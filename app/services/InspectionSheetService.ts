import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import { find } from "lodash";
import type { MomInspectionMeasurement, MomInspectionSheet } from "~/_definitions/meta/entity-types";

export async function updateInspectionSheetInspectionResult(server: IRpdServer, routeContext: RouteContext, inspectionSheetId: number) {
  const inspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");
  const inspectionMeasurementManager = server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement");

  const measurements = await inspectionMeasurementManager.findEntities({
    routeContext,
    filters: [{ operator: "eq", field: "sheet_id", value: inspectionSheetId }],
    properties: ["id", "round", "sampleCode", "isQualified", "characteristic"],
  });

  const measurementsByCharacteristic = measurements.reduce((map, measurement) => {
    if (!measurement.characteristic) {
      return map;
    }
    const characteristicId = measurement.characteristic.id!;

    let measurementsOfCharacteristic = map.get(characteristicId);
    if (!measurementsOfCharacteristic) {
      measurementsOfCharacteristic = [];
      map.set(characteristicId, measurementsOfCharacteristic)
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


  let qualifiedState = "qualified";
  for (const measurementsOfCharacteristic of measurementsByCharacteristic.values()) {
    for (const measurement of measurementsOfCharacteristic) {
      if (!measurement.isQualified && measurement.characteristic?.mustPass) {
        qualifiedState = "unqualified";
      }
    }
  }

  await inspectionSheetManager.updateEntityById({
    routeContext,
    id: inspectionSheetId,
    entityToSave: {
      result: qualifiedState,
    },
  });
}