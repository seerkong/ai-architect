import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
// @ts-ignore
import VueThink from './VueThink.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    vueThink: {
      insertThink: (content?: string, isThinking?: boolean) => ReturnType
      updateThinkContent: (content: string) => ReturnType
      completeThink: () => ReturnType
    }
  }
}

export default Node.create({
  name: 'vueThink',

  group: 'block',
  content: '',
  atom: true,

  addAttributes() {
    return {
      content: {
        default: '',
      },
      isThinking: {
        default: true,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'vue-think',
        getAttrs: element => ({
          content: element.getAttribute('content') || '',
          isThinking: element.getAttribute('isThinking') === 'true',
        }),
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'vue-think',
      mergeAttributes(HTMLAttributes, {
        content: node.attrs.content,
        isThinking: node.attrs.isThinking,
      })
    ]
  },

  addCommands() {
    return {
      insertThink:
        (content = '', isThinking = true) =>
          ({ commands }: { commands: any }) => {
            return commands.insertContent({
              type: this.name,
              attrs: {
                content: content,
                isThinking: isThinking
              }
            })
          },

      updateThinkContent:
        (content: string) =>
          ({ tr, state }: { tr: any, state: any }) => {
            // 查找最后一个思考中的节点
            let node: any = null
            let nodePos = -1

            state.doc.descendants((n: any, p: any) => {
              if (n.type.name === 'vueThink' && n.attrs.isThinking) {
                node = n
                nodePos = p
              }
            })

            if (node && nodePos >= 0) {
              tr.setNodeMarkup(nodePos, null, {
                ...node.attrs,
                content: content
              })
              return true
            }

            return false
          },

      completeThink:
        () =>
          ({ tr, state }: { tr: any, state: any }) => {
            // 查找最后一个思考中的节点
            let node: any = null
            let nodePos = -1

            state.doc.descendants((n: any, p: any) => {
              if (n.type.name === 'vueThink' && n.attrs.isThinking) {
                node = n
                nodePos = p
              }
            })

            if (node && nodePos >= 0) {
              tr.setNodeMarkup(nodePos, null, {
                ...node.attrs,
                isThinking: false
              })
              return true
            }

            return false
          },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(VueThink)
  },
})

