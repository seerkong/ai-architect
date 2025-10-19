import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
// @ts-ignore
import VueMutationPartial from './VueMutationPartial.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    vueMutationPartial: {
      insertMutationPartial: (content?: string, isProcessing?: boolean) => ReturnType
      updateMutationPartialContent: (content: string) => ReturnType
      completeMutationPartial: () => ReturnType
    }
  }
}

export default Node.create({
  name: 'vueMutationPartial',

  group: 'block',
  content: '',
  atom: true,

  addAttributes() {
    return {
      content: {
        default: '',
      },
      isProcessing: {
        default: true,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'vue-mutation-partial',
        getAttrs: element => ({
          content: element.getAttribute('content') || '',
          isProcessing: element.getAttribute('isProcessing') === 'true',
        }),
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'vue-mutation-partial',
      mergeAttributes(HTMLAttributes, {
        content: node.attrs.content,
        isProcessing: node.attrs.isProcessing,
      })
    ]
  },

  addCommands() {
    return {
      insertMutationPartial:
        (content = '', isProcessing = true) =>
          ({ commands }: { commands: any }) => {
            return commands.insertContent({
              type: this.name,
              attrs: {
                content: content,
                isProcessing: isProcessing
              }
            })
          },

      updateMutationPartialContent:
        (content: string) =>
          ({ tr, state }: { tr: any, state: any }) => {
            const { selection } = state
            const { $from } = selection

            // 查找当前或最近的 vueMutationPartial 节点
            let pos = $from.pos
            let node = null
            let nodePos = -1

            state.doc.descendants((n: any, p: any) => {
              if (n.type.name === 'vueMutationPartial' && n.attrs.isProcessing) {
                node = n
                nodePos = p
                return false
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

      completeMutationPartial:
        () =>
          ({ tr, state }: { tr: any, state: any }) => {
            const { selection } = state
            const { $from } = selection

            // 查找最后一个处理中的 vueMutationPartial 节点
            let node = null
            let nodePos = -1

            state.doc.descendants((n: any, p: any) => {
              if (n.type.name === 'vueMutationPartial' && n.attrs.isProcessing) {
                node = n
                nodePos = p
              }
            })

            if (node && nodePos >= 0) {
              tr.setNodeMarkup(nodePos, null, {
                ...node.attrs,
                isProcessing: false
              })
              return true
            }

            return false
          },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(VueMutationPartial)
  },
})

