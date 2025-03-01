import type { RapidPage } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "product_inspection_sheet_import",
  //@ts-ignore
  name: "导入成品检测记录",
  title: "导入成品检测记录",
  permissionCheck: { any: ["inspectionRecord.manage"] },
  view: [
    {
      $id: "productInspectionSheetImport",
      $type: "productInspectionSheetImport",
    },
  ],
};

export default page;
