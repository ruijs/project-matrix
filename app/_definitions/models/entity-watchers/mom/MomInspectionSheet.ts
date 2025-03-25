import { getEntityRelationTargetId, type EntityWatcher, type EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import type { BaseLot, MomInspectionSheet } from "~/_definitions/meta/entity-types";
import {
  lockMeasurementsOfInspectionSheet,
  trySendInspectionSheetNotification,
  refreshInspectionSheetInspectionResult,
  updateQualificationStateOfRelatedApplicationItem,
  updateQualificationStateOfRelatedLot,
  determineInspectionSheetInspectionResult,
} from "~/services/InspectionSheetService";
import { refreshInventoryApplicationInspectionState } from "~/services/InventoryApplicationService";

export default [
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const before = payload.before as MomInspectionSheet;
      let changes = payload.changes as Partial<MomInspectionSheet>;

      if (changes.hasOwnProperty("lotNum")) {
        const materialId = getEntityRelationTargetId(before, "material", "material_id");
        const lotManager = server.getEntityManager<BaseLot>("base_lot");
        const lot = await lotManager.findEntity({
          routeContext,
          filters: [
            { operator: "eq", field: "lotNum", value: before.lotNum },
            { operator: "eq", field: "material_id", value: materialId },
          ],
          properties: ["id"],
        });
        if (lot) {
          changes.lot = { id: lot.id };
        }
      }

      if (changes.hasOwnProperty("approvalState") && changes.approvalState !== before.approvalState) {
        changes.reviewer = routeContext?.state.userId;
      }

      // 当用户点击提交检验记录按钮时，检验单状态更新为已检验，将当前用户设置为检验员
      if (changes.hasOwnProperty("state") && changes.state === "inspected") {
        changes.result = await determineInspectionSheetInspectionResult(server, routeContext, before.id);
        changes.inspector = routeContext?.state.userId;
      }
    },
  },
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      let before = payload.before;

      if (before.hasOwnProperty("lotNum")) {
        const lotManager = server.getEntityManager<BaseLot>("base_lot");
        const lot = await lotManager.findEntity({
          routeContext,
          filters: [
            { operator: "eq", field: "lotNum", value: before.lotNum },
            {
              operator: "eq",
              field: "material_id",
              value: before.material?.id || before.material_id,
            },
          ],
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
      const { server, routerContext: routeContext, payload } = ctx;

      const after = payload.after;
      const changes = payload.changes;
      const before = payload.before;

      const inspectionSheetId: number = after.id;

      const inspectionSheet = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
        routeContext,
        filters: [
          {
            operator: "eq",
            field: "id",
            value: inspectionSheetId,
          },
        ],
        properties: ["id", "code", "lot", "material", "lotNum", "result", "inventoryOperation"],
        relations: {
          inventoryOperation: {
            properties: ["id", "application"],
          },
        },
      });
      if (!inspectionSheet) {
        return;
      }

      // 当用户点击提交检验记录按钮后:
      // - 将检验值锁定，不允许修改。
      // - 更新检验单的检验状态
      if (changes.hasOwnProperty("state") && changes.state === "inspected") {
        await lockMeasurementsOfInspectionSheet(server, routeContext, inspectionSheetId);
      }

      // 审批通过后，更新操作单以及对应批次的检验结果
      if (changes.hasOwnProperty("approvalState") && changes.approvalState === "approved") {
        // 保持批次的`合格证状态`与检验单的`检验结果`一致
        await updateQualificationStateOfRelatedLot(server, routeContext, after);

        const inventoryApplication = inspectionSheet.inventoryOperation?.application;
        // 如果检验单关联了库存操作单以及库存业务申请单，则更新库存业务申请中对应批次物料的检验状态
        await updateQualificationStateOfRelatedApplicationItem(server, routeContext, inspectionSheet, inventoryApplication);

        // 当出入库申请中所有批次的物料都检验完成，将出入库申请单的检验状态设置成已完成。
        await refreshInventoryApplicationInspectionState(server, routeContext, inventoryApplication);
      }

      // 当变更 处理方式 时，更新对应批次的合格信息
      if (changes.hasOwnProperty("treatment")) {
        await updateQualificationStateOfRelatedLot(server, routeContext, after);
      }

      await server.getEntityManager("sys_audit_log").createEntity({
        routeContext,
        entity: {
          user: { id: ctx?.routerContext?.state.userId },
          targetSingularCode: "mom_inspection_sheet",
          targetSingularName: `检验单 - ${inspectionSheet?.code}`,
          method: "update",
          changes: changes,
          before: before,
        },
      });
    },
  },
  {
    eventName: "entity.beforeDelete",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeDelete">) => {
      const { server, payload, routerContext: routeContext } = ctx;

      const before = payload.before;

      const operationTarget = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
        routeContext,
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
          routeContext,
          entity: {
            user: { id: ctx?.routerContext?.state.userId },
            targetSingularCode: "mom_inspection_sheet",
            targetSingularName: `检验单 - ${operationTarget?.code}`,
            method: "delete",
            before: before,
          },
        });
      }
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload, routerContext: routeContext } = ctx;
      const inspectionSheet = payload.after;

      // 当从Excel导入检验数据时，检验单默认即为检验完成状态，此时应锁定检验值
      await lockMeasurementsOfInspectionSheet(server, routeContext, inspectionSheet.id);

      try {
        // 创建检验单时，尝试发送钉钉工作通知给相关用户
        trySendInspectionSheetNotification(server, routeContext, inspectionSheet);
      } catch (err: any) {
        server.getLogger().error("发生检验单通知失败：%s", err.message);
      }
    },
  },
] satisfies EntityWatcher<any>[];
