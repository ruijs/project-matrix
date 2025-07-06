import type { ServerOperation as TServerOperation } from '@ruiapp/rapid-core';
import mom$calcMaterialRequirements from '../models/server-operations/mom/calcMaterialRequirements';
import mom$calcWorkOrderMaterialRequirements from '../models/server-operations/mom/calcWorkOrderMaterialRequirements';
import mom$createGoodTransferIn from '../models/server-operations/mom/createGoodTransferIn';
import mom$createInventoryApplicationItems from '../models/server-operations/mom/createInventoryApplicationItems';
import mom$createInventoryOperation from '../models/server-operations/mom/createInventoryOperation';
import mom$dingtalkCallback from '../models/server-operations/mom/dingtalkCallback';
import mom$downloadInspectSheet from '../models/server-operations/mom/downloadInspectSheet';
import mom$exportExcel from '../models/server-operations/mom/exportExcel';
import mom$fix from '../models/server-operations/mom/fix';
import mom$iotCallback from '../models/server-operations/mom/iotCallback';
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
import mom$splitGoods from '../models/server-operations/mom/splitGoods';
import mom$submitFinishedWorkReports from '../models/server-operations/mom/submitFinishedWorkReports';
import mom$submitGoodCheckedTransfers from '../models/server-operations/mom/submitGoodCheckedTransfers';
import mom$submitGoodInTransfers from '../models/server-operations/mom/submitGoodInTransfers';
import mom$submitGoodOutTransfers from '../models/server-operations/mom/submitGoodOutTransfers';
import mom$submitMrpResult from '../models/server-operations/mom/submitMrpResult';
import mom$submitWorkOrderMrpResult from '../models/server-operations/mom/submitWorkOrderMrpResult';
import mom$test from '../models/server-operations/mom/test';
import notification$readAllNotifications from '../models/server-operations/notification/readAllNotifications';
import shopfloor$bootstrap from '../models/server-operations/shopfloor/bootstrap';
import sys$listMyAllowedSysActions from '../models/server-operations/sys/listMyAllowedSysActions';

export default [
  mom$calcMaterialRequirements,
  mom$calcWorkOrderMaterialRequirements,
  mom$createGoodTransferIn,
  mom$createInventoryApplicationItems,
  mom$createInventoryOperation,
  mom$dingtalkCallback,
  mom$downloadInspectSheet,
  mom$exportExcel,
  mom$fix,
  mom$iotCallback,
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
  mom$splitGoods,
  mom$submitFinishedWorkReports,
  mom$submitGoodCheckedTransfers,
  mom$submitGoodInTransfers,
  mom$submitGoodOutTransfers,
  mom$submitMrpResult,
  mom$submitWorkOrderMrpResult,
  mom$test,
  notification$readAllNotifications,
  shopfloor$bootstrap,
  sys$listMyAllowedSysActions,
] as TServerOperation[];
