import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "operationType",
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "config",
    },
    {
      type: "auto",
      code: "orderNum",
    },
  ],
};

const roleFormConfig: Partial<RapidEntityFormConfig> = {
  items: [
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
      code: "roles",
    },
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "businessType",
      hidden: true,
    },
  ],
  defaultFormFields: {
    businessType: "",
  },
};

const page: RapidPage = {
  code: "mom_inventory_business_type_list",
  name: "库存业务类型列表",
  title: "库存业务类型",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicMainSecondaryLayout",
      mainTitle: "库存业务类型",
      mainColSpan: 8,
      secondaryTitle: "角色",
      secondaryColSpan: 16,
      main: {
        $type: "sonicEntityList",
        entityCode: "MomInventoryBusinessType",
        viewMode: "table",
        selectionMode: "single",
        selectOnClickRow: true,
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
            placeholder: "搜索名称",
            actionEventName: "onSearch",
            filterMode: "contains",
            filterFields: ["name"],
          },
        ],
        orderBy: [
          {
            field: "name",
          },
        ],
        pageSize: 20,
        columns: [
          {
            type: "auto",
            code: "operationType",
            width: "100px",
          },
          {
            type: "auto",
            code: "name",
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
            entityCode: "MomInventoryBusinessType",
          },
        ],
        newForm: cloneDeep(formConfig),
        editForm: cloneDeep(formConfig),
      },
      secondary: [
        {
          $type: "sonicEntityList",
          entityCode: "BusinessTypeOcRole",
          viewMode: "table",
          selectionMode: "none",
          fixedFilters: [
            {
              field: "businessType",
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
          ],
          extraActions: [
            {
              $type: "sonicToolbarFormItem",
              formItemType: "search",
              placeholder: "搜索名称",
              actionEventName: "onSearch",
              filterMode: "contains",
              filterFields: ["name"],
            },
          ],
          orderBy: [
            {
              field: "name",
            },
          ],
          pageSize: 20,
          columns: [
            {
              type: "auto",
              code: "code",
              width: "100px",
            },
            {
              type: "auto",
              code: "name",
            },
            {
              type: "auto",
              code: "roles",
            },
            {
              type: "auto",
              code: "orderNum",
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
              entityCode: "BusinessTypeOcRole",
            },
          ],
          newForm: cloneDeep(roleFormConfig),
          editForm: cloneDeep(roleFormConfig),
          $exps: {
            _hidden: "!$scope.vars.activeId",
            "fixedFilters[0].value": "$scope.vars.activeId",
            "newForm.fixedFields.businessType": "$scope.vars.activeId",
            "newForm.defaultFormFields.businessType": "$scope.vars.activeId",
          },
        },
      ],
    },
  ],
};

export default page;
