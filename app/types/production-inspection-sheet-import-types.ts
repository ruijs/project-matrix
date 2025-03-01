export type ProductionInspectionSheetImportColumn =
  | ProductionInspectionSheetImportSheetPropertyColumn
  | ProductionInspectionSheetImportMeasurementValueColumn
  | ProductionInspectionSheetImportInstrumentCodeColumn;

export type ProductionInspectionSheetImportSheetPropertyColumn = {
  type: "sheetProperty";
  propertyCode: InspectionSheetPropertyCode;
  colNum: number;
};

export type InspectionSheetPropertyCode =
  | "lotNum"
  | "materialAbbr"
  | "productStage"
  | "sampleDeliveryTime"
  | "result"
  | "productionTime"
  | "abnormalDescription"
  | "remark"
  | "inspectorName";

export type ProductionInspectionSheetImportMeasurementValueColumn = {
  type: "measurementValue";
  charName: string;
  colNum: number;
};

export type ProductionInspectionSheetImportInstrumentCodeColumn = {
  type: "instrumentCode";
  charName: string;
  colNum: number;
};

export interface ParseProductInspectionSheetTableResult {
  columns: ProductionInspectionSheetImportColumn[];
  data: unknown[];
  html: string;
  errors?: ImportDataError[];
}

export interface ImportDataError {
  message: string;
  code?: string;
  cellAddress?: string;
}
