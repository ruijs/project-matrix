import { cloneDeep, filter } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "material",
      formControlProps: {
        dropdownMatchSelectWidth: 500,
        listTextFormat: materialFormatStrTemplate,
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
  title: "标签列表",
  // permissionCheck: {any: ["inventoryTag.view","inventoryTag.manage"]},
  view: [
    {
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
      ],
      // fixedFilters: [
      //   {
      //     field: "state",
      //     operator: "eq",
      //     value: "normal",
      //   },
      //   {
      //     field: "location_id",
      //     operator: "notNull",
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
          placeholder: "Search",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["lotNum", "binNum"],
        },
      ],
      searchForm: {
        entityCode: "MomGood",
        items: [
          {
            type: "auto",
            code: "state",
            filterMode: "in",
            itemType: "text",
          },
          {
            type: "auto",
            code: "location",
            filterMode: "in",
            filterFields: ["location_id"],
          },
        ],
      },
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "material",
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
          type: "auto",
          code: "lotNum",
          width: "200px",
        },
        {
          type: "auto",
          code: "binNum",
          title: "托盘号",
          width: "200px",
        },
        {
          type: "auto",
          code: "quantity",
          width: "100px",
        },
        {
          type: "auto",
          code: "unit",
          width: "100px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "state",
          width: "100px",
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
          code: "lot",
          title: "检验状态",
          width: "100px",
          rendererType: "rapidOptionFieldRenderer",
          rendererProps: {
            dictionaryCode: "QualificationState",
            $exps: {
              value: "$slot.record.lot && $slot.record.lot.qualificationState",
            },
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
    },
  ],
};

export default page;
