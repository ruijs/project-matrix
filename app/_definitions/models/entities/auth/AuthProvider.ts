import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "auth",
  code: "AuthProvider",
  name: "认证提供者",
  fields: [
    {
      code: "code",
      name: "提供者代号",
      type: "text",
      required: true,
    },
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "config",
      name: "配置信息",
      type: "json",
    },
  ],
};

export default entity;
