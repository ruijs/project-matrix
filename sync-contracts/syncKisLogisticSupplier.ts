import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { BasePartner, BasePartnerCategory } from "~/_definitions/meta/entity-types";

const syncKisLogisticSupplier: KisToWmsSyncContract<any, BasePartner> = {
  name: "syncKisLogisticSupplier",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "item",
  sourceEntityTypeName: "物流供应商",
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
      ItemClassId: 3006,
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
            value: "express_supplier",
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
export default syncKisLogisticSupplier;
