import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const projectLogFormConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "title",
    },
    {
      type: "textarea",
      code: "content",
    },
  ],
};

const phaseFormConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "description",
    },
    {
      type: "auto",
      code: "startDate",
    },
    {
      type: "auto",
      code: "endDate",
    },
    {
      type: "auto",
      code: "state",
    },
    {
      type: "auto",
      code: "actualStartedAt",
    },
    {
      type: "auto",
      code: "actualCompletedAt",
    },
  ],
  defaultFormFields: {
    achieved: false,
  },
};

const milestoneFormConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "phase",
      listDataFindOptions: {
        fixedFilters: [
          {
            field: "project",
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
        $exps: {
          "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
        },
      },
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "description",
    },
    {
      type: "auto",
      code: "deadline",
    },
    {
      type: "auto",
      code: "state",
    },
    {
      type: "auto",
      code: "completedAt",
    },
  ],
  defaultFormFields: {
    achieved: false,
  },
};

const projectBudgetFormConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "type",
    },
    {
      type: "auto",
      code: "subject",
      listDataFindOptions: {
        properties: ["id", "code", "name", "specification", "defaultUnit"],
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
      code: "title",
    },
    {
      type: "auto",
      code: "cost",
    },
    {
      type: "auto",
      code: "price",
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
      code: "taxRate",
    },
    {
      type: "auto",
      code: "businessCategory",
    },
    {
      type: "auto",
      code: "expenseCategory",
    },
    {
      type: "auto",
      code: "scheduledPaymentDate",
    },
  ],
};

