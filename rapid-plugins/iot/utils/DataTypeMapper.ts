import { IotMeasurementDataType, IotPropertyDataType, IotTdengineDataType } from "../types/IotModelsTypes";

const propertyToTDEngineDataTypeMapper: Record<IotPropertyDataType, IotTdengineDataType> = {
  text: "varchar",
  ntext: "nchar",
  boolean: "bool",
  tiny: "tinyint",
  unsigned_tiny: "tinyint unsigned",
  small: "smallint",
  unsigned_small: "smallint unsigned",
  integer: "int",
  unsigned_integer: "int unsigned",
  long: "long",
  unsigned_long: "long unsigned",
  float: "float",
  double: "double",
  date: "timestamp",
  datetime: "timestamp",
  json: "json",
};

const measurementToTDEngineDataTypeMapper: Record<IotMeasurementDataType, IotTdengineDataType> = {
  boolean: "bool",
  tiny: "tinyint",
  unsigned_tiny: "tinyint unsigned",
  small: "smallint",
  unsigned_small: "smallint unsigned",
  integer: "int",
  unsigned_integer: "int unsigned",
  long: "long",
  unsigned_long: "long unsigned",
  float: "float",
  double: "double",
};

export function mapTypePropertyDataTypeToTDEngineDataType(sourceType: IotPropertyDataType, length?: number): string {
  if (sourceType === "text" || sourceType === "ntext") {
    return `${propertyToTDEngineDataTypeMapper[sourceType]}(${length})`;
  }
  return propertyToTDEngineDataTypeMapper[sourceType];
}

export function mapTypeMeasurementDataTypeToTDEngineDataType(sourceType: IotMeasurementDataType): IotTdengineDataType {
  return measurementToTDEngineDataTypeMapper[sourceType] || "float";
}
