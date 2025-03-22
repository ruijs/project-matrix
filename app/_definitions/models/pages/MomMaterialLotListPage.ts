import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    // {
    //   type: "auto",
    //   code: "lotNum",
    // },
    // {
    //   type: "auto",
    //   code: "material",
    //   formControlProps: {
    //     dropdownMatchSelectWidth: 500,
    //     labelRendererType: "materialLabelRenderer",
    //     listFilterFields: ["name", "code", "specification"],
    //     columns: [
    //       { code: "code", title: "编号", width: 120 },
    //       { code: "name", title: "名称", width: 120 },
    //       { code: "specification", title: "规格", width: 120 },
    //     ],
    //   },
    // },
    // {
    //   type: "auto",
    //   code: "sourceType",
    // },
    // {
    //   type: "date",
    //   code: "manufactureDate",
    // },
    {
      type: "auto",
      code: "qualificationState",
    },
    {
      type: "auto",
      code: "isAOD",
    },
  ],
};

const page: RapidPage = {
  code: "mom_material_lot_list",
  name: "货品批次列表",
  title: "货品批次",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "BaseLot",
      viewMode: "table",
      selectionMode: "none",
      // listActions: [
      //   {
      //     $type: "sonicToolbarNewEntityButton",
      //     text: "新建",
      //     icon: "PlusOutlined",
      //     actionStyle: "primary",
      //   },
      // ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索批号",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["lotNum"],
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
          code: "lotNum",
          width: "200px",
          fixed: "left",
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
          code: "sourceType",
          width: "100px",
        },
        // {
        //   type: "auto",
        //   code: "manufactureDate",
        //   width: "100px",
        //   fieldType: "date",
        // },
        // {
        //   type: "auto",
        //   code: "expireTime",
        //   width: "150px",
        //   fieldType: "date",
        // },
        {
          type: "auto",
          code: "qualificationState",
          width: "100px",
        },
        {
          type: "auto",
          code: "isAOD",
          width: "120px",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
        },
        // {
        //   $type: "sonicRecordActionDeleteEntity",
        //   code: "delete",
        //   actionType: "delete",
        //   actionText: "删除",
        //   dataSourceCode: "list",
        //   entityCode: "BaseLot",
        // },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
