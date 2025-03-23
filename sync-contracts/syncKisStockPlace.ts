import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { BaseLocation } from "~/_definitions/meta/entity-types";

const syncKisStockPlace: KisToWmsSyncContract<any, BaseLocation> = {
  name: "syncKisStockPlace",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "StockPlace",
  sourceEntityTypeName: "库位",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  sourceEntityDisplayField: "FName",
  targetEntityTypeCode: "base_location",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: [["type", "externalCode"]],
  targetEntityFieldsToUpdate: ["code", "name", "externalCode", "type", "parent"],
  fetchSourceOptions: {
    fetchAll: true,
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    appCode: "APP006992",
    async mapToTargetEntity(syncContext, source): Promise<Partial<BaseLocation>> {
      const { server } = syncContext;
      const parent = await server.getEntityManager<BaseLocation>("base_location").findEntity({
        properties: ["id"],
        filters: [
          {
            operator: "eq",
            field: "externalGroupCode",
            value: source.FSPGroupID,
          },
        ],
      });
      return {
        code: source.FNumber,
        name: source.FName,
        externalCode: source.FSPID,
        type: "storageArea",
        parent,
      };
    },
  }),
};
export default syncKisStockPlace;
