import { getNowStringWithTimezone, type ActionHandlerContext, type IRpdServer, type RouteContext, type ServerOperation } from "@ruiapp/rapid-core";
import EntityManager from "@ruiapp/rapid-core/dist/dataAccess/entityManager";
import dayjs from "dayjs";
import { find, get, sample } from "lodash";
import { InspectionResult } from "~/_definitions/meta/data-dictionary-types";
import {
  BaseMaterial,
  MomInspectionCategory,
  MomInspectionCharacteristic,
  MomInspectionCommonCharacteristic,
  MomInspectionMeasurement,
  MomInspectionRule,
  MomInspectionSheet,
  MomInspectionSheetSample,
  OcUser,
  SaveMomInspectionCharacteristicInput,
} from "~/_definitions/meta/entity-types";
import { refreshInspectionSheetInspectionResult } from "~/services/InspectionSheetService";
import { productInspectionImportSettingsIgnoredCharNames } from "~/settings/productInspectionImportSettings";
import type { ProductionInspectionSheetImportColumn } from "~/types/production-inspection-sheet-import-types";
import { formatDateTimeWithoutTimezone } from "~/utils/time-utils";

export interface ImportInspectionSheetsOptions {
  columns: ProductionInspectionSheetImportColumn[];
  data: any[][];
  importingMode: "overwrite" | "append";
}

export interface ImportInspectionSheetOptions {
  server: IRpdServer;
  routeContext: RouteContext;
  importContext: ImportInspectionSheetContext;
  columns: ProductionInspectionSheetImportColumn[];
  row: any[];
}

export interface ImportInspectionSheetContext {
  row?: any[];
  pqcInspectionCategory: MomInspectionCategory;
  commonCharacters: MomInspectionCommonCharacteristic[];
  caches: {
    materials: Map<string, any>;
    inspectionRules: Map<string, any>;
    users: Map<string, any>;
  };
  materialOfCurrentRow?: BaseMaterial;
  inspectionRuleOfCurrentRow?: MomInspectionRule;
}

export default {
  code: "importProductInspectionSheet",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext, input } = ctx;
    const logger = server.getLogger();

    const currentUserId = routeContext.state.userId;
    if (!currentUserId) {
      throw new Error("禁止未认证用户进行此操作。");
    }
    const options: ImportInspectionSheetsOptions = input;
    const { data, columns } = options;

    if (data.length < 2) {
      throw new Error("没有发现要导入的记录");
    }

    const inspectionCategoryManager = server.getEntityManager<MomInspectionCategory>("mom_inspection_category");
    const pqcInspectionCategory = await inspectionCategoryManager.findEntity({
      routeContext,
      filters: [
        {
          operator: "eq",
          field: "name",
          value: "产成品检验",
        },
        {
          operator: "null",
          field: "deletedAt",
        },
      ],
    });

    if (!pqcInspectionCategory) {
      throw new Error("未找到名为“产成品检验”的检验类型。");
    }

    // 准备通用检验特征信息
    const commonCharManager = server.getEntityManager<MomInspectionCommonCharacteristic>("mom_inspection_common_characteristic");
    const commonCharacters = await commonCharManager.findEntities({
      routeContext,
      filters: [
        {
          operator: "null",
          field: "deletedAt",
        },
      ],
    });

    const importContext: ImportInspectionSheetContext = {
      pqcInspectionCategory,
      commonCharacters,
      caches: {
        materials: new Map(),
        inspectionRules: new Map(),
        users: new Map(),
      },
    };

    const inspectionSheetsSaved: Partial<MomInspectionSheet>[] = [];
    for (let rowNum = 1; rowNum < data.length; rowNum++) {
      const row = data[rowNum];

      const importOptions: ImportInspectionSheetOptions = {
        server,
        routeContext,
        importContext,
        columns,
        row,
      };

      try {
        const inspectionSheet = await convertDataRowToInspectionSheet(importOptions);
        if (!inspectionSheet) {
          logger.error(`R${rowNum}: 无效的检验记录。`);
          continue;
        }

        await saveInspectionSheet(server, routeContext, inspectionSheet);
        inspectionSheetsSaved.push(inspectionSheet);
      } catch (ex: any) {
        logger.error("保存检验记录失败。%s", ex.message);
      }
    }

    ctx.output = { result: "ok", inspectionSheetsToSave: inspectionSheetsSaved };
  },
} satisfies ServerOperation;

