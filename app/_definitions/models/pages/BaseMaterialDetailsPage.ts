import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormRockConfig } from "@ruiapp/rapid-extension";

const flowFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "version",
    },
    {
      type: "auto",
      code: "state",
    },
    {
      type: "auto",
      code: "publishState",
    },
  ],
};

const flowProcessFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "process",
      formControlProps: {
        listTextFormat: "{{name}}",
        listFilterFields: ["name"],
        listOrderBy: [
          {
            field: "code",
          },
        ],
      },
    },
    {
      type: "auto",
      code: "aliasName",
    },
    {
      type: "auto",
      code: "standardCycleTime",
    },
  ],
};

const breakdownFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "version",
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
    },
  ],
};

const breakdownPartFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "subMaterial",
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
      code: "matchTags",
    },
    {
      type: "auto",
      code: "quantity",
    },
    {
      type: "auto",
      code: "unit",
    },
  ],
  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        if(changedValues.hasOwnProperty('subMaterial')) {
          const _ = event.framework.getExpressionVars()._;
          const materials = _.get(event.scope.stores['dataFormItemList-subMaterial'], 'data.list');
          const subMaterial = _.find(materials, function (item) { return item.id == changedValues.subMaterial });
          const unitId = _.get(subMaterial, 'defaultUnit.id');
          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              unit: unitId,
            }
          });
        }
      `,
    },
  ],
};

const materialDocumentFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "document",
      label: "文件",
      valueFieldType: "json",
      formControlType: "rapidDocumentFormControl",
      formControlProps: {
        uploadProps: {
          name: "files",
          action: "/api/upload",
          headers: {},
          maxCount: 1,
        },
        onUploaded: [
          { $action: "printToConsole" },
          {
            $action: "script",
            script: `
              var fileInfo = event.args[0];
              event.sender.form.setFieldsValue({
                name: fileInfo.name,
                size: fileInfo.size,
                document: {
                  code: "",
                  name: fileInfo.name,
                  size: fileInfo.size,
                  storageObject: {
                    size: fileInfo.size,
                    key: fileInfo.key,
                  },
                  publishState: "published",
                },
              });
            `,
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
  code: "base_material_details",
  //@ts-ignore
  parentCode: "base_material_list",
  name: "物料详情",
  title: "物料详情",
  permissionCheck: { any: ["baseMaterial.manage"] },
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "BaseMaterial",
      mode: "view",
      column: 3,
      items: [
        {
          type: "auto",
          code: "category",
          rendererProps: {
            format: "{{name}}",
          },
        },
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
          code: "state",
        },
        {
          type: "auto",
          code: "description",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    },
    // {
    //   $type: "antdTabs",
    //   items: [
    //     {
    //       key: "flows",
    //       label: "工艺路线",
    //       children: [
    //         {
    //           $id: "flowsLayout",
    //           $type: "sonicMainSecondaryLayout",
    //           mainTitle: "工艺路线",
    //           mainColSpan: 8,
    //           secondaryTitle: "工序",
    //           secondaryColSpan: 16,
    //           main: {
    //             $type: "sonicEntityList",
    //             entityCode: "MomRoute",
    //             viewMode: "table",
    //             selectionMode: "single",
    //             selectOnClickRow: true,
    //             listActions: [
    //               {
    //                 $type: "sonicToolbarNewEntityButton",
    //                 text: "新建",
    //                 icon: "PlusOutlined",
    //                 actionStyle: "primary",
    //               },
    //             ],
    //             fixedFilters: [
    //               {
    //                 field: "material_id",
    //                 operator: "eq",
    //                 value: "",
    //               },
    //             ],
    //             orderBy: [
    //               {
    //                 field: "version",
    //               },
    //             ],
    //             columns: [
    //               {
    //                 type: "auto",
    //                 code: "version",
    //               },
    //               {
    //                 type: "auto",
    //                 code: "state",
    //                 width: "100px",
    //               },
    //               {
    //                 type: "auto",
    //                 code: "publishState",
    //                 width: "100px",
    //               },
    //             ],
    //             actions: [
    //               {
    //                 $type: "sonicRecordActionEditEntity",
    //                 code: "edit",
    //                 actionType: "edit",
    //                 actionText: "修改",
    //               },
    //               {
    //                 $type: "sonicRecordActionDeleteEntity",
    //                 code: "delete",
    //                 actionType: "delete",
    //                 actionText: "删除",
    //                 dataSourceCode: "list",
    //                 entityCode: "MomRoute",
    //               },
    //             ],
    //             actionsColumnWidth: "80px",
    //             newForm: cloneDeep(flowFormConfig),
    //             editForm: cloneDeep(flowFormConfig),
    //             $exps: {
    //               "fixedFilters[0].value": "$rui.parseQuery().id",
    //               "newForm.fixedFields.material_id": "$rui.parseQuery().id",
    //             },
    //           },
    //           secondary: [
    //             {
    //               $id: "processList",
    //               $type: "sonicEntityList",
    //               entityCode: "MomRouteProcess",
    //               viewMode: "table",
    //               selectionMode: "none",
    //               actionsColumnWidth: "80px",
    //               fixedFilters: [
    //                 {
    //                   field: "route_id",
    //                   operator: "eq",
    //                   value: "",
    //                 },
    //               ],
    //               orderBy: [
    //                 {
    //                   field: "orderNum",
    //                 },
    //               ],
    //               pageSize: -1,
    //               listActions: [
    //                 {
    //                   $type: "sonicToolbarNewEntityButton",
    //                   text: "新建",
    //                   icon: "PlusOutlined",
    //                   actionStyle: "primary",
    //                   $exps: {
    //                     _hidden: "$page.getScope('flowsLayout-scope').vars.activeRecord?.publishState !== 'draft'",
    //                   },
    //                 },
    //               ],
    //               columns: [
    //                 {
    //                   type: "auto",
    //                   code: "orderNum",
    //                   width: "100px",
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "process",
    //                   rendererProps: {
    //                     format: "{{name}}",
    //                   },
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "aliasName",
    //                   width: "200px",
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "inputs",
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "outputs",
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "standardCycleTime",
    //                   width: "100px",
    //                 },
    //               ],
    //               actions: [
    //                 {
    //                   $type: "sonicRecordActionEditEntity",
    //                   code: "edit",
    //                   actionType: "edit",
    //                   actionText: "修改",
    //                   $exps: {
    //                     _hidden: "$page.getScope('flowsLayout-scope').vars.activeRecord?.publishState !== 'draft'",
    //                   },
    //                 },
    //                 {
    //                   $type: "sonicRecordActionDeleteEntity",
    //                   code: "delete",
    //                   actionType: "delete",
    //                   actionText: "删除",
    //                   dataSourceCode: "list",
    //                   entityCode: "MomRouteProcess",
    //                   $exps: {
    //                     _hidden: "$page.getScope('flowsLayout-scope').vars.activeRecord?.publishState !== 'draft'",
    //                   },
    //                 },
    //               ],
    //               newForm: cloneDeep(flowProcessFormConfig),
    //               editForm: cloneDeep(flowProcessFormConfig),
    //               $exps: {
    //                 _hidden: "!$scope.vars.activeId",
    //                 "fixedFilters[0].value": "$scope.vars.activeId",
    //                 "newForm.fixedFields.route_id": "$scope.vars.activeId",
    //                 hideActionsColumn: "$scope.vars.activeRecord?.publishState !== 'draft'",
    //               },
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //     {
    //       key: "breakdowns",
    //       label: "下级物料",
    //       children: [
    //         {
    //           $id: "breakdownsLayout",
    //           $type: "sonicMainSecondaryLayout",
    //           mainTitle: "BOM版本",
    //           mainColSpan: 8,
    //           secondaryTitle: "下级物料",
    //           secondaryColSpan: 16,
    //           main: {
    //             $type: "sonicEntityList",
    //             entityCode: "MomMaterialBreakdown",
    //             viewMode: "table",
    //             selectionMode: "single",
    //             selectOnClickRow: true,
    //             listActions: [
    //               {
    //                 $type: "sonicToolbarNewEntityButton",
    //                 text: "新建",
    //                 icon: "PlusOutlined",
    //                 actionStyle: "primary",
    //               },
    //             ],
    //             fixedFilters: [
    //               {
    //                 field: "material_id",
    //                 operator: "eq",
    //                 value: "",
    //               },
    //             ],
    //             orderBy: [
    //               {
    //                 field: "version",
    //               },
    //             ],
    //             columns: [
    //               {
    //                 type: "auto",
    //                 code: "version",
    //               },
    //               {
    //                 type: "auto",
    //                 code: "quantity",
    //               },
    //               {
    //                 type: "auto",
    //                 code: "unit",
    //                 rendererProps: {
    //                   format: "{{name}}",
    //                 },
    //               },
    //               {
    //                 type: "auto",
    //                 code: "state",
    //                 width: "100px",
    //               },
    //             ],
    //             actions: [
    //               {
    //                 $type: "sonicRecordActionEditEntity",
    //                 code: "edit",
    //                 actionType: "edit",
    //                 actionText: "修改",
    //               },
    //               {
    //                 $type: "sonicRecordActionDeleteEntity",
    //                 code: "delete",
    //                 actionType: "delete",
    //                 actionText: "删除",
    //                 dataSourceCode: "list",
    //                 entityCode: "MomMaterialBreakdown",
    //               },
    //             ],
    //             actionsColumnWidth: "80px",
    //             newForm: cloneDeep(breakdownFormConfig),
    //             editForm: cloneDeep(breakdownFormConfig),
    //             $exps: {
    //               "fixedFilters[0].value": "$rui.parseQuery().id",
    //               "newForm.fixedFields.material_id": "$rui.parseQuery().id",
    //             },
    //           },
    //           secondary: [
    //             {
    //               $id: "breakdownPartList",
    //               $type: "sonicEntityList",
    //               entityCode: "MomMaterialBreakdownPart",
    //               viewMode: "table",
    //               selectionMode: "none",
    //               actionsColumnWidth: "80px",
    //               fixedFilters: [
    //                 {
    //                   field: "breakdown_id",
    //                   operator: "eq",
    //                   value: "",
    //                 },
    //               ],
    //               orderBy: [
    //                 {
    //                   field: "orderNum",
    //                 },
    //               ],
    //               pageSize: -1,
    //               listActions: [
    //                 {
    //                   $type: "sonicToolbarNewEntityButton",
    //                   text: "新建",
    //                   icon: "PlusOutlined",
    //                   actionStyle: "primary",
    //                 },
    //               ],
    //               columns: [
    //                 {
    //                   type: "auto",
    //                   code: "orderNum",
    //                   width: "100px",
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "subMaterial",
    //                   rendererType: "anchor",
    //                   rendererProps: {
    //                     children: {
    //                       $type: "materialLabelRenderer",
    //                       $exps: {
    //                         value: "$slot.value",
    //                       },
    //                     },
    //                     $exps: {
    //                       href: "$rui.execVarText('/pages/base_material_details?id={{id}}', $slot.value)",
    //                     },
    //                   },
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "matchTags",
    //                   width: "100px",
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "quantity",
    //                   width: "100px",
    //                 },
    //                 {
    //                   type: "auto",
    //                   code: "unit",
    //                   rendererProps: {
    //                     format: "{{name}}",
    //                   },
    //                   width: "100px",
    //                 },
    //               ],
    //               actions: [
    //                 {
    //                   $type: "sonicRecordActionEditEntity",
    //                   code: "edit",
    //                   actionType: "edit",
    //                   actionText: "修改",
    //                 },
    //                 {
    //                   $type: "sonicRecordActionDeleteEntity",
    //                   code: "delete",
    //                   actionType: "delete",
    //                   actionText: "删除",
    //                   dataSourceCode: "list",
    //                   entityCode: "MomMaterialBreakdownPart",
    //                 },
    //               ],
    //               newForm: cloneDeep(breakdownPartFormConfig),
    //               editForm: cloneDeep(breakdownPartFormConfig),
    //               $exps: {
    //                 _hidden: "!$scope.vars.activeId",
    //                 "fixedFilters[0].value": "$scope.vars.activeId",
    //                 "newForm.fixedFields.breakdown_id": "$scope.vars.activeId",
    //               },
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //     {
    //       key: "documents",
    //       label: "文档",
    //       children: [
    //         {
    //           $id: "userList",
    //           $type: "sonicEntityList",
    //           entityCode: "BaseMaterialDocument",
    //           viewMode: "table",
    //           selectionMode: "none",
    //           fixedFilters: [
    //             {
    //               field: "material_id",
    //               operator: "eq",
    //               value: "",
    //             },
    //           ],
    //           listActions: [
    //             {
    //               $type: "sonicToolbarNewEntityButton",
    //               text: "新建",
    //               icon: "PlusOutlined",
    //               actionStyle: "primary",
    //             },
    //             {
    //               $type: "sonicToolbarRefreshButton",
    //               text: "刷新",
    //               icon: "ReloadOutlined",
    //             },
    //           ],
    //           extraProperties: ["document", "createdBy"],
    //           columns: [
    //             {
    //               type: "auto",
    //               code: "document",
    //               title: "名称",
    //               fixed: "left",
    //               cell: [
    //                 {
    //                   $type: "antdListItemMeta",
    //                   title: {
    //                     $type: "antdSpace",
    //                     children: [
    //                       {
    //                         $type: "text",
    //                         text: "",
    //                       },
    //                       {
    //                         $type: "anchor",
    //                         href: "",
    //                         children: "下载",
    //                       },
    //                     ],
    //                   },
    //                   $exps: {
    //                     "title.children[0].text": "$slot.value.name",
    //                     "title.children[1].href": "'/api/download/document?documentId=' + $slot.value.id",
    //                     description:
    //                       "$functions.formatFileSize($slot.value.size) + ' | ' + $slot.record.createdBy.name + ' 创建于 ' + $functions.formatDateTime($slot.value.createdAt)",
    //                   },
    //                 },
    //               ],
    //             },
    //             {
    //               type: "auto",
    //               code: "state",
    //               width: "100px",
    //             },
    //             {
    //               type: "auto",
    //               code: "createdAt",
    //               width: "150px",
    //             },
    //           ],
    //           actions: [
    //             {
    //               $type: "sonicRecordActionDeleteEntity",
    //               code: "delete",
    //               actionType: "delete",
    //               actionText: "删除",
    //               dataSourceCode: "list",
    //               entityCode: "BaseMaterialDocument",
    //             },
    //           ],
    //           newForm: cloneDeep(materialDocumentFormConfig),
    //           $exps: {
    //             "fixedFilters[0].value": "$rui.parseQuery().id",
    //             "newForm.fixedFields.material_id": "$rui.parseQuery().id",
    //           },
    //         },
    //       ],
    //     },
    //   ],
    // },
  ],
};

export default page;
