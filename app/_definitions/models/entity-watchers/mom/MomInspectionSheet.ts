import type {EntityWatcher, EntityWatchHandlerContext, IRpdServer} from "@ruiapp/rapid-core";
import {
  BaseLot,
  HuateGCMS,
  MomInspectionMeasurement,
  MomInspectionSheet,
  type SaveBaseLotInput,
  SaveHuateGCMSInput
} from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";
import path from "path";
import * as XLSX from 'xlsx';
import fs from "fs";

export default [
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, payload, routerContext } = ctx;

      const before = payload.before
      let changes = payload.changes

      if (changes.hasOwnProperty('lotNum')) {
        const lot = await saveMaterialLotInfo(server, {
          lotNum: before.lotNum,
          material: { "id": before.material?.id || before.material || before.material_id },
          sourceType: "selfMade",
          qualificationState: "uninspected",
          isAOD: false,
          state: "normal",
        } as SaveBaseLotInput);
        if (lot) {
          changes.lot = { id: lot?.id };
        }
      }

      if (changes.hasOwnProperty('approvalState') && changes.approvalState !== before.approvalState) {
        changes.reviewer = routerContext?.state.userId;
      }

      if (changes.hasOwnProperty('state') && changes.state === 'inspected') {
        changes.inspector = routerContext?.state.userId;
      }
    },
  },
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, payload } = ctx;

      let before = payload.before

      if (before.hasOwnProperty('lotNum')) {
        const lot = await saveMaterialLotInfo(server, {
          lotNum: before.lotNum,
          material: { "id": before.material?.id || before.material || before.material_id },
          sourceType: "selfMade",
          qualificationState: "uninspected",
          isAOD: false,
          state: "normal",
        } as SaveBaseLotInput);
        if (lot) {
          before.lot_id = lot?.id;
        }
      }
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;

      let after = payload.after

      const operationTarget = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
        filters: [
          {
            operator: "eq",
            field: "id",
            value: after.id,
          },
        ],
        properties: ["id", "material", "code", "gcmsReportFile"],
      });


      if (operationTarget?.gcmsReportFile && operationTarget?.material?.name === "石蜡油" && operationTarget?.gcmsReportFile.key.endsWith(".xlsx")) {
        const items = await readGCMSFile(server, operationTarget?.gcmsReportFile?.key)
        if (items) {
          const gcmsItems = await server.getEntityManager<HuateGCMS>("huate_gcms").findEntities({
            filters: [{
              operator: "eq",
              field: "enabled",
              value: true
            }]
          });
          if (gcmsItems && gcmsItems.length > 0) {
            //   check if all items in gcmsItems

            let gcmsPassed = true
            for (const item of items) {
              const gcmsItem = gcmsItems.find((gcmsItem) => {
                return item === gcmsItem.code
              })

              if (!gcmsItem) {
                gcmsPassed = false
              }

              await server.getEntityManager<HuateGCMS>("huate_gcms").createEntity({
                entity: {
                  material: after?.material?.id || after?.material || after?.material_id,
                  momInspectionSheetId: after.id,
                  code: item,
                  enabled: !!gcmsItem,
                  needInspect: !gcmsItem,
                } as SaveHuateGCMSInput
              })
            }

            await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").updateEntityById({
              routeContext: ctx.routerContext,
              id: after.id,
              entityToSave: {
                gcmsPassed: gcmsPassed,
              }
            })
          }
        }
      }
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, payload } = ctx;

      const after = payload.after;
      const changes = payload.changes;

      const operationTarget = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
        filters: [
          {
            operator: "eq",
            field: "id",
            value: after.id,
          },
        ],
        properties: ["id", "material", "code"],
      });

      if (changes) {
        if (ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inspection_sheet",
              targetSingularName: `检验单 - ${ operationTarget?.code }`,
              method: "update",
              changes: changes,
            }
          })
        }
      }

      if (changes.hasOwnProperty('gcmsReportFile') && operationTarget?.material?.name === "石蜡油" && changes?.gcmsReportFile.key.endsWith(".xlsx")) {
        const items = await readGCMSFile(server, after?.gcmsReportFile?.key)
        if (items) {
          const gcmsItems = await server.getEntityManager<HuateGCMS>("huate_gcms").findEntities({
            filters: [{
              operator: "eq",
              field: "enabled",
              value: true
            }]
          });
          if (gcmsItems && gcmsItems.length > 0) {
            //   check if all items in gcmsItems

            let gcmsPassed = true
            for (const item of items) {
              const gcmsItem = gcmsItems.find((gcmsItem) => {
                return item === gcmsItem.code
              })

              if (!gcmsItem) {
                gcmsPassed = false
              }

              await server.getEntityManager<HuateGCMS>("huate_gcms").createEntity({
                entity: {
                  material: after?.material?.id || after?.material || after?.material_id,
                  momInspectionSheetId: after.id,
                  code: item,
                  enabled: !!gcmsItem,
                  needInspect: !gcmsItem,
                } as SaveHuateGCMSInput
              })
            }

            await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").updateEntityById({
              routeContext: ctx.routerContext,
              id: after.id,
              entityToSave: {
                gcmsPassed: gcmsPassed,
              }
            })
          }
        }
      }

      if (changes.hasOwnProperty('state') && changes.state === 'inspected') {
        const measurements = await server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").findEntities(
          {
            filters: [
              { operator: "eq", field: "sheet_id", value: after.id },
            ],
            properties: ["id", "sheet", "characteristic", "qualitativeValue", "quantitativeValue", "isQualified"],
            relations: {
              characteristic: {
                relations: {
                  method: true,
                },
              },
              sheet: {
                properties: ["id", "code", "lotNum", "material", "rule", "result", "reportFile", "gcmsReportFile", "invoiceReportFile", "normalReportFile", "qualityReportFile", "createdBy", "gcmsPassed"],
                relations: {
                  rule: {
                    properties: ["id", "name", "category"],
                  },
                },
              },
            }
          }
        );

        for (const measurement of measurements) {
          await server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").updateEntityById({
            routeContext: ctx.routerContext,
            id: measurement.id,
            entityToSave: {
              locked: true,
            }
          });
        }

        const yidaSDK = await new YidaHelper(server).NewAPIClient();
        const yidaAPI = new YidaApi(yidaSDK);

        await yidaAPI.uploadInspectionMeasurements(measurements)

        const yidaResp = await yidaAPI.uploadInspectionSheetAudit(measurements)

        if (yidaResp && yidaResp.result) {
          await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").updateEntityById({
            routeContext: ctx.routerContext,
            id: after.id,
            entityToSave: {
              yidaId: yidaResp.result
            }
          });
        }

      }

      if (after.lotNum && after.material_id) {
        const lotManager = server.getEntityManager<BaseLot>("base_lot");
        const lot = await lotManager.findEntity({
          filters: [
            { operator: "eq", field: "lotNum", value: after.lotNum },
            {
              operator: "eq",
              field: "material_id",
              value: after.material_id
            }],
          properties: ["id"],
        });
        if (lot && after.result) {
          await lotManager.updateEntityById({
            routeContext: ctx.routerContext,
            id: lot.id,
            entityToSave: {
              qualificationState: after.result,
            },
          });
        }
      }

      if (changes.hasOwnProperty('treatment')) {
        if (after.lot_id) {
          const isAOD = changes.treatment === 'special';
          const qualified = after.result === 'qualified' ? 'true' : changes.treatment === 'forced';
          await server.getEntityManager<BaseLot>("base_lot").updateEntityById({
            routeContext: ctx.routerContext,
            id: after.lot_id,
            entityToSave: {
              treatment: changes.treatment,
              isAOD: isAOD,
              qualificationState: qualified ? 'qualified' : 'unqualified',
            }
          });
        }
      }

      //   TODO: 处理GCMS文件

      try {
        if (changes.hasOwnProperty('gcmsReportFile') && changes?.gcmsReportFile.key.endsWith(".xlsx")) {
          const items = await readGCMSFile(server, after.gcmsReportFile.key)
          if (items) {
            const gcmsItems = await server.getEntityManager<HuateGCMS>("huate_gcms").findEntities({
              filters: [{
                operator: "eq",
                field: "enabled",
                value: true
              }]
            });
            if (gcmsItems && gcmsItems.length > 0) {
              //   check if all items in gcmsItems

              for (const item of items) {
                const gcmsItem = gcmsItems.find((gcmsItem) => {
                  return item === gcmsItem.code
                })

                await server.getEntityManager<HuateGCMS>("huate_gcms").createEntity({
                  entity: {
                    material: after?.material?.id || after?.material || after?.material_id,
                    momInspectionSheetId: after.id,
                    code: item,
                    enabled: !!gcmsItem,
                    needInspect: !gcmsItem,
                  } as SaveHuateGCMSInput
                })
              }
            }
          }
        }
      } catch (error) {
        console.error(error)
      }



    }
  },
  {
    eventName: "entity.beforeDelete",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeDelete">) => {
      const { server, payload, routerContext } = ctx;

      const before = payload.before

      const operationTarget = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
        filters: [
          {
            operator: "eq",
            field: "id",
            value: before.id,
          },
        ],
        properties: ["id", "code"],
      });
      if (ctx?.routerContext?.state.userId) {
        await server.getEntityManager("sys_audit_log").createEntity({
          entity: {
            user: { id: ctx?.routerContext?.state.userId },
            targetSingularCode: "mom_inspection_sheet",
            targetSingularName: `检验单 - ${ operationTarget?.code }`,
            method: "delete",
          }
        })
      }
    },
  },
] satisfies EntityWatcher<any>[];


