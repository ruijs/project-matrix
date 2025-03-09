import type { RapidDataDictionary as TRapidDataDictionary } from '@ruiapp/rapid-extension';
import ActiveInactiveState from '../models/data-dictionaries/ActiveInactiveState';
import ApprovalState from '../models/data-dictionaries/ApprovalState';
import BaseLocationType from '../models/data-dictionaries/BaseLocationType';
import BaseLotState from '../models/data-dictionaries/BaseLotState';
import BusinessActivityKind from '../models/data-dictionaries/BusinessActivityKind';
import BusinessActivityState from '../models/data-dictionaries/BusinessActivityState';
import BusinessApplicationState from '../models/data-dictionaries/BusinessApplicationState';
import BusinessInstanceState from '../models/data-dictionaries/BusinessInstanceState';
import BusinessProcessState from '../models/data-dictionaries/BusinessProcessState';
import BusinessTaskState from '../models/data-dictionaries/BusinessTaskState';
import CbsContractKind from '../models/data-dictionaries/CbsContractKind';
import CbsContractState from '../models/data-dictionaries/CbsContractState';
import CbsOrderKind from '../models/data-dictionaries/CbsOrderKind';
import CbsOrderState from '../models/data-dictionaries/CbsOrderState';
import ConfirmationState from '../models/data-dictionaries/ConfirmationState';
import DataDictionaryValueType from '../models/data-dictionaries/DataDictionaryValueType';
import DocumentType from '../models/data-dictionaries/DocumentType';
import EmployeeState from '../models/data-dictionaries/EmployeeState';
import EnabledDisabledState from '../models/data-dictionaries/EnabledDisabledState';
import FinTransactionType from '../models/data-dictionaries/FinTransactionType';
import FormFieldType from '../models/data-dictionaries/FormFieldType';
import InspectionDetermineType from '../models/data-dictionaries/InspectionDetermineType';
import InspectionKind from '../models/data-dictionaries/InspectionKind';
import InspectionResult from '../models/data-dictionaries/InspectionResult';
import MaterialSourceType from '../models/data-dictionaries/MaterialSourceType';
import MetaDataDictionaryLevel from '../models/data-dictionaries/MetaDataDictionaryLevel';
import MetaPropertyType from '../models/data-dictionaries/MetaPropertyType';
import MetaRouteHttpMethod from '../models/data-dictionaries/MetaRouteHttpMethod';
import MetaRouteType from '../models/data-dictionaries/MetaRouteType';
import MomApplicationSource from '../models/data-dictionaries/MomApplicationSource';
import MomEquipmentPowerState from '../models/data-dictionaries/MomEquipmentPowerState';
import MomEquipmentProductionState from '../models/data-dictionaries/MomEquipmentProductionState';
import MomGoodState from '../models/data-dictionaries/MomGoodState';
import MomInspectionSheetState from '../models/data-dictionaries/MomInspectionSheetState';
import MomInspectionSheetTreatment from '../models/data-dictionaries/MomInspectionSheetTreatment';
import MomInventoryOperationState from '../models/data-dictionaries/MomInventoryOperationState';
import MomInventoryOperationType from '../models/data-dictionaries/MomInventoryOperationType';
import MomMpsExecutionState from '../models/data-dictionaries/MomMpsExecutionState';
import MomMpsScheduleState from '../models/data-dictionaries/MomMpsScheduleState';
import MomMrpExecutionState from '../models/data-dictionaries/MomMrpExecutionState';
import MomMrpPlanningState from '../models/data-dictionaries/MomMrpPlanningState';
import MomPackageGoodState from '../models/data-dictionaries/MomPackageGoodState';
import MomWorkOrderAssignmentState from '../models/data-dictionaries/MomWorkOrderAssignmentState';
import MomWorkOrderExecutionState from '../models/data-dictionaries/MomWorkOrderExecutionState';
import MomWorkTaskAssignmentState from '../models/data-dictionaries/MomWorkTaskAssignmentState';
import MomWorkTaskExecutionState from '../models/data-dictionaries/MomWorkTaskExecutionState';
import MomWorkTrackAssignmentState from '../models/data-dictionaries/MomWorkTrackAssignmentState';
import MomWorkTrackExecutionState from '../models/data-dictionaries/MomWorkTrackExecutionState';
import PmBudgetType from '../models/data-dictionaries/PmBudgetType';
import PmMilestoneState from '../models/data-dictionaries/PmMilestoneState';
import PmPhaseState from '../models/data-dictionaries/PmPhaseState';
import PmProjectStage from '../models/data-dictionaries/PmProjectStage';
import PmProjectState from '../models/data-dictionaries/PmProjectState';
import PmWorkItemState from '../models/data-dictionaries/PmWorkItemState';
import PmWorkItemStepState from '../models/data-dictionaries/PmWorkItemStepState';
import PrintTaskState from '../models/data-dictionaries/PrintTaskState';
import PrinterNetworkState from '../models/data-dictionaries/PrinterNetworkState';
import PublishState from '../models/data-dictionaries/PublishState';
import QualificationState from '../models/data-dictionaries/QualificationState';
import QualitativeInspectionDetermineType from '../models/data-dictionaries/QualitativeInspectionDetermineType';
import QuantityType from '../models/data-dictionaries/QuantityType';
import UndeletedDeletedState from '../models/data-dictionaries/UndeletedDeletedState';
import UnitType from '../models/data-dictionaries/UnitType';
import UserSecretLevel from '../models/data-dictionaries/UserSecretLevel';
import WarehouseStrategy from '../models/data-dictionaries/WarehouseStrategy';
import setting$SettingItemType from '../models/data-dictionaries/setting/SettingItemType';
import sys$SysAuditLogMethod from '../models/data-dictionaries/sys/SysAuditLogMethod';
import sys$SysAuditLogTarget from '../models/data-dictionaries/sys/SysAuditLogTarget';

