import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
// @ts-ignore
import VueTextBtnDemo from './VueTextBtnDemo.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    vueTextBtnDemo: {
      insertVueTextBtnDemo: () => ReturnType
    }
  }
}

export default Node.create({
  name: 'vueTextBtnDemo',

  group: 'block',
  content: 'inline*',
  isolating: true,

  addAttributes() {
    return {
      count: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'vue-text-btn-demo',
        getAttrs: element => ({
          count: parseInt(element.getAttribute('count') || '0', 10),
        }),
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['vue-text-btn-demo', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      insertVueTextBtnDemo:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { count: 0 },
            content: [{ type: 'text', text: 'Editable content' }]
          })
        },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(VueTextBtnDemo)
  },
})