async function saveMaterialLotInfo(server: IRpdServer, lot: SaveBaseLotInput) {
  if (!lot.lotNum || !lot.material || !lot.material.id) {
    throw new Error("lotNum and material are required when saving lot info.");
  }

  const baseLotManager = server.getEntityManager<BaseLot>("base_lot");
  const lotInDb = await baseLotManager.findEntity({
    filters: [
      { operator: "eq", field: "lot_num", value: lot.lotNum },
      { operator: "eq", field: "material_id", value: lot.material.id },
    ],
  });

  return lotInDb || (await baseLotManager.createEntity({ entity: lot }));
}


async function readGCMSFile(server: IRpdServer, fileKey: string) {
  // TODO: 处理上报GCMS报告
  const filePathName = path.join(server.config.localFileStoragePath, fileKey);
  const fileBuffer = fs.readFileSync(filePathName);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

  // Get the "LibRes" sheet
  const sheetName = 'LibRes';
  const worksheet = workbook.Sheets[sheetName];

  if (worksheet) {
    // Convert the sheet to JSON
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let targetColumnIndex = -1;
    let dataStartIndex = -1;

    // Scan the data to find the row with "匹配项名称"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (Array.isArray(row)) {
        const columnIndex = row.indexOf('匹配项名称');
        if (columnIndex !== -1) {
          targetColumnIndex = columnIndex;
          dataStartIndex = i + 1;  // Start reading data from the next row
          break;
        }
      }
    }

    if (targetColumnIndex !== -1 && dataStartIndex !== -1) {
      // Extract data from the target column starting from the correct row
      const matchingItems = data.slice(dataStartIndex).map(row => row[targetColumnIndex]);

      console.log('匹配项名称列长度:', matchingItems.length);

      return matchingItems
    } else {
      console.log('未找到"匹配项名称"列');
    }
  } else {
    console.log(`未找到表格: ${ sheetName }`);
  }

}





