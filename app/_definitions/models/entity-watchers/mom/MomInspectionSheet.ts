import { DingTalkService } from "@ruiapp/ding-talk-plugin";
import { DingTalkMessage } from "@ruiapp/ding-talk-plugin/dist/server-sdk/dingTalkSdkTypes";
import { getEntityRelationTargetId, IRpdServer, RouteContext, type EntityWatcher, type EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { flatten, get, map } from "lodash";
import {
  BaseLot,
  BaseMaterial,
  MomInspectionMeasurement,
  MomInspectionRule,
  MomInspectionSheet,
  MomInventoryApplication,
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

      // 当用户点击提交检验记录按钮时，检验单状态更新为已检验，将当前用户设置为检验员
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

      const inspectionSheet = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
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

      // 更新检验结果
      const momInspectionMeasurementManager = server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement");
      const measurements = await momInspectionMeasurementManager.findEntities({
        routeContext,
        filters: [{ operator: "eq", field: "sheet_id", value: after.id }],
        properties: ["id", "characteristic", "isQualified", "createdAt", "qualitativeValue", "quantitativeValue"],
      });

      // 获取每个特性的最新测量值
      const latestMeasurement = measurements.reduce((acc, item) => {
        const characteristicId = item.characteristic?.id;
        if (characteristicId && item.createdAt) {
          if (!acc[characteristicId] || (acc[characteristicId]?.createdAt || 0) < item.createdAt) {
            acc[characteristicId] = item;
          }
        }
        return acc;
      }, {} as Record<string, MomInspectionMeasurement>);

      // 检查是否所有测量值都已完成
      const allMeasurementsComplete = Object.values(latestMeasurement).every((item) => {
        const characteristic = item.characteristic as { measurementType?: string };
        if (characteristic?.measurementType === 'qualitative') {
          return item.qualitativeValue !== null && item.qualitativeValue !== undefined;
        } else {
          return item.quantitativeValue !== null && item.quantitativeValue !== undefined;
        }
      });

      if (allMeasurementsComplete) {
        let result = "qualified";
        
        // 检查所有测量值的合格情况
        const hasUnqualifiedMustPass = Object.values(latestMeasurement).some(
          (item) => item.characteristic?.mustPass && !item.isQualified
        );

        // 检查非必检项的不合格情况
        const hasUnqualifiedNonMustPass = Object.values(latestMeasurement).some(
          (item) => !item.characteristic?.mustPass && !item.isQualified
        );

        // 如果有必检项不合格或超过允许的非必检不合格数量，则整体不合格
        if (hasUnqualifiedMustPass || hasUnqualifiedNonMustPass) {
          result = "unqualified";
        }

        // 只有当结果发生变化时才更新
        if (inspectionSheet?.result !== result) {
          await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").updateEntityById({
            routeContext,
            id: after.id,
            entityToSave: {
              result: result,
            },
          });
        }
      }

      if (changes) {
        if (ctx?.routerContext?.state.userId) {
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
        }
      }

      // 如果检验单关联了库存操作单以及库存业务申请单，则更新库存业务申请中对应批次物料的检验状态
      if (inspectionSheet?.inventoryOperation?.application && inspectionSheet?.lotNum && inspectionSheet?.result) {
        const momInventoryApplicationItemManager = server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item");
        const momInventoryApplicationItem = await momInventoryApplicationItemManager.findEntity({
          routeContext,
          filters: [
            { operator: "eq", field: "lotNum", value: inspectionSheet.lotNum },
            {
              operator: "eq",
              field: "operation_id",
              value: inspectionSheet.inventoryOperation.application.id,
            },
          ],
          properties: ["id"],
        });

        if (momInventoryApplicationItem) {
          await momInventoryApplicationItemManager.updateEntityById({
            routeContext,
            id: momInventoryApplicationItem.id,
            entityToSave: {
              inspectState: inspectionSheet.result,
            },
          });
        }

        // 当检验申请中所有批次的物料都检验完成，将检验单的检验状态设置成已完成。
        const momInventoryApplicationItems = await momInventoryApplicationItemManager.findEntities({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "operation_id",
              value: inspectionSheet.inventoryOperation.application.id,
            },
          ],
          properties: ["id", "inspectState"],
        });

        if (momInventoryApplicationItems.length > 0) {
          // every item has been inspected, then update the application state to inspected
          const allInspected = momInventoryApplicationItems.every((item) => item?.inspectState);
          if (allInspected) {
            await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").updateEntityById({
              routeContext,
              id: inspectionSheet.inventoryOperation.application.id,
              entityToSave: {
                inspectState: "inspected",
              },
            });
          }
        }
      }

      // 当用户点击提交检验记录按钮后:
      // - 将检验值锁定，不允许修改。
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

      // 保持批次的`合格证状态`与检验单的`检验结果`一致
      if (after.lotNum && after.material_id) {
        const lotManager = server.getEntityManager<BaseLot>("base_lot");
        const lot = await lotManager.findEntity({
          routeContext,
          filters: [
            { operator: "eq", field: "lotNum", value: inspectionSheet?.lotNum },
            {
              operator: "eq",
              field: "material_id",
              value: inspectionSheet?.material?.id,
            },
          ],
          properties: ["id"],
        });
        if (lot && after.result) {
          await lotManager.updateEntityById({
            routeContext,
            id: lot.id,
            entityToSave: {
              qualificationState: inspectionSheet?.result,
            },
          });
        }
      }

      // 当变更 处理方式 时，更新对应批次的合格信息：
      // 1. 更新处理方式：特采、退货、强制合格
      // 2. 是否让步接收：当处理方式为特采时，表示让步接收
      // 3. 是否合格。检验结果为合格，或者处理方式为强制合格时，设置为合格。
      if (changes.hasOwnProperty("treatment")) {
        if (after.lot_id) {
          const isAOD = changes.treatment === "special";
          const qualified = inspectionSheet?.result === "qualified" ? true : changes.treatment === "forced";
          await server.getEntityManager<BaseLot>("base_lot").updateEntityById({
            routeContext,
            id: inspectionSheet?.lot?.id,
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
