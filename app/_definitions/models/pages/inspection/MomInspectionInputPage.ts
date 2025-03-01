import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "mom_inspection_input",
  name: "检验录入",
  title: "检验录入",
  permissionCheck: { any: ["inspectionRecord.manage"] },
  view: [
    {
      $type: "inspectionInputSection",
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    },
  ],
};

export default page;
