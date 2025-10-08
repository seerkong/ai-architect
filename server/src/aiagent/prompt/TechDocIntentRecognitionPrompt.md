请根据以下用户原始问题，分析用户的意图，是下面的哪一种，或者多种的组合
如果匹配了某种意图，需要执行对应的任务


### 原子任务

#### 模块拆分

填充Module的businessDesc、dependency; 定义ModuleRelationDiagram

#### 实体细化

填充Entity，的title、类型定义(typescript字段)、businessDesc等未填写的字段； 定义EntityRelationDiagram

#### 枚举拆分

填充Enum，的title、类型定义(typescript字段)、businessDesc等未填写的字段

#### 枚举细化(状态机细化)

枚举状态机的细化：（为关键、复杂的业务的枚举，定义StateMachine）

#### 单个模块的初步逻辑拆分

填充HttpEndpoint，KafkaConsumer，PublicProcedure的title、businessDesc和dependency

#### 单个模块的完整逻辑拆分

填充HttpEndpoint，KafkaConsumer，PublicProcedure，PrivateProcedure的title、businessDesc和dependency
注意，并不是一个模块所有的逻辑内部使用的函数，都要对应一个PrivateProcedure，仅是关键、复杂的、在模块内可以复用的业务，才需要对应一个PrivateProcedure。多数内部逻辑，可以在逻辑细化时，在伪代码中定义一个未实现的细节的有功能注释的函数来表示

#### 单个模块的逻辑细化

填充HttpEndpoint，KafkaConsumer，PublicProcedure，PrivateProcedure的
techSummary、类型定义、伪代码等未填写的字段

#### 单个模块的前端业务可复用组件设计

对关键、复杂的、或在模块内可以复用的前端业务组件（ViewComponent）进行详细设计，
即（title、businessDesc、typescript、dependency）字段

#### 单个模块的前端页面设计

对点击导航或者通过不同的url，展示的网页核心业务区域的页面详细（Page）设计
即（title、businessDesc、dependency）字段

#### 单个模块的缓存设计

定义BackendCache中的各个字段

#### 指定修改

当用户指定了某个具体的id，或名字时，你只需要细化对应目标的修改，而不是整个模块的所有逻辑
如果修改过程中，涉及到对其他模块的逻辑、枚举、实体修改时，需要一并返回更新后的变更指令

### 组合任务

#### 数据建模

需要进行模块拆分（如果还未拆分）、实体细化、枚举细化、枚举状态机细化

#### 模块细化

对各个模块内，进行实体细化、枚举细化、单个模块的初步逻辑拆分、单个模块的缓存设计、单个模块的前端页面设计(无需设计页面下的组件)

#### 指定模块的逻辑细化

单个模块的完整逻辑拆分和单个模块的逻辑细化

#### 设计后端接口
对各个模块内的HttpEndpoint进行初步拆分，填充title、businessDesc，techSummary字段

#### 指定模块的前端细化

执行 单个模块的前端业务视图组件设计 、单个模块的前端页面设计

<用户原始问题>
@userQuestion
</用户原始问题>
