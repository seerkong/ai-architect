## 示例
### 任务意图-根据需求文档，拆解，生成模块定义
拆解模块时，需要满足一些约束
* 最底层只有公共模块(Common.module)
* 不需要单独设计数据访问模块，可以假定各个模块有自己的数据读写实现
* 模块的拆分尽量按业务，而不是技术实现细节
* 尽量克制的添加中层模块，除非确实很需要。但中层模块一定一定不要添加常见的、能通过库引入的、或者在技术约束文档中提到的已存在的中台、服务等，比如审批、权限，可以假定这些引擎已经在底层或者外部服务是提供了

返回示意
<MutationPartial>
  <Module mutationType="Create" id="Common.module">
  <![CDATA[
    {
      "title": "公共模块",
      "businessDesc": `
      公共枚举/实体/工具逻辑等等
      ...
      `
    }
  ]]>
  </Module>
</MutationPartial>
<MutationPartial>
  <Module mutationType="Create" id="ApprovalProcess.module">
  <![CDATA[
    {
      "title": "审批流程模块",
      "businessDesc": `
      这里写入根据需求文档拆解后，和流程有关的功能任务
      ...
      `
    }
  ]]>
  </Module>
</MutationPartial>

### 任务意图-根据需求生成枚举和实体定义
返回示意

<MutationPartial>
  <Enum mutationType="Create" id="Common.module/TaskType.enum">
  <![CDATA[
    {
      "title": "任务状态",
      "typescript": `
enum TaskType {
    Finished = 'Finished',
    Failed = 'Failed',
}
      `
    }
  ]]>
  </Enum>
</MutationPartial>

<MutationPartial>
  <Entity mutationType="Create" id="ApprovalProcess.module/BizProcess.entity">
  <![CDATA[
    {
      "title": "业务流程实例",
      "typescript": `
class BizProcess {
  title: string;
  // 流程级状态
  status: TaskType;
  @OneToMany({relationKey: "ProcessStep__to__Process"})
  steps: BizProcessStep[];
}
      `
    }
  ]]>
  </Entity>
</MutationPartial>
<MutationPartial>
  <Entity mutationType="Create" id="ApprovalProcess.module/BizProcessStep.entity">
  <![CDATA[
    {
      "title": "业务流程实例的步骤",
      "typescript": `
class BizProcessStep {
  title: string;
  // 步骤状态
  status: TaskType;

  @ManyToOne({relationKey: "ProcessStep__to__Process"})
  process: BizProcess;
}
      `
    }
  ]]>
  </Entity>
</MutationPartial>

### 任务意图-将审批流程模块(ApprovalProcess.module)进行逻辑拆解
返回示意

<MutationPartial>
  <HttpEndpoint mutationType="Create" id="ApprovalProcess.module/StartLeaveProcess.endpoint.proc">
  <![CDATA[
    {
      "title": "发起请假流程",
      "businessDesc": `
实现请假流程的发起
接收请假请求数据 xxx
调用流程引擎，发起流程
详细业务规则如下...
      `
    }
  ]]>
  </HttpEndpoint>
</MutationPartial>
<MutationPartial>
  <HttpEndpoint mutationType="Create" id="ApprovalProcess.module/ProceedLeaveProcess.endpoint.proc">
  <![CDATA[
    {
      "title": "推进（同意）请假流程",
      "businessDesc": `
以当前流程处理人的身份，审批通过当前流程
详细业务规则如下...
      `
    }
  ]]>
  </HttpEndpoint>
</MutationPartial>
<MutationPartial>
  <HttpEndpoint mutationType="Create" id="ApprovalProcess.module/RejectLeaveProcess.endpoint.proc">
  <![CDATA[
    {
      "title": "拒绝请假流程",
      "businessDesc": `
以当前流程处理人的身份，审批拒绝当前流程
详细业务规则如下...
      `
    }
  ]]>
  </HttpEndpoint>
</MutationPartial>

### 任务意图-生成细化后审批流程模块(ApprovalProcess.module)下的对外http接口(ApprovalProcess.module/StartLeaveProcess.endpoint.proc)详细设计
返回示意

<MutationPartial>
  <HttpEndpoint mutationType="Update" id="ApprovalProcess.module/StartLeaveProcess.endpoint.proc">
  <![CDATA[
    {
      "title": "发起请假流程",
      "businessDesc": `
实现请假流程的发起
接收请假请求数据 xxx
调用流程引擎，发起流程
详细业务规则如下...
      `,
      "typescript": `
class StartLeaveProcessReq {
  // 请假开始时间
  dateStart: string;
  // 请假结束时间
  dateEnd: string;
}

class StartLeaveProcessResp {
  processId: string;
}
      `,
      "ctrlFlowPseudocode": `
      function entry(input: StartLeaveProcessReq) : StartLeaveProcessResp {
        let callProcessEngineResult: callBizProcessEngine(input);
        let r = new StartLeaveProcessResp();
        r.processId = callProcessEngineResult.processId;
      }
      // 调用流程引擎
      // 注意：在生成伪代码时，不需要精细的设计如何实现，只需要关注宏观的变量传递、加工过程
      function callBizProcessEngine(input) {
        // 逻辑实现...

        return {
          processId: "xx",
          currentApprovers: ["zhangsan", "lisi"]
        }
      }
      // 通知流程审批人
      function notify(callProcessEngineResult) {
        sendMessageToWeixin(callProcessEngineResult.currentApprovers)
      }
      `
    }
  ]]>
  </HttpEndpoint>
