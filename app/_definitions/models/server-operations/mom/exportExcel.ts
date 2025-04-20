import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import { utils, writeXLSX } from "xlsx";
import type {
  MomGood,
  MomGoodTransfer,
  MomInspectionMeasurement,
  MomInventoryApplicationItem,
  MomMaterialLotInventoryBalance,
} from "~/_definitions/meta/entity-types";
import { EntityFilterOptions } from "@ruiapp/rapid-extension/src/types/rapid-entity-types";
import { isArray, map } from "lodash";
import dayjs from "dayjs";

// 导出类型定义
export type ExportExcelInput = {
  type: string;
  createdAtFrom: string;
  createdAtTo: string;
  businessType: string;
  applicant: string;
  createdAt: string;
  endAt: string;
  operationState: string;
  materialCategory: string;
  lotNum: string;
  binNum: string;
  material: string;
  warehouse: string;
  warehouseArea: string;
  location: string;
  state: string;
  approvalState: string;
  result: string;
  inspector: string;
  biller: string;
};

// Excel表头配置
const EXCEL_HEADERS = {
  inventory: ["物料编码", "物料名称", "物料规格", "物料类型", "批号", "数量"],
  goods: ["物料", "物料类型", "批号", "托盘号", "数量", "生产日期", "有效期", "状态", "仓库", "库位", "合格状态"],
  operation: ["操作单号", "操作类型", "物料", "批号", "托盘号", "数量", "生产日期", "有效期", "入库库位", "合格状态"],
  inspection: [
    "检验单号",
    "检验单状态",
    "审核状态",
    "物料",
    "检验规则",
    "批号",
    "样本号",
    "检验轮次",
    "检验特征",
    "检验仪器",
    "实测值",
    "合格状态",
    "检验时间",
  ],
  application: ["申请单号", "操作类型", "仓库", "物料号", "物料名称", "物料规格", "批号", "计划数量", "实际数量", "备注", "领料用途", "加工单位", "加工要求"],
};

// 状态映射
const STATE_MAPPINGS = {
  qualificationState: {
    qualified: "合格",
    unqualified: "不合格",
    default: "未检验",
  },
  inspectionState: {
    inspecting: "检验中",
    inspected: "检验完成",
    default: "待检验",
  },
  approvalState: {
    approved: "已审核",
    rejected: "已驳回",
    default: "未审核",
  },
  goodState: {
    normal: "正常",
    splitted: "已拆分",
    merged: "已合并",
    transferred: "已转移",
    destroied: "已销毁",
    default: "待处理",
  },
};

