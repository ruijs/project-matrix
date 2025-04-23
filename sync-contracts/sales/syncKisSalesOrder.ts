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
import { isEqual, map, omit, orderBy } from "lodash";
import { getEntityRelationTargetId } from "@ruiapp/rapid-core";

const syncKisInventoryMaterialReceiptNotice: KisToWmsSyncContract<any, MomInventoryApplication> = {
  name: "syncKisSalesOrder",
  enabled: true,
  jobCronTime: "0 0/10 * * * *",
  sourceEntityTypeCode: "salesorder",
  sourceEntityTypeName: "销售订单",
  sourceEntityIdField: "Head.FInterID",
  sourceEntityCodeField: "Head.FBillNo",
  sourceEntityDisplayField: "Head.FBillNo",
  targetEntityTypeCode: "mom_inventory_application",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "code",
  targetEntityUniqueKeys: ["code"],
  targetEntityFieldsToUpdate: ["customer", "applicant", "contractNum", "items"],
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
  findTargetEntityRelationsOptions: {
    items: true,
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    appCode: "app007099",

    async sourceEntityFilter(syncContext, source) {
      return !!source.Head.FCheckDate;
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
            value: "销售出库",
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
        contractNum: head.FHeadSelfS0193,
        businessType,
        customer,
        applicant,
        operationType: "out",
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
          quantity: entry.Fauxqty,
          unit: material.defaultUnit,
          remark: entry.Fnote,
          fOrderBillNo: head.FHeadSelfS0193,
          fSourceBillNo: head.FHeadSelfS0193,
          orderNum: applicationItems.length + 1,
        };
        applicationItems.push(applicationItem);
      }

      return inventoryApplication;
    },

    async handleShouldUpdate(syncContext, source, targetEntityToSave, currentTargetEntity, changes) {
      function inventoryApplicationItemMapper(item: Partial<MomInventoryApplicationItem>) {
        return {
          orderNum: item.orderNum,
          material_id: getEntityRelationTargetId(item, "material", "material_id"),
          quantity: item.quantity,
          remark: item.remark,
          fOrderBillNo: item.fOrderBillNo,
          fSourceBillNo: item.fSourceBillNo,
        };
      }
      const itemsToSave = orderBy(map(targetEntityToSave.items, inventoryApplicationItemMapper), ["orderNum"]);
      const itemsSaved = orderBy(map(currentTargetEntity.items, inventoryApplicationItemMapper), ["orderNum"]);
      const itemsChanged = !isEqual(itemsToSave, itemsSaved);

      const isWarehouseAssigned = !!(currentTargetEntity as any).from_warehouse_id;

      const shouldItemsUpdate = !isWarehouseAssigned && itemsChanged;

      if (!shouldItemsUpdate) {
        delete changes.items;
      }

      const changesExceptItems = omit(changes, ["items"]);
      const shouldEntityUpdate =
        currentTargetEntity.operationState === "pending" && (!!(changesExceptItems && Object.keys(changesExceptItems).length) || shouldItemsUpdate);
      return shouldEntityUpdate;
    },
  }),
};
export default syncKisInventoryMaterialReceiptNotice;
