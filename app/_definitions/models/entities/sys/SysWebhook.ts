import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "sys",
  code: "Webhook",
  name: "Webhook",
  tableName: "sys_webhooks",
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "url",
      name: "URL",
      type: "text",
      required: true,
    },
    {
      code: "secret",
      name: "密钥",
      type: "text",
      required: false,
    },
    {
      code: "namespace",
      name: "namespace",
      type: "text",
      required: true,
    },
    {
      code: "modelSingularCode",
      name: "模型Code",
      type: "text",
      required: true,
    },
    {
      code: "events",
      name: "事件",
      type: "json",
      required: false,
    },
    {
      code: "enabled",
      name: "是否启用",
      type: "boolean",
      required: true,
    },
  ],
};

export default entity;
