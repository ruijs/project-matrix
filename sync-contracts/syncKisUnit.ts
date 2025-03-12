import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { BaseUnit } from "~/_definitions/meta/entity-types";

const syncKisUnit: KisToWmsSyncContract<any, BaseUnit> = {
  name: "syncKisUnit",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "MeasureUnit",
  sourceEntityTypeName: "计量单位",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  targetEntityTypeCode: "base_unit",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: ["externalCode", "code"],
  targetEntityFieldsToUpdate: ["code", "name", "externalCode"],
  fetchSourceOptions: {
    fetchAll: true,
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    async mapToTargetEntity(syncContext, source): Promise<Partial<BaseUnit>> {
      return {
        code: source.FNumber,
        name: source.FName,
        externalCode: source.FItemID.toString(),
        type: "others",
        orderNum: 1,
        category: { id: 1 },
      };
    },
  }),
};
export default syncKisUnit;
