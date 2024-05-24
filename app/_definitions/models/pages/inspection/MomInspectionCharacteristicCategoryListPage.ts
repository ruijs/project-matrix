import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
    items: [
        {
            code: "name",
            type: "auto",
        },
        {
            code: "description",
            type: "auto",
        }
    ],
};

const page: RapidPage = {
    code: "mom_inspection_characteristic_category_list",
    name: "检验特征类型",
    title: "检验特征类型",
    permissionCheck: { any: [] },
    view: [
        {
            $type: "sonicEntityList",
            entityCode: "MomInspectionCharacteristicCategory",
            viewMode: "table",
            orderBy: [
                {
                    field: "name",
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
                    filterFields: ["name","description"],
                },
            ],
            columns: [
                {
                    type: "auto",
                    code: "name",
                    width: "120px",
                    fixed: "left",
                },
                {
                    type: "auto",
                    code: "description",                    
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
                    entityCode: "MomInspectionCharacteristicCategory",
                },
            ],
            newForm: cloneDeep(formConfig),
            editForm: cloneDeep(formConfig),
            searchForm: {
                entityCode: "MomInspectionCharacteristicCategory",
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