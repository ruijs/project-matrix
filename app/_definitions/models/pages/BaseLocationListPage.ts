import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "type",
    },
    {
      type: "treeSelect",
      code: "parent",
      formControlProps: {
        listDataSourceCode: "locations",
        listParentField: "parent.id",
      },
    },
    {
      type: "auto",
      code: "code",
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "orderNum",
    },
  ],
};

const page: RapidPage = {
  code: "base_location_list",
  name: "区域列表",
  title: "区域管理",
  permissionCheck: { any: ["baseLocation.manage"] },
  view: [
    {
      $id: "baseLocationList",
      $type: "sonicEntityList",
      entityCode: "BaseLocation",
      viewMode: "table",
      virtual: true,
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        },
        {
          $type: "batchPrintAction",
          title: "批量打印",
          dataSourceAdapter: `
            return {
              templateCode: "locationIdentificationCard",
              taskData: record,
            };
          `,
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索名称、编码",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "name"],
        },
      ],
      orderBy: [
        {
          field: "orderNum",
        },
      ],
      convertListToTree: true,
      listParentField: "parent.id",
      pageSize: -1,
      extraProperties: ["parent"],
      columns: [
        {
          type: "auto",
          code: "code",
          width: "200px",
        },
        {
          type: "auto",
          code: "type",
          width: "100px",
        },
        {
          type: "auto",
          code: "name",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionPrintEntity",
          actionType: "print",
          actionText: "打印",
          dataSourceAdapter: `
            return _.map(data, function(item){
              return {
                templateCode: "locationIdentificationCard",
                taskData: item,
              }
            });
          `,
        },
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
          entityCode: "BaseLocation",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      // searchForm: {
      //   entityCode: "BaseLocation",
      //   items: [
      //     {
      //       type: "auto",
      //       code: "code",
      //       filterMode: "contains",
      //     },
      //     {
      //       type: "auto",
      //       code: "name",
      //       filterMode: "contains",
      //     },
      //   ],
      // },
      rowSelection: {
        checkStrictly: false,
      },
      onSelectedIdsChange: [
        {
          $action: "setVars",
          $exps: {
            "vars.selectedIds": "$event.args[0].selectedIds",
            "vars.selectedRecords": "$event.args[0].selectedRecords",
          },
        },
      ],
      stores: [
        {
          type: "entityStore",
          name: "locations",
          entityCode: "BaseLocation",
          properties: ["id", "type", "code", "name", "parent", "orderNum", "createdAt"],
          filters: [],
          orderBy: [
            {
              field: "orderNum",
            },
          ],
        },
      ],
      $exps: {
        convertListToTree: "!_.get($page.getScope('baseLocationList-scope').getStore('list').getConfig().filters, '[0].filters[0].value')",
      },
    },
  ],
};

export default page;
