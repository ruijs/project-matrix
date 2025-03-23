import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import {
  BaseMaterial,
  BasePartner,
  OcUser,
  type MomInventoryApplication,
  type MomInventoryApplicationItem,
  type MomInventoryBusinessType,
} from "~/_definitions/meta/entity-types";

const syncKisInventoryMaterialReceiptNotice: KisToWmsSyncContract<any, MomInventoryApplication> = {
  name: "syncKisSubcontractDelivery",
  enabled: true,
  jobCronTime: "0 0/10 * * * *",
  sourceEntityTypeCode: "subcontractdelivery",
  sourceEntityTypeName: "委外加工出库红字单",
  sourceEntityIdField: "Head.FInterID",
  sourceEntityCodeField: "Head.FBillNo",
  sourceEntityDisplayField: "Head.FBillNo",
  targetEntityTypeCode: "mom_inventory_application",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "code",
  targetEntityUniqueKeys: ["code"],
  targetEntityFieldsToUpdate: [],
  fetchSourceOptions: {
    fetchAll: false,
    fetchPageSize: 50,
    requestParams: {
      OrderBy: {
        Property: "FCheckDate",
        Type: "Desc",
      },
    },
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    appCode: "app007104",

    async sourceEntityFilter(syncContext, source) {
      // FROB 为 -1 表示红字单据
      return source.Head.FROB === -1;
    },

    async mapToTargetEntity(syncContext, source) {
      const { server, routeContext } = syncContext;

      const materialManager = server.getEntityManager<BaseMaterial>("base_material");
      const partnerManager = server.getEntityManager<BasePartner>("base_partner");
      const userManager = server.getEntityManager<OcUser>("oc_user");

      const businessType = await server.getEntityManager<MomInventoryBusinessType>("mom_inventory_business_type").findEntity({
        properties: ["id", "name", "operationType"],
        filters: [
          {
            operator: "eq",
            field: "name",
            value: "委外加工出库退货入库",
          },
        ],
      });

      const head = source.Head;

      const supplier = await partnerManager.findEntity({
        routeContext,
        filters: [{ operator: "eq", field: "externalCode", value: head.FSupplyID }],
        properties: ["id", "name"],
      });

      if (!supplier) {
        throw new Error(`未找到externalCode为${head.FSupplyID}的供应商。`);
      }

      const applicant = await userManager.findEntity({
        routeContext,
        filters: [{ operator: "eq", field: "externalUserCode", value: head.FBillerID }],
        properties: ["id", "name"],
      });

      if (!applicant) {
        throw new Error(`未找到externalUserCode为${head.FBillerID}的用户。`);
      }

      const inventoryApplication: Partial<MomInventoryApplication> = {
        code: head.FBillNo,
        businessType,
        supplier: supplier,
        applicant,
        operationType: "in",
        state: "approved",
        operationState: "pending",
        source: "kis",
        externalCode: head.FInterID,
        items: [],
      };

      const applicationItems: Partial<MomInventoryApplicationItem>[] = inventoryApplication.items!;
      for (const entry of source.Entry) {
        const material = await materialManager.findEntity({
          routeContext,
          filters: [{ operator: "eq", field: "externalCode", value: entry.FItemID }],
          properties: ["id", "code", "name", "specification"],
          relations: {
            defaultUnit: {
              properties: ["id", "name"],
            },
          },
        });

        if (!material) {
          throw new Error(`未找到externalCode为${entry.FItemID}的物料.`);
        }

        const applicationItem: Partial<MomInventoryApplicationItem> = {
          material,
          lotNum: entry.FBatchNo,
          quantity: Math.abs(entry.Fauxqty),
          unit: material.defaultUnit,
          remark: entry.Fnote,
          orderNum: applicationItems.length + 1,
        };
        applicationItems.push(applicationItem);
      }

      return inventoryApplication;
    },
  }),
};
export default syncKisInventoryMaterialReceiptNotice;
