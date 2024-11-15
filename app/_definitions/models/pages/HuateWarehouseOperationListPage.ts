import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "factory",
    },
    {
      type: "auto",
      code: "material",
      formControlProps: {
        dropdownMatchSelectWidth: 500,
        listTextFormat: materialFormatStrTemplate,
        listFilterFields: ["name", "code", "specification"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
          { code: "specification", title: "规格", width: 120 },
        ],
      },
    },
    {
      type: "auto",
      code: "quantity",
    },
  ],
};

const page: RapidPage = {
  code: "huate_warehouse_operation_list",
  name: "仓库操作登记",
  title: "仓库操作登记",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "HuateWarehouseOperation",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        },
      ],
      orderBy: [
        {
          field: "createdAt",
          desc: true,
        },
      ],
      columns: [
        {
          type: "auto",
          code: "factory",
          width: "150px",
        },
        {
          type: "auto",
          code: "material",
          fixed: "left",
          rendererType: "anchor",
          rendererProps: {
            children: {
              $type: "materialLabelRenderer",
              $exps: {
                value: "$slot.value",
              },
            },
            $exps: {
              href: "$rui.execVarText('/pages/base_material_details?id={{id}}', $slot.value)",
            },
          },
        },
        {
          type: "auto",
          code: "quantity",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      // actions: [
      //   {
      //     $type: "sonicRecordActionEditEntity",
      //     code: "edit",
      //     actionType: "edit",
      //     actionText: "修改",
      //   },
      //   {
      //     $type: "sonicRecordActionDeleteEntity",
      //     code: "delete",
      //     actionType: "delete",
      //     actionText: "删除",
      //     dataSourceCode: "list",
      //     entityCode: "HuateWarehouseOperation",
      //   },
      // ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
