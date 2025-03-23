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
  name: "syncKisGoodsReturnNotice",
  enabled: true,
  jobCronTime: "0 0/10 * * * *",
  sourceEntityTypeCode: "goodsreturnnotice",
  sourceEntityTypeName: "销售退货入库通知单",
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
    appCode: "app007099",

    async sourceEntityFilter(syncContext, source) {
      return !!source.Head.FCheckDate;
    },

    async mapToTargetEntity(syncContext, source) {
      console.dir(source, { depth: 4 });
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
            value: "销售退货入库",
          },
        ],
      });

      const head = source.Head;

      const customer = await partnerManager.findEntity({
        routeContext,
        filters: [{ operator: "eq", field: "externalCode", value: head.FCustID }],
        properties: ["id", "name"],
      });

      if (!customer) {
        throw new Error(`未找到externalCode为${head.FCustID}的客户。`);
      }

      const applicant = await userManager.findEntity({
        routeContext,
        filters: [{ operator: "eq", field: "externalCode", value: head.FEmpID }],
        properties: ["id", "name"],
      });

      if (!applicant) {
        throw new Error(`未找到externalCode为${head.FEmpID}的用户。`);
      }

      const inventoryApplication: Partial<MomInventoryApplication> = {
        code: head.FBillNo,
        businessType,
        customer,
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
          quantity: entry.Fauxqty,
          unit: material.defaultUnit,
          remark: entry.Fnote,
          fOrderBillNo: entry.FSourceBillNo,
          fSourceBillNo: entry.FSourceBillNo,
          orderNum: applicationItems.length + 1,
        };
        applicationItems.push(applicationItem);
      }

      return inventoryApplication;
    },
  }),
};
export default syncKisInventoryMaterialReceiptNotice;
