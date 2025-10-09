export const FormDemo = {
  "children": [
    {
      "is": "web-form-lcd",
      "_id": "15870304-528c-4f18-b4c2-7529dcb30837",
      "labelWidth": 20,
      "onSubmit": "{{e => {\n  console.log('Form submitted:', state)\n  alert('submit data:' + JSON.stringify(state.formData))\n}}}",
      "model": "{{state.formData}}",
      "style": {
        "overflow": "hidden"
      },
      "children": [
        {
          "is": "h2",
          "_id": "44ad8bba-071b-4e13-ba07-a1fe02cc8c21",
          "children": "选择题"
        },
        {
          "is": "p",
          "_id": "e8528607-9d5c-4d57-b770-8f9be6017490",
          "children": "1. 哪一个是正确的？"
        },
        {
          "is": "WebFormItemRender",
          "label": "",
          "prop": "radio1",
          "children": [
            {
              "is": "WebSelect",
              "placeholder": "请选择答案",
              "children": [
                { is: 'option', value: 'a', children: 'A. mouse.bird.size 是无效的' },
                { is: 'option', value: 'b', children: 'B. mouse[bird.size] 是无效的' },
                { is: 'option', value: 'c', children: 'C. mouse[bird[\'size\']] 是无效的' },
                { is: 'option', value: 'd', children: 'D. 以上三个选项都是有效的' },
              ]
            }
          ],
          "_id": "select1-item",
          "style": {
            "marginTop": "10px"
          }
        },
        {
          "is": "h2",
          "_id": "206f027a-5269-4a72-963f-b8921014d8f8",
          "children": "填空题"
        },
        {
          "is": "p",
          "_id": "d2ebe941-821c-4c6d-9c00-f16be7aa3c8b",
          "children": "1. 下面打印 name 值是什么"
        },
        {
          "is": "WebFormItemRender",
          "label": "",
          "prop": "input1",
          "children": [
            {
              "is": "WebInput",
              "type": "text",
              "placeholder": "请输入答案"
            }
          ],
          "_id": "input1-item",
          "style": {
            "marginTop": "10px"
          }
        },
        {
          "is": "button",
          "type": "submit",
          "children": "提交"
        }
      ],

    }
  ],
  "state": {
    "count": 0,
    "formData": {}
  },
  "is": "Page",
  "_id": "13f4e3cc-2aca-4f04-8507-f9d52411a34a",
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