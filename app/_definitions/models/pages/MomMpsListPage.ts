import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "material",
      listDataFindOptions: {
        fixedFilters: [
          {
            operator: "eq",
            field: "can_produce",
            value: true,
          },
        ],
        orderBy: [
          {
            field: "code",
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
      code: "quantity",
    },
    {
      type: "auto",
      code: "unit",
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
      code: "scheduleState",
    },
    {
      type: "auto",
      code: "executionState",
    },
  ],
};

const page: RapidPage = {
  code: "mom_mps_list",
  name: "生产计划列表",
  title: "主生产计划",
  view: [
    {
      $type: "antdTabs",
      items: [
        {
          key: "unscheduled",
          label: "未计划",
          children: [
            {
              $id: "unscheduledMpsList",
              $type: "sonicEntityList",
              entityCode: "MomMasterProductionSchedule",
              viewMode: "table",
              selectionMode: "multiple",
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                },
                {
                  $type: "rapidToolbarFormModalButton",
                  text: "计算物料需求",
                  icon: "ScheduleOutlined",
                  modalBody: [
                    {
                      $type: "rapidEntityForm",
                      $id: "createMrpForm",
                      entityCode: "MomManufacturingResourcePlan",
                      mode: "new",
                      items: [
                        {
                          type: "auto",
                          code: "name",
                        },
                      ],
                      $exps: {
                        "fixedFields.planningState": "'unplanned'",
                        "fixedFields.executionState": "'pending'",
                        "fixedFields.productionSchedules": "_.get($page.getScope('unscheduledMpsList-scope'), 'vars.selectedIds', [])",
                      },
                      onSaveSuccess: [
                        {
                          $action: "setVars",
                          vars: {
                            "modal-open": false,
                          },
                        },
                      ],
                    },
                  ],
                  onModalOpen: [
                    {
                      $action: "sendComponentMessage",
                      componentId: "createMrpForm",
                      message: {
                        name: "resetFields",
                      },
                    },
                  ],
                  onModalOk: [
                    {
                      $action: "sendComponentMessage",
                      componentId: "createMrpForm",
                      message: {
                        name: "submit",
                      },
                    },
                  ],
                },
                // {
                //   $type: "sonicToolbarRefreshButton",
                //   text: "刷新",
                //   icon: "ReloadOutlined",
                // },
              ],
              extraActions: [
                {
                  $type: "sonicToolbarFormItem",
                  formItemType: "search",
                  placeholder: "搜索编号",
                  actionEventName: "onSearch",
                  filterMode: "contains",
                  filterFields: ["code"],
                },
              ],
              fixedFilters: [
                {
                  field: "schedule_state",
                  operator: "eq",
                  value: "unscheduled",
                },
              ],
              orderBy: [
                {
                  field: "scheduledFinishDate",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "material",
                  rendererType: "anchor",
                  rendererProps: {
                    children: {
                      $type: "materialLabelRenderer",
                      $exps: {
                        value: "$slot.value",
                      },
                    },
                    $exps: {
                      href: "$rui.execVarText('/pages/mom_mps_details?id={{id}}', $slot.record)",
                    },
                  },
                },
                // {
                //   type: 'auto',
                //   code: 'tags',
                //   width: '200px',
                // },
                {
                  key: "tags-d",
                  type: "auto",
                  code: "tags",
                  title: "d",
                  fieldName: "tags",
                  width: "50px",
                  align: "right",
                  rendererProps: {
                    $exps: {
                      value: "qs.parse($slot.value).d",
                    },
                  },
                },
                {
                  key: "tags-D",
                  type: "auto",
                  code: "tags",
                  title: "D",
                  fieldName: "tags",
                  width: "50px",
                  align: "right",
                  rendererProps: {
                    $exps: {
                      value: "qs.parse($slot.value).D",
                    },
                  },
                },
                {
                  key: "tags-b",
                  type: "auto",
                  code: "tags",
                  title: "b",
                  fieldName: "tags",
                  width: "50px",
                  align: "right",
                  rendererProps: {
                    $exps: {
                      value: "qs.parse($slot.value).b",
                    },
                  },
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
                  code: "scheduleState",
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
              actionsColumnWidth: "80px",
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
                  entityCode: "MomMasterProductionSchedule",
                },
              ],
              newForm: cloneDeep(formConfig),
              editForm: cloneDeep(formConfig),
              onSelectedIdsChange: [
                {
                  $action: "setVars",
                  $exps: {
                    "vars.selectedIds": "$event.args[0].selectedIds",
                    "vars.selectedRecords": "$event.args[0].selectedRecords",
                  },
                },
              ],
              searchForm: {
                entityCode: "MomMasterProductionSchedule",
                items: [
                  {
                    type: "auto",
                    code: "scheduledStartDate",
                    filterMode: "eq",
                  },
                ],
              },
            },
          ],
        },
        {
          key: "scheduled",
          label: "已计划",
          children: [
            {
              $id: "scheduledMpsList",
              $type: "sonicEntityList",
              entityCode: "MomMasterProductionSchedule",
              viewMode: "table",
              selectionMode: "multiple",
              // listActions: [
              //   {
              //     $type: "sonicToolbarRefreshButton",
              //     text: "刷新",
              //     icon: "ReloadOutlined",
              //   },
              // ],
              extraActions: [
                {
                  $type: "sonicToolbarFormItem",
                  formItemType: "search",
                  placeholder: "Search",
                  actionEventName: "onSearch",
                  filterMode: "contains",
                  filterFields: ["code"],
                },
              ],
              fixedFilters: [
                {
                  field: "schedule_state",
                  operator: "eq",
                  value: "scheduled",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "material",
                  rendererType: "anchor",
                  rendererProps: {
                    children: {
                      $type: "materialLabelRenderer",
                      $exps: {
                        value: "$slot.value",
                      },
                    },
                    $exps: {
                      href: "$rui.execVarText('/pages/mom_mps_details?id={{id}}', $slot.record)",
                    },
                  },
                },
                // {
                //   type: 'auto',
                //   code: 'tags',
                //   width: '200px',
                // },
                {
                  key: "tags-d",
                  type: "auto",
                  code: "tags",
                  title: "d",
                  fieldName: "tags",
                  width: "50px",
                  align: "right",
                  rendererProps: {
                    $exps: {
                      value: "qs.parse($slot.value).d",
                    },
                  },
                },
                {
                  key: "tags-D",
                  type: "auto",
                  code: "tags",
                  title: "D",
                  fieldName: "tags",
                  width: "50px",
                  align: "right",
                  rendererProps: {
                    $exps: {
                      value: "qs.parse($slot.value).D",
                    },
                  },
                },
                {
                  key: "tags-b",
                  type: "auto",
                  code: "tags",
                  title: "b",
                  fieldName: "tags",
                  width: "50px",
                  align: "right",
                  rendererProps: {
                    $exps: {
                      value: "qs.parse($slot.value).b",
                    },
                  },
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
                  code: "scheduleState",
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
              actionsColumnWidth: "80px",
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
                  entityCode: "MomMasterProductionSchedule",
                },
              ],
              newForm: cloneDeep(formConfig),
              editForm: cloneDeep(formConfig),
              onSelectedIdsChange: [
                {
                  $action: "setVars",
                  $exps: {
                    "vars.selectedIds": "$event.args[0].selectedIds",
                    "vars.selectedRecords": "$event.args[0].selectedRecords",
                  },
                },
              ],
              searchForm: {
                entityCode: "MomMasterProductionSchedule",
                items: [
                  {
                    type: "auto",
                    code: "scheduledStartDate",
                    filterMode: "eq",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};

export default page;
