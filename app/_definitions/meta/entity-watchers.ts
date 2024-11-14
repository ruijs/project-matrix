import type { EntityWatcherType as TEntityWatcherType } from '@ruiapp/rapid-core';
import bpm$BpmInstanceEntityWatchers from '../models/entity-watchers/bpm/BpmInstanceEntityWatchers';
import cbs$CbsOrderItemWatchers from '../models/entity-watchers/cbs/CbsOrderItemWatchers';
import cbs$CbsOrderWatchers from '../models/entity-watchers/cbs/CbsOrderWatchers';
import mom$HuateWarehouseOperation from '../models/entity-watchers/mom/HuateWarehouseOperation';
import mom$MomGoodTransfer from '../models/entity-watchers/mom/MomGoodTransfer';
import mom$MomInspectionCharacteristic from '../models/entity-watchers/mom/MomInspectionCharacteristic';
import mom$MomInspectionMeasurement from '../models/entity-watchers/mom/MomInspectionMeasurement';
import mom$MomInspectionRule from '../models/entity-watchers/mom/MomInspectionRule';
import mom$MomInspectionSheet from '../models/entity-watchers/mom/MomInspectionSheet';
import mom$MomInspectionSheetSample from '../models/entity-watchers/mom/MomInspectionSheetSample';
import mom$MomInventoryApplication from '../models/entity-watchers/mom/MomInventoryApplication';
import mom$MomInventoryMaterial from '../models/entity-watchers/mom/MomInventoryMaterial';
import mom$MomInventoryOperation from '../models/entity-watchers/mom/MomInventoryOperation';
import mom$MomMaterialLot from '../models/entity-watchers/mom/MomMaterialLot';
import mom$MomTransportOperation from '../models/entity-watchers/mom/MomTransportOperation';
import mom$MomWorkFeed from '../models/entity-watchers/mom/MomWorkFeed';
import mom$MomWorkFeedTask from '../models/entity-watchers/mom/MomWorkFeedTask';
import mom$MomWorkOrder from '../models/entity-watchers/mom/MomWorkOrder';
import mom$MomWorkReport from '../models/entity-watchers/mom/MomWorkReport';
import mom$MomWorkReportMeasurments from '../models/entity-watchers/mom/MomWorkReportMeasurments';
import mom$MomWorkTask from '../models/entity-watchers/mom/MomWorkTask';

export default [
  ...bpm$BpmInstanceEntityWatchers,
  ...cbs$CbsOrderItemWatchers,
  ...cbs$CbsOrderWatchers,
  ...mom$HuateWarehouseOperation,
  ...mom$MomGoodTransfer,
  ...mom$MomInspectionCharacteristic,
  ...mom$MomInspectionMeasurement,
  ...mom$MomInspectionRule,
  ...mom$MomInspectionSheet,
  ...mom$MomInspectionSheetSample,
  ...mom$MomInventoryApplication,
  ...mom$MomInventoryMaterial,
  ...mom$MomInventoryOperation,
  ...mom$MomMaterialLot,
  ...mom$MomTransportOperation,
  ...mom$MomWorkFeed,
  ...mom$MomWorkFeedTask,
  ...mom$MomWorkOrder,
  ...mom$MomWorkReport,
  ...mom$MomWorkReportMeasurments,
  ...mom$MomWorkTask,
] as TEntityWatcherType[];
