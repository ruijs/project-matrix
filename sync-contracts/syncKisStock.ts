import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { BaseLocation } from "~/_definitions/meta/entity-types";

const syncKisStock: KisToWmsSyncContract<any, BaseLocation> = {
  name: "syncKisStock",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "Stock",
  sourceEntityTypeName: "仓库",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  sourceEntityDisplayField: "FName",
  targetEntityTypeCode: "base_location",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: [["type", "externalCode"]],
  targetEntityFieldsToUpdate: ["code", "name", "type", "externalCode"],
  fetchSourceOptions: {
    fetchAll: true,
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    async mapToTargetEntity(syncContext, source): Promise<Partial<BaseLocation>> {
      return {
        code: source.FNumber,
        name: source.FName,
        type: "warehouse",
        externalCode: source.FItemID,
      };
    },
  }),
};
export default syncKisStock;
