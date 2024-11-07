import type { RapidPageLoader as TRapidPageLoader } from '@ruiapp/rapid-extension';
import AppNavItemListPage from '../models/pages/AppNavItemListPage';
import BaseEmployeeListPage from '../models/pages/BaseEmployeeListPage';
import BaseFormFieldListPage from '../models/pages/BaseFormFieldListPage';
import BaseLocationListPage from '../models/pages/BaseLocationListPage';
import BaseMaterialCategoryListPage from '../models/pages/BaseMaterialCategoryListPage';
import BaseMaterialDetailsPage from '../models/pages/BaseMaterialDetailsPage';
import BaseMaterialListPage from '../models/pages/BaseMaterialListPage';
import BasePartnerCategoryListPage from '../models/pages/BasePartnerCategoryListPage';
import BasePartnerListPage from '../models/pages/BasePartnerListPage';
import BaseUnitListPage from '../models/pages/BaseUnitListPage';
import CbsContractDetailsPage from '../models/pages/CbsContractDetailsPage';
import CbsContractListPage from '../models/pages/CbsContractListPage';
import CbsContractRelationKindListPage from '../models/pages/CbsContractRelationKindListPage';
import CbsOrderDetailsPage from '../models/pages/CbsOrderDetailsPage';
import CbsOrderListPage from '../models/pages/CbsOrderListPage';
import DataDictionaryListPage from '../models/pages/DataDictionaryListPage';
import FinAccountListPage from '../models/pages/FinAccountListPage';
import FinBusinessCategoryListPage from '../models/pages/FinBusinessCategoryListPage';
import FinExpenseCategoryListPage from '../models/pages/FinExpenseCategoryListPage';
import FinTransactionListPage from '../models/pages/FinTransactionListPage';
import HomePage from '../models/pages/HomePage';
import HuateGCMSListPage from '../models/pages/HuateGCMSListPage';
import HuateWarehouseOperationListPage from '../models/pages/HuateWarehouseOperationListPage';
import MomEquipmentCategoryDetailPage from '../models/pages/MomEquipmentCategoryDetailPage';
import MomEquipmentCategoryListPage from '../models/pages/MomEquipmentCategoryListPage';
import MomEquipmentListPage from '../models/pages/MomEquipmentListPage';
import MomFactoryListPage from '../models/pages/MomFactoryListPage';
import MomGoodListPage from '../models/pages/MomGoodListPage';
import MomGoodLocationListPage from '../models/pages/MomGoodLocationListPage';
import MomInspectionSamplingDetailPage from '../models/pages/MomInspectionSamplingDetailPage';
import MomInspectionSamplingListPage from '../models/pages/MomInspectionSamplingListPage';
import MomInventoryAdjustApplicationDetailsPage from '../models/pages/MomInventoryAdjustApplicationDetailsPage';
import MomInventoryAdjustApplicationListPage from '../models/pages/MomInventoryAdjustApplicationListPage';
import MomInventoryAdjustOperationDetailsPage from '../models/pages/MomInventoryAdjustOperationDetailsPage';
import MomInventoryAdjustOperationListPage from '../models/pages/MomInventoryAdjustOperationListPage';
import MomInventoryApplicationDetailsPage from '../models/pages/MomInventoryApplicationDetailsPage';
import MomInventoryApplicationFormPage from '../models/pages/MomInventoryApplicationFormPage';
import MomInventoryApplicationListPage from '../models/pages/MomInventoryApplicationListPage';
import MomInventoryBusinessTypeListPage from '../models/pages/MomInventoryBusinessTypeListPage';
import MomInventoryInOperationDetailsPage from '../models/pages/MomInventoryInOperationDetailsPage';
import MomInventoryListPage from '../models/pages/MomInventoryListPage';
import MomInventoryNormalOperationDetailsPage from '../models/pages/MomInventoryNormalOperationDetailsPage';
import MomInventoryNormalOperationListPage from '../models/pages/MomInventoryNormalOperationListPage';
import MomInventoryOperationFormPage from '../models/pages/MomInventoryOperationFormPage';
import MomInventoryOperationListPage from '../models/pages/MomInventoryOperationListPage';
import MomInventoryOrganizeOperationListPage from '../models/pages/MomInventoryOrganizeOperationListPage';
import MomInventoryOutOperationDetailsPage from '../models/pages/MomInventoryOutOperationDetailsPage';
import MomInventorySearchListPage from '../models/pages/MomInventorySearchListPage';
import MomInventoryStatTableListPage from '../models/pages/MomInventoryStatTableListPage';
import MomInventoryStatTriggerListPage from '../models/pages/MomInventoryStatTriggerListPage';
import MomInventoryTransferApplicationDetailsPage from '../models/pages/MomInventoryTransferApplicationDetailsPage';
import MomInventoryTransferApplicationListPage from '../models/pages/MomInventoryTransferApplicationListPage';
import MomMaterialInventoryBalanceListPage from '../models/pages/MomMaterialInventoryBalanceListPage';
import MomMaterialInventoryListPage from '../models/pages/MomMaterialInventoryListPage';
import MomMaterialLotInventoryListPage from '../models/pages/MomMaterialLotInventoryListPage';
import MomMaterialLotListPage from '../models/pages/MomMaterialLotListPage';
import MomMpsDetailsPage from '../models/pages/MomMpsDetailsPage';
import MomMpsListPage from '../models/pages/MomMpsListPage';
import MomMrpDetailsPage from '../models/pages/MomMrpDetailsPage';
import MomMrpListPage from '../models/pages/MomMrpListPage';
import MomPrintTemplateListPage from '../models/pages/MomPrintTemplateListPage';
import MomProcessCategoryListPage from '../models/pages/MomProcessCategoryListPage';
import MomProcessListPage from '../models/pages/MomProcessListPage';
import MomProdTaskDetailsPage from '../models/pages/MomProdTaskDetailsPage';
import MomProdTaskListPage from '../models/pages/MomProdTaskListPage';
import MomRouteProcessParameterDetailsPage from '../models/pages/MomRouteProcessParameterDetailsPage';
import MomRouteProcessParameterListPage from '../models/pages/MomRouteProcessParameterListPage';
import MomTransportOperationDetailsPage from '../models/pages/MomTransportOperationDetailsPage';
import MomTransportOperationListPage from '../models/pages/MomTransportOperationListPage';
import MomWarehouseListPage from '../models/pages/MomWarehouseListPage';
import MomWarehouseStrategyListPage from '../models/pages/MomWarehouseStrategyListPage';
import MomWorkOrderDetailsPage from '../models/pages/MomWorkOrderDetailsPage';
import MomWorkOrderListPage from '../models/pages/MomWorkOrderListPage';
import MomWorkOrderReportDetailsPage from '../models/pages/MomWorkOrderReportDetailsPage';
import OcDepartmentListPage from '../models/pages/OcDepartmentListPage';
import OcRoleDetailsPage from '../models/pages/OcRoleDetailsPage';
import OcRoleListPage from '../models/pages/OcRoleListPage';
import OcUserListPage from '../models/pages/OcUserListPage';
import ShopfloorAppDetailsPage from '../models/pages/ShopfloorAppDetailsPage';
import ShopfloorAppListPage from '../models/pages/ShopfloorAppListPage';
import ShopfloorDisplayDeviceDetailsPage from '../models/pages/ShopfloorDisplayDeviceDetailsPage';
import ShopfloorDisplayDeviceListPage from '../models/pages/ShopfloorDisplayDeviceListPage';
import ShopfloorStationListPage from '../models/pages/ShopfloorStationListPage';
import account$AccountChangePasswordPage from '../models/pages/account/AccountChangePasswordPage';
import account$AccountNotificationListPage from '../models/pages/account/AccountNotificationListPage';
import account$AccountProfilePage from '../models/pages/account/AccountProfilePage';
import bpm$BpmCcToMeApplicationListPage from '../models/pages/bpm/BpmCcToMeApplicationListPage';
import bpm$BpmInstanceDetailsPage from '../models/pages/bpm/BpmInstanceDetailsPage';
import bpm$BpmMyFinishedApprovalListPage from '../models/pages/bpm/BpmMyFinishedApprovalListPage';
import bpm$BpmMyInitiatedApplicationListPage from '../models/pages/bpm/BpmMyInitiatedApplicationListPage';
import bpm$BpmMyPendingApprovalListPage from '../models/pages/bpm/BpmMyPendingApprovalListPage';
import bpm$BpmProcessListPage from '../models/pages/bpm/BpmProcessListPage';
import inspection$Injection$MomInspectionInjectionSheetDetailsPage from '../models/pages/inspection/Injection/MomInspectionInjectionSheetDetailsPage';
import inspection$Injection$MomInspectionInjectionSheetList from '../models/pages/inspection/Injection/MomInspectionInjectionSheetList';
import inspection$MomInspectionCategoryListPage from '../models/pages/inspection/MomInspectionCategoryListPage';
import inspection$MomInspectionCharacteristicCategoryListPage from '../models/pages/inspection/MomInspectionCharacteristicCategoryListPage';
import inspection$MomInspectionCharacteristicListPage from '../models/pages/inspection/MomInspectionCharacteristicListPage';
import inspection$MomInspectionCustomerRuleDetailPage from '../models/pages/inspection/MomInspectionCustomerRuleDetailPage';
import inspection$MomInspectionCustomerRuleListPage from '../models/pages/inspection/MomInspectionCustomerRuleListPage';
import inspection$MomInspectionDefectCategoryListPage from '../models/pages/inspection/MomInspectionDefectCategoryListPage';
import inspection$MomInspectionDefectListPage from '../models/pages/inspection/MomInspectionDefectListPage';
import inspection$MomInspectionFeedStockList from '../models/pages/inspection/MomInspectionFeedStockList';
import inspection$MomInspectionFinishedStockList from '../models/pages/inspection/MomInspectionFinishedStockList';
import inspection$MomInspectionInputPage from '../models/pages/inspection/MomInspectionInputPage';
import inspection$MomInspectionInstrumentCategoryListPage from '../models/pages/inspection/MomInspectionInstrumentCategoryListPage';
import inspection$MomInspectionInstrumentListPage from '../models/pages/inspection/MomInspectionInstrumentListPage';
import inspection$MomInspectionMethodListPage from '../models/pages/inspection/MomInspectionMethodListPage';
import inspection$MomInspectionRuleDetailPage from '../models/pages/inspection/MomInspectionRuleDetailPage';
import inspection$MomInspectionRuleListPage from '../models/pages/inspection/MomInspectionRuleListPage';
import inspection$MomInspectionSheetDetailsPage from '../models/pages/inspection/MomInspectionSheetDetailsPage';
import inspection$MomInspectionSheetListPage from '../models/pages/inspection/MomInspectionSheetListPage';
import inspection$feedstock$MomFeedStockInspectionSheetDetailsPage from '../models/pages/inspection/feedstock/MomFeedStockInspectionSheetDetailsPage';
import inspection$feedstock$MomFeedStockInspectionSheetListPage from '../models/pages/inspection/feedstock/MomFeedStockInspectionSheetListPage';
import inspection$prilling$MomPrillingFeedStockInspectionSheetDetailsPage from '../models/pages/inspection/prilling/MomPrillingFeedStockInspectionSheetDetailsPage';
import inspection$prilling$MomPrillingFeedStockInspectionSheetList from '../models/pages/inspection/prilling/MomPrillingFeedStockInspectionSheetList';
import inspection$stockout$MomAssemblyStockOutInspectionSheetDetailsPage from '../models/pages/inspection/stockout/MomAssemblyStockOutInspectionSheetDetailsPage';
import inspection$stockout$MomAssemblyStockOutInspectionSheetList from '../models/pages/inspection/stockout/MomAssemblyStockOutInspectionSheetList';
import inspection$stockout$MomPrilingStockOutInspectionSheetDetailsPage from '../models/pages/inspection/stockout/MomPrilingStockOutInspectionSheetDetailsPage';
import inspection$stockout$MomPrilingStockOutInspectionSheetList from '../models/pages/inspection/stockout/MomPrilingStockOutInspectionSheetList';
import inspection$stockout$MomStockOutInspectionSheetDetailsPage from '../models/pages/inspection/stockout/MomStockOutInspectionSheetDetailsPage';
import inspection$stockout$MomStockOutInspectionSheetListPage from '../models/pages/inspection/stockout/MomStockOutInspectionSheetListPage';
import meta$MetaDataDictionaryListPage from '../models/pages/meta/MetaDataDictionaryListPage';
import meta$MetaModelDataPage from '../models/pages/meta/MetaModelDataPage';
import meta$MetaModelDetailsPage from '../models/pages/meta/MetaModelDetailsPage';
import meta$MetaModelListPage from '../models/pages/meta/MetaModelListPage';
import meta$MetaRouteListPage from '../models/pages/meta/MetaRouteListPage';
import pm$PmProjectCategoryListPage from '../models/pages/pm/PmProjectCategoryListPage';
import pm$PmProjectDetailsPage from '../models/pages/pm/PmProjectDetailsPage';
import pm$PmProjectEventListPage from '../models/pages/pm/PmProjectEventListPage';
import pm$PmProjectListPage from '../models/pages/pm/PmProjectListPage';
import pm$PmProjectSettingsPage from '../models/pages/pm/PmProjectSettingsPage';
import pm$PmProjectWorkItemTypeSettingsPage from '../models/pages/pm/PmProjectWorkItemTypeSettingsPage';
import pm$PmWorkItemDetailsPage from '../models/pages/pm/PmWorkItemDetailsPage';
import pm$PmWorkItemListPage from '../models/pages/pm/PmWorkItemListPage';
import pm$PmWorkItemResolutionListPage from '../models/pages/pm/PmWorkItemResolutionListPage';
import pm$PmWorkItemTypeDetailsPage from '../models/pages/pm/PmWorkItemTypeDetailsPage';
import pm$PmWorkItemTypeListPage from '../models/pages/pm/PmWorkItemTypeListPage';
import prod$cc$MomProdCcDetailsPage from '../models/pages/prod/cc/MomProdCcDetailsPage';
import prod$cc$MomProdCcSheetList from '../models/pages/prod/cc/MomProdCcSheetList';
import prod$hg$MomProdHgDetailsPage from '../models/pages/prod/hg/MomProdHgDetailsPage';
import prod$hg$MomProdHgSheetList from '../models/pages/prod/hg/MomProdHgSheetList';
import prod$sy$MomProdSyDetailsPage from '../models/pages/prod/sy/MomProdSyDetailsPage';
import prod$sy$MomProdSySheetList from '../models/pages/prod/sy/MomProdSySheetList';
import prod$tys$MomProdTysDetailsPage from '../models/pages/prod/tys/MomProdTysDetailsPage';
import prod$tys$MomProdTysSheetList from '../models/pages/prod/tys/MomProdTysSheetList';
import prod$xzy$MomProdXzyDetailsPage from '../models/pages/prod/xzy/MomProdXzyDetailsPage';
import prod$xzy$MomProdXzySheetList from '../models/pages/prod/xzy/MomProdXzySheetList';
import setting$SystemSettingItemSettingPage from '../models/pages/setting/SystemSettingItemSettingPage';
import setting$SystemSettingsPage from '../models/pages/setting/SystemSettingsPage';
import sys$SysActionListPage from '../models/pages/sys/SysActionListPage';
import sys$SysAuditLogkListPage from '../models/pages/sys/SysAuditLogkListPage';
import sys$SysPrinterListPage from '../models/pages/sys/SysPrinterListPage';
import sys$SysSubSystemListPage from '../models/pages/sys/SysSubSystemListPage';
import sys$SysWebhookListPage from '../models/pages/sys/SysWebhookListPage';

