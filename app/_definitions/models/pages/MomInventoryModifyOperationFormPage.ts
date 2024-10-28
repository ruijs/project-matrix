import type { RapidPage } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "mom_inventory_modify_operation_form",
  parentCode: "mom_inventory_modify_operation_list",
  name: "新建出入库调整单",
  title: "新建出入库调整单",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "inventoryModifyOperationForm",
    },
  ],
};

export default page;