const page: RapidPage = {
  code: "pm_project_details",
  //@ts-ignore
  parentCode: "pm_project_list",
  name: "项目详情",
  title: "项目详情",
  permissionCheck: { any: ["pmProject.view", "pmProject.manage"] },
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "PmProject",
      mode: "view",
      column: 3,
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
          code: "category",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "customer",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "salesman",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "projectManager",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "stage",
        },
        {
          type: "auto",
          code: "state",
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
          key: "projectLogs",
          label: "项目日志",
          children: [
            {
              $id: "projectLogList",
              $type: "sonicEntityList",
              entityCode: "PmProjectEvent",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "project",
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
                },
                // {
                //   $type: "sonicToolbarRefreshButton",
                //   text: "刷新",
                //   icon: "ReloadOutlined",
                // },
              ],
              pageSize: 20,
              orderBy: [
                {
                  field: "createdAt",
                  desc: true,
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "createdAt",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "title",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "content",
                },
                {
                  type: "auto",
                  code: "createdBy",
                  width: "100px",
                  rendererProps: {
                    format: "{{name}}",
                  },
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
                  entityCode: "PmProjectEvent",
                },
              ],
              newForm: cloneDeep(projectLogFormConfig),
              editForm: cloneDeep(projectLogFormConfig),
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.project_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
        {
          key: "phases",
          label: "阶段",
          children: [
            {
              $id: "phaseList",
              $type: "sonicEntityList",
              entityCode: "PmPhase",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "project",
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
                },
                // {
                //   $type: "sonicToolbarRefreshButton",
                //   text: "刷新",
                //   icon: "ReloadOutlined",
                // },
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
                  code: "startDate",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "endDate",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "state",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "actualStartedAt",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "actualCompletedAt",
                  width: "150px",
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
                  entityCode: "PmPhase",
                },
              ],
              newForm: cloneDeep(phaseFormConfig),
              editForm: cloneDeep(phaseFormConfig),
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.project_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
        {
          key: "milestones",
          label: "里程碑",
          children: [
            {
              $id: "milestoneList",
              $type: "sonicEntityList",
              entityCode: "PmMilestone",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "project",
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
                },
                // {
                //   $type: "sonicToolbarRefreshButton",
                //   text: "刷新",
                //   icon: "ReloadOutlined",
                // },
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
                  code: "phase",
                  width: "150px",
                  fieldName: "phase.name",
                },
                {
                  type: "auto",
                  code: "deadline",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "state",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "completedAt",
                  width: "150px",
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
                  entityCode: "PmMilestone",
                },
              ],
              newForm: cloneDeep(milestoneFormConfig),
              editForm: cloneDeep(milestoneFormConfig),
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.project_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
        {
          key: "orders",
          label: "相关订单",
          children: [
            {
              $id: "orderList",
              $type: "sonicEntityList",
              entityCode: "CbsOrder",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "projects",
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
              // listActions: [
              //   {
              //     $type: "sonicToolbarRefreshButton",
              //     text: "刷新",
              //     icon: "ReloadOutlined",
              //   },
              // ],
              pageSize: 20,
              columns: [
                {
                  type: "auto",
                  code: "kind",
                  fixed: "left",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "code",
                  fixed: "left",
                  width: "100px",
                },
                {
                  type: "link",
                  code: "name",
                  fixed: "left",
                  rendererProps: {
                    url: "/pages/cbs_order_details?id={{id}}",
                  },
                },
                {
                  type: "auto",
                  code: "totalAmount",
                  width: "120px",
                  align: "right",
                  rendererType: "rapidCurrencyRenderer",
                },
                {
                  type: "auto",
                  code: "projects",
                  width: "300px",
                  rendererProps: {
                    listContainer: {
                      $type: "htmlElement",
                      htmlTag: "div",
                    },
                    itemContainer: {
                      $type: "htmlElement",
                      htmlTag: "div",
                    },
                    item: {
                      $type: "rapidLinkRenderer",
                      url: "/pages/pm_project_details?id={{id}}",
                      text: "{{code}} {{name}}",
                    },
                    separator: {
                      $type: "htmlElement",
                      htmlTag: "div",
                    },
                  },
                },
                {
                  type: "auto",
                  code: "contracts",
                  width: "300px",
                  rendererProps: {
                    listContainer: {
                      $type: "htmlElement",
                      htmlTag: "div",
                    },
                    itemContainer: {
                      $type: "htmlElement",
                      htmlTag: "div",
                    },
                    item: {
                      $type: "rapidLinkRenderer",
                      url: "/pages/cbs_contract_details?id={{id}}",
                      text: "{{code}} {{name}}",
                    },
                    separator: {
                      $type: "htmlElement",
                      htmlTag: "div",
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
                  code: "createdAt",
                  width: "150px",
                },
              ],
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
              },
            },
          ],
        },
        {
          key: "contracts",
          label: "相关合同",
          children: [
            {
              $id: "contractList",
              $type: "sonicEntityList",
              entityCode: "CbsContract",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "project",
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
              // listActions: [
              //   {
              //     $type: "sonicToolbarRefreshButton",
              //     text: "刷新",
              //     icon: "ReloadOutlined",
              //   },
              // ],
              pageSize: 20,
              columns: [
                {
                  type: "auto",
                  code: "kind",
                  fixed: "left",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "code",
                  fixed: "left",
                  width: "100px",
                },
                {
                  type: "link",
                  code: "name",
                  fixed: "left",
                  rendererProps: {
                    url: "/pages/cbs_contract_details?id={{id}}",
                  },
                },
                {
                  type: "auto",
                  code: "salesman",
                  fieldName: "salesman.name",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "totalAmount",
                  width: "120px",
                  align: "right",
                  rendererType: "rapidCurrencyRenderer",
                },
                {
                  type: "auto",
                  code: "state",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "createdAt",
                  width: "150px",
                },
              ],
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
              },
            },
          ],
        },
        {
          key: "budgets",
          label: "项目预算",
          children: [
            {
              $id: "budgetList",
              $type: "sonicEntityList",
              entityCode: "PmProjectBudget",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "project",
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
                  field: "type",
                },
                {
                  field: "orderNum",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "orderNum",
                  fixed: "left",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "type",
                  fixed: "left",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "title",
                  fixed: "left",
                },
                {
                  type: "auto",
                  code: "businessCategory",
                  width: "150px",
                  rendererProps: {
                    format: "{{code}} {{name}}",
                  },
                },
                {
                  type: "auto",
                  code: "cost",
                  width: "120px",
                  align: "right",
                  rendererType: "rapidCurrencyRenderer",
                },
                {
                  type: "auto",
                  code: "price",
                  width: "120px",
                  align: "right",
                  rendererType: "rapidCurrencyRenderer",
                },
                {
                  type: "auto",
                  code: "quantity",
                  width: "60px",
                  align: "right",
                  rendererType: "rapidNumberRenderer",
                },
                {
                  type: "auto",
                  code: "unit",
                  width: "50px",
                  rendererProps: {
                    format: "{{name}}",
                  },
                },
                {
                  type: "auto",
                  code: "taxRate",
                  width: "60px",
                  align: "right",
                  rendererType: "rapidPercentRenderer",
                },
                {
                  key: "price-quantity-taxRate",
                  type: "auto",
                  code: "id",
                  fieldName: "id",
                  title: "税费",
                  width: "120px",
                  align: "right",
                  rendererType: "rapidCurrencyRenderer",
                  rendererProps: {
                    $exps: {
                      value: "$slot.record.price * $slot.record.quantity * $slot.record.taxRate",
                    },
                  },
                },
                {
                  key: "price-quantity",
                  type: "auto",
                  code: "id",
                  fieldName: "id",
                  title: "金额",
                  width: "120px",
                  align: "right",
                  rendererType: "rapidCurrencyRenderer",
                  rendererProps: {
                    $exps: {
                      value: "$slot.record.price * $slot.record.quantity",
                    },
                  },
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
                  entityCode: "PmProjectBudget",
                },
              ],
              footer: [
                {
                  $type: "antdAlert",
                  style: {
                    textAlign: "right",
                  },
                  $exps: {
                    _hidden: "!$scope.stores.list?.data",
                    message: `$scope.stores.list ?
                      '收入合计：' + Intl.NumberFormat('Zh-cn').format(_.sumBy(_.filter($scope.stores.list.data?.list, { type: 'in'}), function (item) {return item.price * item.quantity})) +
                      '，支出合计：' + Intl.NumberFormat('Zh-cn').format(_.sumBy(_.filter($scope.stores.list.data?.list, { type: 'out'}), function (item) {return item.price * item.quantity})) +
                      '，毛利：' + Intl.NumberFormat('Zh-cn').format(_.sumBy(_.filter($scope.stores.list.data?.list, { type: 'in'}), function (item) {return item.price * item.quantity}) - _.sumBy(_.filter($scope.stores.list.data?.list, { type: 'out'}), function (item) {return item.price * item.quantity}))
                      : ''`,
                  },
                },
              ],
              newForm: cloneDeep(projectBudgetFormConfig),
              editForm: cloneDeep(projectBudgetFormConfig),
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.project_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default page;
