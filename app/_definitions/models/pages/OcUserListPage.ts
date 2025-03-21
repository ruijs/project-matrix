import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { HttpRequestStoreConfig } from "@ruiapp/move-style";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "login",
    },
    {
      type: "auto",
      code: "email",
    },
    {
      type: "auto",
      code: "mobile",
    },
    {
      type: "treeSelect",
      code: "department",
      formControlProps: {
        listDataSourceCode: "departments",
        listParentField: "parent.id",
      },
    },
    {
      type: "auto",
      code: "roles",
      listDataFindOptions: {
        orderBy: [
          {
            field: "orderNum",
          },
        ],
      },
    },
    {
      type: "auto",
      code: "state",
    },
  ],
};

const page: RapidPage = {
  code: "oc_user_list",
  name: "用户列表",
  title: "用户管理",
  permissionCheck: { any: ["sysUser.manage"] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "OcUser",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
          $exps: {
            _hidden: "!($scope.stores['systemSettings']?.data && !$scope.stores['systemSettings']?.data?.userCreateByWebDisabled)",
          },
        },
        {
          $type: "rapidToolbarButton",
          text: "同步钉钉用户信息",
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "POST",
              url: "/api/svc/dingTalk/bindDingTalkAccountForUsersWithMobile",
              data: {},
              onSuccess: [
                {
                  $action: "antdToast",
                  type: "success",
                  $exps: {
                    content:
                      "'钉钉用户信息同步完成。本次绑定 ' + ($event.args[0]?.newBindedCount) + ' 个钉钉用户，已绑定 ' + ($event.args[0]?.totalBindedCount) + ' 个钉钉用户，共 ' + ($event.args[0]?.userWithMobileCount) + ' 个用户设置了手机号。'",
                  },
                },
              ],
              onError: [
                {
                  $action: "antdToast",
                  type: "error",
                  $exps: {
                    content: "'钉钉用户信息同步失败：' + ($event.args[0]?.message || '')",
                  },
                },
              ],
            },
          ],
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索名称、登录账号",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["login", "name"],
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "name",
          fixed: "left",
        },
        {
          type: "auto",
          code: "login",
          fixed: "left",
        },
        {
          type: "auto",
          code: "email",
          width: "200px",
        },
        {
          type: "auto",
          code: "mobile",
          width: "200px",
        },
        {
          type: "auto",
          code: "department",
          width: "150px",
        },
        {
          type: "auto",
          code: "roles",
          width: "250px",
          rendererProps: {
            item: {
              $type: "rapidLinkRenderer",
              url: "/pages/oc_role_details?id={{id}}",
              text: "{{name}}",
            },
          },
        },
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "auto",
          code: "createdBy",
          width: "150px",
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
      actionsColumnWidth: "200px",
      actions: [
        {
          $type: "rapidFormModalRecordAction",
          code: "resetPassword",
          actionText: "重置密码",
          modalTitle: "重置密码",
          form: {
            $type: "rapidForm",
            items: [
              {
                type: "password",
                code: "password",
                label: "新密码",
                required: true,
                rules: [
                  // eslint-disable-next-line no-template-curly-in-string
                  { required: true, message: "请输入${label}" },
                ],
              },
            ],
          },
          onFormSubmit: [
            {
              $action: "sendHttpRequest",
              url: `/api/resetPassword`,
              method: "POST",
              data: { password: "" },
              $exps: {
                data: "$event.args[0]",
              },
            },
          ],
          successMessage: "密码重置成功。",
          errorMessage: "密码重置失败。",
          $exps: {
            "form.fixedFields.userId": "$slot.record.id",
          },
        },
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
        },
        {
          $type: "sonicRecordActionUpdateEntity",
          code: "disable",
          actionText: "禁用",
          entity: {
            state: "disabled",
          },
          $exps: {
            _hidden: "$slot.record.state !== 'enabled'",
          },
        },
        {
          $type: "sonicRecordActionUpdateEntity",
          code: "enable",
          actionText: "启用",
          entity: {
            state: "enabled",
          },
          $exps: {
            _hidden: "$slot.record.state === 'enabled'",
          },
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          $exps: {
            _hidden: "!($scope.stores['systemSettings']?.data && !$scope.stores['systemSettings']?.data?.userDeleteByWebDisabled)",
          },
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      searchForm: {
        entityCode: "OcUser",
        items: [
          {
            type: "auto",
            code: "login",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "name",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "state",
            filterMode: "eq",
          },
        ],
      },
      stores: [
        {
          type: "entityStore",
          name: "departments",
          entityCode: "OcDepartment",
          properties: ["id", "code", "name", "parent", "orderNum", "createdAt"],
          filters: [],
          orderBy: [
            {
              field: "orderNum",
            },
          ],
        },
        {
          type: "httpRequest",
          name: "systemSettings",
          request: {
            method: "GET",
            url: "/api/svc/systemSettingValues?groupCode=public",
          },
        } as HttpRequestStoreConfig,
      ],
    },
  ],
};

export default page;
