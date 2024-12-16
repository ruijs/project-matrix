import KingdeeSDK from "~/sdk/kis/api";
import {ActionHandlerContext, IRpdServer, UpdateEntityByIdOptions} from "@ruiapp/rapid-core";
import KisHelper from "~/sdk/kis/helper";
import {
  BaseLocation,
  BaseMaterial,
  BaseMaterialCategory,
  BasePartnerCategory,
  BaseUnit,
  SaveBaseLocationInput,
  SaveBaseMaterialCategoryInput,
  SaveBaseMaterialInput,
  SaveBasePartnerInput,
  SaveBaseUnitInput,
  SaveMomGoodTransferInput,
  SaveMomInventoryApplicationInput,
  SaveMomInventoryApplicationItemInput,
  SaveMomInventoryOperationInput, SaveOcUserInput,
} from "~/_definitions/meta/entity-types";

interface SyncOptions {
  url: string;
  singularCode?: string;
  mapToEntity: (item: any) => Promise<any>;
  filter?: (item: any) => boolean;
  payload?: any;
  syncAll?: boolean;
  pageSize?: number;
}

class KisDataSync {
  private api!: KingdeeSDK;
  private server: IRpdServer;
  private ctx: ActionHandlerContext;
  private materialCategories: BaseMaterialCategory[] = [];
  private partnerCategories: BasePartnerCategory[] = [];
  private baseLocations: BaseLocation[] = [];
  private units: BaseUnit[] = [];

  constructor(server: IRpdServer, ctx: ActionHandlerContext) {
    this.server = server;
    this.ctx = ctx;
  }

  // Initialize API client
  public async initialize() {
    this.api = await new KisHelper(this.server).NewAPIClient();
  }

  // Load base data for categories and units
  private async loadBaseData() {
    await Promise.all([this.loadMaterialCategories(), this.loadPartnerCategories(), this.loadUnits(), this.loadBaseLocations()]);
  }

  private async loadMaterialCategories() {
    this.materialCategories = await this.loadEntities("base_material_category");
  }

  private async loadPartnerCategories() {
    this.partnerCategories = await this.loadEntities("base_partner_category", {});
  }

  private async loadBaseLocations() {
    this.baseLocations = await this.loadEntities("base_location", {});
  }

  private async loadUnits() {
    this.units = await this.loadEntities("base_unit");
  }

  private async loadEntities(entityName: string, options: object = {
    filters: [{
      operator: "notNull",
      field: "externalCode"
    }]
  }) {
    const entityManager = this.server.getEntityManager(entityName);
    return await entityManager.findEntities(options);
  }

  // Utility function to pause execution
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry mechanism for API requests
  private async retryApiRequest(url: string, payload: object, retries: number = 3): Promise<any> {
    let attempts = 0;
    while (attempts < retries) {
      const response = await this.api.PostResourceRequest(url, payload);
      if (response.data.errcode === 0) {
        return response;
      }
      console.error(`API ${ url } request failed (attempt ${ attempts + 1 }):`, url, response.data);
      attempts += 1;
      await this.sleep(2000); // Wait before retrying
    }
    throw new Error(`Failed to fetch data from ${ url } after ${ retries } attempts`);
  }

  // Fetch paginated list from the API
  private async fetchListPages(options: SyncOptions): Promise<any[]> {
    const results: any[] = [];
    let page = 1;
    const pageSize = options.pageSize ? options.pageSize : 100;
    if (options.syncAll === undefined) {
      options.syncAll = true
    }

    if (!options.payload) {
      options.payload = {}
    }

    try {
      while (true) {
        const response = await this.retryApiRequest(options.url, {
          CurrentPage: page,
          ItemsOfPage: pageSize,
          ...options.payload,
        });

        const data = response.data.data;

        // console.log(`URL: ${options.url}, Payload: ${JSON.stringify(options.payload, null, 2)}, Current Page: ${page} Total Items: ${data?.TotalItems}, Page Size: ${pageSize}, Total Pages: ${data?.TotalPage || data?.TotalPages || 1}, "syncAll: ${options.syncAll}"`);

        if (data?.GoodItemStocks?.length) {
          results.push(...data.GoodItemStocks);
        }
        if (data?.List?.length) {
          results.push(...data.List);
        }

        if (options.syncAll) {
          const totalPage = data?.TotalPage || data?.TotalPages || 1;
          if (page >= totalPage) break;
        } else {
          break;
        }

        await this.sleep(500);

        page += 1;
      }
    } catch (e) {
      console.error(e);
    }

    return results;
  }

