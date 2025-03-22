import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    // {
    //   type: "auto",
    //   code: "code",
    // },
    {
      type: "auto",
      code: "material",
      listDataFindOptions: {
        properties: ["id", "code", "name", "specification", "defaultUnit"],
        fixedFilters: [
          {
            operator: "eq",
            field: "can_produce",
            value: true,
          },
        ],
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
      code: "tags",
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
  code: "mom_work_order_list",
  name: "工单列表",
  title: "工单管理",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomWorkOrder",
      viewMode: "table",
      selectionMode: "none",
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
          type: "link",
          code: "code",
          width: "200px",
          fixed: "left",
          rendererType: "link",
          rendererProps: {
            url: "/pages/mom_work_order_details?id={{id}}",
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
        {
          type: "auto",
          code: "route",
          width: "100px",
          rendererProps: {
            format: "{{version}}",
          },
        },
        {
          type: "auto",
          code: "tags",
          width: "100px",
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
          width: "50px",
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
        "newForm.fixedFields.assignmentState": "unassigned",
        "newForm.fixedFields.executionState": "pending",
      },
    },
  ],
};

export default page;
