import type {ActionHandlerContext, IRpdServer, ServerOperation} from "@ruiapp/rapid-core";
import {utils, writeXLSX} from "xlsx";
import type {
  MomGood,
  MomGoodTransfer,
  MomInspectionMeasurement,
  MomInventoryApplicationItem, MomMaterialLotInventoryBalance,
} from "~/_definitions/meta/entity-types";
import {EntityFilterOptions} from "@ruiapp/rapid-extension/src/types/rapid-entity-types";

export type ExportExcelInput = {
  type: string;
  createdAtFrom: string;
  createdAtTo: string;
};


export default {
  code: "exportExcel",
  method: "GET",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: ExportExcelInput = ctx.input;

    const exportExcel = await handleExportByType(server, input);

    ctx.routerContext.response.headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    ctx.routerContext.response.headers.set(
      "Content-Disposition",
      `attachment; filename="${ encodeURIComponent('file.xlsx') }"`
    );
    ctx.routerContext.response.body = exportExcel;
  },
} satisfies ServerOperation;

async function handleExportByType(server: IRpdServer, input: ExportExcelInput) {
  switch (input.type) {
    case "application":
      return exportApplicationExcel(server, input);
    case "inventory":
      return exportInventoryExcel(server, input);
    case "goods":
      return exportGoodsExcel(server, input);
    case "operation":
      return exportOperationExcel(server, input);
    case "inspection":
      return exportInspectionExcel(server, input);
    case "organize":
      return exportInspectionExcel(server, input);
    default:
      throw new Error(`Unsupported type: ${ input.type }`);
  }
}

async function exportInventoryExcel(server: IRpdServer, input: ExportExcelInput) {
  const inventoryBalances = await fetchInventory(server, input);

  const rows = inventoryBalances.map(flattenInventory);

  return createExcelSheet(rows, [
    "物料编码", "物料名称", "物料规格", "物料类型", "批号", "数量"
  ]);
}

async function exportGoodsExcel(server: IRpdServer, input: ExportExcelInput) {
  const goodTransfers = await fetchGoods(server, input);

  const rows = goodTransfers.map(flattenGoods);

  return createExcelSheet(rows, [
    "物料", "物料类型", "批号", "托盘号", "数量", "生产日期", "有效期",
    "状态", "仓库", "库位", "合格状态"
  ]);
}

async function exportOperationExcel(server: IRpdServer, input: ExportExcelInput) {
  const goodTransfers = await fetchGoodTransfers(server, input);

  const rows = goodTransfers.map(flattenGoodTransfer);

  return createExcelSheet(rows, [
    "操作单号", "操作类型", "物料", "批号", "托盘号", "数量",
    "生产日期", "有效期", "入库库位", "合格状态"
  ]);
}

async function exportInspectionExcel(server: IRpdServer, input: ExportExcelInput) {
  const inspectionMeasurements = await fetchInspectionMeasurements(server, input);

  const rows = inspectionMeasurements.map(flattenInspectionMeasurement);

  return createExcelSheet(rows, [
    "检验单号", "检验单状态", "审核状态", "物料", "检验规则",
    "批号", "样本号", "检验轮次", "检验特征", "检验仪器",
    "实测值", "合格状态", "检验时间"
  ]);
}

async function exportApplicationExcel(server: IRpdServer, input: ExportExcelInput) {
  const applicationItems = await fetchApplicationItems(server, input);

  const rows = applicationItems.map(flattenApplicationItem);

  return createExcelSheet(rows, [
    "申请单号", "操作类型", "物料", "批号", "数量"
  ]);
}

// Fetching Functions

