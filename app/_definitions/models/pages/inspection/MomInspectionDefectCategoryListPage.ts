import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
    items: [
        {
            type: "treeSelect",
            code: "parent",
            formControlProps: {
                listDataSourceCode: "nodeList",
                listParentField: "parent.id",
            },
        },
        {
            code: "name",
            type: "auto",
        },
        {
            code: "orderNum",
            type: "auto",
        },
        {
            code: "state",
            type: "auto",
        },
    ],
};

const page: RapidPage = {
    code: "mom_inspection_defect_category_list",
    name: "缺陷分类",
    title: "缺陷分类",
    permissionCheck: { any: [] },
    view: [
        {
            $type: "sonicEntityList",
            entityCode: "MomInspectionDefectCategory",
            viewMode: "table",
            convertListToTree: true,
            pageSize: -1,
            listParentField: "parent.id",
            extraProperties: ["parent"],
            orderBy: [
                {
                    field: "orderNum",
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
                    placeholder: "Search",
                    actionEventName: "onSearch",
                    filterMode: "contains",
                    filterFields: ["name"],
                },
            ],
            columns: [
                {
                    type: "auto",
                    code: "name",
                    fixed: "left",
                },
                {
                    type: "auto",
                    code: "orderNum",
                    width: "100px",
                    fixed: "left",
                },
                {
                    type: "auto",
                    code: "state",
                    width: "100px",
                    fixed: "left",
                }
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
                    entityCode: "MomInspectionDefectCategory",
                },
            ],
            newForm: cloneDeep(formConfig),
            editForm: cloneDeep(formConfig),
            // searchForm: {
            //     entityCode: "MomInspectionDefectCategory",
            //     items: [
            //         {
            //             type: "auto",
            //             code: "name",
            //             filterMode: "contains",
            //         },
            //     ],
            // },
            stores: [
                {
                  type: "entityStore",
                  name: "nodeList",
                  entityCode: "MomInspectionDefectCategory",
                  properties: ["id",  "name", "parent", "orderNum", "createdAt"],
                  filters: [],
                  orderBy: [
                    {
                      field: "orderNum",
                    },
                  ],
                },
              ],
        },
    ],
};

export default page;