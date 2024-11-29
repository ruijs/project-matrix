import { isBoolean, isNull, isNumber, isString, isUndefined } from "lodash";

export function formatValueToSqlLiteral(value: any) {
  if (isNull(value) || isUndefined(value)) {
    return "null";
  }

  if (isString(value)) {
    return `'${value.replace(/'/g, "''")}'`;
  }

  if (isBoolean(value)) {
    return value ? "true" : "false";
  }

  if (isNumber(value)) {
    return value.toString();
  }

  return `'${value.toString().replace(/'/g, "''")}'`;
}
