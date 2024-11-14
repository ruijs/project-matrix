import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomPrintLog",
  name: "打印记录",
  description: "打印记录",
  fields: [
    {
      code: "code",
      name: "打印机编码",
      type: "text",
      required: true,
    },
    {
      code: "tasks",
      name: "打印内容",
      type: "json",
    },
  ],
};

export default entity;