async function fetchInventory(server: IRpdServer, input: ExportExcelInput) {
  let filters: EntityFilterOptions[] = [{ operator: "gt", field: "onHandQuantity", value: 0}];

  if (input.createdAtFrom) {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input.createdAtTo) {
    filters.push({ operator: "lte", field: "createdAt", value: input.createdAtTo });
  }

  return server.getEntityManager<MomMaterialLotInventoryBalance>("mom_material_lot_inventory_balance").findEntities({
    filters: filters,
    properties: [
      "id","material","lotNum","unit","quantity","lot"
    ],
    relations: {
      material: {
        properties: [
          "id","code","name","specification","category"
        ],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

async function fetchGoods(server: IRpdServer, input: ExportExcelInput) {
  let filters: EntityFilterOptions[] = [{ operator: "ne", field: "state", value: "pending"}];

  if (input.createdAtFrom) {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input.createdAtTo) {
    filters.push({ operator: "lte", field: "createdAt", value: input.createdAtTo });
  }

  return server.getEntityManager<MomGood>("mom_good").findEntities({
    filters: filters,
    properties: [
      "id","material","lotNum","binNum","quantity","unit","state","warehouse","location","lot","manufactureDate","validityDate","createdAt"
    ],
    relations: {
      material: {
        properties: [
          "id","code","name","specification","category"
        ],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

async function fetchGoodTransfers(server: IRpdServer, input: ExportExcelInput) {
  let filters: EntityFilterOptions[] = [{ operator: "notNull", field: "to" }];

  if (input.createdAtFrom) {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input.createdAtTo) {
    filters.push({ operator: "lte", field: "createdAt", value: input.createdAtTo });
  }

  return server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntities({
    filters: filters,
    properties: [
      "id", "operation", "lotNum", "binNum", "material",
      "quantity", "packageNum", "manufactureDate",
      "validityDate", "from", "to"
    ],
    relations: {
      operation: {
        properties: [
          "id", "code", "businessType", "applicant",
          "application", "contractNum", "productionPlanSn",
          "supplier", "customer", "shop", "department",
          "finishedMaterial"
        ],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

async function fetchInspectionMeasurements(server: IRpdServer, input: ExportExcelInput) {
  let filters: EntityFilterOptions[] = [
    {
      operator: "exists",
      field: "sheet",
      filters: [
        {
          operator: "notNull",
          field: "material"
        },
        {
          operator: "notNull",
          field: "rule"
        }
      ]
    },
    {
      operator: "or",
      filters: [
        {
          operator: "notNull",
          field: "qualitativeValue"
        },
        {
          operator: "notNull",
          field: "quantitativeValue"
        }
      ]
    }
  ];

  if (input.createdAtFrom) {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input.createdAtTo) {
    filters.push({ operator: "lte", field: "createdAt", value: input.createdAtTo });
  }

  return server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").findEntities({
    filters: filters,
    properties: [
      "id", "sheet", "sampleCode", "characteristic",
      "instrument", "inspector", "createdAt",
      "qualitativeValue", "quantitativeValue",
      "isQualified", "round"
    ],
    relations: {
      sheet: {
        properties: [
          "id", "code", "state", "approvalState",
          "material", "rule", "remark", "lotNum"
        ],
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

async function fetchApplicationItems(server: IRpdServer, input: ExportExcelInput) {
  let filters: EntityFilterOptions[] = [{ operator: "notNull", field: "application" }, {
    operator: "notNull",
    field: "material"
  }];

  if (input.createdAtFrom) {
    filters.push({ operator: "gte", field: "createdAt", value: input.createdAtFrom });
  }
  if (input.createdAtTo) {
    filters.push({ operator: "lte", field: "createdAt", value: input.createdAtTo });
  }

  return server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").findEntities({
    filters: filters,
    properties: [
      "id", "application", "lotNum", "binNum",
      "material", "quantity", "material"
    ],
    relations: {
      application: {
        properties: ["id", "code", "businessType"]
      },
    },
    orderBy: [{ field: "id", desc: false }],
  });
}

// Data Flattening Functions
function flattenInventory(good: MomMaterialLotInventoryBalance) {
  return {
    materialCode: `${ good.material?.code }`,
    materialName: `${ good.material?.name }`,
    materialSpecification: `${ good.material?.specification }`,
    materialCategory: `${ good.material?.category?.name }`,
    lotNum: good.lotNum,
    quantity: good.onHandQuantity,
  };
}

function flattenGoods(good: MomGood) {
  return {
    material: `${ good.material?.code }-${ good.material?.name }-${ good.material?.specification }`,
    materialCategory: `${ good.material?.category?.name }`,
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
    material: `${ goodTransfer.material?.code }-${ goodTransfer.material?.name }-${ goodTransfer.material?.specification }`,
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
    material: `${ measurement.sheet?.material?.code }-${ measurement.sheet?.material?.name }-${ measurement.sheet?.material?.specification }`,
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
  return {
    code: item.application?.code,
    businessType: item.application?.businessType?.name,
    material: `${ item.material?.code }-${ item.material?.name }-${ item.material?.specification }`,
    lotNum: item.lotNum,
    quantity: item.quantity,
  };
}

// Mapping Functions

function mapQualificationState(state: string | undefined): string {
  switch (state) {
    case "qualified":
      return "合格";
    case "unqualified":
      return "不合格";
    default:
      return "未检验";
  }
}

function mapInspectionState(state: string | undefined): string {
  switch (state) {
    case "inspecting":
      return "检验中";
    case "inspected":
      return "检验完成";
    default:
      return "待检验";
  }
}

function mapApprovalState(state: string | undefined): string {
  switch (state) {
    case "approved":
      return "已审核";
    case "rejected":
      return "已驳回";
    default:
      return "未审核";
  }
}

function mapGoodState(state: string | undefined): string {
  switch (state) {
    case "normal":
      return "正常";
    case "splitted":
      return "已拆分";
    case "merged":
      return "已合并";
    case "transferred":
      return "已转移";
    case "destroied":
      return "已销毁";
    default:
      return "待处理";
  }
}



// Excel Sheet Creation

function createExcelSheet(rows: any[], header: string[]) {
  const worksheet = utils.json_to_sheet(rows);
  utils.sheet_add_aoa(worksheet, [header], { origin: "A1" });

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  return writeXLSX(workbook, { type: "buffer", bookType: "xlsx" });
}
