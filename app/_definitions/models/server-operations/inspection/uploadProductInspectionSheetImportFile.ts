import ExcelJS from "exceljs";
import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import { find, get, isArray } from "lodash";
import type {
  ProductionInspectionSheetImportColumn,
  ParseProductInspectionSheetTableResult,
  ImportDataError,
  InspectionSheetPropertyCode,
  ProductionInspectionSheetImportMeasurementValueColumn,
} from "~/types/production-inspection-sheet-import-types";
import dayjs from "dayjs";
import {
  BaseMaterial,
  MomInspectionCategory,
  MomInspectionCharacteristic,
  MomInspectionCommonCharacteristic,
  MomInspectionRule,
  OcUser,
} from "~/_definitions/meta/entity-types";
import { productInspectionImportSettingsIgnoredCharNames } from "~/settings/productInspectionImportSettings";

type CodeInferOption<TCode = string> = {
  name: string;
  code: TCode;
};

const sheetPropertyItems: CodeInferOption<InspectionSheetPropertyCode>[] = [
  { name: "批号", code: "lotNum" },
  { name: "产品", code: "materialAbbr" },
  { name: "产品属性", code: "productStage" },
  { name: "成品送样时间", code: "sampleDeliveryTime" },
  { name: "SPEC判定", code: "result" },
  { name: "成品完成时间", code: "productionTime" },
  { name: "异常项目描述", code: "abnormalDescription" },
  { name: "备注", code: "remark" },
  { name: "检验人", code: "inspectorName" },
];

export default {
  code: "uploadProductInspectionSheetImportFile",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext, input } = ctx;

    // const currentUserId = ctx.routerContext.state.userId;

    let file: File | File[] | null = input.file || input.files;
    if (isArray(file)) {
      file = file[0];
    }

    if (!file) {
      throw new Error("请上传有效的文件。");
    }

    if (!file.size) {
      throw new Error("上传的文件不能为空。");
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      throw new Error("仅支持.xlsx格式的文件。");
    }

    const fileBuffer = await file.arrayBuffer();
    const result = await parseInspectionSheetImportFile(routerContext, server, fileBuffer);

    ctx.output = result;
  },
} satisfies ServerOperation;

function getCellText(cell: ExcelJS.Cell): string | null {
  if (!cell) {
    return null;
  }

  if (cell.isMerged) {
    return getCellText(cell.master);
  }

  if (!cell.value) {
    return null;
  }

  if (cell.type === ExcelJS.ValueType.Date) {
    return dayjs(cell.value as Date).format("YYYY-MM-DD");
  }
  return cell.text;
}

function getCellDateText(cell: ExcelJS.Cell): string | null {
  if (!cell) {
    return null;
  }

  if (cell.isMerged) {
    return getCellDateText(cell.master);
  }

  if (!cell.value) {
    return null;
  }

  if (cell.type === ExcelJS.ValueType.Date) {
    return dayjs(cell.value as Date).format("YYYY-MM-DD");
  } else if (cell.type === ExcelJS.ValueType.Number) {
    const numValue = parseInt(cell.value + "", 10) || 2;
    const msOfOneDay = 24 * 3600000;
    const msOfMinDay = dayjs("1900-01-01").valueOf();
    // 不要使用dayjs().add()方法，有bug
    return dayjs(msOfMinDay + (numValue - 2) * msOfOneDay).format("YYYY-MM-DD");
  }
  return cell.text;
}

