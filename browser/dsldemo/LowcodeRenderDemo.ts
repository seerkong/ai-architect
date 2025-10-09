export const FormDemo = {
  "children": [
    {
      is: 'markdown-it',
      content: '## aaaa\n\n---\n\n[WebFormLcd](https://www.baidu.com/)'
    },
    {
      "is": "WebFormLcd",
      "_id": "15870304-528c-4f18-b4c2-7529dcb30837",
      "labelWidth": 20,
      "onSubmit": "{{e => {\n  e.preventDefault()\n; console.log(state)\n  alert('submit data:' + JSON.stringify(state.formData))\n}}}",
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
          "is": "select",
          "prop": "select1",
          "name": "select1",
          "v-model": "select1",
          // "value": "1",
          "placeholder": "请选择答案",
          "children": [
            { is: 'option', value: '1', children: 'A' },
            { is: 'option', value: '2', children: 'B' },
          ]
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
          "is": "input",
          "type": "text",
          "v-model": "input1",
          "name": "input1",
          // "value": "value2",
          "placeholder": "请输入答案"
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
    "formData": {
      "input1": "value2",
      "select1": "2"
    }
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