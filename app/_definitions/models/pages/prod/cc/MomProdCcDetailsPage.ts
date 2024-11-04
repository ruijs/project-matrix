import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormRockConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const reportFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "workOrder",
      listDataFindOptions: {
        properties: ["id", "code"],
        fixedFilters: [
          {
            field: "id",
            operator: "eq",
            value: "",
          },
        ],
        $exps: {
          "fixedFilters[0].value": "$rui.parseQuery().id",
        },
      },

      formControlProps: {
        listTextFormat: "{{code}}",
        dropdownMatchSelectWidth: 300,
        listFilterFields: ["code"],
        columns: [{ code: "code", title: "编号", width: 120 }],
      },
    },
    {
      type: "auto",
      code: "process",
      listDataFindOptions: {
        properties: ["id", "code", "name"],
        fixedFilters: [
          {
            field: "id",
            operator: "eq",
            value: "",
          },
        ],
        $exps: {
          "fixedFilters[0].value": "$stores.detail?.data?.list[0]?.process.id",
        },
      },
      formControlProps: {
        dropdownMatchSelectWidth: 300,
        listTextFormat: "{{code}} {{name}}",
        listFilterFields: ["name", "code"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
        ],
      },
    },
    {
      type: "auto",
      code: "equipment",
      listDataFindOptions: {
        properties: ["id", "code", "name"],
        fixedFilters: [
          {
            field: "id",
            operator: "eq",
            value: "",
          },
        ],
        $exps: {
          "fixedFilters[0].value": "$stores.detail?.data?.list[0]?.equipment.id",
        },
      },
      formControlProps: {
        dropdownMatchSelectWidth: 300,
        listTextFormat: "{{code}} {{name}}",
        listFilterFields: ["name", "code"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
        ],
      },
    },
    {
      type: "auto",
      code: "operators",
      formControlProps: {
        listTextFormat: "{{name}} ({{department.name}})",
      },
      listDataFindOptions: {
        properties: ["id", "name", "department"],
        fixedFilters: [
          {
            field: "state",
            operator: "eq",
            value: "normal",
          },
        ],
        orderBy: [
          {
            field: "code",
          },
        ],
      },
    },
    {
      type: "auto",
      code: "lotNum",
    },
  ],
  defaultFormFields: {
    unqualifiedQuantity: 0,
    scrapQuantity: 0,
    work_order_id: "",
  },
  $exps: {
    "defaultFormFields.work_order_id": "$rui.parseQuery().id",
  },
};

const feedFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "process",
      listDataFindOptions: {
        properties: ["id", "code", "name"],
        fixedFilters: [
          {
            field: "id",
            operator: "eq",
            value: "",
          },
        ],
        $exps: {
          "fixedFilters[0].value": "$stores.detail?.data?.list[0]?.process.id",
        },
      },
      formControlProps: {
        dropdownMatchSelectWidth: 300,
        listTextFormat: "{{code}} {{name}}",
        listFilterFields: ["name", "code"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
        ],
      },
    },
    {
      type: "auto",
      code: "equipment",
      listDataFindOptions: {
        properties: ["id", "code", "name"],
        fixedFilters: [
          {
            field: "id",
            operator: "eq",
            value: "",
          },
        ],
        $exps: {
          "fixedFilters[0].value": "$stores.detail?.data?.list[0]?.equipment.id",
        },
      },
      formControlProps: {
        dropdownMatchSelectWidth: 300,
        listTextFormat: "{{code}} {{name}}",
        listFilterFields: ["name", "code"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
        ],
      },
    },
    {
      type: "auto",
      code: "rawMaterial",
      formControlType: "rawMaterialSelector",
      formControlProps: {
        $exps: {
          materialId: "",
        },
      },
      $exps: {
        "formControlProps.$exps.materialId": "$stores.detail?.data?.list[0]?.material.id",
      },
    },
    {
      type: "auto",
      code: "lot",
      formControlProps: {
        dropdownMatchSelectWidth: 300,
        listTextFormat: "{{lotNum}}",
        listFilterFields: ["lotNum"],
        columns: [{ code: "lotNum", title: "批号", width: 120 }],
      },
    },
  ],
  defaultFormFields: {
    unqualifiedQuantity: 0,
    scrapQuantity: 0,
  },
};

