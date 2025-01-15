import KingdeeSDK from "~/sdk/kis/api";

export interface WarehouseEntry {
  Famount?: number;
  FAuxPropID?: number;
  FAuxPrice?: number;
  Fauxqty: number;
  FAuxQtyMust: number;
  FBatchNo?: string;
  FDCSPID?: string;
  FDCStockID?: string;
  FEntryID?: number;
  FICMOBillNo?: string;
  FICMOInterID?: number;
  FItemID?: string;
  FKFDate?: string;
  FKFPeriod?: number;
  FMTONo?: string;
  Fnote?: string;
  FQty: number;
  FSecQty?: number;
  FQtyMust?: number;
  FSecCoefficient?: number;
  FUnitID?: string;
  FDeptID?: number;
  FPlanMode:number;
  FReProduceType?: number;
  FSCStockID?: string;
  FSourceBillNo?: string;
  FSourceTranType?: string;
  FSourceInterId?: string;
  FSourceEntryID?: number;
  FOrderBillNo?: string;
  FOrderInterID?: string;
  FOrderEntryID?: number;
}

export interface WarehousePayload {
  Object: {
    Head: {
      FBillerID?: string;
      FBillNo?: string;
      Fdate: string;
      FSettleDate?: string
      FDCStockID?: string;
      FSCStockID?: string;
      FDCSPID?: string;
      FPurposeID?: number;
      FDeptID?: string;
      FManagerID?: string;
      FEmpID?: string;
      FFManagerID?: string;
      FSManagerID?: string;
      FTranType: number; // 1
      FROB?: number;
      Fuse?: string;
      FHeadSelfB0436?: string;
      FPOStyle?: string;
      FSupplyID?: string;
      FHeadSelfA0143?: string; // 质检员
      FMarketingStyle?: string;
      FSaleStyle?: string;
      FHeadSelfB0164?: string; // 物流公司
      FHeadSelfB0163?: string; // 合同号
      FHeadSelfB0165?: string; // 销售发货单号
      FHeadSelfS0193?: string; // 合同号
      FWLCompany?: string; // 物流公司

    };
    Entry: Array<WarehouseEntry>;
  };
}

export interface WarehouseTransferPayload {
  Object: {
    Head: {
      FBillerID: number;
      FBillNo: string;
      FCheckDate: string;
      FCheckerID: number;
      Fdate: string;
      FDeptID: number;
      FFManagerID: number;
      FManageType: number;
      FMultiCheckStatus: string;
      FPosterID: number;
      FSManagerID: number;
      FTranType: number;
      FROB: number;
    };
    Entry: Array<{
      Famount: number;
      FAuxPropID: number;
      Fauxqty: number;
      FAuxQtyMust: number;
      FBatchNo: string;
      FDCSPID: number;
      FDCStockID: number;
      FEntryID: number;
      FICMOBillNo: string;
      FICMOInterID: number;
      FItemID: number;
      FKFDate: string;
      FKFPeriod: number;
      FMTONo: string;
      Fnote: string;
      FPeriodDate: string;
      FPlanAmount: number;
      FPlanMode: number;
      FPPBomEntryID: number;
      FQty: number;
      FQtyMust: number;
      FSecCoefficient: number;
      FSecQty: number;
      FSnList: Array<{
        FSerialNum: string;
        FSerialDesc: string;
      }>;
      FSourceBillNo: string;
      FSourceEntryID: number;
      FSourceInterId: number;
      FSourceTranType: number;
      FUnitID: number;
    }>;
  };
}

interface ApiResponse<T> {
  errorCode: number;
  description: string;
  data: T;
}

interface WarehouseResponseData {
  FID: number;
  FBillNo: string;
}

class KisInventoryOperationAPI {
  private api!: KingdeeSDK;

  constructor(api: KingdeeSDK) {
    this.api = api;
  }

  // Utility function to pause execution
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry mechanism for API requests
  private async retryApiRequest<T>(url: string, payload: object, retries: number = 1): Promise<ApiResponse<T>> {
    let attempts = 0;
    const response = await this.api.PostResourceRequest(url, payload, true);
    let lastResponse: ApiResponse<T> = response.data as ApiResponse<T>;
    
    while (attempts < retries) {
      if (lastResponse.errorCode === 0) {
        return lastResponse;
      }
      console.log(`API request failed (attempt ${attempts + 1}):`, payload, response.data);
      attempts += 1;
      await this.sleep(2000); // Wait before retrying
      
      const retryResponse = await this.api.PostResourceRequest(url, payload, true);
      lastResponse = retryResponse.data as ApiResponse<T>;
    }
    
    return lastResponse;
  }

  // 产成品入库单
  public async createProductReceipt(payload: WarehousePayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/productreceipt/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }

  // 生产领料单
  public async createPickingList(payload: WarehousePayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/pickinglist/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }

  // 外购入库单
  public async createPurchaseReceipt(payload: WarehousePayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/purchasereceipt/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }

  // 销售出库单
  public async createSalesDelivery(payload: WarehousePayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/salesdelivery/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }

  // 调拨单
  public async createStockTransfer(payload: WarehouseTransferPayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/stocktransfer/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }

  // 委外加工入库单
  public async createSubcontractReceipt(payload: WarehousePayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/subcontractreceipt/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }

  // 委外加工出库单
  public async createSubcontractdelivery(payload: WarehousePayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/subcontractdelivery/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }


  // 其他入库
  public async createMiscellaneousReceipt(payload: WarehousePayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/miscellaneousreceipt/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }

  // 其他出库
  public async createMiscellaneousDelivery(payload: WarehousePayload): Promise<ApiResponse<WarehouseResponseData>> {
    const url = "/koas/app007104/api/miscellaneousdelivery/create";
    return await this.retryApiRequest<WarehouseResponseData>(url, payload);
  }


}

export default KisInventoryOperationAPI;
