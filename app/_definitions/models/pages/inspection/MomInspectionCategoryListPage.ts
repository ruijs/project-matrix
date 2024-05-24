import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
    items: [
        {
            code: "code",
            type: "auto",
        },
        {
            code: "name",
            type: "auto",
        },
        {
            code: "orderNum",
            type: "auto",
        }
    ],
};

const page: RapidPage = {
    code: "mom_inspection_category_list",
    name: "检验类型列表",
    title: "检验类型管理",
    permissionCheck: { any: [] },
    view: [
        {
            $type: "sonicEntityList",
            entityCode: "MomInspectionCategory",
            viewMode: "table",
            orderBy: [
                {
                    field: "code",
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
                    filterFields: ["code", "name"],
                },
            ],
            columns: [
                {
                    type: "link",
                    code: "code",
                    width: "100px",
                    fixed: "left",
                },
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
                    entityCode: "MomInspectionCategory",
                },
            ],
            newForm: cloneDeep(formConfig),
            editForm: cloneDeep(formConfig),
            searchForm: {
                entityCode: "MomInspectionCategory",
                items: [
                    {
                        type: "auto",
                        code: "code",
                        filterMode: "contains",
                    },
                    {
                        type: "auto",
                        code: "name",
                        filterMode: "contains",
                    },
                ],
            },
        },
    ],
};

export default page;