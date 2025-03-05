import { eq, gt, gte, lt, lte } from "lodash";
import { decimalSum } from "./decimal";
import { MomInspectionCharacteristic } from "~/_definitions/meta/entity-types";

export function isCharacterMeasurementValueQualified(characteristic: Partial<MomInspectionCharacteristic>, measuredValue: any): boolean | null {
  if (!characteristic) {
    return null;
  }

  if (!characteristic.kind) {
    return null;
  }

  const { kind, upperLimit, lowerLimit, upperTol, lowerTol, determineType, qualitativeDetermineType } = characteristic as Required<MomInspectionCharacteristic>;

  if (kind === "quantitative") {
    const norminal = parseFloat(characteristic.norminal!);
    // 定量
    switch (determineType) {
      case "inLimit":
        return lowerLimit <= measuredValue && measuredValue <= upperLimit;
      case "inTolerance":
        return decimalSum(lowerTol, norminal) <= measuredValue && measuredValue <= decimalSum(upperTol, norminal);
      case "gt":
        return gt(measuredValue, norminal);
      case "ge":
        return gte(measuredValue, norminal);
      case "lt":
        return lt(measuredValue, norminal);
      case "le":
        return lte(measuredValue, norminal);
      default:
        return null;
    }
  } else if (kind === "qualitative") {
    // 定性
    if (!qualitativeDetermineType) {
      return null;
    }
    return eq(characteristic.norminal, measuredValue);
  } else {
    return null;
  }
}