  // Fetch detail page from the API
  private async fetchDetailPages(options: SyncOptions): Promise<any[]> {

    const results: any[] = [];

    try {
      const chunks = this.chunkArray(options?.payload?.ItemIds, 20); // Split itemIds into chunks of 20

      for (const chunk of chunks) {
        const response = await this.retryApiRequest(options.url, { ItemIds: chunk });
        const data = response.data.data;
        if (data.GoodItemStocks && data.GoodItemStocks.length) {
          results.push(...data.GoodItemStocks);
        }
        if (data.List && data.List.length) {
          results.push(...data.List);
        }
      }
    } catch (e) {
      console.error(e);
    }

    return results;
  }

  private async syncEntities(options: SyncOptions, isLoadDetail: boolean = false) {
    const data = isLoadDetail ? await this.fetchDetailPages(options) : await this.fetchListPages(options);
    // console.log(`Fetched ${data.length} items from ${options.url}`)
    const filteredData = options.filter ? data.filter(options.filter) : data;
    // console.log(`Filtered ${filteredData.length} items from ${options.url}`)
    const entities = (await Promise.all(filteredData.map(options.mapToEntity))).filter(item => item != null);
    // console.log(`Mapped ${entities.length} items from ${options.url}`)
    const entityManager = options.singularCode ? this.server.getEntityManager(options.singularCode) : null;

    for (const entity of entities) {
      try {
        if (!entityManager) break;
        isLoadDetail ? await entityManager.updateEntityById(entity) : await entityManager.createEntity({ entity });
      } catch (e: any) {
        if (e.code === '23505') {
          // console.error(`Entity with code ${entity.code} already exists or id ${entity.id} updated`);
        } else {
          console.error(e);
        }
      }
    }
    // this.ctx.logger.info(`${options.singularCode} entities ${isLoadDetail ? 'detail' : 'list'} synced`);
  }

  // Utility function to split an array into chunks
  private chunkArray(array: any[], chunkSize: number): any[][] {
    const results: any[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      results.push(array.slice(i, chunkSize + i));
    }
    return results;
  }

  // Create sync function for general entities
  private createListSyncFunction(options: SyncOptions) {
    return async () => {
      await this.syncEntities(options, false);
    };
  }

  // Create sync function for detailed entities
  private createDetailSyncFunction(options: SyncOptions) {
    return async () => {
      await this.syncEntities(options, true);
    };
  }

