import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
    items: [
        {
            type: "treeSelect",
            code: "category",
            formControlProps: {
                listDataSourceCode: "categories",
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
    code: "mom_inspection_defect_list",
    name: "缺陷管理",
    title: "缺陷管理",
    permissionCheck: { any: [] },
    view: [
        {
            $id: "mainLayout",
            $type: "sonicMainSecondaryLayout",
            mainTitle: "缺陷分类",
            mainColSpan: 4,
            secondaryTitle: "缺陷列表",
            secondaryColSpan: 20,
            main: {
                $type: "antdTree",
                showLine: true,
                defaultExpandAll: true,
                fieldNames: { key: "id", title: "name" },
                titleRender: {
                    $type: "text",
                    $exps: {
                        text: "$slot.nodeData.name",
                    },
                },
                // onSelect: {
                //   $action: "setComponentProperty",
                //   componentId: "lblName",
                //   propName: "text",
                //   propValue: ([ , eventArgs]: any) => eventArgs.selected && eventArgs.node.name
                // },
                $exps: {
                    treeData: "$rui.listToTree($scope.stores.categories.data?.list, { listParentField: 'parent.id'})",
                },
                onSelect: [
                    {
                        $action: "sendComponentMessage",
                        componentId: "mainLayout",
                        message: {
                            name: "notifySelectedIdsChange",
                            payload: {
                                selectedIds: [],
                            },
                        },
                        $exps: {
                            "message.payload.selectedIds": "$event.args[0]",
                        },
                    },
                    // {
                    //   $action: "setVars",
                    //   scopeId: "package_list-scope",
                    //   $exps: {
                    //     "vars.activeId": "_.first($event.args[0])"
                    //   }
                    // }
                ],
            },
            secondary: [
                {
                    $type: "sonicEntityList",
                    entityCode: "MomInspectionDefect",
                    viewMode: "table",
                    fixedFilters: [
                        {
                            field: "category_id",
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
                            // $exps: {
                            //   _hidden: "!$scope.vars.activeId",
                            // }
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
                    orderBy: [
                        {
                            field: "orderNum",
                        },
                    ],
                    pageSize: 20,
                    columns: [
                        {
                            type: "auto",
                            code: "name",
                            width: "200px",
                        },
                        {
                            type: "auto",
                            code: "orderNum",
                            width: "100px",
                        },
                        {
                            type: "auto",
                            code: "state",
                            width: "100px",
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
                            entityCode: "MomInspectionDefect",
                        },
                    ],
                    newForm: cloneDeep(formConfig),
                    editForm: cloneDeep(formConfig),
                    stores: [
                        {
                            type: "entityStore",
                            name: "categories",
                            entityCode: "MomInspectionDefectCategory",
                            properties: ["id", "name", "parent", "orderNum"],
                            orderBy: [
                                {
                                    field: "orderNum",
                                },
                            ],
                        },
                    ],
                    $exps: {
                        "fixedFilters[0].value": "$scope.vars.activeId",
                        "newForm.fixedFields.category_id": "$scope.vars.activeId",
                    },
                },
            ],
            stores: [
                {
                    type: "entityStore",
                    name: "categories",
                    entityCode: "MomInspectionDefectCategory",
                    properties: ["id", "name", "parent", "orderNum"],
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