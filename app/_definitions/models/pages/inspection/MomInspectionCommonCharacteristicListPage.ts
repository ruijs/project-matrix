import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "kind",
    },
    {
      type: "auto",
      code: "unitName",
      $exps: {
        hidden: "$self.form.getFieldValue('kind') !== 'quantitative'",
      },
    },
    {
      type: "auto",
      code: "qualitativeDetermineType",
      $exps: {
        hidden: "$self.form.getFieldValue('kind') !== 'qualitative'",
      },
    },
    {
      type: "auto",
      code: "norminal",
      formControlType: "rapidSelect",
      formControlProps: {
        listDataSource: {
          data: {
            list: [],
          },
        },
      },
      $exps: {
        "formControlProps.listDataSource.data.list": "$self.form.getFieldValue('qualitativeNorminalValues') || []",
        hidden: "$self.form.getFieldValue('kind') !== 'qualitative' || !$self.form.getFieldValue('qualitativeDetermineType')",
      },
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "config",
    },
  ],
  defaultFormFields: {
    orderNum: 0,
  },
  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        if(changedValues.hasOwnProperty('qualitativeDetermineType')) {
          const _ = event.framework.getExpressionVars()._;
          const rapidAppDefinition = event.framework.getExpressionVars().rapidAppDefinition;
          const dictionary = _.find(rapidAppDefinition.getDataDictionaries(), function(d) { return d.code === 'QualitativeInspectionDetermineType'; });
          const item = _.find(_.get(dictionary, 'entries'), function(item) { return item.value === changedValues.qualitativeDetermineType; });
          const values = _.map(_.split(_.get(item, 'name'), '/'), function(v) { return { name: v, id: v } });
          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              norminal: null,
              qualitativeNorminalValues: values || [],
            }
          });
        }else if(changedValues.hasOwnProperty('kind')){
          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              norminal: null,
              qualitativeDetermineType: null,
              qualitativeNorminalValues: [],
            }
          });
        }
      `,
    },
  ],
};

const page: RapidPage = {
  code: "mom_inspection_common_characteristic_list",
  name: "通用检验特征",
  title: "通用检验特征",
  permissionCheck: { any: ["inspectionCharacteristic.manage"] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomInspectionCommonCharacteristic",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
          $permissionCheck: "inspectionCharacteristic.manage",
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
      fixedFilters: [
        {
          operator: "null",
          field: "deletedAt",
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
          code: "state",
          width: "80px",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "80px",
        },
        {
          type: "auto",
          code: "name",
          width: "150px",
        },
        {
          type: "auto",
          code: "kind",
          width: "150px",
        },
        {
          type: "auto",
          code: "unitName",
          width: "50px",
        },
        {
          type: "auto",
          code: "qualitativeDetermineType",
          width: "150px",
        },
        {
          type: "auto",
          code: "norminal",
          width: "150px",
        },
        {
          type: "auto",
          code: "category",
          width: "150px",
        },
        {
          type: "auto",
          code: "description",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          $permissionCheck: "inspectionCharacteristic.manage",
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
          $permissionCheck: "inspectionCharacteristic.manage",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.fixedFields.state": "'enabled'",
      },
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
