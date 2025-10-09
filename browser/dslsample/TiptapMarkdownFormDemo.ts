export const TiptapMarkdownFormDemo = {
  "is": "Page",
  "_id": "tiptap-markdown-form-page",
  "style": {
    "padding": "12px"
  },
  "children": [
    {
      "is": "web-form-lcd",
      "model": "{{state.formData}}",
      "onSubmit": "{{e => console.log('Form submitted:', state.formData)}}",
      "children": [
        // 基本信息字段
        {
          "is": "WebFormItemRender",
          "label": "标题",
          "prop": "title",
          "required": true,
          "children": [
            {
              "is": "WebInput",
              "type": "text",
              "placeholder": "请输入标题"
            }
          ]
        },
        
        {
          "is": "WebFormItemRender",
          "label": "作者",
          "prop": "author",
          "children": [
            {
              "is": "WebInput",
              "type": "text",
              "placeholder": "请输入作者"
            }
          ]
        },

        // 文章类型选择
        {
          "is": "WebFormItemRender",
          "label": "文章类型",
          "prop": "articleType",
          "children": [
            {
              "is": "WebRadioGroup",
              "options": [
                { "value": "blog", "label": "博客文章" },
                { "value": "tutorial", "label": "教程" },
                { "value": "news", "label": "新闻" },
                { "value": "review", "label": "评测" }
              ]
            }
          ]
        },

        // 标签选择
        {
          "is": "WebFormItemRender",
          "label": "标签",
          "prop": "tags",
          "children": [
            {
              "is": "WebCheckboxGroup",
              "options": [
                { "value": "vue", "label": "Vue.js" },
                { "value": "react", "label": "React" },
                { "value": "javascript", "label": "JavaScript" },
                { "value": "typescript", "label": "TypeScript" },
                { "value": "frontend", "label": "前端开发" },
                { "value": "backend", "label": "后端开发" }
              ]
            }
          ]
        },

        // 发布状态
        {
          "is": "WebFormItemRender",
          "label": "发布状态",
          "prop": "status",
          "children": [
            {
              "is": "WebSelect",
              "placeholder": "请选择发布状态",
              "options": [
                { "value": "draft", "label": "草稿" },
                { "value": "published", "label": "已发布" },
                { "value": "archived", "label": "已归档" }
              ]
            }
          ]
        },

        // 个人简介
        {
          "is": "WebFormItemRender",
          "label": "个人简介",
          "prop": "bio",
          "children": [
            {
              "is": "WebTextarea",
              "placeholder": "请输入个人简介...",
              "rows": 4,
              "maxlength": 200
            }
          ]
        },

        // 富文本编辑器
        {
          "is": "WebFormItemRender",
          "label": "富文本内容",
          "prop": "richContent",
          "children": [
            {
              "is": "WebRichTextEditor",
              "style": "min-height: 200px; border: 1px solid #dcdfe6; border-radius: 4px;"
            }
          ]
        },

        // Markdown编辑器
        {
          "is": "WebFormItemRender",
          "label": "Markdown内容",
          "prop": "markdownContent",
          "children": [
            {
              "is": "WebMarkdownEditor",
              "theme": "github",
              "style": "min-height: 200px; border: 1px solid #dcdfe6; border-radius: 4px;"
            }
          ]
        },

        // 表单操作按钮
        {
          "is": "div",
          "style": "display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;",
          "children": [
            {
              "is": "button",
              "type": "submit",
              "style": "padding: 10px 20px; background-color: #409eff; color: white; border: none; border-radius: 4px; cursor: pointer;",
              "children": "保存表单"
            },
            {
              "is": "button",
              "type": "button",
              "style": "padding: 10px 20px; background-color: #67c23a; color: white; border: none; border-radius: 4px; cursor: pointer;",
              "onClick": "{{() => alert('当前表单数据:\\n' + JSON.stringify(state.formData, null, 2))}}",
              "children": "打印表单数据 (DSL内按钮)"
            },
            {
              "is": "button",
              "type": "button",
              "style": "padding: 10px 20px; background-color: #e6a23c; color: white; border: none; border-radius: 4px; cursor: pointer;",
              "onClick": "{{() => { console.log('富文本内容:', state.formData.richContent); alert('富文本内容:\\n' + (state.formData.richContent || '暂无内容')) }}}",
              "children": "打印富文本内容"
            },
            {
              "is": "button",
              "type": "button",
              "style": "padding: 10px 20px; background-color: #f56c6c; color: white; border: none; border-radius: 4px; cursor: pointer;",
              "onClick": "{{() => { console.log('Markdown内容:', state.formData.markdownContent); alert('Markdown内容:\\n' + (state.formData.markdownContent || '暂无内容')) }}}",
              "children": "打印Markdown内容"
            }
          ]
        }
      ]
    }
  ],
  "state": {
    "formData": {
      "title": "",
      "author": "",
      "articleType": "blog",
      "tags": ["vue", "javascript"],
      "status": "draft",
      "bio": "",
      "richContent": "<h1>欢迎使用富文本编辑器</h1><p>这是一个<strong>示例富文本内容</strong>，支持：</p><ul><li>格式化文本</li><li>列表</li><li>链接</li><li>图片</li></ul><p>您可以在这里编辑富文本内容。</p>",
      "markdownContent": "# 欢迎使用Markdown编辑器\n\n这是一个**示例Markdown内容**，支持：\n\n- 列表项\n- 代码块\n- 链接\n- 图片\n\n```javascript\nconsole.log('Hello World!');\n```\n\n[查看更多](https://www.example.com)"
    }
  },
  "plugins": ["/plugins/web"]
}
