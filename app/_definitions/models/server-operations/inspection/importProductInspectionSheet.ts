import { getNowStringWithTimezone, type ActionHandlerContext, type IRpdServer, type RouteContext, type ServerOperation } from "@ruiapp/rapid-core";
import EntityManager from "@ruiapp/rapid-core/dist/dataAccess/entityManager";
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
import { productInspectionImportSettingsIgnoredCharNames } from "~/settings/productInspectionImportSettings";
import type { ProductionInspectionSheetImportColumn } from "~/types/production-inspection-sheet-import-types";

export interface ImportInspectionSheetsOptions {
  columns: ProductionInspectionSheetImportColumn[];
  data: any[][];
  importingMode: "overwrite" | "append";
}

export interface ImportInspectionSheetOptions {
  server: IRpdServer;
  routeContext: RouteContext;
  importContext: Record<string, any>;
  columns: ProductionInspectionSheetImportColumn[];
  row: any[];
}

export default {
  code: "importProductInspectionSheet",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext, input } = ctx;

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

    const inspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");

    const inspectionSheetsToSave: Partial<MomInspectionSheet>[] = [];
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];

      const importOptions: ImportInspectionSheetOptions = {
        server,
        routeContext,
        importContext: {
          pqcInspectionCategory,
          commonCharacters,
        },
        columns,
        row,
      };
      const inspectionSheet = await convertDataRowToInspectionSheet(importOptions);
      inspectionSheetsToSave.push(inspectionSheet);
    }

    for (const inspectionSheetToSave of inspectionSheetsToSave) {
      const currentInspectionSheet = await findCurrentInspectionSheet(server, routeContext, inspectionSheetManager, inspectionSheetToSave);
      if (currentInspectionSheet) {
        if (
          currentInspectionSheet.state === "inspected" &&
          (currentInspectionSheet.approvalState === "approved" || currentInspectionSheet.approvalState === "rejected")
        ) {
          continue;
        }

        inspectionSheetToSave.state = "inspected";
        inspectionSheetToSave.approvalState = "approving";

        if (currentInspectionSheet.samples && currentInspectionSheet.samples.length === 1 && inspectionSheetToSave.samples) {
          inspectionSheetToSave.samples[0].id = currentInspectionSheet.samples[0].id;
        }

        await inspectionSheetManager.updateEntityById({
          routeContext,
          id: currentInspectionSheet.id,
          entityToSave: inspectionSheetToSave,
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
      } else {
        inspectionSheetToSave.state = "inspected";
        inspectionSheetToSave.approvalState = "approving";
        //TODO: set approvalState ?
        await inspectionSheetManager.createEntity({
          routeContext,
          entity: {
            ...inspectionSheetToSave,
          } as Partial<MomInspectionSheet>,
        });
      }
    }

    ctx.output = { result: "ok", inspectionSheetsToSave };
  },
} satisfies ServerOperation;

async function convertDataRowToInspectionSheet(options: ImportInspectionSheetOptions): Promise<Partial<MomInspectionSheet>> {
  const { server, routeContext, importContext, columns, row } = options;
  const { pqcInspectionCategory } = importContext;
  const commonCharacters: MomInspectionCommonCharacteristic[] = importContext.commonCharacters;

  const inspectionSample: Partial<MomInspectionSheetSample> = {
    code: "1",
    round: 1,
    measurements: [],
  };
  const inspectionSheet: Partial<MomInspectionSheet> = {
    sampleCount: 1,
    samples: [inspectionSample],
  };

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
      } else if (propertyCode === "inspectorName") {
        // 查找检验员
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

        if (users.length) {
          inspectionSheet.inspector = {
            id: users[0].id,
          };
        }
      } else if (propertyCode === "materialAbbr") {
        // 根据规格搜索产品
        const materialManager = server.getEntityManager<BaseMaterial>("base_material");
        const materials = await materialManager.findEntities({
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

        material = materials[0];

        if (materials.length) {
          inspectionSheet.material = {
            id: material.id,
          };
        } else {
          throw new Error(`不存在牌号为“${cellText}”的产品。`);
        }

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

        if (inspectionRules.length) {
          inspectionSheet.rule = {
            id: inspectionRules[0].id,
          };
        }
      } else {
        inspectionSheet[propertyCode] = cellText;
      }

      // 将检验时间设置为导入时间
      inspectionSheet.inspectedAt = getNowStringWithTimezone();
    } else {
      if (!cellText) {
        continue;
      }

      if (productInspectionImportSettingsIgnoredCharNames.includes(column.charName)) {
        continue;
      }

      if (!inspectionRule) {
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
              field: "material_id",
              value: material!.id,
            },
            {
              operator: "null",
              field: "customer_id",
            },
          ],
        });

        if (inspectionRules.length) {
          inspectionRule = inspectionRules[0];
        } else {
          throw new Error(`产品 ${material?.specification} 没有配置“${pqcInspectionCategory.name}”规则。`);
        }
      }

      const charName = column.charName;
      let character = find(inspectionRule?.characteristics, (char: MomInspectionCharacteristic) => {
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
          if (!Number.isNaN(cellValue)) {
            measurement.quantitativeValue = cellValue;
          }
        }
      } else if (columnType === "instrumentCode") {
        measurement.instrumentCode = cellText;
      }
    }
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
