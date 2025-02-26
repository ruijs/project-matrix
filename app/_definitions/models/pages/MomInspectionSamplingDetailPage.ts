import { cloneDeep } from "lodash";
import type { RapidEntityFormConfig, RapidPage } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "from",
    },
    {
      type: "auto",
      code: "to",
    },
    {
      type: "auto",
      code: "samplingCount",
    },
  ],
  defaultFormFields: {},
};

const page: RapidPage = {
  code: "mom_inspection_sampling_details",
  //@ts-ignore
  parentCode: "mom_inspection_sampling_list",
  name: "抽样规则详情",
  title: "抽样规则详情",
  // permissionCheck: {any: []},
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "MomInspectionSampling",
      mode: "view",
      column: 3,
      items: [
        {
          type: "auto",
          code: "materialCategory",
          rendererProps: {
            format: "{{code}}-{{name}}",
          },
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
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
          key: "items",
          label: "抽样数量",
          children: [
            {
              $id: "momInspectionSamplingItemList",
              $type: "sonicEntityList",
              entityCode: "MomInspectionSamplingItem",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "sampling",
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
                  $permissionCheck: "inspectionRule.manage",
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
                  field: "id",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "from",
                },
                {
                  type: "auto",
                  code: "to",
                },
                {
                  type: "auto",
                  code: "samplingCount",
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
                  entityCode: "MomInspectionSamplingItem",
                },
              ],
              newForm: cloneDeep(formConfig),
              editForm: cloneDeep(formConfig),
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.sampling_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default page;
