import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      code: "rule",
      type: "auto",
      required: true,
      listDataFindOptions: {
        fixedFilters: [
          {
            field: "category",
            operator: "exists",
            filters: [
              {
                field: "code",
                operator: "eq",
                value: "granulation_incoming_inspect",
              },
            ],
          },
          {
            field: "customer",
            operator: "null",
          },
        ],
        properties: ["id", "name", "category", "material", "config"],
      },
      formControlProps: {
        listSearchable: true,
        listTextFormat: "{{name}}",
        listFilterFields: ["name"],
        columns: [{ code: "name", title: "名称", width: 120 }],
      },
    },
    {
      type: "auto",
      code: "material",
      listDataFindOptions: {
        fixedFilters: [
          {
            field: "id",
            operator: "eq",
            value: "",
          },
        ],
        $exps: {
          "fixedFilters[0].value": "$scope.vars.active_material_id",
        },
      },
      formControlProps: {
        dropdownMatchSelectWidth: 500,
        listTextFormat: materialFormatStrTemplate,
        listFilterFields: ["name", "code", "specification"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
          { code: "specification", title: "规格", width: 120 },
        ],
        $exps: {
          disabled: "!$self.form.getFieldValue('rule')",
        },
      },
      required: true,
    },
    {
      type: "auto",
      code: "lotNum",
      required: true,
      label: "批次号",
      formControlProps: {
        $exps: {
          disabled: "!$self.form.getFieldValue('rule')",
        },
      },
      $exps: {
        _hidden: "$scope.vars.active_hidden",
      },
    },
    {
      type: "auto",
      code: "lotNum",
      required: true,
      label: "批次号",
      formControlType: "lotNumSelector",
      formControlProps: {
        $exps: {
          disabled: "!($self.form.getFieldValue('rule')&&$self.form.getFieldValue('material'))",
        },
      },
      $exps: {
        _hidden: "!$scope.vars.active_hidden",
        "formControlProps.materialId": "$self.form.getFieldValue('material')",
        "formControlProps.materialCategoryId": "$self.form.getFieldValue('materialCategoryId')",
      },
    },
    {
      code: "reportFile",
      label: "检验报告",
      type: "auto",
      required: true,
      $exps: {
        _hidden: "$scope.vars.active_hidden",
      },
    },
    {
      code: "gcmsReportFile",
      label: "GCMS报告",
      type: "auto",
      $exps: {
        // _hidden:"$scope.vars.active_rule_id "
        _hidden: "!$scope.vars.active_hidden",
      },
    },
    {
      code: "gcmsPassed",
      type: "auto",
      $exps: {
        // _hidden:"$scope.vars.active_rule_id "
        _hidden: "!$scope.vars.active_hidden",
      },
    },
    {
      code: "invoiceReportFile",
      label: "月度发票",
      required: true,
      type: "auto",
      $exps: {
        _hidden: "!$scope.vars.active_hidden",
      },
    },
    {
      code: "normalReportFile",
      label: "常规检测",
      required: true,
      type: "auto",
      $exps: {
        _hidden: "(!$scope.vars.active_hidden&&$scope.vars.active_isNormal)",
      },
    },
    {
      code: "qualityReportFile",
      label: "质保书",
      required: true,
      type: "auto",
      $exps: {
        _hidden: "$scope.vars.active_hidden?true:$scope.vars.active_isQulity",
      },
    },
    {
      type: "auto",
      code: "sender",
    },
    {
      type: "auto",
      code: "remark",
    },
  ],

  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        const ruleList = $page.getScope('sonicEntityList1-scope').getStore('dataFormItemList-rule').data?.list;
        const config = ruleList[0]?.category?.config?.incoming
        const materialId = ruleList.find((item) => item.id === changedValues.rule)?.material?.id
        const name = ruleList.find((item) => item.id === changedValues.rule)?.name
        const id = ruleList.find((item) => item.id === changedValues.rule)?.id
        const isQulity = !(id==31|| id == 32||id ==35||id == 37)
        const isNormal = !(id == 37)
        const hidden = name === '石蜡油检验'
        if(changedValues.hasOwnProperty('rule')) {

            event.scope.setVars({
                active_material_id: materialId,
                active_rule_config:config,
                active_rule_id:id,
                active_hidden:hidden,
                active_isNormal:isNormal,
                active_isQulity:isQulity
            }, true);

            // if(event.sender.form.getFieldsValue('material')){
            //     event.sender.form.setFieldsValue({
            //     material:undefined,
            //     lotNum:undefined
            //     })
            // }

        }

        event.scope.loadStoreData('dataFormItemList-material');
      `,
    },
  ],
  defaultFormFields: {
    result: "uninspected",
    state: "pending",
    sampleCount: "1",
    approvalState: "uninitiated",
    round: "1",
  },
};

const page: RapidPage = {
  code: "mom_prilling_feed_stock_inspection_sheet_list",
  name: "造粒来料检验",
  title: "造粒来料检验",
  //@ts-ignore
  parentCode: "mom_inspection_sheet_list",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomInspectionSheet",
      viewMode: "table",
      // permissionCheck: {any: ["inspection.manage"]},
      selectionMode: "none",
      fixedFilters: [
        {
          field: "rule",
          operator: "exists",
          filters: [
            {
              field: "category",
              operator: "exists",
              filters: [
                {
                  field: "code",
                  operator: "eq",
                  value: "granulation_incoming_inspect",
                },
              ],
            },
          ],
        },
      ],
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          $permissionCheck: "xzyInspectionFeedStock.manage",
          actionStyle: "primary",
        },
        // {
        //   $type: "antdButton",
        //   href: `/api/app/exportExcel?type=inspection`,
        //   $permissionCheck: "xzyInspectionFeedStock.manage",
        //   children: [
        //     {
        //       $type: "text",
        //       text: " 下载",
        //     },
        //   ],
        // },
      ],
      extraProperties: ["rule", "treatment"],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索批号、检验单号",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "lotNum"],
        },
      ],
      enabledFilterCache: true,
      filterCacheName: "mom_inspection_sheet_list",
      searchForm: {
        entityCode: "MomInspectionSheet",
        onValuesChange: [
          {
            $action: "script",
            script: `
                const changedValues = event.args[0] || {};
                const ruleList = $page.getScope('sonicEntityList1-scope').getStore('searchFormItemList-rule')?.data?.list;
                console.log(ruleList,"ruleList")
                const materialId = ruleList.find((item) => item.id === changedValues.rule)?.material?.id
                if(changedValues.hasOwnProperty('rule')) {
                  event.scope.setVars({
                    active_material_id: materialId,
                  }, true);
                }

                event.scope.loadStoreData('searchFormItemList-material');
              `,
          },
        ],
        items: [
          {
            type: "auto",
            code: "state",
            filterMode: "in",
            itemType: "text",
          },
          {
            type: "auto",
            code: "approvalState",
            filterMode: "in",
            itemType: "text",
          },
          {
            type: "auto",
            code: "result",
            filterMode: "in",
            itemType: "text",
          },
          {
            type: "auto",
            code: "inspector",
            filterMode: "in",
            filterFields: ["inspector_id"],
          },
          {
            code: "rule",
            type: "auto",
            required: true,
            listDataFindOptions: {
              fixedFilters: [
                {
                  field: "category",
                  operator: "exists",
                  filters: [
                    {
                      field: "code",
                      operator: "eq",
                      value: "granulation_incoming_inspect",
                    },
                  ],
                },
                {
                  field: "customer",
                  operator: "null",
                },
              ],
              properties: ["id", "name", "category", "material", "config"],
            },
            formControlProps: {
              listSearchable: true,
              listTextFormat: "{{name}}",
              listFilterFields: ["name"],
              columns: [{ code: "name", title: "名称", width: 120 }],
            },
          },
          {
            type: "auto",
            code: "material",
            listDataFindOptions: {
              fixedFilters: [
                {
                  field: "id",
                  operator: "eq",
                  value: "",
                },
              ],
              $exps: {
                "fixedFilters[0].value": "$scope.vars.active_material_id",
              },
            },
            formControlProps: {
              dropdownMatchSelectWidth: 500,
              listTextFormat: materialFormatStrTemplate,
              listFilterFields: ["name", "code", "specification"],
              columns: [
                { code: "code", title: "编号", width: 120 },
                { code: "name", title: "名称", width: 120 },
                { code: "specification", title: "规格", width: 120 },
              ],
              $exps: {
                disabled: "!$self.form.getFieldValue('rule')",
              },
            },
            required: true,
          },
        ],
      },
      orderBy: [
        {
          field: "id",
          desc: true,
        },
      ],
      relations: {
        rule: {
          relations: {
            category: true,
          },
        },
        material: {
          properties: ["id", "code", "name", "specification", "category"],
          relations: {
            category: true,
          },
        },
      },
      columns: [
        {
          type: "auto",
          fixed: "left",
          code: "state",
          width: "100px",
        },
        {
          type: "auto",
          fixed: "left",
          code: "approvalState",
          width: "100px",
        },
        {
          type: "link",
          code: "code",
          width: "200px",
          fixed: "left",
          rendererType: "link",
          rendererProps: {
            url: "/pages/mom_prilling_feed_stock_inspection_sheet_details?id={{id}}",
          },
        },

        {
          type: "auto",
          code: "material",
          fixed: "left",
          rendererType: "anchor",
          rendererProps: {
            children: {
              $type: "materialLabelRenderer",
              $exps: {
                value: "$slot.value",
              },
            },
            $exps: {
              href: "$rui.execVarText('/pages/base_material_details?id={{id}}', $slot.value)",
            },
          },
        },
        {
          code: "rule",
          type: "auto",
          width: "150px",
          rendererType: "text",
          title: "检验类型",
          rendererProps: {
            $exps: {
              text: "_.get($slot.record, 'rule.category.name')||'-'",
            },
          },
        },
        {
          code: "rule",
          type: "auto",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "lotNum",
          width: "150px",
        },
        // {
        //   type: "auto",
        //   code: "inventoryOperation",
        //   width: "150px",
        //   rendererProps: {
        //     format: "{{code}}",
        //   },
        // },
        // {
        //   type: "auto",
        //   code: "acceptQuantity",
        //   width: "100px",
        // },
        {
          type: "auto",
          code: "result",
          width: "150px",
        },
        // {
        //   type: "auto",
        //   code: "treatment",
        //   width: "100px",
        // },
        {
          type: "auto",
          code: "sender",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "inspector",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "reviewer",
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
      actionsColumnWidth: "160px",
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
          $permissionCheck: "xzyInspectionFeedStock.manage",
          $exps: {
            disabled: "$slot.record.approvalState !== 'approving' || $slot.record.approvalState !== 'uninitiated'",
          },
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "MomInspectionSheet",
          $permissionCheck: "xzyInspectionFeedStock.manage",
          $exps: {
            disabled: "$slot.record.approvalState !== 'approving' || $slot.record.approvalState !== 'uninitiated'",
          },
        },
        {
          $type: "inspectionBadAction",
          $permissionCheck: "xzyInspectionFeedStock.manage",
          $exps: {
            _hidden: "$slot.record.result !== 'unqualified'",
          },
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.fixedFields.state": '"pending"',
        "newForm.fixedFields.approvalState": '"uninitiated"',
      },
    },
  ],
};

export default page;
