export const DomainDslTypes = [
  'Module', 'ModuleRelationDiagram',
  'Enum', 'Entity', 'EntityRelationDiagram',
  'HttpEndpoint', 'KafkaConsumer', 'PublicProcedure', 'PrivateProcedure',
  'StateMachine', 'BackendCache',
  'ViewComponent', 'Page'
];

export enum MutationTypeEnum {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete'
}

export const DslTypeToStateKeyMap: any = {
  'Module': 'Module',
  'ModuleRelationDiagram': 'ModuleRelationDiagram',
  'Enum': 'Enum',
  'Entity': 'Entity',
  'EntityRelationDiagram': 'EntityRelationDiagram',
  'HttpEndpoint': 'HttpEndpoint',
  'KafkaConsumer': 'KafkaConsumer',
  'PublicProcedure': 'PublicProcedure',
  'PrivateProcedure': 'PrivateProcedure',
  'StateMachine': 'StateMachine',
  'BackendCache': 'BackendCache',
  'ViewComponent': 'ViewComponent',
  'Page': 'Page'
}

export interface TechDesignSnapshotDsl {

  // key是逻辑流程的唯一标识，对应文件系统中的路径
  // 例如 C.module
  Module: { [key: string]: ModuleItem };

  // 使用 mermaid语法 表示的 模块交互关系
  ModuleRelationDiagram: { [key: string]: ModuleRelationDiagramItem };

  // key是逻辑流程的唯一标识，对应文件系统中的路径。
  // 必须归属于某个模块，以所属模块的路径为前缀。公共模型则需要归属于Common.module
  // 例如 Common.module/Entity/B.entity
  Entity: { [key: string]: EntityItem };

  // 使用 mermaid语法 表示的 模型-关系图（E-R图）
  EntityRelationDiagram: { [key: string]: EntityRelationDiagramItem };

  // key是逻辑流程的唯一标识，对应文件系统中的路径
  // 必须归属于某个模块，以所属模块的路径为前缀。公共枚举则需要归属于Common.module
  // 例如 Common.module/Enum/A.enum
  Enum: { [key: string]: EnumItem };


  // 一个模块，开放可被http调用的逻辑过程
  // key是逻辑流程的唯一标识，对应文件系统中的路径. 必须
  // 必须归属于某个模块，以所属模块的路径为前缀。公共逻辑则需要归属于Common.module
  // 例如 C.module/D.endpoint.proc
  HttpEndpoint: { [key: string]: ProcedureItem };

  // 一个模块，开放的kafka消费者
  // key是逻辑流程的唯一标识，对应文件系统中的路径.
  // 必须归属于某个模块，以所属模块的路径为前缀。公共逻辑则需要归属于Common.module
  // 例如 C.module/D.kafka.proc
  KafkaConsumer: { [key: string]: ProcedureItem };

  // 一个模块，可被其他模块引用调用的逻辑过程。两个模块间只能互相引用调用 PublicProcedure
  // key是逻辑流程的唯一标识，对应文件系统中的路径. 
  // 必须归属于某个模块，以所属模块的路径为前缀。公共逻辑则需要归属于Common.module
  // 例如 C.module/E.public.proc
  PublicProcedure: { [key: string]: ProcedureItem };

  // 一个模块，不可被其他模块引用调用的逻辑过程
  // key是逻辑流程的唯一标识，对应文件系统中的路径.
  // 必须归属于某个模块，以所属模块的路径为前缀。公共逻辑则需要归属于Common.module
  // 例如 C.module/F.private.proc
  PrivateProcedure: { [key: string]: ProcedureItem };

  // 状态机设计
  StateMachine: { [key: string]: StateMachineItem };

  // 后端缓存设计
  BackendCache: { [key: string]: BackendCacheItem };

  // 业务流程设计
  // BusinessFlow: { [key: string]: BusinessFlowItem };

  // 组件设计
  ViewComponent: { [key: string]: ViewComponentItem };

  // 页面设计
  Page: { [key: string]: PageItem };

}

// 功能模块设计
export interface ModuleItem {
  version: number;
  title: string;
  // 业务功能职责的详细介绍。使用文本表示
  businessDesc: string;

  // 技术职责总结。需要随着类型、规则、伪代码的变化进行更新
  techSummary: string;

  // 对其他模块的依赖、引用
  dependency: ModuleDependency;
}


export interface ModuleDependency {
  // 一个模块依赖的其他 ModuleItem 的唯一标识的列表
  moduleIds: string[];
}

