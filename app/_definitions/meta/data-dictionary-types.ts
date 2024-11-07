/**
 * 活跃/不活跃状态
 */
export type ActiveInactiveState =
  | 'active'
  | 'inactive'
  ;

/**
 * 审批状态
 */
export type ApprovalState =
  | 'uninitiated'
  | 'approving'
  | 'approved'
  | 'rejected'
  | 'canceled'
  ;

/**
 * 地点类型
 */
export type BaseLocationType =
  | 'factory'
  | 'building'
  | 'shop'
  | 'warehouse'
  | 'warehouseArea'
  | 'storageArea'
  | 'office'
  | 'lab'
  | 'gate'
  | 'other'
  ;

/**
 * 物品状态
 */
export type BaseLotState =
  | 'normal'
  | 'destroyed'
  | 'pending'
  | 'return'
  ;

/**
 * 业务活动类型
 */
export type BusinessActivityKind =
  | 'approval'
  | 'form'
  | 'comment'
  ;

/**
 * 流程活动状态
 */
export type BusinessActivityState =
  | 'pending'
  | 'finished'
  | 'canceled'
  ;

/**
 * 业务申请状态
 */
export type BusinessApplicationState =
  | 'draft'
  | 'approving'
  | 'approved'
  | 'rejected'
  | 'canceled'
  ;

/**
 * 流程实例状态
 */
export type BusinessInstanceState =
  | 'draft'
  | 'processing'
  | 'finished'
  | 'canceled'
  ;

/**
 * 流程定义状态
 */
export type BusinessProcessState =
  | 'draft'
  | 'approving'
  | 'published'
  | 'disabled'
  | 'archived'
  ;

/**
 * 流程任务状态
 */
export type BusinessTaskState =
  | 'pending'
  | 'finished'
  | 'canceled'
  ;

/**
 * 合同类型
 */
export type CbsContractKind =
  | 'sale'
  | 'purchase'
  | 'special'
  ;

/**
 * 合同状态
 */
export type CbsContractState =
  | 'unsigned'
  | 'fulfilling'
  | 'fulfilled'
  | 'suspended'
  | 'cancelled'
  ;

/**
 * 订单类型
 */
export type CbsOrderKind =
  | 'sale'
  | 'purchase'
  ;

/**
 * 订单状态
 */
export type CbsOrderState =
  | 'unsigned'
  | 'fulfilling'
  | 'fulfilled'
  | 'suspended'
  | 'cancelled'
  ;

/**
 * 确认状态
 */
export type ConfirmationState =
  | 'unconfirmed'
  | 'confirmed'
  ;

/**
 * 字典值类型
 */
export type DataDictionaryValueType =
  | 'string'
  | 'integer'
  ;

/**
 * 文档类型
 */
export type DocumentType =
  | 'directory'
  | 'file'
  | 'link'
  ;

/**
 * 员工状态
 */
export type EmployeeState =
  | 'normal'
  | 'disabled'
  | 'quitted'
  ;

/**
 * 启用/禁用状态
 */
export type EnabledDisabledState =
  | 'enabled'
  | 'disabled'
  ;

/**
 * 转账类型
 */
export type FinTransactionType =
  | 'in'
  | 'out'
  ;

/**
 * 表单字段类型
 */
export type FormFieldType =
  | 'text'
  | 'long'
  | 'double'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'option'
  ;

/**
 * 判定方式
 */
export type InspectionDetermineType =
  | 'inTolerance'
  | 'inLimit'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'le'
  ;

/**
 * 检验条件
 */
export type InspectionKind =
  | 'qualitative'
  | 'quantitative'
  ;

/**
 * 检验结果
 */
export type InspectionResult =
  | 'inspectFree'
  | 'uninspected'
  | 'qualified'
  | 'unqualified'
  ;

/**
 * 物料来源类型
 */
export type MaterialSourceType =
  | 'selfMade'
  | 'purchased'
  | 'outsideProcessed'
  ;

/**
 * 数据字典级别
 */
export type DataDictionaryLevel =
  | 'sys'
  | 'app'
  | 'user'
  ;

/**
 * 实体属性类型
 */
export type PropertyType =
  | 'integer'
  | 'long'
  | 'float'
  | 'double'
  | 'text'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'json'
  | 'option'
  ;

/**
 * HTTP方法
 */
export type RouteHttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  ;

/**
 * 路由类型
 */
export type RouteType =
  | 'RESTful'
  ;

/**
 * 库存申请单来源
 */
export type MomApplicationSource =
  | 'kis'
  | 'manual'
  ;

/**
 * 设备电源状态
 */
export type MomEquipmentPowerState =
  | 'on'
  | 'off'
  ;

/**
 * 设备生产状态
 */
export type MomEquipmentProductionState =
  | 'idle'
  | 'commissioning'
  | 'processing'
  | 'fault'
  ;

/**
 * 物品状态
 */
export type MomGoodState =
  | 'normal'
  | 'splitted'
  | 'merged'
  | 'transferred'
  | 'destroied'
  | 'pending'
  ;

/**
 * 检验单状态
 */
export type MomInspectionSheetState =
  | 'pending'
  | 'inspecting'
  | 'inspected'
  ;

/**
 * 检验结果处理方式
 */
export type MomInspectionSheetTreatment =
  | 'special'
  | 'withdraw'
  | 'forced'
  ;

/**
 * 库存操作状态
 */
export type MomInventoryOperationState =
  | 'pending'
  | 'processing'
  | 'done'
  ;

/**
 * 库存操作类型
 */
