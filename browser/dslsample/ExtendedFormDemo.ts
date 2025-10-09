export const ExtendedFormDemo = {
  "children": [
    {
      "is": "web-form-lcd",
      "_id": "extended-form-1",
      "labelWidth": 20,
      "onSubmit": "{{e => {\n  console.log('Extended Form submitted:', state)\n  alert('submit data:' + JSON.stringify(state.formData))\n}}}",
      "model": "{{state.formData}}",
      "style": {
        "overflow": "hidden"
      },
      "children": [
        {
          "is": "h2",
          "_id": "title-1",
          "children": "扩展表单组件测试"
        },
        
        // 单选组测试
        {
          "is": "h3",
          "_id": "radio-title",
          "children": "1. 单选组 (WebRadioGroup)"
        },
        {
          "is": "WebFormItemRender",
          "label": "选择你喜欢的颜色",
          "prop": "color",
          "children": [
            {
              "is": "WebRadioGroup",
              "options": [
                { "value": "red", "label": "红色" },
                { "value": "green", "label": "绿色" },
                { "value": "blue", "label": "蓝色" },
                { "value": "yellow", "label": "黄色" }
              ]
            }
          ],
          "_id": "color-item"
        },
        
        // 多选组测试
        {
          "is": "h3",
          "_id": "checkbox-title",
          "children": "2. 多选组 (WebCheckboxGroup)"
        },
        {
          "is": "WebFormItemRender",
          "label": "选择你的爱好",
          "prop": "hobbies",
          "children": [
            {
              "is": "WebCheckboxGroup",
              "options": [
                { "value": "reading", "label": "阅读" },
                { "value": "music", "label": "音乐" },
                { "value": "sports", "label": "运动" },
                { "value": "travel", "label": "旅行" },
                { "value": "cooking", "label": "烹饪" }
              ]
            }
          ],
          "_id": "hobbies-item"
        },
        
        // 多行输入测试
        {
          "is": "h3",
          "_id": "textarea-title",
          "children": "3. 多行输入 (WebTextarea)"
        },
        {
          "is": "WebFormItemRender",
          "label": "个人简介",
          "prop": "bio",
          "children": [
            {
              "is": "WebTextarea",
              "placeholder": "请输入你的个人简介...",
              "rows": 4,
              "maxlength": 200
            }
          ],
          "_id": "bio-item"
        },
        
        // 单个单选按钮测试
        {
          "is": "h3",
          "_id": "single-radio-title",
          "children": "4. 单个单选按钮 (WebRadio)"
        },
        {
          "is": "WebFormItemRender",
          "label": "是否同意条款",
          "prop": "agree",
          "children": [
            {
              "is": "WebRadio",
              "value": "yes",
              "label": "同意"
            }
          ],
          "_id": "agree-item"
        },
        
        // 单个多选框测试
        {
          "is": "h3",
          "_id": "single-checkbox-title",
          "children": "5. 单个多选框 (WebCheckbox)"
        },
        {
          "is": "WebFormItemRender",
          "label": "订阅通知",
          "prop": "notifications",
          "children": [
            {
              "is": "WebCheckbox",
              "value": "email",
              "label": "邮件通知"
            }
          ],
          "_id": "notifications-item"
        },
        
        // 下拉选择测试
        {
          "is": "h3",
          "_id": "select-title",
          "children": "6. 下拉选择 (WebSelect)"
        },
        {
          "is": "WebFormItemRender",
          "label": "选择城市",
          "prop": "city",
          "children": [
            {
              "is": "WebSelect",
              "placeholder": "请选择城市",
              "children": [
                { "is": "option", "value": "beijing", "children": "北京" },
                { "is": "option", "value": "shanghai", "children": "上海" },
                { "is": "option", "value": "guangzhou", "children": "广州" },
                { "is": "option", "value": "shenzhen", "children": "深圳" }
              ]
            }
          ],
          "_id": "city-item"
        },
        
        // 文本输入测试
        {
          "is": "h3",
          "_id": "input-title",
          "children": "7. 文本输入 (WebInput)"
        },
        {
          "is": "WebFormItemRender",
          "label": "姓名",
          "prop": "name",
          "children": [
            {
              "is": "WebInput",
              "type": "text",
              "placeholder": "请输入姓名"
            }
          ],
          "_id": "name-item"
        },
        
        {
          "is": "button",
          "type": "button",
          "children": "打印当前表单数据",
          "onClick": "{{() => {\n  console.log('Current form data from DSL:', state.formData)\n  alert('当前表单数据:\\n' + JSON.stringify(state.formData, null, 2))\n}}}",
          "style": {
            "marginTop": "20px",
            "marginRight": "10px",
            "padding": "10px 20px",
            "backgroundColor": "#67c23a",
            "color": "white",
            "border": "none",
            "borderRadius": "4px",
            "cursor": "pointer"
          }
        },
        {
          "is": "button",
          "type": "submit",
          "children": "提交表单",
          "style": {
            "marginTop": "20px",
            "padding": "10px 20px",
            "backgroundColor": "#409eff",
            "color": "white",
            "border": "none",
            "borderRadius": "4px",
            "cursor": "pointer"
          }
        }
      ]
    }
  ],
  "state": {
    "formData": {
      "color": "",
      "hobbies": [],
      "bio": "",
      "agree": "",
      "notifications": [],
      "city": "",
      "name": ""
    }
  },
  "is": "Page",
  "_id": "extended-form-page",
  "style": {
    "padding": "12px"
  },
  "plugins": [
    "/plugins/web"
  ],
  "designer": {
    "canvas": {
      "style": {
        "width": "768px",
        "height": "1024px"
      },
      "zoom": 1
    }
  }
}
