import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import { find } from "lodash";
import type { MomInspectionCharacteristic, MomInspectionMeasurement, MomInspectionSheet } from "~/_definitions/meta/entity-types";
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
