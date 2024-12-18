import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import {
  BaseLot,
  MomInspectionMeasurement,
  MomInspectionSheet,
  MomInventoryApplicationItem
} from "~/_definitions/meta/entity-types";

export default [
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, payload, routerContext } = ctx;

      const before = payload.before
      let changes = payload.changes

      if (before.hasOwnProperty('lotNum')) {
        const lotManager = server.getEntityManager<BaseLot>("base_lot");
        const lot = await lotManager.findEntity({
          filters: [
            { operator: "eq", field: "lotNum", value: before.lotNum },
            {
              operator: "eq",
              field: "material_id",
              value: before.material?.id || before.material_id
            }],
          properties: ["id"],
        });
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
        const lotManager = server.getEntityManager<BaseLot>("base_lot");
        const lot = await lotManager.findEntity({
          filters: [
            { operator: "eq", field: "lotNum", value: before.lotNum },
            {
              operator: "eq",
              field: "material_id",
              value: before.material?.id || before.material_id
            }],
          properties: ["id"],
        });
        if (lot) {
          before.lot = { id: lot?.id };
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
      const before = payload.before;

      const operationTarget = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
        filters: [
          {
            operator: "eq",
            field: "id",
            value: after.id,
          },
        ],
        properties: ["id", "code", "lot", "material", "lotNum", "result", "inventoryOperation"],
        relations: {
          inventoryOperation: {
            properties: ["id", "application"],
          },
        },
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
              before: before,
            }
          })
        }
      }

      if (operationTarget?.inventoryOperation?.application && operationTarget?.lotNum && operationTarget?.result) {
        const momInventoryApplicationItemManager = server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item");
        const momInventoryApplicationItem = await momInventoryApplicationItemManager.findEntity({
          filters: [
            { operator: "eq", field: "lotNum", value: operationTarget.lotNum },
            {
              operator: "eq",
              field: "operation_id",
              value: operationTarget.inventoryOperation.application.id
            }],
          properties: ["id"],
        });

        if (momInventoryApplicationItem) {
          await momInventoryApplicationItemManager.updateEntityById({
            id: momInventoryApplicationItem.id,
            entityToSave: {
              inspectState: operationTarget.result,
            }
          })
        }

      }

      if (changes.hasOwnProperty('state') && changes.state === 'inspected') {
        const measurements = await server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").findEntities(
          {
            filters: [
              { operator: "eq", field: "sheet_id", value: after.id },
            ],
            properties: ["id"],
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
      }

      if (after.lotNum && after.material_id) {
        const lotManager = server.getEntityManager<BaseLot>("base_lot");
        const lot = await lotManager.findEntity({
          filters: [
            { operator: "eq", field: "lotNum", value: operationTarget?.lotNum },
            {
              operator: "eq",
              field: "material_id",
              value: operationTarget?.material?.id
            }],
          properties: ["id"],
        });
        if (lot && after.result) {
          await lotManager.updateEntityById({
            routeContext: ctx.routerContext,
            id: operationTarget?.lot?.id,
            entityToSave: {
              qualificationState: operationTarget?.result,
            },
          });
        }
      }

      if (changes.hasOwnProperty('treatment')) {
        if (after.lot_id) {
          const isAOD = changes.treatment === 'special';
          const qualified = operationTarget?.result === 'qualified' ? 'true' : changes.treatment === 'forced';
          await server.getEntityManager<BaseLot>("base_lot").updateEntityById({
            routeContext: ctx.routerContext,
            id: operationTarget?.lot?.id,
            entityToSave: {
              treatment: changes.treatment,
              isAOD: isAOD,
              qualificationState: qualified ? 'qualified' : 'unqualified',
            }
          });
        }
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
            before: before,
          }
        })
      }
    },
  },
] satisfies EntityWatcher<any>[];
