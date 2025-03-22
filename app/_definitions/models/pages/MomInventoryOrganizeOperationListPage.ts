import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [],
};

const page: RapidPage = {
  code: "mom_inventory_organize_operation_list",
  name: "移库记录列表",
  title: "移库记录",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomGoodTransfer",
      viewMode: "table",
      selectionMode: "none",
      listActions: [],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索托盘号",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["binNum"],
        },
      ],
      orderBy: [
        {
          field: "createdAt",
          desc: true,
        },
      ],
      fixedFilters: [
        {
          field: "operation",
          operator: "exists",
          filters: [
            {
              field: "operationType",
              operator: "eq",
              value: "organize",
            },
          ],
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "auto",
          // code: "transferTime",
          code: "createdAt",
          width: "180px",
          title: "移库时间",
        },
        {
          type: "auto",
          code: "from",
          title: "移出库位",
          width: "120px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "to",
          title: "移入库位",
          width: "120px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "material",
          title: "物料",
          width: "200px",
          rendererType: "materialLabelRenderer",
        },
        {
          type: "auto",
          code: "lotNum",
          title: "批号",
          width: "150px",
        },
        {
          type: "auto",
          code: "binNum",
          title: "托盘号",
          width: "150px",
        },
        {
          type: "auto",
          code: "quantity",
          title: "数量",
          width: "100px",
        },
        {
          type: "auto",
          code: "unit",
          width: "100px",
          rendererProps: {
            format: "{{name}}",
          },
        },
      ],
      actions: [],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
