import { XMLParser } from "fast-xml-parser";
import { AiToHumanConfirmItem, DomainDslTypes, DslTypeToStateKeyMap, MutationTypeEnum, TechDesignDslMutationItem } from "../../../../shared/contract";

// 解析回答中的待确认项
export function extractConfirmForm(content: string): AiToHumanConfirmItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
    processEntities: true,
    trimValues: true,
    preserveOrder: false
  });

  let confirmItems: { [id: string]: AiToHumanConfirmItem } = {};
  let itemOrder: string[] = []; // 记录出现顺序

  // 1. 解析所有 HumanConfirmPartial
  const partialRegex = /<HumanConfirmPartial>[\s\S]*?<\/HumanConfirmPartial>/g;
  const partials = content.match(partialRegex) || [];

  for (const partial of partials) {
    try {
      const xmlObj = parser.parse(partial);
      if (xmlObj['HumanConfirmPartial']) {
        const humanConfirmPartial = xmlObj['HumanConfirmPartial'];

        // 处理 Select 类型的确认项
        if (humanConfirmPartial['Select']) {
          let selectItems = humanConfirmPartial['Select'];
          if (!Array.isArray(selectItems)) {
            selectItems = [selectItems];
          }

          for (const selectItem of selectItems) {
            const id = selectItem['@_id'] || selectItem['@id'] || selectItem.id;
            const cdataText = selectItem['__cdata'] || selectItem['#text'] || '';

            if (id && cdataText) {
              try {
                const jsonData = eval(`(${cdataText})`);
                const confirmItem: AiToHumanConfirmItem = {
                  id: id,
                  title: jsonData.title || '',
                  options: jsonData.options || [],
                  type: 'select'
                };

                // 如果id已存在，记录顺序但覆盖内容
                if (!confirmItems[id]) {
                  itemOrder.push(id);
                }
                confirmItems[id] = confirmItem;
              } catch (e) {
                console.error(`extractConfirmForm Select error:`, e);
              }
            }
          }
        }

        // 处理 Input 类型的确认项
        if (humanConfirmPartial['Input']) {
          let inputItems = humanConfirmPartial['Input'];
          if (!Array.isArray(inputItems)) {
            inputItems = [inputItems];
          }

          for (const inputItem of inputItems) {
            const id = inputItem['@_id'] || inputItem['@id'] || inputItem.id;
            const cdataText = inputItem['__cdata'] || inputItem['#text'] || '';

            if (id && cdataText) {
              try {
                const jsonData = eval(`(${cdataText})`);
                const confirmItem: AiToHumanConfirmItem = {
                  id: id,
                  title: jsonData.title || '',
                  options: [], // Input 类型没有 options
                  type: 'input'
                };

                // 如果id已存在，记录顺序但覆盖内容
                if (!confirmItems[id]) {
                  itemOrder.push(id);
                }
                confirmItems[id] = confirmItem;
              } catch (e) {
                console.error(`extractConfirmForm Input error:`, e);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(`extractConfirmForm partial error:`, e);
    }
  }

  // 2. 按照出现顺序返回结果
  return itemOrder.map(id => confirmItems[id]).filter(item => item !== undefined);
}

// 解析回答中的dsl状态的修改指令
export function extractMutationPatch(content: string): { [key: string]: { [key: string]: TechDesignDslMutationItem } } {
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
    processEntities: true,
    trimValues: true,
    preserveOrder: false
  });
  let patch: { [key: string]: { [key: string]: TechDesignDslMutationItem } } = {};


  // 1. 解析所有 MutationPartial
  const partialRegex = /<MutationPartial>[\s\S]*?<\/MutationPartial>/g;
  const partials = content.match(partialRegex) || [];
  for (const partial of partials) {
    try {
      const xmlObj = parser.parse(partial);
      if (xmlObj['MutationPartial']) {
        for (const subDslType of DomainDslTypes) {
          if (xmlObj['MutationPartial'][subDslType]) {
            let subXmlObjects = xmlObj['MutationPartial'][subDslType];
            if (!Array.isArray(subXmlObjects)) {
              subXmlObjects = [subXmlObjects];
            }
            for (const subXmlObj of subXmlObjects) {
              let id = subXmlObj['@_id'] || subXmlObj['@id'] || subXmlObj.id;
              let mutationType = subXmlObj['@_mutationType'] || subXmlObj['@mutationType'] || subXmlObj.mutationType;
              let xmlBodyText = subXmlObj['__cdata'] || subXmlObj['#text'] || '';
              if (!patch[subDslType]) {
                patch[subDslType] = {};
              }
              // 使用表达式求值的方式将content转换为json
              let contentJson = {}
              try {
                contentJson = eval(`(${xmlBodyText})`);
              } catch (e) {
                contentJson = {};
                console.error(`extractPatch error:`, e);
              }
              patch[subDslType][id] = {
                mutationType: mutationType,
                data: contentJson
              } as TechDesignDslMutationItem;
            }

          }
        }
      }
    } catch (e) {
      // ignore parse error for partial
    }
  }

  return patch;
}


export function patchDslState(dslStateAfter: any, delta: { [key: string]: { [key: string]: TechDesignDslMutationItem } }) {
  for (const dslType of DomainDslTypes) {
    if (delta[dslType]) {
      for (const id in delta[dslType]) {
        let stateKey = DslTypeToStateKeyMap[dslType];
        if (!dslStateAfter[stateKey]) {
          dslStateAfter[stateKey] = {};
        }

        let mutation = delta[dslType][id];
        if (mutation.mutationType === MutationTypeEnum.Create.toString()) {
          mutation.data.version = 1;
          dslStateAfter[stateKey][id] = mutation.data;
        } else if (mutation.mutationType === MutationTypeEnum.Update.toString()) {
          if (!dslStateAfter[stateKey][id]) {
            dslStateAfter[stateKey][id] = {};
          }
          let version = dslStateAfter[stateKey][id]?.version || 0;
          mutation.data.version = version + 1;
          dslStateAfter[stateKey][id] = mutation.data;
        } else if (mutation.mutationType === MutationTypeEnum.Delete.toString()) {
          delete dslStateAfter[stateKey][id];
        }
      }
    }
  }
  return dslStateAfter;
}

// 对比两个镜像
// 如果after存在，而before不存在，则认为after是新增的
// 如果before存在，而after不存在，则认为before是删除的
// 如果before和after都存在，则认为before和after是更新的
export function diffSnapshot(snapshotBefore: any, snapshotAfter: any): { [key: string]: { [key: string]: TechDesignDslMutationItem } } {
  let diff: { [key: string]: { [key: string]: TechDesignDslMutationItem } } = {};
  for (const dslType of DomainDslTypes) {
    let recordsMapBefore = snapshotBefore[dslType] || {};
    let recordsMapAfter = snapshotAfter[dslType] || {};
    let recordsMapDiff: { [key: string]: TechDesignDslMutationItem } = {};
    let beforeIds = new Set<string>(Object.keys(recordsMapBefore));
    let afterIds = new Set<string>(Object.keys(recordsMapAfter));

    // createdIds = afterIds - beforeIds (在after中存在但在before中不存在的)
    let createdIds = new Set<string>();
    for (const id of afterIds) {
      if (!beforeIds.has(id)) {
        createdIds.add(id);
      }
    }

    // deletedIds = beforeIds - afterIds (在before中存在但在after中不存在的)
    let deletedIds = new Set<string>();
    for (const id of beforeIds) {
      if (!afterIds.has(id)) {
        deletedIds.add(id);
      }
    }

    // updatedIds = beforeIds ∩ afterIds (在before和after中都存在的)
    let updatedIds = new Set<string>();
    for (const id of beforeIds) {
      if (afterIds.has(id)) {
        updatedIds.add(id);
      }
    }


    for (const id of createdIds) {
      recordsMapAfter[id].version = 1;
      recordsMapDiff[id] = {
        mutationType: MutationTypeEnum.Create,
        data: recordsMapAfter[id]
      };
    }
    for (const id of deletedIds) {
      recordsMapDiff[id] = {
        mutationType: MutationTypeEnum.Delete,
        data: recordsMapBefore[id]
      };
    }
    for (const id of updatedIds) {
      let oldVersion = recordsMapBefore[id].version || 1;
      recordsMapBefore[id].version = null;
      recordsMapAfter[id].version = null;
      let isSame = isSameDsl(recordsMapBefore[id], recordsMapAfter[id]);
      if (!isSame) {
        recordsMapAfter[id].version = oldVersion + 1;
        recordsMapDiff[id] = {
          mutationType: MutationTypeEnum.Update,
          data: recordsMapAfter[id]
        };
      }
    }
    if (Object.keys(recordsMapDiff).length > 0) {
      diff[dslType] = recordsMapDiff;
    }
  }
  return diff;
}

function isSameDsl(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
