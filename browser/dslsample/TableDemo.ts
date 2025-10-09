export const TableDemo = {
  "children": [
    {
      "is": "web-table-lcd",
      "_id": "table-demo-1",
      "data": "{{state.tableData}}",
      "columns": "{{state.columns}}",
      "rowKey": "id",
      "selectable": true,
      "stripe": true,
      "border": true,
      "style": {
        "marginTop": "20px"
      }
    }
  ],
  "state": {
    "tableData": [
      {
        "id": 1,
        "name": "张三",
        "age": 25,
        "email": "zhangsan@example.com",
        "department": "技术部"
      },
      {
        "id": 2,
        "name": "李四",
        "age": 30,
        "email": "lisi@example.com",
        "department": "产品部"
      },
      {
        "id": 3,
        "name": "王五",
        "age": 28,
        "email": "wangwu@example.com",
        "department": "设计部"
      }
    ],
    "columns": [
      {
        "prop": "name",
        "label": "姓名",
        "width": "120px"
      },
      {
        "prop": "age",
        "label": "年龄",
        "width": "80px",
        "align": "center"
      },
      {
        "prop": "email",
        "label": "邮箱",
        "minWidth": "200px"
      },
      {
        "prop": "department",
        "label": "部门",
        "width": "120px"
      }
    ]
  },
  "is": "Page",
  "_id": "table-demo-page",
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
