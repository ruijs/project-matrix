import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { BasePartner, BasePartnerCategory } from "~/_definitions/meta/entity-types";

const syncKisSupplier: KisToWmsSyncContract<any, BasePartner> = {
  name: "syncKisSupplier",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "Vendor",
  sourceEntityTypeName: "供应商",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  sourceEntityDisplayField: "FName",
  targetEntityTypeCode: "base_partner",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: ["externalCode", "code"],
  targetEntityFieldsToUpdate: ["code", "name", "externalCode"],
  fetchSourceOptions: {
    fetchAll: true,
    requestParams: {
      Detail: true,
    },
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    async mapToTargetEntity(syncContext, source): Promise<Partial<BasePartner>> {
      const { server } = syncContext;
      const category = await server.getEntityManager<BasePartnerCategory>("base_partner_category").findEntity({
        properties: ["id"],
        filters: [
          {
            operator: "eq",
            field: "code",
            value: "supplier",
          },
        ],
      });
      return {
        code: source.FNumber,
        name: source.FName,
        externalCode: source.FItemID,
        categories: category ? [category] : [],
      };
    },
  }),
};
export default syncKisSupplier;
