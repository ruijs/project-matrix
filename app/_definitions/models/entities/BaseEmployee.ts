import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseEmployee",
  name: "员工",
  softDelete: true,
  fields: [
    {
      code: "code",
      name: "工号",
      type: "text",
    },
    {
      code: "name",
      name: "姓名",
      type: "text",
    },
    {
      code: "department",
      name: "部门",
      type: "relation",
      targetSingularCode: "oc_department",
      targetIdColumnName: "department_id",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EmployeeState",
    },
    {
      code: "externalCode",
      name: "外部编号",
      type: "text",
    },
  ],
};

export default entity;
