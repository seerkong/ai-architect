import { EntityItem, EnumItem, ModuleItem, ProcedureItem, TechDesignSnapshotDsl } from "@shared/contract";

// 定义分组后的数据结构
export interface ProcedureGroupedDoc {
  Module: { [key: string]: ModuleItem };
  Entity: { [key: string]: EntityItem };
  Enum: { [key: string]: EnumItem };
  GroupedProcedure: { [moduleId: string]: ModuleProcedureGroup };
}

export interface ModuleProcedureGroup {
  HttpEndpoint: { [key: string]: ProcedureItem };
  KafkaConsumer: { [key: string]: ProcedureItem };
  PublicProcedure: { [key: string]: ProcedureItem };
  PrivateProcedure: { [key: string]: ProcedureItem };
}

// 将dsl结构中的procedure, 按照procedure id中对应模块前缀进行分组
// 枚举、实体、模块 不进行分组
export function dslToOnlyProcedureGrouped(dsl: TechDesignSnapshotDsl): ProcedureGroupedDoc {
  const result: ProcedureGroupedDoc = {
    Module: dsl.Module,
    Entity: dsl.Entity,
    Enum: dsl.Enum,
    GroupedProcedure: {}
  };

  // 处理所有类型的procedures
  const procedureTypes = [
    { name: 'HttpEndpoint', data: dsl.HttpEndpoint },
    { name: 'KafkaConsumer', data: dsl.KafkaConsumer },
    { name: 'PublicProcedure', data: dsl.PublicProcedure },
    { name: 'PrivateProcedure', data: dsl.PrivateProcedure }
  ];

  procedureTypes.forEach(({ name, data }) => {
    Object.keys(data).forEach(procedureId => {
      // 提取模块前缀，格式如 "News.module/GetNewsList.endpoint.proc" -> "News.module"
      const moduleId = procedureId.split('/')[0];

      if (!result.GroupedProcedure[moduleId]) {
        result.GroupedProcedure[moduleId] = {
          HttpEndpoint: {},
          KafkaConsumer: {},
          PublicProcedure: {},
          PrivateProcedure: {}
        };
      }

      // 将procedure添加到对应模块的对应类型中
      (result.GroupedProcedure[moduleId] as any)[name][procedureId] = data[procedureId];
    });
  });

  return result;
}