async function convertDataRowToInspectionSheet(options: ImportInspectionSheetOptions): Promise<Partial<MomInspectionSheet> | null> {
  const { server, routeContext, importContext, columns, row } = options;
  const { pqcInspectionCategory, caches } = importContext;
  const commonCharacters: MomInspectionCommonCharacteristic[] = importContext.commonCharacters;

  const { materials: materialsCache, users: usersCache, inspectionRules: inspectionRulesCache } = caches;

  const inspectionSample: Partial<MomInspectionSheetSample> = {
    code: "1",
    round: 1,
    measurements: [],
  };
  const inspectionSheet: Partial<MomInspectionSheet> = {
    sampleCount: 1,
    samples: [inspectionSample],
  };

  // 将检验时间设置为导入时间
  inspectionSheet.inspectedAt = getNowStringWithTimezone();

  let material: BaseMaterial | undefined;
  let inspectionRule: MomInspectionRule | undefined;

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
    const column = columns[columnIndex];
    const cellText = (row[columnIndex] || "").trim();

    const columnType = column.type;

    if (columnType === "sheetProperty") {
      const { propertyCode } = column;
      if (propertyCode === "result") {
        const resultValueMap: Record<string, InspectionResult> = {
          合格: "qualified",
          不合格: "unqualified",
          一次送检合格: "qualified",
          一次送检不合格: "unqualified",
        };

        inspectionSheet.result = resultValueMap[cellText];
      } else if (propertyCode === "sampleDeliveryTime" || propertyCode === "productionTime") {
        if (!cellText) {
          inspectionSheet[propertyCode] = undefined;
        } else {
          inspectionSheet[propertyCode] = formatDateTimeWithoutTimezone(cellText);
        }
      } else if (propertyCode === "inspectorName") {
        // 查找检验员

        let user: OcUser;
        if (usersCache.has(cellText)) {
          user = usersCache.get(cellText);
        } else {
          const userManager = server.getEntityManager<OcUser>("oc_user");
          const users = await userManager.findEntities({
            routeContext,
            filters: [
              {
                operator: "eq",
                field: "name",
                value: cellText,
              },
              {
                operator: "null",
                field: "deletedAt",
              },
            ],
          });

          user = users[0] || null;
          usersCache.set(cellText, users[0]);
        }

        if (user) {
          inspectionSheet.inspector = {
            id: user.id,
          };
        }
      } else if (propertyCode === "materialAbbr") {
        // 根据规格搜索产品
        let materials: BaseMaterial[];
        if (materialsCache.has(cellText)) {
          materials = materialsCache.get(cellText);
        } else {
          const materialManager = server.getEntityManager<BaseMaterial>("base_material");
          materials = await materialManager.findEntities({
            routeContext,
            filters: [
              {
                operator: "eq",
                field: "specification",
                value: cellText,
              },
              {
                operator: "startsWith",
                field: "code",
                value: "03.",
              },
              {
                operator: "null",
                field: "deletedAt",
              },
            ],
          });

          materialsCache.set(cellText, materials);
        }

        if (!materials.length || materials.length > 1) {
          return null;
        }

        material = materials[0];
        importContext.materialOfCurrentRow = material;
        inspectionSheet.material = {
          id: material.id,
        };

        let inspectionRule: MomInspectionRule;
        if (inspectionRulesCache.has(cellText)) {
          inspectionRule = inspectionRulesCache.get(cellText);
        } else {
          const inspectionRuleManager = server.getEntityManager<MomInspectionRule>("mom_inspection_rule");
          const inspectionRules = await inspectionRuleManager.findEntities({
            routeContext,
            relations: {
              characteristics: {
                relations: {
                  commonChar: true,
                },
              },
            },
            filters: [
              {
                operator: "eq",
                field: "category_id",
                value: pqcInspectionCategory.id,
              },
              {
                operator: "eq",
                field: "material_id",
                value: material.id,
              },
              {
                operator: "null",
                field: "customer_id",
              },
            ],
          });

          inspectionRule = inspectionRules[0];
          inspectionRulesCache.set(cellText, inspectionRule);
        }

        if (!inspectionRule) {
          return null;
        }
        importContext.inspectionRuleOfCurrentRow = inspectionRule;

        inspectionSheet.rule = {
          id: inspectionRule.id,
        };
      } else {
        inspectionSheet[propertyCode] = cellText;
      }
    } else {
      if (!cellText) {
        continue;
      }

      if (productInspectionImportSettingsIgnoredCharNames.includes(column.charName)) {
        continue;
      }

      if (!inspectionRule) {
        continue;
      }

      const charName = column.charName;
      let character = find(inspectionRule.characteristics, (char: MomInspectionCharacteristic) => {
        return char.name === column.charName;
      }) as MomInspectionCharacteristic;

      if (!character) {
        const commonCharacter = find(commonCharacters, (item) => item.name === charName);
        if (!commonCharacter) {
          throw new Error(`检验值无效。${material!.specification}的检验规则中未配置名为“${charName}”的检验特征。`);
        }

        character = await server.getEntityManager<MomInspectionCharacteristic>("mom_inspection_characteristic").createEntity({
          routeContext,
          entity: {
            rule: { id: inspectionRule?.id },
            name: charName,
            kind: commonCharacter.kind || "quantitative",
            isCommon: true,
            skippable: true,
            mustPass: false,
            qualitativeDetermineType: commonCharacter.qualitativeDetermineType,
            norminal: commonCharacter.norminal,
            unitName: commonCharacter.unitName,
            orderNum: 99,
          } satisfies SaveMomInspectionCharacteristicInput,
        });

        inspectionRule.characteristics?.push(character);
      }

      let measurement = find<Partial<MomInspectionMeasurement>>(inspectionSample.measurements, (item) => get(item, "characteristic.id") === character.id);
      if (!measurement) {
        measurement = {
          locked: true,
          characteristic: { id: character.id },
        };
        inspectionSample.measurements!.push(measurement);
      }

      if (columnType === "measurementValue") {
        if (character.kind === "qualitative") {
          measurement.qualitativeValue = cellText;
        } else {
          const cellValue = parseFloat(cellText);
          if (Number.isNaN(cellValue)) {
            // 尝试兼容处理多轮检验值的记录形式
            const values = cellText.split("/");
            const actualValue = parseFloat(values[0]);
            if (!Number.isNaN(actualValue)) {
              measurement.quantitativeValue = actualValue;
            }
          } else {
            measurement.quantitativeValue = cellValue;
          }
        }
      } else if (columnType === "instrumentCode") {
        measurement.instrumentCode = cellText;
      }
    }
  }

  if (inspectionSheet.sampleDeliveryTime) {
    inspectionSheet.inspectedAt = inspectionSheet.sampleDeliveryTime;
  }

  return inspectionSheet;
}