async function parseInspectionSheetImportFile(
  routeContext: RouteContext,
  server: IRpdServer,
  fileBuffer: ArrayBuffer,
): Promise<ParseProductInspectionSheetTableResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const sheet = workbook.getWorksheet(1);
  if (!sheet) {
    throw new Error("未找到有效的工作表。");
  }

  const errors: ImportDataError[] = [];
  const data: any[][] = [];
  const headers: string[] = [];
  const columns: ProductionInspectionSheetImportColumn[] = [];

  // 准备通用检验特征信息
  const commonCharManager = server.getEntityManager<MomInspectionCommonCharacteristic>("mom_inspection_common_characteristic");
  const commonCharacters = await commonCharManager.findEntities({
    routeContext,
    filters: [
      {
        operator: "null",
        field: "deletedAt",
      },
    ],
  });

  const headerRow = sheet.getRow(1);

  let colNum = 1;
  while (true) {
    const cell = headerRow.getCell(colNum);
    let columnTitle = (getCellText(cell) || "").trim();
    if (!columnTitle) {
      break;
    }

    // 根据当前标题推测 检验单属性、测量值、还是检测设备号
    let columnType: ProductionInspectionSheetImportColumn["type"];
    const sheetPropertyCode = inferSheetPropertyCode(columnTitle);
    let charNameOfInstrumentCode: string | null = null;
    let charNameOfMeasurementValue: string | null = null;
    if (sheetPropertyCode) {
      columnType = "sheetProperty";
    } else {
      // 检查是不是记录检测设备号的列
      const charOfInstrumentCodeTitle = find(commonCharacters, (commonChar: MomInspectionCommonCharacteristic) => {
        const instrumentCodePropertySetting = find(get(commonChar, "config.measurementImportSettings.properties"), {
          propertyCode: "instrumentCode",
          columnTitle,
        });
        return !!instrumentCodePropertySetting;
      });

      if (charOfInstrumentCodeTitle) {
        columnType = "instrumentCode";
        charNameOfInstrumentCode = charOfInstrumentCodeTitle.name;
      } else {
        columnType = "measurementValue";
        charNameOfMeasurementValue = columnTitle;
      }
    }

    if (!columnType) {
      colNum++;
      continue;
    }

    if (columnType == "sheetProperty") {
      columns.push({
        type: columnType,
        propertyCode: sheetPropertyCode!,
        colNum,
      });
    } else if (columnType == "measurementValue") {
      columns.push({
        type: columnType,
        charName: charNameOfMeasurementValue!,
        colNum,
      });
    } else if (columnType == "instrumentCode") {
      columns.push({
        type: columnType,
        charName: charNameOfInstrumentCode!,
        colNum,
      });
    }

    headers.push(columnTitle);
    colNum++;
  }
  data.push(headers);

  const inspectionCategoryManager = server.getEntityManager<MomInspectionCategory>("mom_inspection_category");
  const pqcInspectionCategory = await inspectionCategoryManager.findEntity({
    routeContext,
    filters: [
      {
        operator: "eq",
        field: "name",
        value: "产成品检验",
      },
      {
        operator: "null",
        field: "deletedAt",
      },
    ],
  });

  if (!pqcInspectionCategory) {
    throw new Error("未找到名为“产成品检验”的检验类型。");
  }

  let rowNum = 2;
  while (true) {
    const row = sheet.getRow(rowNum);
    if (!row) {
      break;
    }

    const currentRecord: any[] = [];
    let noneEmptyCellCount = 0;

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const column = columns[colIndex];
      const cell = row.getCell(column.colNum);
      let cellText: string;
      if (column.type === "sheetProperty" && (column.propertyCode === "sampleDeliveryTime" || column.propertyCode === "productionTime")) {
        cellText = getCellDateText(cell) || "";
      } else {
        cellText = getCellText(cell) || "";
      }

      currentRecord[colIndex] = cellText.trim();

      if (cellText) {
        noneEmptyCellCount += 1;
      }
    }

    if (noneEmptyCellCount === 0) {
      break;
    }

    const validationContext = {
      row,
      pqcInspectionCategory,
      commonCharacters,
    };

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const column = columns[colIndex];
      const cell = row.getCell(column.colNum);
      const cellText = currentRecord[colIndex];
      const validationOptions: CellValueValidationOptions = { routeContext, validationContext, server, column, cell, cellText };
      const validationError = await validateCellValue(validationOptions);
      if (validationError) {
        errors.push(validationError);
      }
    }

    data.push(currentRecord);
    rowNum++;
  }

  return {
    columns,
    data,
    html: "",
    errors,
  };
}

function inferSheetPropertyCode(propertyColumnTitle: string) {
  return inferPropertyOrParameterCode(sheetPropertyItems, propertyColumnTitle);
}

function inferPropertyOrParameterCode<TCode = string>(inferOptions: CodeInferOption<TCode>[], columnTitle: string): TCode | null {
  const item = inferOptions.find((x) => {
    const name = (columnTitle.split("\n")[0] || "").trim();
    return x.name === name;
  });
  if (item) {
    return item.code;
  }

  return null;
}

export interface CellValueValidationOptions {
  server: IRpdServer;
  routeContext: RouteContext;
  validationContext: Record<string, any>;
  column: ProductionInspectionSheetImportColumn;
  cell: ExcelJS.Cell;
  cellText: string;
}

async function validateCellValue(options: CellValueValidationOptions): Promise<ImportDataError | null> {
  const { column, cell, cellText } = options;

  if (!cell) {
    return null;
  }

  if (cellText && cellText.trim) {
    options.cellText = cellText.trim();
  }

  if (column.type === "sheetProperty") {
    if (column.propertyCode === "lotNum") {
      return await validateCellValueOfLotNum(options);
    } else if (column.propertyCode === "materialAbbr") {
      return await validateCellValueOfMaterialAbbr(options);
    } else if (column.propertyCode === "result") {
      return await validateCellValueOfResult(options);
    } else if (column.propertyCode === "inspectorName") {
      return await validateCellValueOfInspectorName(options);
    }
  } else if (column.type === "measurementValue") {
    return await validateCellValueOfMeasurementField(options);
  }

  return null;
}

async function validateCellValueOfLotNum(options: CellValueValidationOptions): Promise<ImportDataError | null> {
  const { cell, cellText } = options;
  if (!cellText) {
    return {
      message: "批次号不能为空。",
      cellAddress: cell.address,
    };
  }

  return null;
}

