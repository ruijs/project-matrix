import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { BaseMaterial, BaseMaterialCategory } from "~/_definitions/meta/entity-types";

const syncKisMaterial: KisToWmsSyncContract<any, BaseMaterial> = {
  name: "syncKisMaterial",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "Material",
  sourceEntityTypeName: "物料",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  sourceEntityDisplayField: "FName",
  targetEntityTypeCode: "base_material",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: ["externalCode", "code"],
  targetEntityFieldsToUpdate: ["code", "name", "externalCode", "category"],
  fetchSourceOptions: {
    fetchAll: true,
    requestParams: {
      Detail: true,
    },
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    async mapToTargetEntity(syncContext, source): Promise<Partial<BaseMaterial>> {
      const { server } = syncContext;
      const category = await server.getEntityManager<BaseMaterialCategory>("base_material_category").findEntity({
        properties: ["id"],
        filters: [
          {
            operator: "eq",
            field: "externalCode",
            value: source.FParentID,
          },
        ],
      });
      return {
        code: source.FNumber,
        name: source.FName,
        externalCode: source.FItemID,
        category,
        state: "disabled",
      };
    },
  }),
};
export default syncKisMaterial;