  // Main sync function to synchronize all entities
  public async syncBaseData() {
    if (!this.api) {
      throw new Error("API client is not initialized");
    }

    await this.loadBaseData();

    const syncBaseFunctions = [
      //  同步单位
      this.createListSyncFunction({
        url: "/koas/APP006992/api/MeasureUnit/List",
        singularCode: "base_unit",
        mapToEntity: async (item: any) => ({
          code: item.FNumber,
          name: item.FName,
          externalCode: item.FItemID,
          type: 'others',
          orderNum: 1,
          category: { id: 1 }
        } as SaveBaseUnitInput),
      }),
      // 同步物料分类
      this.createListSyncFunction(
        {
          url: "/koas/APP006992/api/Material/List",
          singularCode: "base_material_category",
          mapToEntity: async (item: any) => {
            const parentId = this.materialCategories.find(cat => cat.externalCode === String(item.FParentID))?.id;

            if (!parentId && item.FParentID !== 0) {
              // console.log(`Parent category not found for item ${item.FName}`)
              return null;
            }

            let entity = {
              code: item.FNumber,
              name: item.FName,
              externalCode: item.FItemID,
              orderNum: 1,
            } as SaveBaseMaterialCategoryInput;

            if (parentId) {
              entity.parent = { id: parentId };
            }

            return entity;
          },
          payload: { Detail: false },
        }),
      this.createListSyncFunction({
        url: "/koas/APP006992/api/Stock/List",
        singularCode: "base_location",
        mapToEntity: async (item: any) => {
          return {
            code: item.FNumber,
            name: item.FName,
            externalCode: item.FItemID,
            type: 'warehouse',

          } as SaveBaseLocationInput;
        },
      }),
      // this.createListSyncFunction({
      //   url: "/koas/APP006992/api/StockPlaceGroup/List",
      //   singularCode: "base_location",
      //   mapToEntity: async (item: any) => {
      //     return {
      //       code: item.FNumber,
      //       name: item.FName,
      //       externalCode: item.FSPGroupID,
      //       type: 'warehouse',
      //
      //     } as SaveBaseLocationInput;
      //   },
      // }),
      // 同步库位
      this.createListSyncFunction({
        url: "/koas/APP006992/api/StockPlace/List",
        singularCode: "base_location",
        mapToEntity: async (item: any) => {
          return {
            code: item.FNumber,
            name: item.FName,
            externalCode: item.FSPID,
            parent: {id: this.baseLocations.find(cat => cat.externalGroupCode === String(item.FSPGroupID))?.id},
            type: 'storageArea',
          } as SaveBaseLocationInput;
        },
      }),
    ]

    for (const syncListFunction of syncBaseFunctions) {
      await syncListFunction();
    }

    await this.loadBaseData();

    const syncFunctions = [
      //  同步单位
      this.createListSyncFunction({
        url: "/koas/APP006992/api/MeasureUnit/List",
        singularCode: "base_unit",
        mapToEntity: async (item: any) => ({
          code: item.FNumber,
          name: item.FName,
          externalCode: item.FItemID,
          type: 'others',
          orderNum: 1,
          category: { id: 1 }
        } as SaveBaseUnitInput),
      }),
      // 同步物料
      this.createListSyncFunction({
        url: "/koas/APP006992/api/Material/List",
        singularCode: "base_material",
        mapToEntity: async (item: any) => {
          const category = this.materialCategories.find(cat => cat.externalCode === String(item.FParentID));
          if (!category) return null;
          return {
            code: item.FNumber,
            name: item.FName,
            externalCode: item.FItemID,
            state: 'enabled',
            category: { id: category?.id },
          } as SaveBaseMaterialInput;
        },
        payload: { Detail: true },
        filter: (item: any) => item.FParentID !== 0
      }),
      // 同步员工
      this.createListSyncFunction({
        url: "/koas/APP006992/api/Employee/List",
        singularCode: "oc_user",
        mapToEntity: async (item: any) => {
          // const username = pinyin(item.FName, { style: pinyin.STYLE_NORMAL, segment: true, heteronym: false, compact: true });

          return {
            login: item.FName,
            name: item.FName,
            hidden: false,
            state: 'enabled',
            externalCode: item.EmpID
          } as SaveOcUserInput;
        },
      }),
      // 同步物流供应商
      this.createListSyncFunction({
        url: "/koas/APP006992/api/item/list",
        singularCode: "base_partner",
        mapToEntity: async (item: any) => {
          const category = this.partnerCategories.find(cat => cat.code === 'express_supplier');
          if (!category) return null;

          return {
            code: item.FNumber,
            name: item.FName,
            externalCode: item.FItemID,
            categories: category ? [{ id: category.id }] : [],
          } as SaveBasePartnerInput;
        },
        payload: {
          ItemClassId: 3006
        }
      }),
      // 同步合作伙伴（供应商）
      this.createListSyncFunction({
        url: "/koas/APP006992/api/Vendor/List",
        singularCode: "base_partner",
        mapToEntity: async (item: any) => {
          const category = this.partnerCategories.find(cat => cat.code === 'supplier');
          if (!category) return null;

          return {
            code: item.FNumber,
            name: item.FName,
            externalCode: item.FItemID,
            categories: category ? [{ id: category.id }] : [],
          } as SaveBasePartnerInput;
        },
        filter: (item: any) => item.FParentID !== 0
      }),
      // 同步合作伙伴（客户）
      this.createListSyncFunction({
        url: "/koas/APP006992/api/Customer/List",
        singularCode: "base_partner",
        mapToEntity: async (item: any) => {
          const category = this.partnerCategories.find(cat => cat.code === 'customer');
          if (!category) return null;

          return {
            code: item.FNumber,
            name: item.FName,
            externalCode: item.FItemID,
          } as SaveBasePartnerInput;
        },
      }),
    ];

    for (const syncListFunction of syncFunctions) {
      await syncListFunction();
    }


    const materials = await this.server.getEntityManager("base_material").findEntities({
      filters: [{
        operator: "and",
        filters: [{ operator: "notNull", field: "externalCode" }, { operator: "null", field: "default_unit_id" }]
      }],
    });

    const materialIds = materials.map((material: BaseMaterial) => material.externalCode);

    const syncDetailFunctions = [
      this.createDetailSyncFunction({
        url: "/koas/APP006992/api/Material/GetListDetails",
        singularCode: "base_material",
        mapToEntity: async (item: any) => {

          console.log(item)

          return {
            id: materials.find(material => material.externalCode === String(item.FItemID))?.id,
            entityToSave: {
              specification: item.FModel,
              defaultUnit: {
                id: item.FUnitID ? this.units.find(unit => unit.externalCode === String(item.FUnitID))?.id : null,
              },
            },
          } as UpdateEntityByIdOptions
        },
        payload: { ItemIds: materialIds }
      }),
    ];

    for (const syncDetailFunction of syncDetailFunctions) {
      await syncDetailFunction();
    }
  }