const page: RapidPage = {
  code: "mom_prod_cc_details",
  //@ts-ignore
  parentCode: "mom_prod_cc_sheet_list",
  name: "工单详情",
  title: "工单详情",
  view: [
    {
      $type: "rapidToolbar",
      extras: [
        {
          $type: "rapidToolbarButton",
          text: "取消工单",
          $permissionCheck: "tysProduction.manage",
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              url: "",
              data: {
                $operation: {
                  type: "cancelOrder",
                },
                $stateProperties: ["executionState"],
                executionState: "canceled",
              },
              $exps: {
                url: "'/api/mom/mom_work_orders/' + $rui.parseQuery().id",
              },
            },
            {
              $action: "antdMessage",
              title: "工单取消成功。",
              onClose: [
                {
                  $action: "reloadPage",
                },
              ],
            },
          ],
          $exps: {
            _hidden: "!($stores.detail?.data?.list[0]?.executionState == 'pending' || $stores.detail?.data?.list[0]?.executionState == 'processing')",
          },
        },
        {
          $type: "rapidToolbarButton",
          text: "完成工单",
          actionStyle: "primary",
          $permissionCheck: "tysProduction.manage",
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              url: "",
              data: {
                $operation: {
                  type: "completeOrder",
                },
                $stateProperties: ["executionState"],
                executionState: "completed",
              },
              $exps: {
                url: "'/api/mom/mom_work_orders/' + $rui.parseQuery().id",
              },
            },
            {
              $action: "antdMessage",
              title: "工单已完成。",
              onClose: [
                {
                  $action: "reloadPage",
                },
              ],
            },
          ],
          $exps: {
            _hidden: "!($stores.detail?.data?.list[0]?.executionState == 'processing')",
          },
        },
        {
          $type: "rapidToolbarButton",
          text: "重新开启",
          $permissionCheck: "tysProduction.manage",
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              url: "",
              data: {
                $operation: {
                  type: "reopenOrder",
                },
                $stateProperties: ["executionState"],
              },
              $exps: {
                url: "'/api/mom/mom_work_orders/' + $rui.parseQuery().id",
              },
            },
            {
              $action: "antdMessage",
              title: "工单已重新开启。",
              onClose: [
                {
                  $action: "reloadPage",
                },
              ],
            },
          ],
          $exps: {
            _hidden: "!($stores.detail?.data?.list[0]?.executionState == 'canceled')",
          },
        },
      ],
    },
    {
      $type: "rapidEntityForm",
      entityCode: "MomWorkOrder",
      mode: "view",
      column: 3,
      items: [
        {
          type: "auto",
          code: "code",
        },
        {
          type: "auto",
          code: "material",
          rendererType: "rapidLinkRenderer",
          rendererProps: {
            text: materialFormatStrTemplate,
            url: "/pages/base_material_details?id={{id}}",
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
          code: "factory",
        },
        {
          type: "auto",
          code: "process",
        },
        // {
        //   type: "auto",
        //   code: "equipment",
        // },
        {
          type: "auto",
          code: "executionState",
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
          key: "workReports",
          label: "报工记录",
          children: [
            {
              $type: "sonicEntityList",
              entityCode: "MomWorkReport",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "workOrder",
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
              orderBy: [
                {
                  field: "id",
                  desc: true,
                },
              ],
              extraProperties: ["workOrder"],
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  $permissionCheck: "tysProduction.manage",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                  $exps: {
                    _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'executionState') === 'completed'",
                  },
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
                  code: "createdAt",
                  width: "150px",
                  fixed: "left",
                  rendererType: "link",
                  rendererProps: {
                    url: "/pages/mom_work_report_details?workOrderId={{workOrder.id}}&workReportId={{id}}",
                  },
                },
                {
                  type: "auto",
                  code: "lotNum",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "serialNum",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "process",
                  width: "150px",
                  rendererProps: {
                    format: "{{code}} {{name}}",
                  },
                },
                {
                  type: "auto",
                  code: "equipment",
                  width: "150px",
                  rendererProps: {
                    format: "{{code}} {{name}}",
                  },
                },
                {
                  type: "auto",
                  code: "operators",
                  width: "150px",
                  rendererProps: {
                    format: "{{name}}",
                  },
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
                    disabled: "_.get(_.first(_.get($stores.detail, 'data.list')), 'executionState') === 'completed'",
                  },
                },
                {
                  $type: "sonicRecordActionDeleteEntity",
                  code: "delete",
                  actionType: "delete",
                  actionText: "删除",
                  $permissionCheck: "tysProduction.manage",
                  dataSourceCode: "list",
                  entityCode: "MomWorkReport",
                  $exps: {
                    disabled: "_.get(_.first(_.get($stores.detail, 'data.list')), 'executionState') === 'completed'",
                  },
                },
              ],
              newForm: cloneDeep(reportFormConfig),
              editForm: cloneDeep(reportFormConfig),

              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.defaultFormFields.work_order_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
        {
          key: "feeds",
          label: "投料记录",
          children: [
            {
              $type: "sonicEntityList",
              entityCode: "MomWorkFeed",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "work_order_id",
                  operator: "eq",
                  value: "",
                },
              ],
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  $permissionCheck: "tysProduction.manage",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                  $exps: {
                    _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'executionState') === 'completed'",
                  },
                },
                // {
                //   $type: "sonicToolbarRefreshButton",
                //   text: "刷新",
                //   icon: "ReloadOutlined",
                // },
              ],
              columns: [
                {
                  type: "auto",
                  code: "rawMaterial",
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
                  code: "lot",
                  width: "150px",
                  rendererProps: {
                    format: "{{lotNum}}",
                  },
                },
                {
                  type: "auto",
                  code: "equipment",
                  width: "150px",
                  fixed: "left",
                  rendererProps: {
                    format: "{{name}}",
                  },
                },
                {
                  type: "auto",
                  code: "process",
                  width: "150px",
                  fixed: "left",
                  rendererProps: {
                    format: "{{name}}",
                  },
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
                    disabled: "_.get(_.first(_.get($stores.detail, 'data.list')), 'executionState') === 'completed'",
                  },
                },
                {
                  $type: "sonicRecordActionDeleteEntity",
                  code: "delete",
                  actionType: "delete",
                  actionText: "删除",
                  $permissionCheck: "tysProduction.manage",
                  dataSourceCode: "list",
                  entityCode: "MomWorkFeed",
                  $exps: {
                    disabled: "_.get(_.first(_.get($stores.detail, 'data.list')), 'executionState') === 'completed'",
                  },
                },
              ],
              newForm: cloneDeep(feedFormConfig),
              editForm: cloneDeep(feedFormConfig),
              $exps: {
                "fixedFilters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.work_order_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
        {
          key: "metrics",
          label: "数采数据",
          children: [
            {
              $type: "sonicEntityList",
              entityCode: "MomRouteProcessParameterMeasurement",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "work_order_id",
                  operator: "eq",
                  value: "",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "nominal",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "upperLimit",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "lowerLimit",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "value",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "isOutSpecification",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "createdAt",
                  width: "150px",
                },
              ],
              $exps: {
                "fixedFilters[0].value": "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default page;
