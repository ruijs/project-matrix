import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "material",
      listDataFindOptions: {
        properties: ["id", "code", "name", "specification", "defaultUnit"],
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
    {
      type: "auto",
      code: "lotNum",
    },
    {
      type: "auto",
      code: "sealNum",
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
      code: "deliveryOrderFile",
      label: "送货委托书",
      required: true,
    },
    {
      type: "auto",
      code: "qualityInspectionReportFile",
      label: "质检报告",
      required: true,
    },
    {
      type: "auto",
      code: "sealNumPicture",
      label: "铅封号照片",
      required: true,
    },
  ],
  defaultFormFields: {
    state: "processing"
  },
  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        if(changedValues.hasOwnProperty('material')) {
          const _ = event.framework.getExpressionVars()._;
          const materials = _.get(event.scope.stores['dataFormItemList-material'], 'data.list');
          const material = _.find(materials, function (item) { return item.id == changedValues.material });
          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              unit: _.get(material, 'defaultUnit.id'),
              lotNum: ''
            }
          });
        }
      `,
    },
  ],
};

const page: RapidPage = {
  code: "mom_transport_operation_details",
  name: "运输单详情",
  title: "运输单详情",
  //@ts-ignore
  parentCode: "mom_transport_operation_list",
  // permissionCheck: {any: []},
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "MomTransportOperation",
      mode: "view",
      column: 3,
      items: [
        {
          type: "auto",
          code: "code",
        },
        {
          type: "auto",
          code: "applicant",
        },
        {
          type: "auto",
          code: "orderNumb",
        },
        {
          type: "auto",
          code: "supplier",
        },
        {
          type: "auto",
          code: "state",
        },
        {
          type: "auto",
          code: "approvalState",
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
      $type: "sectionSeparator",
      showLine: false,
    },
    {
      $type: "antdTabs",
      items: [
        {
          key: "items",
          label: "运输单明细",
          children: [
            {
              $id: "momTransportOperationItem",
              $type: "sonicEntityList",
              entityCode: "MomTransportOperationItem",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "operation",
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
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                  $permissionCheck: "inspectionTransport.manage",
                  $exps: {
                    _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
                  },
                },
                // {
                //   $type: "sonicToolbarRefreshButton",
                //   text: "刷新",
                //   icon: "ReloadOutlined",
                // },
              ],
              pageSize: -1,
              orderBy: [
                {
                  field: "createdAt",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "material",
                  width: "200px",
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
                  code: "lotNum",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "sealNum",
                  width: "100px",
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
                  code: "deliveryOrderFile",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "qualityInspectionReportFile",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "sealNumPicture",
                  width: "150px",
                },
              ],
              actions: [
                {
                  $type: "sonicRecordActionEditEntity",
                  code: "edit",
                  actionType: "edit",
                  actionText: "修改",
                  $permissionCheck: "inspectionTransport.manage",
                  $exps: {
                    _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
                  },
                },
                {
                  $type: "sonicRecordActionDeleteEntity",
                  code: "delete",
                  actionType: "delete",
                  actionText: "删除",
                  dataSourceCode: "list",
                  entityCode: "MomGoodTransfer",
                  $permissionCheck: "inspectionTransport.manage",
                  $exps: {
                    _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
                  },
                },
              ],
              newForm: cloneDeep(formConfig),
              editForm: cloneDeep(formConfig),
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.operation_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
    {
      $type: "sectionSeparator",
      showLine: false,
    },
    {
      $type: "rapidToolbar",
      items: [
        {
          $type: "rapidToolbarButton",
          text: "确认提交",
          actionStyle: "primary",
          $permissionCheck: "inspectionTransport.manage",
          size: "large",
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { state: "finished", approvalState: "approving" },
              $exps: {
                url: `"/api/mom/mom_transport_operations/" + $rui.parseQuery().id`,
              },
            },
            {
              $action: "antdMessage",
              title: "已提交",
              onClose: [
                {
                  $action: "reloadPage",
                },
              ],
            },
          ],
          $exps: {
            _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
          },
        },
      ],
    },
  ],
};

export default page;
