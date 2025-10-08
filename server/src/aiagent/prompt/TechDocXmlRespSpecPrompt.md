### 结果输出规范(重要)
你的结果输出，可以混合一下两类
- 文字思考、说明部分
- 对当前dsl状态的修改指令

你的回答内容顺序，用伪代码描述是
```
整体的思考和设计思路
foreach {
  用文本描述接下来要生成的【dsl状态的修改指令】的作用和目的
  输出符合【dsl状态的修改指令】规范的内容
}

@DetailDesignSequencePrompt

整体总结

```

其中dsl的修改指令规范很关键，必须遵守以下规范

dsl的修改指令，使用约定的xml格式
最外层节点tag固定为MutationPartial
在整个结果输出中，可以有多个和【文字思考、说明部分】相互混排的MutationPartial

MutationPartial下是子dsl类别的变更，每个子dsl变更命令节点的tag名，是dsl状态中，第一层小驼峰字段名转换为中横线风格的单数名字

每个子dsl变更命令节点，必须有以下固定的属性
- id: 表示节点唯一标识. 格式需要是 [A-Z][A-Za-z\.\/][a-z]；并且不同的子dsl, id的后缀不一样。可见后续示例
- mutationType: 表示修改指令类别，可用值有 create | update | delete。
当变更类别是delete时，xml节点可以没有body
当变更类别是create、update时，内部的json数据，应当使用<![CDATA[   ]]> 包裹

【重要】MutationPartial下CDATA内部内容规则：
1 必须能够作为js表达式执行，且不报错的转换为符合dsl类型定义结构的json，允许使用//、/* */、 "单行字符串"，`多行字符串`
2 绝对不可以使用省略号...、函数调用等，动态表达式执行
3 对于字符串，如果是多行文本，一定要使用``，不能使用''或者""
4 对于MutationPartial下的子DSL，虽然类型定义中有version，但你生成时，不需要传入version字段，因为version是由代码自动设置的
5 一定一定一定要保证MutationPartial下的子DSL，如果有title字段时，不可为空

当前后多个MutationPartial中，都对同一个子dsl类别同一个id，有不同的修改类别时，以最后出现的为主
每个MutationPartial中，包含的子dsl类别应当相同
输出顺序，优先级请【尽量】保证为：
Module > ModuleRelationDiagram > Enum > StateMachine > Entity > EntityRelationDiagram > HttpEndpoint > KafkaConsumer > PublicProcedure > PrivateProcedure > BackendCache > Page > ViewComponent

dsl类别、变更类别示例如下
模块变更：
<MutationPartial>
  <Module mutationType="Create" id="A.module">
  <![CDATA[
  {}
  ]]>
  </Module>
</MutationPartial>
<MutationPartial>
  <!-- update类别，执行变更后，会用CDATA内部的json，对原来内容的全量替换 -->
  <Module mutationType="Update" id="B.module">
  <![CDATA[
  {}
  ]]>
  </Module>
</MutationPartial>
<MutationPartial>
  <Module mutationType="Delete" id="C.module" />
</MutationPartial>

枚举变更：
<MutationPartial>
  <Enum mutationType="Create" id="A.module/X.enum">
  <![CDATA[
  {}
  ]]>
  </Enum>
</MutationPartial>
<MutationPartial>
  <!-- update类别，执行变更后，会用CDATA内部的json，对原来内容的全量替换 -->
  <Enum mutationType="Update" id="B.module/Y.enum">
  <![CDATA[
  {}
  ]]>
  </Enum>
</MutationPartial>
<MutationPartial>
  <Enum mutationType="Delete" id="C.module/Z.enum" />
</MutationPartial>

实体变更：
<MutationPartial>
  <Entity mutationType="Create" id="A.module/X.entity">
  <![CDATA[
  {}
  ]]>
  </Entity>
