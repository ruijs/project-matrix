import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "sys",
  code: "SysEventLog",
  name: "事件日志",
  fields: [
    {
      code: "time",
      name: "时间",
      type: "datetime",
      required: true,
      defaultValue: "now()",
    },
    {
      code: "sourceType",
      name: "来源类型",
      type: "option",
      dataDictionary: "SysEventSourceType",
      required: true,
      defaultValue: "'user'",
    },
    {
      code: "sourceName",
      name: "来源名称",
      type: "text",
    },
    {
      code: "level",
      name: "级别",
      type: "option",
      dataDictionary: "SysEventLogLevel",
      required: true,
      defaultValue: "'info'",
    },
    {
      code: "message",
      name: "信息",
      type: "text",
      required: true,
    },
    {
      code: "eventType",
      name: "事件类型",
      type: "relation",
      targetSingularCode: "sys_event_type",
      targetIdColumnName: "event_type_id",
    },
    {
      code: "operator",
      name: "操作人",
      type: "relation",
      targetSingularCode: "oc_user",
      targetIdColumnName: "operator_id",
    },
    {
      code: "targetTypeCode",
      name: "操作对象类型",
      type: "text",
    },
    {
      code: "targetId",
      name: "操作对象id",
      type: "integer",
    },
    {
      code: "targetCode",
      name: "操作对象编号",
      type: "text",
    },
    {
      code: "targetName",
      name: "操作对象名称",
      type: "text",
    },
    {
      code: "ip",
      name: "IP地址",
      type: "text",
    },
    {
      code: "details",
      name: "详情",
      type: "text",
    },
    {
      code: "data",
      name: "数据",
      type: "json",
    },
  ],
};

export default entity;
