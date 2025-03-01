import type { ServerOperation as TServerOperation } from '@ruiapp/rapid-core';
import inspection$uploadProductInspectionSheetImportFile from '../models/server-operations/inspection/uploadProductInspectionSheetImportFile';
import kis$getKisAccountAppList from '../models/server-operations/kis/getKisAccountAppList';
import kis$getKisServiceGateway from '../models/server-operations/kis/getKisServiceGateway';
import kis$getKisUserLoginStatus from '../models/server-operations/kis/getKisUserLoginStatus';
import kis$listKisAccounts from '../models/server-operations/kis/listKisAccounts';
import mom$calcMaterialRequirements from '../models/server-operations/mom/calcMaterialRequirements';
import mom$calcWorkOrderMaterialRequirements from '../models/server-operations/mom/calcWorkOrderMaterialRequirements';
import mom$createGoodTransferIn from '../models/server-operations/mom/createGoodTransferIn';
import mom$createInventoryApplicationItems from '../models/server-operations/mom/createInventoryApplicationItems';
import mom$createInventoryOperation from '../models/server-operations/mom/createInventoryOperation';
import mom$deleteGoodInTransfers from '../models/server-operations/mom/deleteGoodInTransfers';
import mom$downloadInspectSheet from '../models/server-operations/mom/downloadInspectSheet';
import mom$exportExcel from '../models/server-operations/mom/exportExcel';
import mom$handleKisOperation from '../models/server-operations/mom/handleKisOperation';
import mom$listGoodCheckTransfer from '../models/server-operations/mom/listGoodCheckTransfer';
import mom$listGoodInTransfer from '../models/server-operations/mom/listGoodInTransfer';
import mom$listGoodOutTransfer from '../models/server-operations/mom/listGoodOutTransfer';
import mom$listGoodsByInspectRule from '../models/server-operations/mom/listGoodsByInspectRule';
import mom$listInventoryCheckTransfer from '../models/server-operations/mom/listInventoryCheckTransfer';
import mom$listInventoryOperationCount from '../models/server-operations/mom/listInventoryOperationCount';
import mom$listMaterialInspections from '../models/server-operations/mom/listMaterialInspections';
import mom$listRawMaterialInspections from '../models/server-operations/mom/listRawMaterialInspections';
import mom$mergeGoods from '../models/server-operations/mom/mergeGoods';
import mom$queryLocation from '../models/server-operations/mom/queryLocation';
import mom$refreshToken from '../models/server-operations/mom/refreshToken';
import mom$splitGoods from '../models/server-operations/mom/splitGoods';
import mom$submitGoodCheckedTransfers from '../models/server-operations/mom/submitGoodCheckedTransfers';
import mom$submitGoodInTransfers from '../models/server-operations/mom/submitGoodInTransfers';
import mom$submitGoodOutTransfers from '../models/server-operations/mom/submitGoodOutTransfers';
import mom$submitMrpResult from '../models/server-operations/mom/submitMrpResult';
import mom$submitWorkOrderMrpResult from '../models/server-operations/mom/submitWorkOrderMrpResult';
import notification$readAllNotifications from '../models/server-operations/notification/readAllNotifications';
import sys$listMyAllowedSysActions from '../models/server-operations/sys/listMyAllowedSysActions';

export default [
  inspection$uploadProductInspectionSheetImportFile,
  kis$getKisAccountAppList,
  kis$getKisServiceGateway,
  kis$getKisUserLoginStatus,
  kis$listKisAccounts,
  mom$calcMaterialRequirements,
  mom$calcWorkOrderMaterialRequirements,
  mom$createGoodTransferIn,
  mom$createInventoryApplicationItems,
  mom$createInventoryOperation,
  mom$deleteGoodInTransfers,
  mom$downloadInspectSheet,
  mom$exportExcel,
  mom$handleKisOperation,
  mom$listGoodCheckTransfer,
  mom$listGoodInTransfer,
  mom$listGoodOutTransfer,
  mom$listGoodsByInspectRule,
  mom$listInventoryCheckTransfer,
  mom$listInventoryOperationCount,
  mom$listMaterialInspections,
  mom$listRawMaterialInspections,
  mom$mergeGoods,
  mom$queryLocation,
  mom$refreshToken,
  mom$splitGoods,
  mom$submitGoodCheckedTransfers,
  mom$submitGoodInTransfers,
  mom$submitGoodOutTransfers,
  mom$submitMrpResult,
  mom$submitWorkOrderMrpResult,
  notification$readAllNotifications,
  sys$listMyAllowedSysActions,
] as TServerOperation[];
