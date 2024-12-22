import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "auth",
  code: "AuthAccount",
  name: "账号",
  fields: [
    {
      code: "user",
      name: "用户",
      type: "relation",
      targetSingularCode: "oc_user",
      targetIdColumnName: "user_id",
    },
    {
      code: "providerCode",
      name: "提供者代号",
      type: "text",
      required: true,
    },
    {
      code: "login",
      name: "登录账号",
      type: "text",
    },
    {
      code: "password",
      name: "密码",
      type: "text",
      config: {
        dataManage: {
          hidden: true,
        },
      },
    },
    {
      code: "email",
      name: "Email",
      type: "text",
    },
    {
      code: "mobile",
      name: "手机号",
      type: "text",
    },
    {
      code: "externalAccountId",
      name: "外部系统账号Id",
      type: "text",
    },
    {
      code: "details",
      name: "详细信息",
      type: "json",
    },
  ],
};

export default entity;
