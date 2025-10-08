## 示例

### 任务意图-设计前端可复用业务组件

唯一id以.view结尾. 一定一定一定不可以使用.vue结尾
注意：这里要拆分出来的，是宏观关键的可复用的业务组件，不是底层组件, 因此偏细节、底层的基础组件无需设计，且最多只能设计两层业务组件，尽量只有一层
比如：CRUD组件、图表、表格、常规前端组件库中包含的组件，是不需要拆解的

返回示意
<MutationPartial>
<ViewComponent mutationType="Create" id="TicketBooking.view">

  <![CDATA[
    {
      "title": "差旅流程订票组件",
      "businessDesc": `
      业务职责描述...
      ...
      `,
      "typescript": `

// 定义父组件传给子组件的 props 的类型
interface IProps {
  message: string;
}

// 定义向父组件暴露子组件的内部属性和方法
interface IExposes {
  // 假设要暴露一个字符串类型的属性
  exposedMessage: string;
  // 假设要暴露一个返回数字的方法
  getExposedNumber: () => number;
}

// 定义 emits 事件的类型
interface IEmits {
  (event: 'simpleEvent'): void;
  (event: 'dataEvent', data: number): void;
}
      `
    }
  ]]>
  </ViewComponent>
</MutationPartial>

<MutationPartial>
  <ViewComponent mutationType="Create" id="ProcessStatusTree.view">
  <![CDATA[
    {
      "title": "流程进度树组件",
      "businessDesc": `
      使用树结构展示流程的进度
      ...
      `
      "typescript": `
// 定义父组件传给子组件的 props 的类型
interface IProps {
  statusTree: ProcessStatusTreeData;
  currentStepId: string;
  currentStepPath: string;
}

interface ProcessStatusTreeData {

}

// 定义向父组件暴露子组件的内部属性和方法
interface IExposes {
// 假设要暴露一个字符串列表类型的属性
currentProcessStepOperators: string[];
// 假设要暴露一个方法
collapseTree: () => void;
}

// 定义 emits 事件的类型
interface IEmits {
(event: 'clickProcessStep', stepPath: string): void;
(event: 'someOtherSimpleEvent'): void;
}
`
}
]]>
</ViewComponent>
</MutationPartial>

## 示例

### 任务意图-设计前端页面

唯一id以.page结尾
返回示意
<MutationPartial>
<Page mutationType="Create" id="TicketBookingProcess.page">

  <![CDATA[
    {
      "title": "差旅流程审批通过后进行订票页面",
      "businessDesc": `
      业务职责描述...
      ...
      `,
     "dependency": {
       "viewComponentIds": [
         "TicketBooking.view",
         "ProcessStatusTree.view"
       ]
     }
    }
  ]]>
  </Page>
</MutationPartial>