export type MomInventoryOperationType =
  | 'in'
  | 'out'
  | 'transfer'
  | 'organize'
  | 'adjust'
  ;

/**
 * 主计划执行状态
 */
export type MomMpsExecutionState =
  | 'pending'
  | 'processing'
  | 'finished'
  | 'canceled'
  ;

/**
 * 主计划规划状态
 */
export type MomMpsScheduleState =
  | 'unscheduled'
  | 'scheduling'
  | 'scheduled'
  | 'canceled'
  ;

/**
 * 生产资源计划执行状态
 */
export type MomMrpExecutionState =
  | 'pending'
  | 'processing'
  | 'finished'
  | 'canceled'
  ;

/**
 * 生产资源计划规划状态
 */
export type MomMrpPlanningState =
  | 'unplanned'
  | 'planning'
  | 'planned'
  | 'canceled'
  ;

/**
 * 包内物品状态
 */
export type MomPackageGoodState =
  | 'packed'
  | 'unpacked'
  ;

/**
 * 工单分配状态
 */
export type MomWorkOrderAssignmentState =
  | 'unassigned'
  | 'assigning'
  | 'assigned'
  | 'canceled'
  ;

/**
 * 工单执行状态
 */
export type MomWorkOrderExecutionState =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'canceled'
  ;

/**
 * 工序任务分配状态
 */
export type MomWorkTaskAssignmentState =
  | 'unassigned'
  | 'assigning'
  | 'assigned'
  | 'canceled'
  ;

/**
 * 任务执行状态
 */
export type MomWorkTaskExecutionState =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'canceled'
  ;

/**
 * 流转单分配状态
 */
export type MomWorkTrackAssignmentState =
  | 'unassigned'
  | 'assigned'
  | 'canceled'
  ;

/**
 * 流转单执行状态
 */
export type MomWorkTrackExecutionState =
  | 'pending'
  | 'processing'
  | 'finished'
  | 'canceled'
  ;

/**
 * 预算类型
 */
export type PmBudgetType =
  | 'in'
  | 'out'
  ;

/**
 * 里程碑状态
 */
export type PmMilestoneState =
  | 'unplanned'
  | 'planned'
  | 'inProgress'
  | 'completed'
  | 'delayed'
  | 'cancelled'
  ;

/**
 * 项目阶段状态
 */
export type PmPhaseState =
  | 'unplanned'
  | 'planned'
  | 'inProgress'
  | 'completed'
  | 'delayed'
  | 'cancelled'
  ;

/**
 * 项目阶段
 */
export type PmProjectStage =
  | 'proposal'
  | 'initialization'
  | 'planning'
  | 'executing'
  | 'closing'
  | 'archived'
  ;

/**
 * 项目状态
 */
export type PmProjectState =
  | 'active'
  | 'suspended'
  | 'closed'
  ;

/**
 * 工作项状态
 */
export type PmWorkItemState =
  | 'pending'
  | 'wip'
  | 'completed'
  | 'closed'
  ;

/**
 * 工作项步骤状态
 */
export type PmWorkItemStepState =
  | 'pending'
  | 'wip'
  | 'completed'
  ;

/**
 * 打印任务状态
 */
export type PrintTaskState =
  | '0'
  | '1'
  | '2'
  ;

/**
 * 打印机网络状态
 */
export type PrinterNetworkState =
  | '0'
  | '1'
  ;

/**
 * 发布状态
 */
export type PublishState =
  | 'draft'
  | 'in_review'
  | 'published'
  | 'archived'
  | 'withdrawed'
  ;

/**
 * 质量状态
 */
export type QualificationState =
  | 'inspectFree'
  | 'uninspected'
  | 'qualified'
  | 'unqualified'
  ;

/**
 * 判定方式
 */
export type QualitativeInspectionDetermineType =
  | 'qualified'
  | 'yes'
  | 'done'
  | 'ok'
  | 'have'
  ;

/**
 * 物理量类型
 */
export type QuantityType =
  | 'time'
  | 'length'
  | 'mass'
  | 'electric_current'
  | 'temperature'
  | 'amount_of_substance'
  | 'luminous_intensity'
  ;

/**
 * 操作方法
 */
export type SysAuditLogMethod =
  | 'update'
  | 'delete'
  ;

/**
 * 操作对象
 */
export type SysAuditLogTarget =
  | 'base_material'
  | 'mom_inventory_application'
  | 'mom_inventory_operation'
  | 'mom_inspection_sheet'
  | 'mom_inspection_rule'
  | 'mom_inspection_characteristic'
  | 'mom_inspection_measurement'
  | 'mom_good_transfer'
  ;

/**
 * 未删除/已删除状态
 */
export type UndeletedDeletedState =
  | 'undeleted'
  | 'deleted'
  ;

/**
 * 单位类型
 */
export type UnitType =
  | 'quantity'
  | 'others'
  ;

/**
 * 用户密级
 */
export type UserSecretLevel =
  | '1'
  | '2'
  | '3'
  | '4'
  ;

/**
 * 仓库策略
 */
export type WarehouseStrategy =
  | 'fifo'
  | 'fdfo'
  | 'manual'
  ;

/**
 * IoT数据类型
 */
export type IotDataType =
  | 'integer'
  | 'long'
  | 'float'
  | 'double'
  | 'boolean'
  | 'text'
  ;

/**
 * IoT触发器事件类型
 */
export type IotTriggerEventType =
  | 'specifyAttributeOutput'
  | 'anyAttributeOutput'
  | 'machineStateChange'
  ;

/**
 * 设置项类型
 */
export type SettingItemType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'switch'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'json'
  ;
