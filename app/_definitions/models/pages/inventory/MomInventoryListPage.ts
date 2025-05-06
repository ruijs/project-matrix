import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "mom_inventory_with_inspection_results",
  name: "库存查询",
  title: "库存查询",
  // permissionCheck: { any: [] },
  view: [
    {
      $type: "inventoryWithInspectionResultSection",
    },
  ],
};

export default page;