export default [
  ActiveInactiveState,
  ApprovalState,
  BaseLocationType,
  BaseLotState,
  BusinessActivityKind,
  BusinessActivityState,
  BusinessApplicationState,
  BusinessInstanceState,
  BusinessProcessState,
  BusinessTaskState,
  CbsContractKind,
  CbsContractState,
  CbsOrderKind,
  CbsOrderState,
  ConfirmationState,
  DataDictionaryValueType,
  DocumentType,
  EmployeeState,
  EnabledDisabledState,
  FinTransactionType,
  FormFieldType,
  InspectionDetermineType,
  InspectionKind,
  InspectionResult,
  MaterialSourceType,
  MetaDataDictionaryLevel,
  MetaPropertyType,
  MetaRouteHttpMethod,
  MetaRouteType,
  MomApplicationSource,
  MomEquipmentPowerState,
  MomEquipmentProductionState,
  MomGoodState,
  MomInspectionSheetState,
  MomInspectionSheetTreatment,
  MomInventoryOperationState,
  MomInventoryOperationType,
  MomMpsExecutionState,
  MomMpsScheduleState,
  MomMrpExecutionState,
  MomMrpPlanningState,
  MomPackageGoodState,
  MomWorkOrderAssignmentState,
  MomWorkOrderExecutionState,
  MomWorkTaskAssignmentState,
  MomWorkTaskExecutionState,
  MomWorkTrackAssignmentState,
  MomWorkTrackExecutionState,
  PmBudgetType,
  PmMilestoneState,
  PmPhaseState,
  PmProjectStage,
  PmProjectState,
  PmWorkItemState,
  PmWorkItemStepState,
  PrintTaskState,
  PrinterNetworkState,
  PublishState,
  QualificationState,
  QualitativeInspectionDetermineType,
  QuantityType,
  UndeletedDeletedState,
  UnitType,
  UserSecretLevel,
  WarehouseStrategy,
  setting$SettingItemType,
  sys$SysAuditLogMethod,
  sys$SysAuditLogTarget,
] as TRapidDataDictionary[];
