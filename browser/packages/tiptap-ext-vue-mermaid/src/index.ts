import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
// @ts-ignore
import VueMermaid from './VueMermaid.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    vueMermaid: {
      insertVueMermaid: (content?: string) => ReturnType
    }
  }
}

export default Node.create({
  name: 'vueMermaid',

  group: 'block',
  content: '',
  atom: true,

  addAttributes() {
    return {
      content: {
        default: '',
      },
      isEditing: {
        default: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'vue-mermaid',
        getAttrs: element => ({
          content: element.getAttribute('content') || '',
          isEditing: element.getAttribute('isEditing') === 'true',
        }),
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'vue-mermaid', 
      mergeAttributes(HTMLAttributes, {
        content: node.attrs.content,
        isEditing: node.attrs.isEditing,
      })
    ]
  },

  addCommands() {
    return {
      insertVueMermaid:
        (content = 'graph TD\n    A[开始] --> B[结束]') =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { 
              content: content,
              isEditing: false 
            }
          })
        },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(VueMermaid)
  },
})
