import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    // {
    //   type: "auto",
    //   code: "code",
    // },
    {
      type: "auto",
      code: "factory",
      formControlProps: {
        $exps: {
          disabled: "true",
        },
      },
      listDataFindOptions: {
        properties: ["id", "code", "name"],
        fixedFilters: [
          {
            field: "factory",
            operator: "eq",
            value: "05",
          },
        ],
      },
    },
    // {
    //   type: "auto",
    //   code: "process",
    //   listDataFindOptions: {
    //     properties: ["id", "code", "name", "factory", "outputs", "equipments", "category"],
    //     fixedFilters: [
    //       {
    //         field: "factory",
    //         operator: "exists",
    //         filters: [
    //           {
    //             field: "code",
    //             operator: "eq",
    //             value: "05",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
    {
      type: "auto",
      code: "material",
      listDataFindOptions: {
        properties: ["id", "code", "name", "materialProcess", "specification", "defaultUnit"],
        fixedFilters: [
          {
            field: "factory",
            operator: "exists",
            filters: [
              {
                field: "code",
                operator: "eq",
                value: "05",
              },
            ],
          },
          {
            operator: "eq",
            field: "can_produce",
            value: true,
          },
        ],
      },
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
    // {
    //   type: "auto",
    //   code: "tags",
    // },
    // {
    //   type: "auto",
    //   code: "route",
    //   listDataFindOptions: {
    //     fixedFilters: [
    //       {
    //         field: "material",
    //         operator: "exists",
    //         filters: [
    //           {
    //             field: "id",
    //             operator: "eq",
    //             value: "",
    //           },
    //         ],
    //       },
    //     ],
    //     $exps: {
    //       "fixedFilters[0].filters[0].value": "$scope.vars.active_material_id",
    //     },
    //   },
    //   formControlProps: {
    //     listTextFieldName: "version",
    //     listFilterFields: ["version"],
    //     columns: [{ code: "version", title: "版本" }],
    //     $exps: {
    //       disabled: "!$self.form.getFieldValue('material')",
    //     },
    //   },
    // },
    // {
    //   type: "auto",
    //   code: "scheduledStartDate",
    // },
    // {
    //   type: "auto",
    //   code: "scheduledFinishDate",
    // },
    // {
    //   type: "auto",
    //   code: "quantity",
    // },
    // {
    //   type: "auto",
    //   code: "unit",
    // },
    // {
    //   type: "auto",
    //   code: "assignmentState",
    // },
    {
      code: "oilMixtureRatio",
      type: "auto",
    },
    {
      code: "paraffinQuantity",
      type: "auto",
    },
    {
      code: "stirringTime",
      type: "auto",
    },
    {
      code: "stirringPressure",
      type: "auto",
    },
    {
      code: "tankNumber",
      type: "auto",
    },
    {
      code: "unloadingVideo",
      type: "auto",
    },
    {
      code: "dcsPicture",
      type: "auto",
    },
    {
      type: "auto",
      code: "executionState",
      formControlProps: {
        disabled: true,
      },
    },
  ],
  onFormRefresh: [
    {
      $action: "script",
      script: `
        let material = event.args[0].form.getFieldValue("process");
        const materialId = material && material.id || material;
        event.scope.setVars({
          active_material_id: materialId,
        }, true);
        event.scope.loadStoreData('dataFormItemList-route');

        const _ = event.framework.getExpressionVars()._;
        const materials = _.get(event.scope.stores['dataFormItemList-material'], 'data.list');
        material = _.find(materials, function (item) { return item.id == materialId });
        const unitId = _.get(material, 'defaultUnit.id');
        event.page.sendComponentMessage(event.sender.$id, {
          name: "setFieldsValue",
          payload: {
            unit: unitId,
          }
        });
      `,
    },
  ],
  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        if(changedValues.hasOwnProperty('process')) {
          event.scope.setVars({
            active_process_id: changedValues.process,
          }, true);
          const _ = event.framework.getExpressionVars()._;
          const materials = _.get(event.scope.stores['dataFormItemList-material'], 'data.list');
          const material = _.find(materials, function (item) { return item.id == changedValues.material });
          const unitId = _.get(material, 'defaultUnit.id');
          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              unit: unitId,
              route: null,
            }
          });
          event.scope.loadStoreData('dataFormItemList-equipment');
        }
      `,
    },
  ],
  defaultFormFields: {
    factory: 9,
    executionState: "processing",
  },
};

const page: RapidPage = {
  code: "mom_prod_tys_sheet_list",
  name: "生产（泰洋圣）",
  title: "生产（泰洋圣）",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomWorkOrder",
      viewMode: "table",
      selectionMode: "none",
      fixedFilters: [
        {
          field: "factory",
          operator: "exists",
          filters: [
            {
              field: "code",
              operator: "eq",
              value: "05",
            },
          ],
        },
        // {
        //   field: "rule",
        //   operator: "exists",
        //   filters: [
        //     {
        //       field: "category",
        //       operator: "exists",
        //       filters: [
        //         {
        //           field: "code",
        //           operator: "eq",
        //           value: "incoming_inspect_topsenchem",
        //         },
        //       ],
        //     },
        //   ],
        // },
      ],
      orderBy: [
        {
          field: "id",
          desc: true,
        },
      ],
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          $permissionCheck: "tysProduction.manage",
          actionStyle: "primary",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索工单号",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code"],
        },
      ],
      columns: [
        {
          type: "auto",
          code: "factory",
          fixed: "left",
          width: "100px",
        },
        {
          type: "link",
          code: "code",
          width: "200px",
          fixed: "left",
          rendererType: "link",
          rendererProps: {
            url: "/pages/mom_prod_tys_details?id={{id}}",
          },
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
        // {
        //   type: "auto",
        //   code: "route",
        //   width: "100px",
        //   rendererProps: {
        //     format: "{{version}}",
        //   },
        // },
        // {
        //   type: "auto",
        //   code: "process",
        //   width: "100px",
        // },
        // {
        //   type: "auto",
        //   code: "equipment",
        //   width: "100px",
        // },
        // {
        //   type: "auto",
        //   code: "scheduledStartDate",
        //   width: "100px",
        // },
        // {
        //   type: "auto",
        //   code: "scheduledFinishDate",
        //   width: "100px",
        // },
        // {
        //   type: "auto",
        //   code: "quantity",
        //   width: "100px",
        // },
        // {
        //   type: "auto",
        //   code: "unit",
        //   width: "50px",
        //   rendererProps: {
        //     format: "{{name}}",
        //   },
        // },
        // {
        //   type: "auto",
        //   code: "assignmentState",
        //   width: "100px",
        // },
        {
          code: "oilMixtureRatio",
          type: "auto",
        },
        {
          code: "paraffinQuantity",
          type: "auto",
        },
        {
          code: "stirringTime",
          type: "auto",
        },
        {
          code: "stirringPressure",
          type: "auto",
        },
        {
          code: "tankNumber",
          type: "auto",
        },
        {
          code: "unloadingVideo",
          type: "auto",
        },
        {
          code: "dcsPicture",
          type: "auto",
        },
        {
          type: "auto",
          code: "executionState",
          width: "100px",
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
          $permissionCheck: "tysProduction.manage",
          actionText: "修改",
          $exps: {
            disabled: "$slot.record.executionState === 'finished'",
          },
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          $permissionCheck: "tysProduction.manage",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "MomWorkOrder",
          $exps: {
            disabled: "$slot.record.executionState === 'finished'",
          },
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      searchForm: {
        entityCode: "OcUser",
        items: [
          {
            type: "auto",
            code: "code",
            filterMode: "contains",
          },
        ],
      },
      $exps: {
        "newForm.defaultFields.executionState": "processing",
      },
    },
  ],
};

export default page;