</MutationPartial>

### 缓存设计
在后端部分，有时需要定义一些关键的，存储到redis的缓存（注意需要克制，不能随意使用缓存）
需要使用如下示例中的规范定义缓存
<MutationPartial>
  <BackendCache mutationType="Create" id="Shop.module/Menu.cache">
  <![CDATA[
    {
      "title": "餐厅店铺限量菜品剩余库存缓存",
      "techSummary": "个别菜品每日根据特殊食材数量，计算后，只能做少数几份，需要缓存剩余可购买份数",
      "cacheKey": "Shop:SpecialDishARemaining.cache",
      "cacheValueTypescript": `number`
    }
  ]]>
  </BackendCache>
</MutationPartial>
<MutationPartial>
  <BackendCache mutationType="Create" id="Shop.module/Menu.cache">
  <![CDATA[
    {
      "title": "餐厅店铺菜单缓存",
      "techSummary": "为防止每次直接从db中查询菜单，将菜单结果数据转换为string存放在redis中",
      "cacheKey": "Shop:Menu.cache",
      "cacheValueTypescript": `
interface Menu {
  items: MenuItem[];
}
interface MenuItem {
  title: string;
  price: number;
}
      `
    }
  ]]>
  </BackendCache>
</MutationPartial>

### 状态机
有些枚举状态的迁移，需要根据业务需求，有严格的转换约束。
在模块下，可以在 枚举所在的模块，建立同名的状态机描述（注意要克制，仅是关键、复杂的业务、涉及状态迁移流转的枚举，需要生成状态机）。
需要在mermaidDsl 字段中，使用mermaid的状态机描述语法绘制图。并在pseudocode中，使用下面的java enum类编写规范，生成状态机的代码实现
例如有Common.module/MotionState.enum，有Still，Moving，Crash 三种状态
可以建立如下id为Common.module/MotionState.statemachine的状态机

<MutationPartial>
  <StateMachine mutationType="Create" id="Common.module/MotionState.statemachine">
  <![CDATA[
    {
      "title": "动作状态的状态机",
      "mermaidDsl": `
stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
      `,
      "pseudocode": `
@AllArgsConstructor
@Getter
public enum MotionStateEnum {
    UNKNOWN("UNKNOWN", "未知"),
    STILL("STILL", "静止") {
        @Override
        public Set<MotionStateEnum> acceptStatusSet() {
            return Set.of(MOVING, CRASH); // 允许转换为MOVING或CRASH，或结束（回到[*]）
        }
        
        @Override
        public MotionStateEnum move() {
            return MOVING;
        }
        
        @Override
        public MotionStateEnum crash() {
            return CRASH;
        }
    },
    MOVING("MOVING", "移动") {
        @Override
        public Set<MotionStateEnum> acceptStatusSet() {
            return Set.of(STILL, CRASH);
        }
        
        @Override
        public MotionStateEnum stop() {
            return STILL;
        }
        
        @Override
        public MotionStateEnum crash() {
            return CRASH;
        }
    },
    CRASH("CRASH", "崩溃") {
        @Override
        public Set<MotionStateEnum> acceptStatusSet() {
            return new HashSet<>(); // 终止状态，不接受转换
        }
    };

    private String code;
    private String desc;

    // 检查是否可接受目标状态
    public boolean canAcceptStatus(MotionStateEnum newStatus) {
        return acceptStatusSet().contains(newStatus);
    }

    public Set<MotionStateEnum> acceptStatusSet() {
        return new HashSet<>();
    }

    // 事件方法：默认抛出异常，特定状态重写
    public MotionStateEnum move() {
        throw new UnsupportedOperationException("状态 " + code + " 不支持事件 move");
    }
    
    public MotionStateEnum stop() {
        throw new UnsupportedOperationException("状态 " + code + " 不支持事件 stop");
    }
    
    public MotionStateEnum crash() {
        throw new UnsupportedOperationException("状态 " + code + " 不支持事件 crash");
    }
}
      `
    }
  ]]>
  </Enum>
</MutationPartial>


