import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomPrintTemplate",
  name: "打印模版",
  description: "打印模版",
  softDelete: true,
  fields: [
    {
      code: "name",
      name: "模版名称",
      type: "text",
      required: true,
    },
    {
      code: "code",
      name: "模版编码",
      type: "text",
      required: true,
    },
    {
      code: "content",
      name: "模版内容",
      type: "text",
    },
  ],
};

export default entity;