  public async syncInventoryData() {
    if (!this.api) {
      throw new Error("API client is not initialized");
    }


    const materials: BaseMaterial[] = await this.server.getEntityManager("base_material").findEntities({
      filters: [{ operator: "notNull", field: "externalCode" }],
      properties: ["id", "externalCode", "defaultUnit"],
    });

    const warehouseLocations: BaseLocation[] = await this.server.getEntityManager("base_location").findEntities({
      filters: [{ operator: "notNull", field: "externalCode" }],
    });


    const momInventoryManager = this.server.getEntityManager("mom_inventory_operation")

    const result = await momInventoryManager.createEntity(
      {
        entity: {
          approvalState: 'uninitiated',
          businessType: 3,
          operationType: 'in',
          state: 'processing',
        } as SaveMomInventoryOperationInput
      }
    )

    const syncFunctions = [
      this.createListSyncFunction({
        url: "/koas/APP007104/api/ICInventory/List",
        singularCode: "mom_good_transfer",
        mapToEntity: async (item: any) => {
          const material = materials.find(material => material.externalCode === String(item.FMaterialID));
          if (!material) {
            // console.log(`Material not found for item ${item.FMaterialNumber}`)

            return null;
          }

          if (item.FBatchNo) {

            const stock = warehouseLocations.find(location => location.code === String(item.FStockNumber))?.id

            let entity = {
              operation: { id: result.id },
              material: { id: material?.id },
              lotNum: item.FBatchNo,
              quantity: item.FBUQty,
              unit: { id: material?.defaultUnit?.id },
              to: { id: stock }
            } as SaveMomGoodTransferInput

            return entity;
          }


        },
        payload: { Data: {} },
        syncAll: true,
      }),
    ]


    for (const syncListFunction of syncFunctions) {
      await syncListFunction();
    }

    await momInventoryManager.updateEntityById({
      id: result.id,
      entityToSave: {
        approvalState: 'approved',
        state: 'done',
      }
    })
  }


