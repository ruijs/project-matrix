import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
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
      code: "originLotNum",
      formControlType: "materialLotNumSelector",
      formControlProps: {},
      $exps: {
        "formControlProps.materialId": "$self.form.getFieldValue('material')",
      },
    },
    {
      type: "auto",
      code: "lotNum",
    },
    {
      type: "date",
      code: "manufactureDate",
    },
  ],
};

const page: RapidPage = {
  code: "mom_material_lot_modify_application_list",
  name: "货品批次修改列表",
  title: "货品批次修改列表",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "BaseLotModifyApplication",
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
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索批号",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["originLotNum", "lotNum"],
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
          code: "material",
          width: "200px",
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
          code: "originLotNum",
          width: "150px",
        },
        {
          type: "auto",
          code: "lotNum",
          width: "150px",
        },
        {
          type: "auto",
          code: "manufactureDate",
          width: "100px",
          fieldType: "date",
        },
        // {
        //   type: "auto",
        //   code: "expireTime",
        //   width: "150px",
        //   fieldType: "date",
        // },
        // {
        //   type: "auto",
        //   code: "qualificationState",
        //   width: "100px",
        // },
        // {
        //   type: "auto",
        //   code: "isAOD",
        //   width: "120px",
        // },
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
      //   // {
      //   //   $type: "sonicRecordActionDeleteEntity",
      //   //   code: "delete",
      //   //   actionType: "delete",
      //   //   actionText: "删除",
      //   //   dataSourceCode: "list",
      //   //   entityCode: "BaseLot",
      //   // },
      // ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
