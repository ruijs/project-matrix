import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import * as fs from "fs";
import * as path from "path";
import { EntityFilterOptions } from "@ruiapp/rapid-extension/src/types/rapid-entity-types";
import type { MomInspectionMeasurement, MomInspectionSheet } from "~/_definitions/meta/entity-types";
import { renderCharacteristicQualifiedConditions } from "~/utils/inspection-utility";
import dayjs from "dayjs";

export type DownloadInspectSheetInput = {
  id: string;
};

interface InspectionData {
  materialName?: string;
  batchNumber?: string;
  sampleCount?: number;
  totalQuantity?: string;
  receiptDate?: string;
  inspectionItems: Array<{ item?: string; standard?: string; result?: string }>;
  conclusion: string;
  inspector?: string;
  reviewer?: string;
  inspectionDate?: string;
  today?: string; // today
}

export default {
  code: "downloadInspectSheet",
  method: "GET",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: DownloadInspectSheetInput = ctx.input;

    const docBuffer = await handleDownloadInspectSheet(server, routeContext, input);

    ctx.routerContext.response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    ctx.routerContext.response.headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent("file.docx")}"`);
    ctx.routerContext.response.body = docBuffer;
  },
} satisfies ServerOperation;

async function handleDownloadInspectSheet(server: IRpdServer, routeContext: RouteContext, input: DownloadInspectSheetInput) {
  const templatePath = path.resolve(__dirname, "../../../templates", "inspection_sheet_template.docx");

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template file not found");
  }

  const content = fs.readFileSync(templatePath, "binary");

  // 初始化 PizZip 和 Docxtemplater
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  const inspectionSheet = await fetchInspectionSheet(server, routeContext, input);
  const inspectionSheetMeasurements = await fetchInspectionMeasurements(server, routeContext, input);

  // 定义模板中需要填充的数据
  let data: InspectionData = {
    materialName: inspectionSheet?.material?.code + "-" + inspectionSheet?.material?.name + "-" + inspectionSheet?.material?.specification,
    batchNumber: inspectionSheet?.lotNum,
    sampleCount: inspectionSheet?.sampleCount,
    totalQuantity: inspectionSheet?.acceptQuantity?.toString() || "-",
    receiptDate: dayjs(inspectionSheet?.createdAt).format("YYYY-MM-DD"),
    conclusion: "合格",
    inspector: inspectionSheet?.inspector?.name,
    reviewer: inspectionSheet?.reviewer?.name,
    inspectionDate: dayjs(inspectionSheet?.inspectedAt).format("YYYY-MM-DD"),
    today: dayjs().format("YYYY-MM-DD"),
    inspectionItems: [],
  };

  for (const measurement of inspectionSheetMeasurements) {
    if (measurement.characteristic) {
      data.inspectionItems.push({
        item: measurement.characteristic?.name,
        standard: renderCharacteristicQualifiedConditions(measurement.characteristic),
        result: measurement.qualitativeValue || measurement.quantitativeValue?.toString(),
      });
    }
  }

  // 渲染模板
  doc.render(data);

  // 生成最终的文档并保存
  const outputBuffer = doc.getZip().generate({ type: "nodebuffer" });

  console.log("Word document generated successfully");
  return outputBuffer;
}

async function fetchInspectionSheet(server: IRpdServer, routeContext: RouteContext, input: DownloadInspectSheetInput) {
  let filters: EntityFilterOptions[] = [
    {
      operator: "notNull",
      field: "material",
    },
    {
      operator: "notNull",
      field: "rule",
    },
    {
      operator: "eq",
      field: "id",
      value: input.id,
    },
  ];

  return server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
    routeContext,
    filters: filters,
    properties: ["id", "material", "lotNum", "sampleCount", "sampleCount", "acceptQuantity", "createdAt", "inspector", "reviewer", "result"],
  });
}

async function fetchInspectionMeasurements(server: IRpdServer, routeContext: RouteContext, input: DownloadInspectSheetInput) {
  let filters: EntityFilterOptions[] = [
    {
      operator: "exists",
      field: "sheet",
      filters: [
        {
          operator: "eq",
          field: "id",
          value: input.id,
        },
      ],
    },
  ];

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
  });
}
