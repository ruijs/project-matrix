import { DingTalkService } from "@ruiapp/ding-talk-plugin";
import { DingTalkMessage } from "@ruiapp/ding-talk-plugin/dist/server-sdk/dingTalkSdkTypes";
import { getEntityRelationTargetId, IRpdServer, RouteContext, type EntityWatcher, type EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { filter, flatten, get, map } from "lodash";
import {
  BaseLot,
  BaseMaterial,
  MomInspectionMeasurement,
  MomInspectionRule,
  MomInspectionSheet,
  MomInventoryApplicationItem,
  OcUser,
} from "~/_definitions/meta/entity-types";
import { renderMaterial } from "~/app-extension/rocks/material-label-renderer/MaterialLabelRenderer";

export default [
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_inspection_sheet",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const before = payload.before;
      let changes = payload.changes;

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
          changes.lot = { id: lot?.id };
        }
      }

      if (changes.hasOwnProperty("approvalState") && changes.approvalState !== before.approvalState) {
        changes.reviewer = routeContext?.state.userId;
      }

      if (changes.hasOwnProperty("state") && changes.state === "inspected") {
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

      const operationTarget = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
        routeContext,
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
            routeContext,
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inspection_sheet",
              targetSingularName: `检验单 - ${operationTarget?.code}`,
              method: "update",
              changes: changes,
              before: before,
            },
          });
        }
      }

      if (operationTarget?.inventoryOperation?.application && operationTarget?.lotNum && operationTarget?.result) {
        const momInventoryApplicationItemManager = server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item");
        const momInventoryApplicationItem = await momInventoryApplicationItemManager.findEntity({
          routeContext,
          filters: [
            { operator: "eq", field: "lotNum", value: operationTarget.lotNum },
            {
              operator: "eq",
              field: "operation_id",
              value: operationTarget.inventoryOperation.application.id,
            },
          ],
          properties: ["id"],
        });

        if (momInventoryApplicationItem) {
          await momInventoryApplicationItemManager.updateEntityById({
            routeContext,
            id: momInventoryApplicationItem.id,
            entityToSave: {
              inspectState: operationTarget.result,
            },
          });
        }
      }

      if (changes.hasOwnProperty("state") && changes.state === "inspected") {
        const measurements = await server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").findEntities({
          routeContext,
          filters: [{ operator: "eq", field: "sheet_id", value: after.id }],
          properties: ["id"],
        });

        for (const measurement of measurements) {
          await server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").updateEntityById({
            routeContext,
            id: measurement.id,
            entityToSave: {
              locked: true,
            },
          });
        }
      }

      if (after.lotNum && after.material_id) {
        const lotManager = server.getEntityManager<BaseLot>("base_lot");
        const lot = await lotManager.findEntity({
          routeContext,
          filters: [
            { operator: "eq", field: "lotNum", value: operationTarget?.lotNum },
            {
              operator: "eq",
              field: "material_id",
              value: operationTarget?.material?.id,
            },
          ],
          properties: ["id"],
        });
        if (lot && after.result) {
          await lotManager.updateEntityById({
            routeContext,
            id: operationTarget?.lot?.id,
            entityToSave: {
              qualificationState: operationTarget?.result,
            },
          });
        }
      }

      if (changes.hasOwnProperty("treatment")) {
        if (after.lot_id) {
          const isAOD = changes.treatment === "special";
          const qualified = operationTarget?.result === "qualified" ? "true" : changes.treatment === "forced";
          await server.getEntityManager<BaseLot>("base_lot").updateEntityById({
            routeContext,
            id: operationTarget?.lot?.id,
            entityToSave: {
              treatment: changes.treatment,
              isAOD: isAOD,
              qualificationState: qualified ? "qualified" : "unqualified",
            },
          });
        }
      }
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
    /**
     * 创建检验单时，尝试发送钉钉工作通知给相关用户
     */
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload, routerContext: routeContext } = ctx;
      const inspectionSheet = payload.after;

      try {
        trySendInspectionSheetNotification(server, routeContext, inspectionSheet);
      } catch (err: any) {
        server.getLogger().error("发生检验单通知失败：%s", err.message);
      }
    },
  },
] satisfies EntityWatcher<any>[];

async function trySendInspectionSheetNotification(server: IRpdServer, routeContext: RouteContext, inspectionSheet: MomInspectionSheet) {
  const ruleId = getEntityRelationTargetId(inspectionSheet, "rule", "rule_id");
  if (!ruleId) {
    return;
  }

  const ruleManager = server.getEntityManager<MomInspectionRule>("mom_inspection_rule");
  const inspectionRule = await ruleManager.findById({
    routeContext,
    id: ruleId,
    relations: {
      category: {
        relations: {
          notificationSubscribers: {
            properties: ["id", "name"],
          },
        },
      },
    },
  });
  if (!inspectionRule) {
    return;
  }

  const inspectionCategory = inspectionRule.category;
  if (!inspectionCategory) {
    return;
  }

  const enableDingTalkNotification = get(inspectionCategory, "config.enableDingTalkNotification");
  if (!enableDingTalkNotification) {
    return;
  }

  const notificationSubscribers: OcUser[] = get(inspectionCategory, "notificationSubscribers") || [];
  if (!notificationSubscribers.length) {
    return;
  }

  const subscriberIds = flatten(map(notificationSubscribers, (item) => item.id));
  // const allExternalAccounts = flatten(map(notificationSubscribers, (item) => item.accounts));
  // const allDingTalkAccounts = filter(allExternalAccounts, (item) => item.providerCode === "dingTalk");
  // const dingUserIds = map(allDingTalkAccounts, (item) => item.externalAccountId);

  const sheetCode = inspectionSheet.code;
  const lotNum = inspectionSheet.lotNum;

  const materialId = getEntityRelationTargetId(inspectionSheet, "material", "material_id");
  const materialManager = server.getEntityManager<BaseMaterial>("base_material");
  const material = await materialManager.findById({
    routeContext,
    id: materialId,
  });

  let dingTalkNotificationContent = get(inspectionCategory, "config.dingTalkNotificationContent", "检验任务提醒");
  dingTalkNotificationContent += `\n\n`;
  dingTalkNotificationContent += `- 检验单号：${sheetCode || ""}\n`;
  dingTalkNotificationContent += `- 检验单类型：${inspectionCategory.name || ""}\n`;
  dingTalkNotificationContent += `- 物料：${renderMaterial(material as any)}\n`;
  dingTalkNotificationContent += `- 批号：${lotNum || ""}\n`;

  const dingTalkMessage: DingTalkMessage = {
    msgtype: "markdown",
    markdown: {
      title: "检验任务提醒",
      text: dingTalkNotificationContent,
    },
  };
  const logger = server.getLogger();
  logger.info("发送检验任务通知。", { subscriberIds, dingTalkMessage });
  const dingTalkService = server.getService<DingTalkService>("dingTalkService");
  await dingTalkService.sendWorkMessage(routeContext, subscriberIds, dingTalkMessage);
}