  public async syncInventoryNotify() {
    if (!this.api) {
      throw new Error("API client is not initialized");
    }

    const [materials, employees, partners] = await Promise.all([
      this.server.getEntityManager("base_material").findEntities({
        filters: [{ operator: "notNull", field: "externalCode" }],
        properties: ["id", "externalCode", "defaultUnit"],
      }),
      this.server.getEntityManager("oc_user").findEntities({
        filters: [{ operator: "notNull", field: "externalCode" }],
      }),
      this.server.getEntityManager("base_partner").findEntities({
        filters: [{ operator: "notNull", field: "externalCode" }],
      }),
    ]);

    const materialMap = new Map(materials.map(material => [material.externalCode, material]));
    const employeeMap = new Map(employees.map(employee => [employee.externalCode, employee]));
    const partnerMap = new Map(partners.map(partner => [partner.externalCode, partner]));

    const syncFunctions = [
      // 委外加工出库红字
      this.createListSyncFunction({
        url: "/koas/app007104/api/subcontractdelivery/list",
        singularCode: "mom_inventory_application",
        mapToEntity: async (item: any) => {
          const { Entry, Head } = item;

          const mapEntryToEntity = (entry: any) => {
            const material = materialMap.get(String(entry.FItemID));
            return {
              material,
              lotNum: entry.FBatchNo,
              quantity: entry.Fauxqty,
              unit: { id: material?.defaultUnit?.id },
              remark: entry?.Fnote,
              orderNum: 1,
            } as SaveMomInventoryApplicationItemInput;
          };

          const entities = Entry.map(mapEntryToEntity);

          return {
            code: Head.FBillNo,
            contractNum: Head.FHeadSelfP0338,
            businessType: { id: 20 }, // 委外加工出库退货入库
            supplier: { id: partnerMap.get(String(Head.FSupplyID))?.id },
            applicant: { id: employeeMap.get(String(Head.FEmpID))?.id },
            operationType: 'in',
            state: 'approved',
            operationState: 'pending',
            items: entities,
            externalCode: Head.FInterID,
            source: 'kis',
            fPOStyle: Head.FPOStyle,
            fSupplyID: Head.FSupplyID,
          } as SaveMomInventoryApplicationInput;
        },
        payload: {
          OrderBy: {
            Property: "FCheckDate",
            Type: "Desc",
          },
        },
        syncAll: false,
        filter: (item: any) => item.Head.FROB === -1,
        pageSize: 50,
      }),
      // 采购入库通知单
      this.createListSyncFunction({
        url: "/koas/app007140/api/materialreceiptnotice/list",
        singularCode: "mom_inventory_application",
        mapToEntity: async (item: any) => {
          const { Entry, Head } = item;

          const mapEntryToEntity = (entry: any) => {
            const material = materialMap.get(String(entry.FItemID));
            return {
              material,
              lotNum: entry.FBatchNo,
              quantity: entry.Fauxqty,
              unit: { id: material?.defaultUnit?.id },
              remark: entry?.Fnote,
              fOrderBillNo: entry?.FOrderBillNo,
              fOrderType: entry?.FOrderType,
              fSourceBillNo: entry?.FSourceBillNo,
              fSourceBillType: entry?.FSourceBillType,
              orderNum: 1,
            } as SaveMomInventoryApplicationItemInput;
          };

          const entities = Entry.map(mapEntryToEntity);

          return {
            code: Head.FBillNo,
            contractNum: Head.FHeadSelfP0338,
            businessType: { id: 1 }, // 采购入库
            supplier: { id: partnerMap.get(String(Head.FSupplyID))?.id },
            applicant: { id: employeeMap.get(String(Head.FEmpID))?.id },
            operationType: 'in',
            state: 'approved',
            operationState: 'pending',
            items: entities,
            externalCode: Head.FInterID,
            source: 'kis',
            fPOStyle: Head.FPOStyle,
            fSupplyID: Head.FSupplyID,
          } as SaveMomInventoryApplicationInput;
        },
        payload: {
          OrderBy: {
            Property: "FCheckDate",
            Type: "Desc",
          },
        },
        syncAll: false,
        filter: (item: any) => item.Head.FCheckDate !== null,
        pageSize: 50,
      }),
      // 采购退货出库通知单
      this.createListSyncFunction({
        url: "/koas/app007140/api/materialreturnnotice/list",
        singularCode: "mom_inventory_application",
        mapToEntity: async (item: any) => {
          const { Entry, Head } = item;

          const mapEntryToEntity = (entry: any) => {
            const material = materialMap.get(String(entry.FItemID));
            return {
              material,
              lotNum: entry.FBatchNo,
              quantity: entry.Fauxqty,
              unit: { id: material?.defaultUnit?.id },
              remark: entry?.Fnote
            } as SaveMomInventoryApplicationItemInput;
          };

          const entities = Entry.map(mapEntryToEntity);

          return {
            code: Head.FBillNo,
            businessType: { id: 8 }, // 采购退货出库
            supplier: { id: partnerMap.get(String(Head.FSupplyID))?.id },
            applicant: { id: employeeMap.get(String(Head.FEmpID))?.id },
            operationType: 'out',
            state: 'approved',
            operationState: 'pending',
            items: entities,
            externalCode: Head.FInterID,
            fSupplyID: Head.FSupplyID,
            source: 'kis',
          } as SaveMomInventoryApplicationInput;
        },
        payload: {
          OrderBy: {
            Property: "FCheckDate",
            Type: "Desc",
          },
        },
        syncAll: false,
        filter: (item: any) => item.Head.FCheckDate !== null,
        pageSize: 50,
      }),
      // 销售退货入库通知单
      this.createListSyncFunction({
        url: "/koas/app007099/api/goodsreturnnotice/list",
        singularCode: "mom_inventory_application",
        mapToEntity: async (item: any) => {
          const { Entry, Head } = item;

          const mapEntryToEntity = (entry: any) => {
            const material = materialMap.get(String(entry.FItemID));
            return {
              material,
              lotNum: entry.FBatchNo,
              quantity: entry.Fauxqty,
              unit: { id: material?.defaultUnit?.id },
              remark: entry?.Fnote
            } as SaveMomInventoryApplicationItemInput;
          };

          const entities = Entry.map(mapEntryToEntity);

          return {
            code: Head.FBillNo,
            businessType: { id: 7 }, // 销售退货入库
            supplier: { id: partnerMap.get(String(Head.FSupplyID))?.id },
            applicant: { id: employeeMap.get(String(Head.FEmpID))?.id },
            operationType: 'out',
            state: 'approved',
            operationState: 'pending',
            items: entities,
            externalCode: Head.FInterID,
            fSupplyID: Head.FSupplyID,
            source: 'kis',
          } as SaveMomInventoryApplicationInput;
        },
        payload: {
          OrderBy: {
            Property: "FCheckDate",
            Type: "Desc",
          },
        },
        syncAll: false,
        filter: (item: any) => item.Head.FCheckDate !== null,
        pageSize: 50,
      }),
      // 销售退货入库通知单
      this.createListSyncFunction({
        url: "/koas/app007099/api/goodsreturnnotice/list",
        singularCode: "mom_inventory_application",
        mapToEntity: async (item: any) => {
          const { Entry, Head } = item;

          const mapEntryToEntity = (entry: any) => {
            const material = materialMap.get(String(entry.FItemID));
            return {
              material,
              lotNum: entry.FBatchNo,
              quantity: entry.Fauxqty,
              unit: { id: material?.defaultUnit?.id },
              remark: entry?.Fnote
            } as SaveMomInventoryApplicationItemInput;
          };

          const entities = Entry.map(mapEntryToEntity);

          return {
            code: Head.FBillNo,
            businessType: { id: 7 }, // 销售退货入库
            supplier: { id: partnerMap.get(String(Head.FSupplyID))?.id },
            applicant: { id: employeeMap.get(String(Head.FEmpID))?.id },
            operationType: 'out',
            state: 'approved',
            operationState: 'pending',
            items: entities,
            externalCode: Head.FInterID,
            source: 'kis',
            fSupplyID: Head.FSupplyID,
          } as SaveMomInventoryApplicationInput;
        },
        payload: {
          OrderBy: {
            Property: "FCheckDate",
            Type: "Desc",
          },
        },
        syncAll: false,
        filter: (item: any) => item.Head.FCheckDate !== null,
        pageSize: 50,
      }),
      // 销售订单（当通知单用）
      this.createListSyncFunction({
        url: "/koas/app007099/api/salesorder/list",
        singularCode: "mom_inventory_application",
        mapToEntity: async (item: any) => {
          const { Entry, Head } = item;

          const mapEntryToEntity = (entry: any) => {
            const material = materialMap.get(String(entry.FItemID));
            return {
              material,
              quantity: entry.Fauxqty,
              unit: { id: material?.defaultUnit?.id },
              remark: entry?.Fnote,
              fOrderBillNo: Head?.FBillNo,
              fSourceBillNo: Head?.FBillNo,
              orderNum: 1,
            } as SaveMomInventoryApplicationItemInput;
          };

          const entities = Entry.map(mapEntryToEntity);

          return {
            code: Head.FBillNo,
            businessType: { id: 4 }, // 销售出库
            customer: { id: partnerMap.get(String(Head.FCustID))?.id },
            applicant: { id: employeeMap.get(String(Head.FEmpID))?.id },
            operationType: 'out',
            state: 'approved',
            operationState: 'pending',
            items: entities,
            externalCode: Head.FInterID,
            source: 'kis',
            fSupplyID: Head.FSupplyID,
            contractNum: Head.FHeadSelfS0193,
          } as SaveMomInventoryApplicationInput;
        },
        payload: {
          OrderBy: {
            Property: "FCheckDate",
            Type: "Desc",
          },
        },
        syncAll: false,
        filter: (item: any) => item.Head.FCheckDate !== null,
        pageSize: 50,
      }),
    ];

    try {
      await Promise.all(syncFunctions.map(syncFunc => syncFunc()));
    } catch (error) {
      console.error("Error during inventory sync:", error);
    }
  }


