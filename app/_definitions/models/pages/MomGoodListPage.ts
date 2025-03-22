import { cloneDeep, orderBy } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "material",
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
      code: "lotNum",
    },
    {
      type: "auto",
      code: "binNum",
      label: "托盘号",
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
      code: "state",
      formControlProps: {
        listSearchable: true,
        listTextFormat: "{{name}} {{value}}",
        listFilterFields: ["label"],
      },
    },
  ],
};

const page: RapidPage = {
  code: "mom_good_list",
  name: "标签列表",
  title: "标签管理",
  // permissionCheck: {any: ["inventoryTag.view","inventoryTag.manage"]},
  view: [
    {
      $id: "goodEntityList",
      $type: "sonicEntityList",
      entityCode: "MomGood",
      viewMode: "table",
      extraProperties: ["manufactureDate", "validityDate", "createdAt"],
      listActions: [
        // {
        //   $type: "sonicToolbarNewEntityButton",
        //   text: "新建",
        //   icon: "PlusOutlined",
        //   actionStyle: "primary",
        //   $permissionCheck: "inventoryTag.manage",
        // },
        {
          $type: "mergeBinNumAction",
          $permissionCheck: "inventoryTag.manage",
        },
        {
          $type: "batchPrintAction",
          title: "批量打印",
          dataSourceAdapter: `
            const createdAt = _.get(record, "createdAt");
            const validityDate = _.get(record, "validityDate");
            const dictionaries = rapidAppDefinition.getDataDictionaries();
            const dictionary = _.find(dictionaries, function(d) { return d.code === "QualificationState" });
            const qualificationStateInfo = _.find(_.get(dictionary, "entries"), function(e) { return e.value === _.get(record, "lot.qualificationState") });

            return {
              templateCode: _.get(record, "material.category.printTemplate.code"),
              taskData: _.merge({}, record, {
                materialName: _.get(record, "material.name"),
                materialCode: _.get(record, "material.code"),
                materialSpecification: _.get(record, "material.specification"),
                lotNum: _.get(record, "lot.lotNum"),
                createdAt: createdAt && dayjs(createdAt).format("YYYY-MM-DD HH:mm:ss"),
                validityDate: validityDate && dayjs(validityDate).format("YYYY-MM-DD"),
                currentTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                unit: _.get(record, "unit.name"),
                qualificationState: _.get(qualificationStateInfo, "name"),
              })
            };
          `,
          $permissionCheck: "inventoryTag.manage",
        },
        {
          $type: "antdButton",
          href: `/api/app/exportExcel?type=goods`,
          $exps: {
            href: "'/api/app/exportExcel?type=goods&lotNum=' + $scope.vars.lotNum + '&binNum=' + $scope.vars.binNum + '&material=' + $scope.vars.material + '&warehouse=' + $scope.vars.warehouse + '&warehouseArea=' + $scope.vars.warehouseArea + '&location=' + $scope.vars.location + '&state=' + $scope.vars.state",
          },
          children: [
            {
              $type: "text",
              text: " 下载",
            },
          ],
        },
      ],
      // fixedFilters: [
      //   {
      //     field: "state",
      //     operator: "eq",
      //     value: "normal",
      //   },
      // ],
      relations: {
        material: {
          properties: ["id", "code", "name", "specification", "category"],
          relations: {
            category: {
              properties: ["id", "code", "name", "printTemplate"],
            },
          },
        },
      },
      orderBy: [
        {
          field: "createdAt",
          desc: true,
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索批号、托盘号、物料",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: [
            "lotNum",
            "binNum",
            {
              field: "material",
              operator: "exists",
              filters: [
                {
                  operator: "or",
                  filters: [
                    {
                      field: "name",
                      operator: "contains",
                    },
                    {
                      field: "code",
                      operator: "contains",
                    },
                    {
                      field: "specification",
                      operator: "contains",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      enabledFilterCache: true,
      filterCacheName: "mom_good_list",
      searchForm: {
        entityCode: "MomGood",
        items: [
          {
            type: "auto",
            code: "lotNum",
            filterMode: "contains",
          },
          {
            type: "auto",
            label: "托盘号",
            code: "binNum",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "state",
            filterMode: "in",
            itemType: "text",
          },
          {
            type: "auto",
            code: "materialCategory",
            label: "物料类型",
            formControlType: "rapidEntityTableSelect",
            formControlProps: {
              entityCode: "BaseMaterialCategory",
              mode: "multiple",
            },
            filterMode: "in",
            filterFields: [
              {
                field: "material",
                operator: "exists",
                filters: [
                  {
                    field: "category",
                    operator: "exists",
                    filters: [
                      {
                        field: "id",
                        operator: "in",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "auto",
            code: "material",
            formControlType: "rapidEntityTableSelect",
            formControlProps: {
              entityCode: "BaseMaterial",
              dropdownMatchSelectWidth: 500,
              labelRendererType: "materialLabelRenderer",
              listFilterFields: ["name", "code", "specification"],
              requestParams: {
                orderBy: [{ field: "code" }],
              },
              columns: [
                {
                  title: "名称",
                  code: "name",
                  width: 120,
                },
                {
                  title: "编号",
                  code: "code",
                  width: 120,
                },
                {
                  title: "规格",
                  code: "specification",
                  width: 120,
                },
              ],
            },
            filterMode: "in",
            filterFields: [
              {
                field: "material",
                operator: "exists",
                filters: [
                  {
                    field: "id",
                    operator: "in",
                  },
                ],
              },
            ],
          },
          {
            type: "auto",
            code: "warehouse",
            filterMode: "in",
            filterFields: ["warehouse_id"],
            formControlProps: {
              requestParams: {
                fixedFilters: [
                  {
                    field: "type",
                    operator: "eq",
                    value: "warehouse",
                  },
                ],
              },
            },
          },
          {
            type: "auto",
            code: "warehouseArea",
            filterMode: "in",
            filterFields: ["warehouse_area_id"],
            formControlProps: {
              requestParams: {
                fixedFilters: [
                  {
                    field: "parent_id",
                    operator: "in",
                    value: [],
                  },
                  {
                    field: "type",
                    operator: "eq",
                    value: "warehouseArea",
                  },
                ],
              },
            },
            $exps: {
              "formControlProps.requestParams.fixedFilters[0].value":
                "_.isEmpty($self.form.getFieldValue('warehouse')) ? undefined : $self.form.getFieldValue('warehouse')",
            },
          },
          {
            type: "auto",
            code: "location",
            filterMode: "in",
            filterFields: ["location_id"],
            formControlProps: {
              requestParams: {
                fixedFilters: [
                  {
                    field: "parent_id",
                    operator: "in",
                    value: [],
                  },
                  {
                    field: "type",
                    operator: "eq",
                    value: "storageArea",
                  },
                ],
              },
            },
            $exps: {
              "formControlProps.requestParams.fixedFilters[0].value":
                "_.isEmpty($self.form.getFieldValue('warehouseArea')) ? undefined : $self.form.getFieldValue('warehouseArea')",
            },
          },
        ],
        onValuesChange: [
          {
            $action: "script",
            script: `
              const changedValues = event.args[0] || {};
              if(changedValues.hasOwnProperty('lotNum')){
                event.scope.setVars({
                  lotNum: changedValues?.lotNum,
                }, true);
              }

              if(changedValues.hasOwnProperty('binNum')){
                event.scope.setVars({
                  binNum: changedValues?.binNum,
                }, true);
              }

              if(changedValues.hasOwnProperty('state')) {
                event.scope.setVars({
                  state: changedValues?.state,
                }, true);
              }

              if(changedValues.hasOwnProperty('material')) {
                event.scope.setVars({
                  material: changedValues?.material,
                }, true);
              }

              if(changedValues.hasOwnProperty('warehouse')) {
                event.page.sendComponentMessage(event.sender.$id, {
                  name: "setFieldsValue",
                  payload: {
                    warehouseArea: undefined,
                    location: undefined,
                  }
                });

                await new Promise(function(res){
                  setTimeout(() => {
                    res(null);
                  }, 600);
                });

                event.page.sendComponentMessage('goodEntityList-searchForm-rapidForm-item-warehouseArea-input', {
                  name: "refreshData",
                });

                event.scope.setVars({
                  warehouse: changedValues?.warehouse,
                }, true);
              }else if(changedValues.hasOwnProperty('warehouseArea')){
                event.page.sendComponentMessage(event.sender.$id, {
                  name: "setFieldsValue",
                  payload: {
                    location: undefined,
                  }
                });

                await new Promise(function(res){
                  setTimeout(() => {
                    res(null);
                  }, 600);
                });

                event.page.sendComponentMessage('goodEntityList-searchForm-rapidForm-item-location-input', {
                  name: "refreshData",
                });
              }

              if(changedValues.hasOwnProperty('warehouseArea')){
                event.scope.setVars({
                  warehouseArea: changedValues?.warehouseArea,
                }, true);
              }

              if(changedValues.hasOwnProperty('location')){
                event.scope.setVars({
                  location: changedValues?.location,
                }, true);
              }
            `,
          },
        ],
      },
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "material",
          width: "100px",
          fieldName: "material.code",
          title: "料号",
        },
        {
          type: "auto",
          code: "material",
          title: "名称及型号",
          width: "200px",
          rendererType: "anchor",
          rendererProps: {
            children: {
              $type: "materialLabelRenderer",
              hideCode: true,
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
          type: "auto",
          title: "物料类型",
          code: "material.category",
          width: "100px",
        },
        {
          type: "auto",
          code: "lotNum",
          width: "180px",
        },
        {
          type: "auto",
          code: "binNum",
          title: "托盘号",
          width: "180px",
        },
        {
          type: "auto",
          code: "quantity",
          width: "80px",
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
          code: "state",
          width: "80px",
        },
        {
          type: "auto",
          code: "warehouse",
          width: "100px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "warehouseArea",
          width: "100px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "location",
          width: "100px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "manufactureDate",
          width: "100px",
          fieldType: "date",
        },
        {
          type: "auto",
          code: "validityDate",
          width: "100px",
          fieldType: "date",
        },
        // {
        //   type: "auto",
        //   code: "lot",
        //   title: "检验状态",
        //   width: "100px",
        //   rendererType: "rapidOptionFieldRenderer",
        //   rendererProps: {
        //     dictionaryCode: "QualificationState",
        //     $exps: {
        //       value: "$slot.record.lot && $slot.record.lot.qualificationState",
        //     },
        //   },
        // },
        {
          type: "auto",
          code: "lot",
          title: "检验状态",
          width: "100px",
          rendererType: "customTextRenderer",
          rendererProps: {
            render: `
              const qualificationState = _.get(record, "lot.qualificationState");
              switch (qualificationState) {
                case "inspectFree":
                  return "免检";
                case "uninspected":
                  return "待检";
                case "qualified":
                  return "合格";
                case "unqualified":
                  if (record.lot?.treatment === "special") {
                    return "不合格（特采）";
                  } else if (record.lot?.treatment === "withdraw") {
                    return "不合格（退货）";
                  }

                  return "不合格";
                default:
                  return "";
              }
            `,
          },
        },
      ],
      actionsColumnWidth: "180px",
      actions: [
        // {
        //   $type: "sonicRecordActionEditEntity",
        //   code: "edit",
        //   actionType: "edit",
        //   actionText: "修改",
        //   $permissionCheck: "inventoryTag.manage",
        // },
        // {
        //   $type: "sonicRecordActionDeleteEntity",
        //   code: "delete",
        //   actionType: "delete",
        //   actionText: "删除",
        //   dataSourceCode: "list",
        //   entityCode: "MomGood",
        //   $permissionCheck: "inventoryTag.manage",
        // },
        {
          $type: "viewInspectionRecordAction",
          code: "view",
          actionText: "查看指标",
          $permissionCheck: "inventoryTag.manage",
        },
        {
          $type: "splitBinNumAction",
          code: "split",
          actionType: "split",
          actionText: "拆分",
          $permissionCheck: "inventoryTag.manage",
          $exps: {
            disabled: `$slot.record.state !== 'normal'`,
          },
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      onSelectedIdsChange: [
        {
          $action: "setVars",
          $exps: {
            "vars.selectedIds": "$event.args[0].selectedIds",
            "vars.selectedRecords": "$event.args[0].selectedRecords",
          },
        },
      ],
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