async function findCurrentInspectionSheet(
  server: IRpdServer,
  routeContext: RouteContext,
  inspectionSheetManager: EntityManager<MomInspectionSheet>,
  predicate: Partial<MomInspectionSheet>,
) {
  const entity = await inspectionSheetManager.findEntity({
    routeContext,
    filters: [
      //TODO: 查找对应检验单时，暂时不要求检验类型为“产成品检验”。待系统中自动生成产品品检验单的检验类型错误问题修正后再恢复。
      // {
      //   operator: "eq",
      //   field: "rule_id",
      //   value: predicate.rule?.id,
      // },
      {
        operator: "eq",
        field: "material_id",
        value: predicate.material?.id,
      },
      {
        operator: "eq",
        field: "lotNum",
        value: predicate.lotNum,
      },
    ],
    relations: {
      samples: {
        relations: {
          measurements: true,
        },
      },
    },
    orderBy: [
      {
        field: "id",
        desc: true,
      },
    ],
  });

  return entity;
}

async function saveInspectionSheet(server: IRpdServer, routeContext: RouteContext, inspectionSheet: Partial<MomInspectionSheet>) {
  const inspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");
  const currentInspectionSheet = await findCurrentInspectionSheet(server, routeContext, inspectionSheetManager, inspectionSheet);
  if (currentInspectionSheet) {
    if (
      currentInspectionSheet.state === "inspected" &&
      (currentInspectionSheet.approvalState === "approved" || currentInspectionSheet.approvalState === "rejected")
    ) {
      return;
    }

    inspectionSheet.state = "inspected";
    inspectionSheet.approvalState = "approving";

    if (currentInspectionSheet.samples && currentInspectionSheet.samples.length === 1 && inspectionSheet.samples) {
      inspectionSheet.samples[0].id = currentInspectionSheet.samples[0].id;
    }

    const newInspectionSheet = await inspectionSheetManager.updateEntityById({
      routeContext,
      id: currentInspectionSheet.id,
      entityToSave: inspectionSheet,
      relationPropertiesToUpdate: {
        samples: {
          relationRemoveMode: "delete",
          relationPropertiesToUpdate: {
            measurements: {
              relationRemoveMode: "delete",
              propertiesToUpdate: ["quantitativeValue", "qualitativeValue", "isQualified", "inspector", "instrumentCode"],
            },
          },
        },
      },
    });

    await refreshInspectionSheetInspectionResult(server, routeContext, newInspectionSheet.id);
  } else {
    inspectionSheet.state = "inspected";
    inspectionSheet.approvalState = "approving";
    //TODO: set approvalState ?
    const newInspectionSheet = await inspectionSheetManager.createEntity({
      routeContext,
      entity: {
        ...inspectionSheet,
      } as Partial<MomInspectionSheet>,
    });
    await refreshInspectionSheetInspectionResult(server, routeContext, newInspectionSheet.id);
  }
}