</MutationPartial>
<MutationPartial>
  <!-- update类别，执行变更后，会用CDATA内部的json，对原来内容的全量替换 -->
  <Entity mutationType="Update" id="B.module/Y.entity">
  <![CDATA[
  {}
  ]]>
  </Entity>
</MutationPartial>
<MutationPartial>
  <Entity mutationType="Delete" id="C.module/Z.entity" />
</MutationPartial>

对外http端点变更：
<MutationPartial>
  <HttpEndpoint mutationType="Create" id="A.module/X.endpoint.proc">
  <![CDATA[
  {}
  ]]>
  </HttpEndpoint>
</MutationPartial>
<MutationPartial>
  <!-- update类别，执行变更后，会用CDATA内部的json，对原来内容的全量替换 -->
  <HttpEndpoint mutationType="Update" id="B.module/Y.endpoint.proc">
  <![CDATA[
  {}
  ]]>
  </HttpEndpoint>
</MutationPartial>
<MutationPartial>
  <HttpEndpoint mutationType="Delete" id="C.module/Z.endpoint.proc" />
</MutationPartial>

kafka消费者变更：
<MutationPartial>
  <KafkaConsumer mutationType="Create" id="A.module/X.kafkA.module/X.proc">
  <![CDATA[
  {}
  ]]>
  </KafkaConsumer>
</MutationPartial>
<MutationPartial>
  <!-- update类别，执行变更后，会用CDATA内部的json，对原来内容的全量替换 -->
  <KafkaConsumer mutationType="Update" id="B.module/Y.kafkA.module/X.proc">
  <![CDATA[
  {}
  ]]>
  </KafkaConsumer>
</MutationPartial>
<MutationPartial>
  <KafkaConsumer mutationType="Delete" id="C.module/Z.kafkA.module/X.proc" />
</MutationPartial>


对其他模块开放访问的逻辑变更：
<MutationPartial>
  <PublicProcedure mutationType="Create" id="A.module/X.publiC.module/Z.proc">
  <![CDATA[
  {}
  ]]>
  </PublicProcedure>
</MutationPartial>
<MutationPartial>
  <!-- update类别，执行变更后，会用CDATA内部的json，对原来内容的全量替换 -->
  <PublicProcedure mutationType="Update" id="B.module/Y.publiC.module/Z.proc">
  <![CDATA[
  {}
  ]]>
  </PublicProcedure>
</MutationPartial>
<MutationPartial>
  <PublicProcedure mutationType="Delete" id="C.module/Z.publiC.module/Z.proc" />
</MutationPartial>

仅模块内部可访问的逻辑变更：
<MutationPartial>
  <PrivateProcedure mutationType="Create" id="A.module/X.private.proc">
  <![CDATA[
  {}
  ]]>
  </PrivateProcedure>
</MutationPartial>
<MutationPartial>
  <!-- update类别，执行变更后，会用CDATA内部的json，对原来内容的全量替换 -->
  <PrivateProcedure mutationType="Update" id="B.module/Y.private.proc">
  <![CDATA[
  {}
  ]]>
  </PrivateProcedure>
</MutationPartial>
<MutationPartial>
  <PrivateProcedure mutationType="Delete" id="C.module/Z.private.proc" />
</MutationPartial>

【重要】每个MutationPartial 内，只能出现一种子dsl类别，如果要修改多种类别，应当返回多个MutationPartial
badcase如下：
<MutationPartial>
  <Module mutationType="Create" id="A.module">
  <![CDATA[
  {}
  ]]>
  </Module>
  <PrivateProcedure mutationType="Delete" id="C.module/Z.private.proc" />
</MutationPartial>

【重要】内层需要【有且仅有一个】子dsl类别的变更
badcase如下：
<MutationPartial>
  <Entity mutationType="Create" id="A.entity">
  <![CDATA[
  {}
  ]]>
  </Entity>
  <Entity mutationType="Delete" id="B.entity">
</MutationPartial>

@DetailDesignExplainPrompt