  public async syncKisAuditStatus() {

    const inventoryOperationManager = this.server.getEntityManager("mom_inventory_operation")

    const operations = await inventoryOperationManager.findEntities({
      filters: [{ operator: "eq", field: "approval_state", value: "approving" }, {
        operator: "notNull",
        field: "externalCode"
      }],
      properties: ["id", "operationType", "businessType", "externalCode"],
    })

    let statusApiUrl = ""
    for (const operation of operations) {
      switch (operation.businessType.name) {
        case "盘盈入库":
          statusApiUrl = "/koas/app007104/api/inventorygain/getdetail"
          break;
        case "盘亏出库":
          statusApiUrl = "/koas/app007104/api/inventoryloss/getdetail"
          break;
        case "其他原因入库":
        case "其他原因出库":
          statusApiUrl = "/koas/app007104/api/miscellaneousreceipt/getdetail"
          break;
        case "委外加工入库":
          statusApiUrl = "/koas/app007104/api/subcontractreceipt/getdetail"
          break;
        case "委外加工出库":
          statusApiUrl = "/koas/app007104/api/subcontractdelivery/getdetail"
          break;
        case "生产领料":
          statusApiUrl = "/koas/app007104/api/pickinglist/getdetail"
          break;
        case "库存调拨":
          statusApiUrl = "/koas/app007104/api/stocktransfer/getdetail"
          break;
        case "采购入库":
        case "采购退货出库":
          statusApiUrl = "/koas/app007104/api/purchasereceipt/getdetail"
          break;
        case "销售出库":
        case "销售退货入库":
          statusApiUrl = "/koas/app007104/api/salesdelivery/getdetail"
          break;
        case "生产入库":
          statusApiUrl = "/koas/app007104/api/productreceipt/getdetail"
          break;
        default:
          break;
      }
      const response = await this.retryApiRequest(statusApiUrl, { Id: operation.externalCode })
      if (response.data.Head.FCheckDate) {
        await inventoryOperationManager.updateEntityById({
          id: operation.id,
          entityToSave: {
            approvalState: 'approved',
          }
        })
      }
    }
  }
}

export default KisDataSync;
