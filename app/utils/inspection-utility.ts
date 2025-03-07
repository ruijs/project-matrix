import { isNil, isNumber, isString } from "lodash";
import { MomInspectionCharacteristic, MomInspectionMeasurement } from "~/_definitions/meta/entity-types";

export function isCharactorMeasured(measurement: MomInspectionMeasurement, characteristic: MomInspectionCharacteristic) {
  let inspectionValue = characteristic.kind === "quantitative" ? measurement.quantitativeValue : measurement.qualitativeValue;
  return !(isNil(inspectionValue) || (isString(inspectionValue) && inspectionValue.trim() === ""));
}

export function renderCharacteristicQualifiedConditions(characteristic: Partial<MomInspectionCharacteristic>) {
  if (!characteristic) {
    return;
  }

  const { kind, upperLimit, lowerLimit, upperTol, lowerTol, determineType } = characteristic;

  const norminal = characteristic.norminal;

  switch (kind) {
    // 定量
    case "quantitative":
      switch (determineType) {
        case "inLimit":
          if (isNil(lowerLimit) && isNumber(upperLimit)) {
            return `≤${upperLimit}`;
          } else if (isNil(upperLimit) && isNumber(lowerLimit)) {
            return `≥${lowerLimit}`;
          } else if (isNumber(upperLimit) && isNumber(lowerLimit)) {
            return `${lowerLimit} ~ ${upperLimit}`;
          }
          return "";
        case "inTolerance":
          if (isNil(norminal)) {
            return "";
          }

          if (isNil(lowerTol) && isNil(upperLimit)) {
            return norminal.toString();
          }

          if (isNil(lowerTol) && isNumber(upperTol)) {
            return `${norminal} ~ ${norminal}+${upperTol}`;
          } else if (isNil(upperTol) && isNumber(lowerTol)) {
            return `${norminal}${lowerTol} ~ ${norminal}`;
          } else {
            if (upperTol! + lowerTol! == 0) {
              return `${norminal}±${upperTol}`;
            } else {
              return `${norminal}${lowerTol} ~ ${norminal}+${upperTol}`;
            }
          }
        case "gt":
          return isNil(norminal) ? "" : `>${norminal}`;
        case "ge":
          return isNil(norminal) ? "" : `≥${norminal}`;
        case "lt":
          return isNil(norminal) ? "" : `<${norminal}`;
        case "le":
          return isNil(norminal) ? "" : `≤${norminal}`;
      }
    // 定性
    case "qualitative":
      return norminal;
  }
}