async function validateCellValueOfMaterialAbbr(options: CellValueValidationOptions): Promise<ImportDataError | null> {
  const { routeContext, validationContext, server, cell, cellText } = options;
  if (!cellText) {
    return {
      message: "产品不能为空。",
      cellAddress: cell.address,
    };
  }

  // 根据规格搜索产品
  const materialManager = server.getEntityManager<BaseMaterial>("base_material");
  const materials = await materialManager.findEntities({
    routeContext,
    filters: [
      {
        operator: "eq",
        field: "specification",
        value: cellText,
      },
      {
        operator: "startsWith",
        field: "code",
        value: "03.",
      },
      {
        operator: "null",
        field: "deletedAt",
      },
    ],
  });

  if (!materials.length) {
    return {
      message: `不存在牌号为“${cellText}”的产品。`,
      cellAddress: cell.address,
    };
  }

  if (materials.length > 1) {
    return {
      message: `存在多个牌号为“${cellText}”的产品。`,
      cellAddress: cell.address,
    };
  }

  const material = materials[0];
  validationContext.material = material;

  const pqcInspectionCategory: MomInspectionCategory = validationContext.pqcInspectionCategory;

  const inspectionRuleManager = server.getEntityManager<MomInspectionRule>("mom_inspection_rule");
  const inspectionRules = await inspectionRuleManager.findEntities({
    routeContext,
    relations: {
      characteristics: {
        relations: {
          commonChar: true,
        },
      },
    },
    filters: [
      {
        operator: "eq",
        field: "category_id",
        value: pqcInspectionCategory.id,
      },
      {
        operator: "eq",
        field: "material_id",
        value: material.id,
      },
      {
        operator: "null",
        field: "customer_id",
      },
    ],
  });

  if (!inspectionRules.length) {
    return {
      message: `产品 ${material.specification} 没有配置“${pqcInspectionCategory.name}”规则。`,
      cellAddress: cell.address,
    };
  }

  const inspectionRule = inspectionRules[0];
  validationContext.inspectionRule = inspectionRule;
  return null;
}

async function validateCellValueOfResult(options: CellValueValidationOptions): Promise<ImportDataError | null> {
  const { cell, cellText } = options;
  if (!cellText) {
    return {
      message: "SPEC判定不能为空。",
      cellAddress: cell.address,
    };
  }

  if (cellText !== "一次送检合格" && cellText !== "一次送检不合格") {
    return {
      message: "无效的SPEC判定值。必须为“一次送检合格”或者“一次送检不合格”",
      cellAddress: cell.address,
    };
  }

  return null;
}

async function validateCellValueOfInspectorName(options: CellValueValidationOptions): Promise<ImportDataError | null> {
  const { routeContext, server, cell, cellText } = options;
  if (!cellText) {
    return {
      message: "检验人不能为空。",
      cellAddress: cell.address,
    };
  }

  const userManager = server.getEntityManager<OcUser>("oc_user");
  const userCount = await userManager.count({
    routeContext,
    filters: [
      {
        operator: "eq",
        field: "name",
        value: cellText,
      },
      {
        operator: "null",
        field: "deletedAt",
      },
    ],
  });

  if (!userCount) {
    return {
      message: `不存在名为“${cellText}”的用户。`,
      cellAddress: cell.address,
    };
  }

  if (userCount > 1) {
    return {
      message: `存在多个名为“${cellText}”的用户。`,
      cellAddress: cell.address,
    };
  }

  return null;
}

async function validateCellValueOfMeasurementField(options: CellValueValidationOptions): Promise<ImportDataError | null> {
  const { validationContext, column, cell, cellText } = options;
  const commonCharacters: MomInspectionCommonCharacteristic[] = validationContext.commonCharacters;

  // 获取检验特征信息
  const material = validationContext.material as BaseMaterial;
  const inspectionRule = validationContext.inspectionRule as MomInspectionRule;
  if (!inspectionRule) {
    return null;
  }

  const characteristics = inspectionRule.characteristics!;
  const charName = (column as ProductionInspectionSheetImportMeasurementValueColumn).charName;
  if (productInspectionImportSettingsIgnoredCharNames.includes(charName)) {
    return null;
  }

  const character = find(characteristics, (item) => item.name === charName);
  let characterKind = character?.kind;

  if (cellText) {
    if (!character) {
      const commonCharacter = find(commonCharacters, (item) => item.name === charName);
      if (commonCharacter) {
        // 如果填写了检验值，并且能找到对应的通用检验项则不报错，因为导入时会自动创建可跳过且不做合格判定的检验项。
        characterKind = commonCharacter.kind;
      } else {
        return {
          message: `检验值无效。${material.specification}的检验规则中未配置名为“${charName}”的检验特征。`,
          cellAddress: cell.address,
        };
      }
    }

    if (characterKind === "quantitative") {
      if (Number.isNaN(parseFloat(cellText))) {
        return {
          message: `检验值无效。“${charName}”为定量检验，其结果必须为数值。`,
          cellAddress: cell.address,
        };
      }
    }
  } else {
    if (character && !character.skippable) {
      return {
        message: `必须检验 ${charName}，检验值不能为空。`,
        cellAddress: cell.address,
      };
    }
  }

  return null;
}
