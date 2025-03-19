import { DingTalkService } from "@ruiapp/ding-talk-plugin";
import { DingTalkMessage } from "@ruiapp/ding-talk-plugin/dist/server-sdk/dingTalkSdkTypes";
import { getEntityRelationTargetId, type IRpdServer, type RouteContext } from "@ruiapp/rapid-core";
import { find, flatten, get, map } from "lodash";
import type {
  BaseLot,
  BaseMaterial,
  MomInspectionCharacteristic,
  MomInspectionMeasurement,
  MomInspectionRule,
  MomInspectionSheet,
  MomInventoryApplication,
  MomInventoryApplicationItem,
  OcUser,
} from "~/_definitions/meta/entity-types";
import { renderMaterial } from "~/app-extension/rocks/material-label-renderer/MaterialLabelRenderer";
import { isCharactorMeasured } from "~/utils/inspection-utility";

/**
 * 更新检验单的检验结果。
 * 检验单检验结果判定规则：
 * - 如果检验项设置为不可跳过，则必须填写检验值。
 * - 如存在不可跳过的检验项没有填写检验值，则不进行检查单的检验结果判断。
 * - 如果存在任意一个填写了检验值且被配置为必须合格（mustPass）的检验项被判定为不合格，则检验单判定为不合格，否则判定为合格。
 * - 如检验单包含多个样本，则所有样本的均需判定合格
 * - 如某样本存在多轮检验，则以最后轮次的检验值为准
 * @param server
 * @param routeContext
 * @param inspectionSheetId
 */
export async function updateInspectionSheetInspectionResult(server: IRpdServer, routeContext: RouteContext, inspectionSheetId: number) {
  const inspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");
  const inspectionMeasurementManager = server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement");

  const measurements = await inspectionMeasurementManager.findEntities({
    routeContext,
    filters: [{ operator: "eq", field: "sheet_id", value: inspectionSheetId }],
    properties: ["id", "round", "sampleCode", "isQualified", "quantitativeValue", "qualitativeValue", "characteristic"],
  });

  if (!measurements.length) {
    return;
  }

  const measurementsByCharacteristic = measurements.reduce((map, measurement) => {
    if (!measurement.characteristic) {
      return map;
    }
    const characteristicId = measurement.characteristic.id!;

    let measurementsOfCharacteristic = map.get(characteristicId);
    if (!measurementsOfCharacteristic) {
      measurementsOfCharacteristic = [];
      map.set(characteristicId, measurementsOfCharacteristic);
    }

    const measurementOfSample = find(measurementsOfCharacteristic, (item) => {
      return item.sampleCode === measurement.sampleCode;
    });

    if (!measurementOfSample) {
      measurementsOfCharacteristic.push(measurement);
    } else {
      if (measurement.round > measurementOfSample.round) {
        Object.assign(measurementOfSample, measurement);
      }
    }

    return map;
  }, new Map() as Map<number, MomInspectionMeasurement[]>);

  let allUnskippableCharactersMeasured = true;
  let sheetQualificationResult: MomInspectionSheet["result"] | null = "qualified";
  for (const measurementsOfCharacteristic of measurementsByCharacteristic.values()) {
    for (const measurement of measurementsOfCharacteristic) {
      const characteristic = measurement.characteristic as MomInspectionCharacteristic;
      const charactorMeasured = isCharactorMeasured(measurement, characteristic);
      if (!characteristic.skippable && !charactorMeasured) {
        allUnskippableCharactersMeasured = false;
      }

      let isUnqualified = false;
      if (charactorMeasured && characteristic.mustPass) {
        isUnqualified = measurement.isQualified === false;
      }

      if (isUnqualified) {
        sheetQualificationResult = "unqualified";
      }
    }
  }

  if (!allUnskippableCharactersMeasured) {
    sheetQualificationResult = null;
  }

  await inspectionSheetManager.updateEntityById({
    routeContext,
    id: inspectionSheetId,
    entityToSave: {
      result: sheetQualificationResult,
    },
  });
}

export async function lockMeasurementsOfInspectionSheet(server: IRpdServer, routeContext: RouteContext, inspectionSheetId: number) {
  const measurements = await server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").findEntities({
    routeContext,
    filters: [{ operator: "eq", field: "sheet_id", value: inspectionSheetId }],
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

/**
 * 保持批次的`合格证状态`与检验单的`检验结果`一致。
 * 当变更 处理方式 或者 审核状态 时，更新对应批次的合格信息。
 * 1. 处理方式：特采、退货、强制合格
 * 2. 是否让步接收：当处理方式为特采时，表示让步接收
 * 3. 是否合格。检验结果为合格，或者处理方式为强制合格时，设置为合格。
 * @param server
 * @param routeContext
 * @param inspectionSheet
 * @returns
 */
export async function updateQualificationStateOfRelatedLot(server: IRpdServer, routeContext: RouteContext, inspectionSheet: MomInspectionSheet) {
  const lotId = getEntityRelationTargetId(inspectionSheet, "lot", "lot_id");
  if (!lotId) {
    return;
  }

  if (inspectionSheet.result === "uninspected") {
    return;
  }

  const lotIsAOD = inspectionSheet.treatment === "special";
  let lotQualificationState: BaseLot["qualificationState"] = "uninspected";

  if (inspectionSheet.result === "qualified") {
    lotQualificationState = "qualified";
  } else if (inspectionSheet.result === "unqualified") {
    lotQualificationState = "unqualified";
  }

  if (inspectionSheet.treatment === "forced") {
    lotQualificationState = "qualified";
  }

  await server.getEntityManager<BaseLot>("base_lot").updateEntityById({
    routeContext,
    id: lotId,
    entityToSave: {
      treatment: inspectionSheet.treatment,
      isAOD: lotIsAOD,
      qualificationState: lotQualificationState,
    },
  });
}

/**
 * 如果检验单关联了库存操作单以及库存业务申请单，则更新库存业务申请中对应批次物料的检验状态
 * @param server
 * @param routeContext
 * @param inspectionSheet
 * @param inventoryApplication
 * @returns
 */
export async function updateQualificationStateOfRelatedApplicationItem(
  server: IRpdServer,
  routeContext: RouteContext,
  inspectionSheet: MomInspectionSheet,
  inventoryApplication?: Partial<MomInventoryApplication>,
) {
  if (!inventoryApplication) {
    return;
  }

  if (!inspectionSheet.lotNum) {
    return;
  }

  const materialId = getEntityRelationTargetId(inspectionSheet, "material", "material_id");

  const momInventoryApplicationItemManager = server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item");
  const momInventoryApplicationItem = await momInventoryApplicationItemManager.findEntity({
    routeContext,
    filters: [
      { operator: "eq", field: "application", value: inventoryApplication.id },
      { operator: "eq", field: "material", value: materialId },
      { operator: "eq", field: "lotNum", value: inspectionSheet.lotNum },
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
}

/**
 * 创建检验单时，尝试发送钉钉工作通知给相关用户
 * @param server
 * @param routeContext
 * @param inspectionSheet
 * @returns
 */
export async function trySendInspectionSheetNotification(server: IRpdServer, routeContext: RouteContext, inspectionSheet: MomInspectionSheet) {
  if (inspectionSheet.state === "inspected") {
    return;
  }

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

  const notificationSubscribers: Partial<OcUser>[] = get(inspectionCategory, "notificationSubscribers") || [];
  if (!notificationSubscribers.length) {
    return;
  }

  const subscriberIds = flatten(map(notificationSubscribers, (item) => item.id)) as number[];
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