export default [
  AppNavItemListPage,
  BaseEmployeeListPage,
  BaseFormFieldListPage,
  BaseLocationListPage,
  BaseMaterialCategoryListPage,
  BaseMaterialDetailsPage,
  BaseMaterialListPage,
  BasePartnerCategoryListPage,
  BasePartnerListPage,
  BaseUnitListPage,
  CbsContractDetailsPage,
  CbsContractListPage,
  CbsContractRelationKindListPage,
  CbsOrderDetailsPage,
  CbsOrderListPage,
  DataDictionaryListPage,
  FinAccountListPage,
  FinBusinessCategoryListPage,
  FinExpenseCategoryListPage,
  FinTransactionListPage,
  HomePage,
  HuateGCMSListPage,
  HuateWarehouseOperationListPage,
  MomEquipmentCategoryDetailPage,
  MomEquipmentCategoryListPage,
  MomEquipmentListPage,
  MomFactoryListPage,
  MomGoodListPage,
  MomGoodLocationListPage,
  MomInspectionSamplingDetailPage,
  MomInspectionSamplingListPage,
  MomInventoryAdjustApplicationDetailsPage,
  MomInventoryAdjustApplicationListPage,
  MomInventoryAdjustOperationDetailsPage,
  MomInventoryAdjustOperationListPage,
  MomInventoryApplicationDetailsPage,
  MomInventoryApplicationFormPage,
  MomInventoryApplicationListPage,
  MomInventoryBusinessTypeListPage,
  MomInventoryInOperationDetailsPage,
  MomInventoryListPage,
  MomInventoryNormalOperationDetailsPage,
  MomInventoryNormalOperationListPage,
  MomInventoryOperationFormPage,
  MomInventoryOperationListPage,
  MomInventoryOrganizeOperationListPage,
  MomInventoryOutOperationDetailsPage,
  MomInventorySearchListPage,
  MomInventoryStatTableListPage,
  MomInventoryStatTriggerListPage,
  MomInventoryTransferApplicationDetailsPage,
  MomInventoryTransferApplicationListPage,
  MomMaterialInventoryBalanceListPage,
  MomMaterialInventoryListPage,
  MomMaterialLotInventoryListPage,
  MomMaterialLotListPage,
  MomMpsDetailsPage,
  MomMpsListPage,
  MomMrpDetailsPage,
  MomMrpListPage,
  MomPrintTemplateListPage,
  MomProcessCategoryListPage,
  MomProcessListPage,
  MomProdTaskDetailsPage,
  MomProdTaskListPage,
  MomRouteProcessParameterDetailsPage,
  MomRouteProcessParameterListPage,
  MomTransportOperationDetailsPage,
  MomTransportOperationListPage,
  MomWarehouseListPage,
  MomWarehouseStrategyListPage,
  MomWorkOrderDetailsPage,
  MomWorkOrderListPage,
  MomWorkOrderReportDetailsPage,
  OcDepartmentListPage,
  OcRoleDetailsPage,
  OcRoleListPage,
  OcUserListPage,
  ShopfloorAppDetailsPage,
  ShopfloorAppListPage,
  ShopfloorDisplayDeviceDetailsPage,
  ShopfloorDisplayDeviceListPage,
  ShopfloorStationListPage,
  account$AccountChangePasswordPage,
  account$AccountNotificationListPage,
  account$AccountProfilePage,
  bpm$BpmCcToMeApplicationListPage,
  bpm$BpmInstanceDetailsPage,
  bpm$BpmMyFinishedApprovalListPage,
  bpm$BpmMyInitiatedApplicationListPage,
  bpm$BpmMyPendingApprovalListPage,
  bpm$BpmProcessListPage,
  inspection$Injection$MomInspectionInjectionSheetDetailsPage,
  inspection$Injection$MomInspectionInjectionSheetList,
  inspection$MomInspectionCategoryListPage,
  inspection$MomInspectionCharacteristicCategoryListPage,
  inspection$MomInspectionCharacteristicListPage,
  inspection$MomInspectionCustomerRuleDetailPage,
  inspection$MomInspectionCustomerRuleListPage,
  inspection$MomInspectionDefectCategoryListPage,
  inspection$MomInspectionDefectListPage,
  inspection$MomInspectionFeedStockList,
  inspection$MomInspectionFinishedStockList,
  inspection$MomInspectionInputPage,
  inspection$MomInspectionInstrumentCategoryListPage,
  inspection$MomInspectionInstrumentListPage,
  inspection$MomInspectionMethodListPage,
  inspection$MomInspectionRuleDetailPage,
  inspection$MomInspectionRuleListPage,
  inspection$MomInspectionSheetDetailsPage,
  inspection$MomInspectionSheetListPage,
  inspection$feedstock$MomFeedStockInspectionSheetDetailsPage,
  inspection$feedstock$MomFeedStockInspectionSheetListPage,
  inspection$prilling$MomPrillingFeedStockInspectionSheetDetailsPage,
  inspection$prilling$MomPrillingFeedStockInspectionSheetList,
  inspection$stockout$MomAssemblyStockOutInspectionSheetDetailsPage,
  inspection$stockout$MomAssemblyStockOutInspectionSheetList,
  inspection$stockout$MomPrilingStockOutInspectionSheetDetailsPage,
  inspection$stockout$MomPrilingStockOutInspectionSheetList,
  inspection$stockout$MomStockOutInspectionSheetDetailsPage,
  inspection$stockout$MomStockOutInspectionSheetListPage,
  meta$MetaDataDictionaryListPage,
  meta$MetaModelDataPage,
  meta$MetaModelDetailsPage,
  meta$MetaModelListPage,
  meta$MetaRouteListPage,
  pm$PmProjectCategoryListPage,
  pm$PmProjectDetailsPage,
  pm$PmProjectEventListPage,
  pm$PmProjectListPage,
  pm$PmProjectSettingsPage,
  pm$PmProjectWorkItemTypeSettingsPage,
  pm$PmWorkItemDetailsPage,
  pm$PmWorkItemListPage,
  pm$PmWorkItemResolutionListPage,
  pm$PmWorkItemTypeDetailsPage,
  pm$PmWorkItemTypeListPage,
  prod$cc$MomProdCcDetailsPage,
  prod$cc$MomProdCcSheetList,
  prod$hg$MomProdHgDetailsPage,
  prod$hg$MomProdHgSheetList,
  prod$sy$MomProdSyDetailsPage,
  prod$sy$MomProdSySheetList,
  prod$tys$MomProdTysDetailsPage,
  prod$tys$MomProdTysSheetList,
  prod$xzy$MomProdXzyDetailsPage,
  prod$xzy$MomProdXzySheetList,
  setting$SystemSettingItemSettingPage,
  setting$SystemSettingsPage,
  sys$SysActionListPage,
  sys$SysAuditLogkListPage,
  sys$SysPrinterListPage,
  sys$SysSubSystemListPage,
  sys$SysWebhookListPage,
] as TRapidPageLoader[];