### 模块关系依赖图
当模块（Module）间的依赖关系发生变化时，需要创建或更新模块关系的依赖图。在mermaidDsl字段中，使用Mermaid语法描述关系。
这个依赖图的id固定为ModuleRelation.diagram, 只能有一份
生成mermaid dsl规则：
* 应当显示模块的标题，再换行显示模块英文模块标识（去掉.module）,例如: 图书编目模块<br>(BookCatalog)
* 注意合理的布局，尽量避免连线重叠

例如，以下是一个图书馆管理系统模块依赖图

<MutationPartial>
  <ModuleRelationDiagram mutationType="Create" id="ModuleRelation.diagram">
  <![CDATA[
    {
      "title": "模块关系图",
      "mermaidDsl": `
%%{init: {'theme': 'neutral'}}%%
graph TD
    %% 公共模块（中心位置）
    Common["公共模块<br>(Common)<br>工具类/异常处理/常量"]

    %% 业务支撑层（中间层）
    BookCatalog["图书编目模块<br>(BookCatalog)"] --> Common
    UserManagement["用户管理模块<br>(UserManagement)"] --> Common

    %% 业务层（外层布局）
    BorrowReturn["借还管理模块<br>(BorrowReturn)"] --> BookCatalog
    BorrowReturn --> UserManagement
    BorrowReturn --> Common

    Reservation["预约管理模块<br>(Reservation)"] --> BookCatalog
    Reservation --> UserManagement
    Reservation --> Common

    FineCalculation["罚款计算模块<br>(FineCalculation)"] --> BorrowReturn
    FineCalculation --> Common

    %% 报表生成模块（通过声明顺序控制连线方向）
    ReportGeneration["报表生成模块<br>(ReportGeneration)"] --> BookCatalog
    ReportGeneration --> BorrowReturn
    ReportGeneration --> UserManagement
    ReportGeneration --> Common

    %% 样式定义
    classDef business fill:#cff4d2,stroke:#2e7d32;
    classDef support fill:#bbdefb,stroke:#1565c0;
    classDef common fill:#ffecb3,stroke:#ffa000;

    %% 节点分类
    class BorrowReturn,Reservation,FineCalculation,ReportGeneration business
    class BookCatalog,UserManagement support
    class Common common
      `
    }
  ]]>
  </ModuleRelationDiagram>
</MutationPartial>




### 模型关系依赖图
当模型(Entity)间的依赖关系发生变化时，需要创建或更新模块关系的依赖图。
在mermaidDsl字段中，使用Mermaid语法描述关系。
注意事项：
* 由于有些系统的关联关系比较复杂，因此允许将按照关联关系性，拆分为多个E-R图，避免连线混乱
* 应当使用适当的换行避标题过长，比如：店铺<br>(Shop)
* 有时，某些模型的字段很多，此时在生成E-R图时，仅需保留主键、外键、关键业务字段、关键标识字段等，尽量控制在E-R图中* 显式的字段不超过10个
* 创建时间、更新时间、创建人、更新人这类常规的默认字段，不要体现在E-R图中
* 依赖图的id格式为EntityRelation-biz-${bizName}.diagram

例如，以下是图书馆管理系统的几个E-R图
<MutationPartial>
  <EntityRelationDiagram mutationType="Create" id="E-R-Biz-Borrow.diagram">
  <![CDATA[
    {
      "title": "借阅模块关系图",
      "mermaidDsl": `
erDiagram
    READER ||--o{ BORROW_RECORD : places
    BOOK ||--o{ BORROW_RECORD : contains

    READER {
        string reader_id PK
        string name
        string phone_number
        date membership_date
    }

    BOOK {
        string isbn PK
        string title
        string author
        varchar status
    }

    BORROW_RECORD {
        string record_id PK
        date borrow_date
        date return_date
        string reader_id FK
        string isbn FK
    }
      `
    }
  ]]>
  </EntityRelationDiagram>
</MutationPartial>
<MutationPartial>

  <EntityRelationDiagram mutationType="Create" id="E-R-Biz-Permission.diagram">
  <![CDATA[
    {
      "title": "权限管理关系图",
      "mermaidDsl": `
erDiagram
    USER ||--o{ USER_ROLE : "分配"
    ROLE ||--o{ USER_ROLE : "包含"
    ROLE ||--o{ ROLE_PERMISSION : "拥有"
    PERMISSION ||--o{ ROLE_PERMISSION : "关联"

    USER {
        int id "用户ID，主键"
        varchar name "用户名"
        varchar password "用户密码"
    }
    ROLE {
        int id "角色ID，主键"
        varchar name "角色名称"
    }
    PERMISSION {
        int id "权限ID，主键"
        varchar name "权限名称"
        varchar description "权限描述"
    }
    USER_ROLE {
        int user_id "用户ID，外键"
        int role_id "角色ID，外键"
    }
    ROLE_PERMISSION {
        int role_id "角色ID，外键"
        int permission_id "权限ID，外键"
    }
      `
    }
  ]]>
  </EntityRelationDiagram>
</MutationPartial>