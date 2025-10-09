import { Node, mergeAttributes, findChildren } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
// @ts-ignore
import { createLowlight, common } from 'lowlight'
import 'highlight.js/styles/github-dark.css'

// 创建 lowlight 实例
// @ts-ignore
const lowlight = createLowlight(common)

// @ts-ignore
import CodeBlockEnhanced from './CodeBlockEnhanced.vue'

// 辅助函数：解析高亮节点
function parseNodes(nodes: any[], className: string[] = []): { text: string; classes: string[] }[] {
  if (!nodes || !Array.isArray(nodes)) {
    return []
  }

  return nodes.flatMap(node => {
    if (!node) {
      return []
    }

    const classes = [...className, ...(node.properties?.className || [])]

    if (node.children) {
      return parseNodes(node.children, classes)
    }

    if (node.value === undefined || node.value === null) {
      return []
    }

    return {
      text: String(node.value),
      classes,
    }
  })
}

// 辅助函数：获取高亮节点
function getHighlightNodes(result: any) {
  // `.value` for lowlight v1, `.children` for lowlight v2
  return result.value || result.children || []
}

// 辅助函数：检查语言是否已注册
function registered(aliasOrLanguage: string) {
  return lowlight.registered(aliasOrLanguage)
}

// 辅助函数：获取语法高亮装饰
function getDecorations(doc: ProsemirrorNode, name: string) {
  const decorations: Decoration[] = []

  findChildren(doc, node => node.type.name === name).forEach(block => {
    let from = block.pos + 1
    const language = block.node.attrs.language || 'text'

    if (language === 'text') {
      return
    }

    try {
      const languages = lowlight.listLanguages()
      const nodes = language && (languages.includes(language) || registered(language))
        ? getHighlightNodes(lowlight.highlight(language, block.node.textContent))
        : getHighlightNodes(lowlight.highlightAuto(block.node.textContent))

      parseNodes(nodes).forEach(node => {
        const to = from + node.text.length

        if (node.classes.length) {
          const decoration = Decoration.inline(from, to, {
            class: node.classes.join(' '),
          })

          decorations.push(decoration)
        }

        from = to
      })
    } catch (error) {
      console.warn('语法高亮失败:', error)
    }
  })

  return DecorationSet.create(doc, decorations)
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    code: {
      setCode: (attributes?: { language?: string }) => ReturnType
      toggleCode: (attributes?: { language?: string }) => ReturnType
    }
  }
}

export default Node.create({
  name: 'code',

  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      language: {
        default: 'text',
        parseHTML: element => element.getAttribute('data-language') || 'text',
        renderHTML: attributes => {
          if (!attributes.language || attributes.language === 'text') {
            return {}
          }
          return {
            'data-language': attributes.language,
          }
        },
      },
      collapsed: {
        default: false,
        parseHTML: element => element.getAttribute('data-collapsed') === 'true',
        renderHTML: attributes => {
          if (!attributes.collapsed) {
            return {}
          }
          return {
            'data-collapsed': 'true',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'code',
        preserveWhitespace: 'full',
        getAttrs: element => {
          // 所有 <code> 标签都识别为代码块，不管父级元素是什么
          const language = element.getAttribute('data-language') || 
                          element.className?.match(/language-(\w+)/)?.[1] || 
                          'text'
          return {
            language: language,
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'code',
      mergeAttributes(HTMLAttributes, {
        'data-language': node.attrs.language,
        'data-collapsed': node.attrs.collapsed ? 'true' : undefined,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setCode:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes)
        },
      toggleCode:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Enter': ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2
        const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n')

        if (!isAtEnd || !endsWithDoubleNewline) {
          return false
        }

        return editor
          .chain()
          .command(({ tr }) => {
            tr.delete($from.pos - 2, $from.pos)
            return true
          })
          .exitCode()
          .run()
      },
      'Shift-Enter': ({ editor }) => {
        // Shift+Enter 在代码块内插入换行
        if (editor.isActive('code')) {
          return editor.commands.insertContent('\n')
        }
        return false
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      // 语法高亮插件
      new Plugin({
        key: new PluginKey('codeBlockHighlight'),
        state: {
          init: (_, { doc }) => getDecorations(doc, this.name),
          apply: (transaction, decorationSet, oldState, newState) => {
            const oldNodeName = oldState.selection.$head.parent.type.name
            const newNodeName = newState.selection.$head.parent.type.name
            const oldNodes = findChildren(oldState.doc, node => node.type.name === this.name)
            const newNodes = findChildren(newState.doc, node => node.type.name === this.name)

            if (
              transaction.docChanged &&
              ([oldNodeName, newNodeName].includes(this.name) ||
                newNodes.length !== oldNodes.length ||
                transaction.steps.some(step => {
                  // @ts-ignore
                  return (
                    // @ts-ignore
                    step.from !== undefined &&
                    // @ts-ignore
                    step.to !== undefined &&
                    oldNodes.some(node => {
                      // @ts-ignore
                      return (
                        // @ts-ignore
                        node.pos >= step.from &&
                        // @ts-ignore
                        node.pos + node.node.nodeSize <= step.to
                      )
                    })
                  )
                }))
            ) {
              return getDecorations(transaction.doc, this.name)
            }

            return decorationSet.map(transaction.mapping, transaction.doc)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(CodeBlockEnhanced)
  },
})