// 使用 mermaid语法 表示的 模块交互关系
export interface ModuleRelationDiagramItem {
  version: number;
  title: string;
  mermaidDsl: string;
}

// 枚举定义
export interface EnumItem {
  version: number;
  title: string;

  // 业务功能职责的详细介绍。使用文本表示
  businessDesc: string;

  // 使用typescript语言，对这个枚举的定义
  typescript: string;
}

// 实体定义
export interface EntityItem {
  version: number;
  title: string;

  // 业务功能职责的详细介绍。使用文本表示
  businessDesc: string;

  // 使用typescript语言，对这个模型的定义
  // 如果两个模型间，有关联关系，可以使用注解标记
  // 例如
  // @OneToOne({relationKey: "<在目标模型，这个关系的反向属性>"})
  // @ManyToOne()
  // @ManyToMany()
  typescript: string;

  // 对其他entity的依赖、引用
  // dependency: EntityDependency;
}

export interface EntityDependency {
  // 一个模块依赖的其他 EntityItem 的唯一标识的列表
  entityIds: string[];
}

// 使用mermaid语法 表示的 模型-关系图（E-R图）
export interface EntityRelationDiagramItem {
  version: number;
  title: string;
  mermaidDsl: string;
}

export interface ProcedureItem {
  version: number;
  title: string;
  // 业务功能职责的详细介绍。使用文本表示
  businessDesc: string;

  // 技术职责总结。需要随着类型、规则、伪代码的变化进行更新
  techSummary: string;

  // 对其他逻辑过程的依赖、引用
  dependency: ProcedureDependency;

  // 逻辑入参出参，以及涉及的子结构类型定义,
  typescript: string;

  // 业务逻辑控制流的伪代码，是指导 ProcedureItem 真正实现时的入口逻辑。【javascript函数】
  // 主要用条件分支、循环、函数调用来描述执行顺序控制
  // 部分偏实现的代码片段可以通过注释省略。但是重要的函数调用需要体现出来
  // 可以调用执行下文中 rulePseudocode，dataFlowPseudocode，以函数调用的方式来示意
  ctrlFlowPseudocode: string;

  // 业务规则的伪代码描述。包含多个有id属性的xml节点，每个节点内是一段表示规则的代码片段
  // 对于根据条件、类别，走不同策略的场景：可以用一段switch结合子函数调用表示【javascript片段】
  // 对于根据条件、走不同策略的场景：可以用一段if-else-if-else结合子函数调用表示【javascript片段】
  // 对于本质是规则推理的产生式规则系统的场景：可以使用逻辑编程语法来描述规则【datalog片段】
  rulePseudocode: string;

  //【可选】重数据加工的逻辑，使用数据流表示逻辑。通过一段仅有赋值、函数调用、return的方式【javascript函数】
  // 通过函数调用表达数据流的节点，通过函数参数中引用变量关系，表达数据流的节点依赖关系
  dataFlowPseudocode: string;
}

export interface ProcedureDependency {
  // 一个逻辑过程依赖的其他ProcedureItem的唯一标识的列表
  procedureIds: string[];
}

export interface StateMachineItem {
  version: number;
  title: string;

  // 状态机伪代码，使用java语言的枚举类描述
  pseudocode: string;
  // 使用mermaid语法 表示的 状态机图
  mermaidDsl: string;
}

export interface BackendCacheItem {
  version: number;
  title: string;
  // 技术职责总结
  techSummary: string;

  // 缓存key的定义，例如：`${entityId}_${entityField}`
  cacheKey: string;
  // 缓存值的类型定义，使用typescript语言
  cacheValueTypescript: string;
}

// export interface BusinessFlowItem {
//   version: number;
//   title: string;
//   pseudocode: string;
// }

export interface ViewComponentItem {
  version: number;
  title: string;

  // 业务功能职责的详细介绍。使用文本表示
  businessDesc: string;
  // 使用typescript语言的interface，
  // 分别定义props、expose、emits
  typescript: string;

  dependency: ViewComponentDependency;
}

export interface ViewComponentDependency {
  // 一个视图组件依赖的其他ProcedureItem的唯一标识的列表
  procedureIds: string[];

  // 依赖的其他子组件
  viewComponentIds: string[];
}

export interface PageItem {
  version: number;
  title: string;

  // 业务功能职责的详细介绍。使用文本表示
  businessDesc: string;

  dependency: PageDependency;
}

export interface PageDependency {
  // 一个page包含的view的ids
  viewComponentIds: string[];
}
