import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormRockConfig } from "@ruiapp/rapid-extension";

const orderFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "code",
    },
    {
      type: "auto",
      code: "material",
      listDataFindOptions: {
        properties: ["id", "code", "name", "specification", "defaultUnit"],
      },
      formControlProps: {
        dropdownMatchSelectWidth: 500,
        labelRendererType: "materialLabelRenderer",
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
      code: "route",
      listDataFindOptions: {
        fixedFilters: [
          {
            field: "material",
            operator: "exists",
            filters: [
              {
                field: "id",
                operator: "eq",
                value: "",
              },
            ],
          },
        ],
        $exps: {
          "fixedFilters[0].filters[0].value": "$scope.vars.active_material_id",
        },
      },
      formControlProps: {
        listTextFieldName: "version",
        listFilterFields: ["version"],
        columns: [{ code: "version", title: "版本" }],
        $exps: {
          disabled: "!$self.form.getFieldValue('material')",
        },
      },
    },
    {
      type: "auto",
      code: "scheduledStartDate",
    },
    {
      type: "auto",
      code: "scheduledFinishDate",
    },
    {
      type: "auto",
      code: "quantity",
    },
    {
      type: "auto",
      code: "unit",
    },
    {
      type: "auto",
      code: "assignmentState",
    },
    {
      type: "auto",
      code: "executionState",
    },
  ],
  onFormRefresh: [
    {
      $action: "script",
      script: `
        let material = event.args[0].form.getFieldValue("material");
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
        if(changedValues.hasOwnProperty('material')) {
          event.scope.setVars({
            active_material_id: changedValues.material,
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
          event.scope.loadStoreData('dataFormItemList-route');
        }
      `,
    },
  ],
};

const page: RapidPage = {
  code: "mom_mps_details",
  //@ts-ignore
  parentCode: "mom_mps_list",
  name: "主生产计划项详情",
  title: "主生产计划项详情",
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "MomMasterProductionSchedule",
      mode: "view",
      column: 3,
      items: [
        {
          type: "auto",
          code: "material",
          rendererType: "materialLabelRenderer",
        },
        {
          type: "auto",
          code: "quantity",
        },
        {
          type: "auto",
          code: "unit",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "scheduleState",
        },
        {
          type: "auto",
          code: "executionState",
        },
        {
          type: "auto",
          code: "scheduledStartDate",
        },
        {
          type: "auto",
          code: "scheduledFinishDate",
        },
        {
          type: "auto",
          code: "actualStartDate",
        },
        {
          type: "auto",
          code: "actualFinishDate",
        },
        {
          type: "auto",
          code: "createdAt",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    },
    {
      $type: "antdTabs",
      items: [
        {
          key: "orders",
          label: "工单",
          children: [
            {
              $id: "productionOrders",
              $type: "sonicEntityList",
              entityCode: "MomWorkOrder",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "mps_id",
                  operator: "eq",
                  value: "",
                },
              ],
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                },
                // {
                //   $type: "sonicToolbarRefreshButton",
                //   text: "刷新",
                //   icon: "ReloadOutlined",
                // },
              ],
              columns: [
                {
                  type: "link",
                  code: "code",
                  width: "150px",
                  fixed: "left",
                  rendererType: "link",
                  rendererProps: {
                    url: "/pages/mom_work_order_details?id={{id}}",
                  },
                },
                {
                  type: "link",
                  code: "material",
                  fixed: "left",
                  rendererType: "link",
                  rendererProps: {
                    text: "{{material.code}} {{material.name}}",
                    url: "/pages/base_material_details?id={{material.id}}",
                  },
                },
                {
                  type: "auto",
                  code: "scheduledStartDate",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "scheduledFinishDate",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "quantity",
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
                {
                  type: "auto",
                  code: "assignmentState",
                  width: "100px",
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
                  actionText: "修改",
                },
                {
                  $type: "sonicRecordActionDeleteEntity",
                  code: "delete",
                  actionType: "delete",
                  actionText: "删除",
                  dataSourceCode: "list",
                  entityCode: "MomWorkOrder",
                },
              ],
              newForm: cloneDeep(orderFormConfig),
              editForm: cloneDeep(orderFormConfig),
              $exps: {
                "fixedFilters[0].value": "$rui.parseQuery().id",
                "newForm.defaultFormFields.material": "parseInt($rui.parseQuery().id, 10)",
                "newForm.fixedFields.mps_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default page;
