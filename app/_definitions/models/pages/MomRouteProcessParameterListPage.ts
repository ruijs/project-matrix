import {cloneDeep} from "lodash";
import type {RapidEntityFormRockConfig, RapidPage} from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "equipment",
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
      code: "dimension",
    },
    {
      type: "auto",
      code: "nominal",
    },
    {
      type: "auto",
      code: "upperLimit",
    },
    {
      type: "auto",
      code: "lowerLimit",
    },
    {
      type: "auto",
      code: "fawCode",
    },
  ],
};

const page: RapidPage = {
  code: "mom_process_details",
  //@ts-ignore
  parentCode: "mom_process_list",
  name: "生产工艺参数列表",
  title: "生产工艺参数列表",
  // permissionCheck: {any: []},
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "MomProcess",
      mode: "view",
      column: 3,
      items: [
        {
          type: "auto",
          code: "factory",
        },
        {
          type: "auto",
          code: "code",
        },
        {
          type: "auto",
          code: "name",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    },
    {
      $type: "sectionSeparator",
      showLine: true,
    },
    {
      $type: "antdTabs",
      items: [
        {
          key: "items",
          label: "工艺参数指标",
          children: [
            {
              $id: "goodTransferList",
              $type: "sonicEntityList",
              entityCode: "MomRouteProcessParameter",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "process_id",
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
                {
                  $type: "sonicToolbarRefreshButton",
                  text: "刷新",
                  icon: "ReloadOutlined",
                },
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
                  code: "process",
                },
                {
                  type: "auto",
                  code: "equipment",
                  rendererProps: {
                    format: "{{code}}-{{name}}",
                  },
                },
                {
                  type: "auto",
                  code: "dimension",
                  title: "数采指标",
                  rendererProps: {
                    format: "{{name}}",
                  },
                },
                {
                  type: "auto",
                  code: "fawCode",
                },
                {
                  type: "auto",
                  code: "nominal",
                },
                {
                  type: "auto",
                  code: "upperLimit",
                },
                {
                  type: "auto",
                  code: "lowerLimit",
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
                  entityCode: "MomRouteProcessParameter",
                },
              ],
              newForm: cloneDeep(formConfig),
              editForm: cloneDeep(formConfig),
              $exps: {
                "fixedFilters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.process_id": "$rui.parseQuery().id",
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
  ],
};

export default page;