export default {
  code: "exportExcel",
  method: "GET",
  async handler(ctx: ActionHandlerContext) {
    try {
      const { server, routerContext: routeContext } = ctx;
      const input: ExportExcelInput = ctx.input || {};

      // 对input数组类型参数的兼容处理
      const params = input as any;
      for (const key in params) {
        const paramValue = params[key];
        if (isArray(paramValue)) {
          params[key] = paramValue.join(",");
        }
      }

      // 验证输入类型
      if (!Object.keys(EXCEL_HEADERS).includes(input.type)) {
        throw new Error(`不支持的导出类型: ${input.type}`);
      }

      const exportExcel = await handleExportByType(routeContext, server, input);
      const filename = `${getNameOfExportType(input.type)}-${dayjs().format("YYYYMMDD-HHmmss")}.xlsx`;

      ctx.routerContext.response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      ctx.routerContext.response.headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      ctx.routerContext.response.body = exportExcel;
    } catch (error: unknown) {
      console.error("Export Excel Error:", error);
      throw new Error(`导出Excel失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  },
} satisfies ServerOperation;

// 工具函数：构建日期过滤条件
function buildDateFilters(input: ExportExcelInput): EntityFilterOptions[] {
  const filters: EntityFilterOptions[] = [];

  if (input.createdAtFrom) {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input.createdAtTo) {
    filters.push({ operator: "lte", field: "createdAt", value: getNextDate(input.createdAtTo) });
  }
  if (input.createdAt && input.createdAt !== "undefined") {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAt });
  }
  if (input.endAt && input.endAt !== "undefined") {
    filters.push({ operator: "lte", field: "createdAt", value: getNextDate(input.endAt) });
  }

  return filters;
}

// 工具函数：构建通用过滤条件
function buildCommonFilters(input: ExportExcelInput): EntityFilterOptions[] {
  const filters: EntityFilterOptions[] = [];

  if (input.materialCategory && input.materialCategory !== "undefined") {
    filters.push({
      operator: "exists",
      field: "material",
      filters: [{ operator: "in", field: "category", value: input.materialCategory.split(",") }],
    });
  }

  if (input.material && input.material !== "undefined") {
    filters.push({
      operator: "in",
      field: "material_id",
      value: input.material.split(","),
    });
  }

  if (input.lotNum && input.lotNum !== "undefined") {
    filters.push({ operator: "eq", field: "lotNum", value: input.lotNum });
  }

  if (input.binNum && input.binNum !== "undefined") {
    filters.push({ operator: "eq", field: "binNum", value: input.binNum });
  }

  return filters;
}

function getNameOfExportType(type: string) {
  switch (type) {
    case "application":
      return "库存操作报表";
    case "inventory":
      return "库存结存报表";
    case "goods":
      return "货品报表";
    case "operation":
      return "库存操作报表";
    case "inspection":
      return "检验记录报表";
    default:
      return "";
  }
}

async function handleExportByType(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  switch (input.type) {
    case "application":
      return exportApplicationExcel(routeContext, server, input);
    case "inventory":
      return exportInventoryExcel(routeContext, server, input);
    case "goods":
      return exportGoodsExcel(routeContext, server, input);
    case "operation":
      return exportOperationExcel(routeContext, server, input);
    case "inspection":
      return exportInspectionExcel(routeContext, server, input);
    default:
      throw new Error(`Unsupported type: ${input.type}`);
  }
}

async function exportInventoryExcel(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  const inventoryBalances = await fetchInventory(routeContext, server, input);

  const rows = inventoryBalances.map(flattenInventory);

  return createExcelSheet(rows, EXCEL_HEADERS.inventory);
}

async function exportGoodsExcel(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  const goodTransfers = await fetchGoods(routeContext, server, input);

  const rows = goodTransfers.map(flattenGoods);

  return createExcelSheet(rows, EXCEL_HEADERS.goods);
}

async function exportOperationExcel(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  const goodTransfers = await fetchGoodTransfers(routeContext, server, input);

  const rows = goodTransfers.map(flattenGoodTransfer);

  return createExcelSheet(rows, EXCEL_HEADERS.operation);
}

async function exportInspectionExcel(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  const inspectionMeasurements = await fetchInspectionMeasurements(routeContext, server, input);

  const rows = inspectionMeasurements.map(flattenInspectionMeasurement);

  return createExcelSheet(rows, EXCEL_HEADERS.inspection);
}

async function exportApplicationExcel(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  const applicationItems = await fetchApplicationItems(routeContext, server, input);

  const rows = applicationItems.map(flattenApplicationItem);

  return createExcelSheet(rows, EXCEL_HEADERS.application);
}

// Fetching Functions

async function fetchInventory(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  const filters: EntityFilterOptions[] = [{ operator: "gt", field: "onHandQuantity", value: 0 }, ...buildDateFilters(input), ...buildCommonFilters(input)];

  return server.getEntityManager<MomMaterialLotInventoryBalance>("mom_material_lot_inventory_balance").findEntities({
    routeContext,
    filters,
    properties: ["id", "material", "lotNum", "unit", "onHandQuantity", "lot"],
    relations: {
      material: {
        properties: ["id", "code", "name", "specification", "category"],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

async function fetchGoods(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  const filters: EntityFilterOptions[] = [...buildDateFilters(input), ...buildCommonFilters(input)];

  if (input?.state && input.state !== "undefined") {
    filters.push({
      operator: "in",
      field: "state",
      value: input.state.split(","),
      itemType: "text",
    });
  }

  if (input?.warehouse && input.warehouse !== "undefined") {
    filters.push({
      operator: "in",
      field: "warehouse_id",
      value: input.warehouse.split(","),
    });
  }

  if (input?.warehouseArea && input.warehouseArea !== "undefined") {
    filters.push({
      operator: "in",
      field: "warehouse_area_id",
      value: input.warehouseArea.split(","),
    });
  }

  if (input?.location && input.location !== "undefined") {
    filters.push({
      operator: "in",
      field: "location_id",
      value: input.location.split(","),
    });
  }

  return server.getEntityManager<MomGood>("mom_good").findEntities({
    routeContext,
    filters,
    properties: [
      "id",
      "material",
      "lotNum",
      "binNum",
      "quantity",
      "unit",
      "state",
      "warehouse",
      "location",
      "lot",
      "manufactureDate",
      "validityDate",
      "createdAt",
    ],
    relations: {
      material: {
        properties: ["id", "code", "name", "specification", "category"],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

async function fetchGoodTransfers(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  let filters: EntityFilterOptions[] = [{ operator: "notNull", field: "to" }];

  if (input.createdAtFrom) {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input.createdAtTo) {
    filters.push({ operator: "lte", field: "createdAt", value: getNextDate(input.createdAtTo) });
  }

  return server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntities({
    routeContext,
    filters: filters,
    properties: ["id", "operation", "lotNum", "binNum", "material", "quantity", "packageNum", "manufactureDate", "validityDate", "from", "to"],
    relations: {
      operation: {
        properties: [
          "id",
          "code",
          "businessType",
          "applicant",
          "application",
          "contractNum",
          "productionPlanSn",
          "supplier",
          "customer",
          "shop",
          "department",
          "finishedMaterial",
        ],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

function getNextDate(date: string) {
  return dayjs(date).add(1, "day").format("YYYY-MM-DD");
}

async function fetchInspectionMeasurements(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  let filters: EntityFilterOptions[] = [
    {
      operator: "exists",
      field: "sheet",
      filters: [
        {
          operator: "notNull",
          field: "material",
        },
        {
          operator: "notNull",
          field: "rule",
        },
      ],
    },
    {
      operator: "or",
      filters: [
        {
          operator: "notNull",
          field: "qualitativeValue",
        },
        {
          operator: "notNull",
          field: "quantitativeValue",
        },
      ],
    },
  ];

  if (input?.createdAt && input.createdAt !== "undefined") {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input?.endAt && input.endAt !== "undefined") {
    filters.push({ operator: "lte", field: "createdAt", value: getNextDate(input.createdAtTo) });
  }
  if (input?.state && input.state !== "undefined") {
    filters.push({
      operator: "exists",
      field: "sheet",
      filters: [{ operator: "in", field: "state", value: input.state.split(","), itemType: "text" }],
    });
  }
  if (input?.approvalState && input.approvalState !== "undefined") {
    filters.push({
      operator: "exists",
      field: "sheet",
      filters: [{ operator: "in", field: "approvalState", value: input.approvalState.split(","), itemType: "text" }],
    });
  }
  if (input?.materialCategory && input.materialCategory !== "undefined") {
    filters.push({
      operator: "exists",
      field: "material",
      filters: [{ operator: "in", field: "category", value: input.materialCategory.split(",") }],
    });
  }
  if (input?.warehouse && input.warehouse !== "undefined") {
    filters.push({
      operator: "in",
      field: "warehouse_id",
      value: input.warehouse.split(","),
    });
  }
  if (input?.warehouseArea && input.warehouseArea !== "undefined") {
    filters.push({
      operator: "in",
      field: "warehouse_area_id",
      value: input.warehouseArea.split(","),
    });
  }
  if (input?.location && input.location !== "undefined") {
    filters.push({
      operator: "in",
      field: "location_id",
      value: input.location.split(","),
    });
  }
  if (input?.material && input.material !== "undefined") {
    filters.push({
      operator: "in",
      field: "material_id",
      value: input.material.split(","),
    });
  }
  if (input?.lotNum && input.lotNum !== "undefined") {
    filters.push({ operator: "eq", field: "lotNum", value: input.lotNum });
  }
  if (input?.binNum && input.binNum !== "undefined") {
    filters.push({ operator: "eq", field: "binNum", value: input.binNum });
  }

  return server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").findEntities({
    routeContext,
    filters: filters,
    properties: [
      "id",
      "sheet",
      "sampleCode",
      "characteristic",
      "instrument",
      "inspector",
      "createdAt",
      "qualitativeValue",
      "quantitativeValue",
      "isQualified",
      "round",
    ],
    relations: {
      sheet: {
        properties: ["id", "code", "state", "approvalState", "material", "rule", "remark", "lotNum"],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

async function fetchApplicationItems(routeContext: RouteContext, server: IRpdServer, input: ExportExcelInput) {
  let filters: EntityFilterOptions[] = [
    { operator: "notNull", field: "application" },
    {
      operator: "notNull",
      field: "material",
    },
  ];

  if (input?.createdAtFrom) {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input?.createdAtTo) {
    filters.push({ operator: "lte", field: "createdAt", value: getNextDate(input.createdAtTo) });
  }
  if (input?.createdAt && input.createdAt !== "undefined") {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAt });
  }
  if (input?.endAt && input.endAt !== "undefined") {
    filters.push({ operator: "lte", field: "createdAt", value: getNextDate(input.endAt) });
  }
  if (input?.businessType && input.businessType !== "undefined") {
    filters.push({
      operator: "exists",
      field: "application",
      filters: [{ operator: "in", field: "businessType", value: input.businessType.split(",") }],
    });
  }
  if (input?.applicant && input.applicant !== "undefined") {
    filters.push({
      operator: "exists",
      field: "application",
      filters: [{ operator: "in", field: "applicant_id", value: input.applicant.split(",") }],
    });
  }
  if (input?.biller && input.biller !== "undefined") {
    filters.push({
      operator: "exists",
      field: "application",
      filters: [{ operator: "in", field: "biller", value: input.biller.split(",") }],
    });
  }
  if (input?.operationState && input.operationState !== "undefined") {
    filters.push({
      operator: "exists",
      field: "application",
      filters: [{ operator: "in", field: "operationState", value: input.operationState.split(","), itemType: "text" }],
    });
  }
  if (input?.warehouse && input.warehouse !== "undefined") {
    filters.push({
      operator: "exists",
      field: "application",
      filters: [
        {
          operator: "in",
          field: "warehouse_id",
          value: input.warehouse.split(","),
        },
      ],
    });
  }
  if (input?.material && input.material !== "undefined") {
    filters.push({ operator: "in", field: "material_id", value: input.material.split(",") });
  }
  if (input?.lotNum && input.lotNum !== "undefined") {
    filters.push({ operator: "eq", field: "lotNum", value: input.lotNum });
  }

  return server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").findEntities({
    routeContext,
    filters: filters,
    properties: ["id", "application", "lotNum", "binNum", "material", "quantity", "remark", "acceptQuantity", "material"],
    relations: {
      application: {
        properties: ["id", "code", "operationType", "fUse", "businessType", "supplier", "from", "to"],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

// Data Flattening Functions
function flattenInventory(good: MomMaterialLotInventoryBalance) {
  return {
    materialCode: `${good.material?.code}`,
    materialName: `${good.material?.name}`,
    materialSpecification: `${good.material?.specification}`,
    materialCategory: `${good.material?.category?.name}`,
    lotNum: good.lotNum,
    quantity: good.onHandQuantity,
  };
}

function flattenGoods(good: MomGood) {
  return {
    material: `${good.material?.code}-${good.material?.name}-${good.material?.specification}`,
    materialCategory: `${good.material?.category?.name}`,
    lotNum: good.lotNum,
    binNum: good.binNum,
    quantity: good.quantity,
    manufactureDate: good.manufactureDate,
    validityDate: good.validityDate,
    state: mapGoodState(good.state),
    warehouse: good.warehouse?.name,
    location: good.location?.name,
    qualificationState: mapQualificationState(good.lot?.qualificationState),
  };
}

function flattenGoodTransfer(goodTransfer: MomGoodTransfer) {
  return {
    code: goodTransfer.operation?.code,
    businessType: goodTransfer.operation?.businessType?.name,
    material: `${goodTransfer.material?.code}-${goodTransfer.material?.name}-${goodTransfer.material?.specification}`,
    lotNum: goodTransfer.lotNum,
    binNum: goodTransfer.binNum,
    quantity: goodTransfer.quantity,
    manufactureDate: goodTransfer.manufactureDate,
    validityDate: goodTransfer.validityDate,
    to: goodTransfer.to?.name,
    qualificationState: mapQualificationState(goodTransfer.lot?.qualificationState),
  };
}

function flattenInspectionMeasurement(measurement: MomInspectionMeasurement) {
  return {
    code: measurement.sheet?.code,
    state: mapInspectionState(measurement.sheet?.state),
    approvalState: mapApprovalState(measurement.sheet?.approvalState),
    material: `${measurement.sheet?.material?.code}-${measurement.sheet?.material?.name}-${measurement.sheet?.material?.specification}`,
    rule: measurement.sheet?.rule?.name,
    lotNum: measurement.sheet?.lotNum,
    sampleCode: measurement.sampleCode,
    round: measurement.round,
    characteristic: measurement.characteristic?.name,
    instrument: measurement.instrument?.code,
    value: measurement.qualitativeValue || measurement.quantitativeValue,
    isQualified: measurement.isQualified ? "合格" : "不合格",
    inspectedAt: measurement.createdAt,
  };
}

function flattenApplicationItem(item: MomInventoryApplicationItem) {
  const application = item.application;
  const businessTypeName = application?.businessType?.name || "";
  const operationType = application?.operationType;

  let warehouseName: string;
  if (operationType === "in") {
    warehouseName = application?.to?.name || "";
  } else if (operationType === "out") {
    warehouseName = application?.from?.name || "";
  } else {
    warehouseName = "";
  }

  return {
    code: application?.code,
    businessType: application?.businessType?.name,
    warehouse: warehouseName,
    materialCode: item.material?.code || "",
    materialName: item.material?.name || "",
    materialSpecification: item.material?.specification || "",
    lotNum: item.lotNum,
    quantity: item.quantity,
    actualQuantity: item.acceptQuantity,
    remark: ["生产入库", "领料出库", "生产入库退货出库"].includes(businessTypeName) ? item.remark || "" : "",
    fUse: ["领料出库"].includes(businessTypeName) ? application?.fUse || "" : "",
    supplier: ["委外加工出库", "委外加工入库"].includes(businessTypeName) ? application?.supplier?.name || "" : "",
    requirement: ["委外加工出库"].includes(businessTypeName) ? application?.fUse || "" : "",
  };
}

// Mapping Functions

function mapState(state: string | undefined, type: keyof typeof STATE_MAPPINGS): string {
  const mapping = STATE_MAPPINGS[type];
  return state ? mapping[state as keyof typeof mapping] || mapping.default : mapping.default;
}

function mapQualificationState(state: string | undefined): string {
  return mapState(state, "qualificationState");
}

function mapInspectionState(state: string | undefined): string {
  return mapState(state, "inspectionState");
}

function mapApprovalState(state: string | undefined): string {
  return mapState(state, "approvalState");
}

function mapGoodState(state: string | undefined): string {
  return mapState(state, "goodState");
}

// Excel Sheet Creation

function createExcelSheet(rows: any[], header: string[]) {
  try {
    const worksheet = utils.json_to_sheet(rows);

    // 设置表头样式
    const headerRange = { s: { c: 0, r: 0 }, e: { c: header.length - 1, r: 0 } };
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = utils.encode_cell({ c: C, r: 0 });
      if (worksheet[address]) {
        worksheet[address].s = {
          font: { bold: true },
          alignment: { horizontal: "center" },
        };
      }
    }

    utils.sheet_add_aoa(worksheet, [header], { origin: "A1" });

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");

    return writeXLSX(workbook, { type: "buffer", bookType: "xlsx" });
  } catch (error: unknown) {
    console.error("Create Excel Sheet Error:", error);
    throw new Error("创建Excel文件失败");
  }
}
