import { isNull, isString, isUndefined } from "lodash";
import { MomInspectionCharacteristic, MomInspectionMeasurement } from "~/_definitions/meta/entity-types";

export function isCharactorMeasured(measurement: MomInspectionMeasurement, characteristic: MomInspectionCharacteristic) {
  let inspectionValue = characteristic.kind === "quantitative" ? measurement.quantitativeValue : measurement.qualitativeValue;
  return !(isUndefined(inspectionValue) || isNull(inspectionValue) || (isString(inspectionValue) && inspectionValue.trim() === ""));
}
