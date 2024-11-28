import type {
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
  DataDictionaryLevel,
  DataDictionaryValueType,
  DocumentType,
  EmployeeState,
  EnabledDisabledState,
  FinTransactionType,
  FormFieldType,
  InspectionDetermineType,
  InspectionKind,
  InspectionResult,
  IotAttributeDataType,
  IotMeasurementDataType,
  IotTriggerEventType,
  MaterialSourceType,
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
  PropertyType,
  PublishState,
  QualificationState,
  QualitativeInspectionDetermineType,
  RouteHttpMethod,
  RouteType,
  SettingItemType,
  SysAuditLogMethod,
  SysAuditLogTarget,
  UndeletedDeletedState,
  UnitType,
  WarehouseStrategy,
} from "./data-dictionary-types";
/**
 * 客户端
 */
export interface AppClient {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 状态
   */
  state: UndeletedDeletedState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 客户端
 */
export type SaveAppClientInput = Omit<AppClient, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 导航菜单
 */
export interface AppNavItem {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 客户端
   */
  client?: Partial<AppClient>;
  /**
   * 上级菜单
   */
  parent?: Partial<AppNavItem>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 图标
   */
  icon?: string;
  /**
   * 页面代码
   */
  pageCode?: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 导航菜单
 */
export type SaveAppNavItemInput = Omit<AppNavItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 建筑物
 */
export interface BaseBuilding {
  /**
   * id
   */
  id: number;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 建筑物
 */
export type SaveBaseBuildingInput = Omit<BaseBuilding, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 员工
 */
export interface BaseEmployee {
  /**
   * id
   */
  id: number;
  /**
   * 工号
   */
  code?: string;
  /**
   * 姓名
   */
  name?: string;
  /**
   * 部门
   */
  department?: Partial<OcDepartment>;
  /**
   * 状态
   */
  state?: EmployeeState;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 员工
 */
export type SaveBaseEmployeeInput = Omit<BaseEmployee, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 表单字段
 */
export interface BaseFormField {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 来源
   */
  source?: string;
  /**
   * 外部id
   */
  externalId?: string;
  /**
   * 外部数据
   */
  externalData?: Record<string, any>;
  /**
   * 字段类型
   */
  fieldType: FormFieldType;
  /**
   * 状态
   */
  state?: EnabledDisabledState;
  /**
   * 备注
   */
  description?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 表单字段
 */
export type SaveBaseFormFieldInput = Omit<BaseFormField, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 大门
 */
export interface BaseGate {
  /**
   * id
   */
  id: number;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 大门
 */
export type SaveBaseGateInput = Omit<BaseGate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 位置
 */
export interface BaseLocation {
  /**
   * id
   */
  id: number;
  /**
   * 上级位置
   */
  parent?: Partial<BaseLocation>;
  /**
   * 类型
   */
  type: BaseLocationType;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 外部编码
   */
  externalCode?: string;
  /**
   * 外部库位组编码
   */
  externalGroupCode?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 位置
 */
export type SaveBaseLocationInput = Omit<BaseLocation, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 批次
 */
export interface BaseLot {
  /**
   * id
   */
  id: number;
  /**
   * 物料
   */
  material: Partial<BaseMaterial>;
  /**
   * 批次号
   */
  lotNum?: string;
  /**
   * 来源
   */
  sourceType?: MaterialSourceType;
  /**
   * 生产时间
   */
  manufactureDate?: string;
  /**
   * 失效时间
   */
  expireTime?: string;
  /**
   * 有效期至
   */
  validityDate?: string;
  /**
   * 合格证状态
   */
  qualificationState?: QualificationState;
  /**
   * 是否让步接收
   */
  isAOD?: boolean;
  /**
   * 状态
   */
  state?: BaseLotState;
  /**
   * 处理方式
   */
  treatment?: MomInspectionSheetTreatment;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 钉钉审批流程实例ID
   */
  dingtalkProcessInstanceId?: string;
  /**
   * 钉钉审批流程发起人
   */
  dingtalkApprovalOriginator?: string;
  /**
   * 通风开始时间
   */
  ventilationStartTime?: string;
  /**
   * 通风结束时间
   */
  ventilationFinishTime?: string;
  /**
   * 通风时长
   */
  ventilationDuration?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 批次
 */
export type SaveBaseLotInput = Omit<BaseLot, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物料
 */
export interface BaseMaterial {
  /**
   * id
   */
  id: number;
  /**
   * 物料号
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 品牌
   */
  brand?: string;
  /**
   * 规格
   */
  specification?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 分类
   */
  category: Partial<BaseMaterialCategory>;
  /**
   * 默认单位
   */
  defaultUnit?: Partial<BaseUnit>;
  /**
   * 类型
   */
  types?: any;
  /**
   * 可生产
   */
  canProduce?: boolean;
  /**
   * 可采购
   */
  canPurchase?: boolean;
  /**
   * 可外协
   */
  canOutsource?: boolean;
  /**
   * 可销售
   */
  canSale?: boolean;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 是否免检
   */
  isInspectionFree: boolean;
  /**
   * 质保期
   */
  qualityGuaranteePeriod?: string;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 安全库存数量
   */
  safetyStockQuantity?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物料
 */
export type SaveBaseMaterialInput = Omit<BaseMaterial, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物料分类
 */
export interface BaseMaterialCategory {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 默认单位
   */
  defaultUnit?: Partial<BaseUnit>;
  /**
   * 排序号
   */
  orderNum?: number;
  /**
   * 上级分类
   */
  parent?: Partial<BaseMaterialCategory>;
  /**
   * 物料
   */
  materials?: any;
  /**
   * 物料
   */
  brekdown?: any;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 打印模版
   */
  printTemplate?: Partial<MomPrintTemplate>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物料分类
 */
export type SaveBaseMaterialCategoryInput = Omit<BaseMaterialCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物料文档
 */
export interface BaseMaterialDocument {
  /**
   * id
   */
  id: number;
  /**
   * 物料
   */
  material: Partial<BaseMaterial>;
  /**
   * 文档
   */
  document: Partial<EcmDocument>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物料文档
 */
export type SaveBaseMaterialDocumentInput = Omit<BaseMaterialDocument, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物料类型
 */
export interface BaseMaterialType {
  /**
   * id
   */
  id: number;
  /**
   * 物料
   */
  materials?: any;
  /**
   * 编号
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物料类型
 */
export type SaveBaseMaterialTypeInput = Omit<BaseMaterialType, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 办公室
 */
export interface BaseOffice {
  /**
   * id
   */
  id: number;
  /**
   * 建筑
   */
  building?: Partial<BaseBuilding>;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 办公室
 */
export type SaveBaseOfficeInput = Omit<BaseOffice, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 合作伙伴
 */
export interface BasePartner {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 分类
   */
  categories?: any;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 合作伙伴
 */
export type SaveBasePartnerInput = Omit<BasePartner, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 合作伙伴分类
 */
export interface BasePartnerCategory {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 合作伙伴分类
 */
export type SaveBasePartnerCategoryInput = Omit<BasePartnerCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 单位
 */
export interface BaseUnit {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 英文名称
   */
  nameEn?: string;
  /**
   * 打印符号
   */
  printSymbol?: string;
  /**
   * 类型
   */
  type: UnitType;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 单位分组
   */
  category: Partial<BaseUnitCategory>;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 单位
 */
export type SaveBaseUnitInput = Omit<BaseUnit, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 单位分组
 */
export interface BaseUnitCategory {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 单位
   */
  units?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 单位分组
 */
export type SaveBaseUnitCategoryInput = Omit<BaseUnitCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 合同
 */
export interface CbsContract {
  /**
   * id
   */
  id: number;
  /**
   * 类型
   */
  kind?: CbsContractKind;
  /**
   * 编号
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 所属项目
   */
  project?: Partial<PmProject>;
  /**
   * 销售
   */
  salesman?: Partial<OcUser>;
  /**
   * 相关订单
   */
  orders?: any;
  /**
   * 合同金额
   */
  totalAmount: number;
  /**
   * 签订日期
   */
  signingDate?: string;
  /**
   * 状态
   */
  state: CbsContractState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 合同
 */
export type SaveCbsContractInput = Omit<CbsContract, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 合同文件
 */
export interface CbsContractFile {
  /**
   * id
   */
  id: number;
  /**
   * 文件编号
   */
  code?: string;
  /**
   * 文件名
   */
  name: string;
  /**
   * 文件大小
   */
  size: string;
  /**
   * 备注
   */
  description?: string;
  /**
   * 合同
   */
  contract?: Partial<CbsContract>;
  /**
   * 存储对象
   */
  storageObject?: Partial<EcmStorageObject>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 合同文件
 */
export type SaveCbsContractFileInput = Omit<CbsContractFile, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 资金预算
 */
export interface CbsContractFundingBudget {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 所属项目
   */
  project?: Partial<PmProject>;
  /**
   * 销售
   */
  salesman?: Partial<OcUser>;
  /**
   * 相关订单
   */
  orders?: any;
  /**
   * 合同金额
   */
  totalAmount: number;
  /**
   * 状态
   */
  state: CbsContractState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 资金预算
 */
export type SaveCbsContractFundingBudgetInput = Omit<CbsContractFundingBudget, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 合同关联
 */
export interface CbsContractRelation {
  /**
   * id
   */
  id: number;
  /**
   * 主体合同
   */
  main?: Partial<CbsContract>;
  /**
   * 被关联合同
   */
  target?: Partial<CbsContract>;
  /**
   * 关系
   */
  kind?: Partial<CbsContractRelationKind>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 合同关联
 */
export type SaveCbsContractRelationInput = Omit<CbsContractRelation, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 合同关联关系
 */
export interface CbsContractRelationKind {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 反向关系
   */
  opposite?: Partial<CbsContractRelationKind>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 合同关联关系
 */
export type SaveCbsContractRelationKindInput = Omit<CbsContractRelationKind, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 订单
 */
export interface CbsOrder {
  /**
   * id
   */
  id: number;
  /**
   * 类型
   */
  kind: CbsOrderKind;
  /**
   * 编号
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 相关项目
   */
  projects?: any;
  /**
   * 相关合同
   */
  contracts?: any;
  /**
   * 物料需求计划
   */
  mrp?: Partial<MomManufacturingResourcePlan>;
  /**
   * 订单项
   */
  items?: any;
  /**
   * 订单金额
   */
  totalAmount: number;
  /**
   * 税费
   */
  taxFee: number;
  /**
   * 转账记录
   */
  transactions?: any;
  /**
   * 状态
   */
  state: CbsOrderState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 订单
 */
export type SaveCbsOrderInput = Omit<CbsOrder, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 订单项
 */
export interface CbsOrderItem {
  /**
   * id
   */
  id: number;
  /**
   * 订单
   */
  order: Partial<CbsOrder>;
  /**
   * 物料需求计划
   */
  mrp?: Partial<MomManufacturingResourcePlan>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 产品/服务
   */
  subject?: Partial<BaseMaterial>;
  /**
   * 名称
   */
  name: string;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 单价
   */
  price: number;
  /**
   * 数量
   */
  quantity: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 税率
   */
  taxRate: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 订单项
 */
export type SaveCbsOrderItemInput = Omit<CbsOrderItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 文档
 */
export interface EcmDocument {
  /**
   * id
   */
  id: number;
  /**
   * 类型
   */
  type: DocumentType;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 扩展名
   */
  extName?: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 大小
   */
  size: number;
  /**
   * 最新版本
   */
  lastRevision?: Partial<EcmRevision>;
  /**
   * 存储对象
   */
  storageObject?: Partial<EcmStorageObject>;
  /**
   * 链接
   */
  ref?: Partial<EcmDocument>;
  /**
   * 父文档
   */
  parent?: Partial<EcmDocument>;
  /**
   * 上级文档id
   */
  ancestorIdPath?: string;
  /**
   * 状态
   */
  publishState: PublishState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 文档
 */
export type SaveEcmDocumentInput = Omit<EcmDocument, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 文档版本
 */
export interface EcmRevision {
  /**
   * id
   */
  id: number;
  /**
   * 文档
   */
  document: Partial<EcmDocument>;
  /**
   * 大小
   */
  size: number;
  /**
   * 存储对象
   */
  storageObject?: Partial<EcmStorageObject>;
  /**
   * 状态
   */
  publishState: PublishState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 文档版本
 */
export type SaveEcmRevisionInput = Omit<EcmRevision, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 存储对象
 */
export interface EcmStorageObject {
  /**
   * id
   */
  id: number;
  /**
   * 大小
   */
  size: number;
  /**
   * 对象唯一键
   */
  key: string;
  /**
   * 哈希值
   */
  hash?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 存储对象
 */
export type SaveEcmStorageObjectInput = Omit<EcmStorageObject, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 账户
 */
export interface FinAccount {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 初始金额
   */
  initialAmount: number;
  /**
   * 账户余额
   */
  balance: number;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 账户
 */
export type SaveFinAccountInput = Omit<FinAccount, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 业务类型
 */
export interface FinBusinessCategory {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 上级分类
   */
  parent?: Partial<FinBusinessCategory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 业务类型
 */
export type SaveFinBusinessCategoryInput = Omit<FinBusinessCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 费用类型
 */
export interface FinExpenseCategory {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 上级分类
   */
  parent?: Partial<FinExpenseCategory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 费用类型
 */
export type SaveFinExpenseCategoryInput = Omit<FinExpenseCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 转账
 */
export interface FinTransaction {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code?: string;
  /**
   * 账户
   */
  account: Partial<FinAccount>;
  /**
   * 类型
   */
  type: FinTransactionType;
  /**
   * 描述
   */
  description?: string;
  /**
   * 金额
   */
  amount: number;
  /**
   * 账户余额
   */
  balance?: number;
  /**
   * 转账时间
   */
  transferedAt?: string;
  /**
   * 状态
   */
  state: ConfirmationState;
  /**
   * 合同
   */
  contract?: Partial<CbsContract>;
  /**
   * 订单
   */
  order?: Partial<CbsOrder>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 转账
 */
export type SaveFinTransactionInput = Omit<FinTransaction, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 大门
 */
export interface HuateGCMS {
  /**
   * id
   */
  id: number;
  /**
   * 物料
   */
  material?: Partial<BaseMaterial>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 是否启用
   */
  enabled?: boolean;
  /**
   * 是否需要审核
   */
  needInspect?: boolean;
  /**
   * 检验单
   */
  sheet?: Partial<MomInspectionSheet>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 大门
 */
export type SaveHuateGCMSInput = Omit<HuateGCMS, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 华特出库登记
 */
export interface HuateWarehouseOperation {
  /**
   * id
   */
  id: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 物料
   */
  material?: Partial<BaseMaterial>;
  /**
   * 出库数量
   */
  quantity?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 华特出库登记
 */
export type SaveHuateWarehouseOperationInput = Omit<HuateWarehouseOperation, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * KisConfig
 */
export interface KisConfig {
  /**
   * id
   */
  id: number;
  /**
   * API Endpoint
   */
  api_endpoint?: string;
  /**
   * client_id
   */
  client_id?: string;
  /**
   * client_secret
   */
  client_secret?: string;
  /**
   * uid
   */
  uid?: number;
  /**
   * session_id
   */
  session_id: string;
  /**
   * access_token
   */
  access_token?: string;
  /**
   * auth_data
   */
  auth_data: string;
  /**
   * refresh_auth_data_token
   */
  refresh_auth_data_token: string;
  /**
   * gateway_router_addr
   */
  gateway_router_addr: string;
  /**
   * session_id_expire_in
   */
  session_id_expire_in: number;
  /**
   * access_token_expire_in
   */
  access_token_expire_in: number;
  /**
   * refresh_auth_data_token_expire_in
   */
  refresh_auth_data_token_expire_in: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * KisConfig
 */
export type SaveKisConfigInput = Omit<KisConfig, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 数据字典
 */
export interface DataDictionary {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 值类型
   */
  valueType: DataDictionaryValueType;
  /**
   * 级别
   */
  level: DataDictionaryLevel;
  /**
   * 描述
   */
  description?: string;
  /**
   * 来源
   */
  source?: string;
  /**
   * 外部id
   */
  externalId?: string;
  /**
   * 外部数据
   */
  externalData?: Record<string, any>;
  /**
   * 状态
   */
  state: UndeletedDeletedState;
  /**
   * 条目
   */
  entries?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 数据字典
 */
export type SaveDataDictionaryInput = Omit<DataDictionary, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 数据字典条目
 */
export interface DataDictionaryEntry {
  /**
   * id
   */
  id: number;
  /**
   * 数据字典
   */
  dictionary?: Partial<DataDictionary>;
  /**
   * 值
   */
  value: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 颜色
   */
  color?: string;
  /**
   * 图标
   */
  icon?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 是否禁用
   */
  disabled: boolean;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 数据字典条目
 */
export type SaveDataDictionaryEntryInput = Omit<DataDictionaryEntry, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 实体模型
 */
export interface Model {
  /**
   * id
   */
  id: number;
  /**
   * namespace
   */
  namespace: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * singular code
   */
  singularCode: string;
  /**
   * plural code
   */
  pluralCode: string;
  /**
   * 权限配置
   */
  permissionPolicies?: Record<string, any>;
  /**
   * 属性
   */
  properties?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 实体模型
 */
export type SaveModelInput = Omit<Model, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 实体属性
 */
export interface Property {
  /**
   * id
   */
  id: number;
  /**
   * 模型
   */
  model?: Partial<Model>;
  /**
   * 属性类型
   */
  type: PropertyType;
  /**
   * 名称
   */
  name: string;
  /**
   * code
   */
  code: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 数据库列名
   */
  columnName: string;
  /**
   * 必填
   */
  required: boolean;
  /**
   * 默认值
   */
  defaultValue?: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 自增
   */
  autoIncrement: boolean;
  /**
   * 最小长度
   */
  minLength?: number;
  /**
   * 最大长度
   */
  maxLength?: number;
  /**
   * 关系类型
   */
  relation?: string;
  /**
   * 关联实体
   */
  targetSingularCode?: string;
  /**
   * 关联实体的Id列名
   */
  targetIdColumnName?: string;
  /**
   * 自身实体Id列名
   */
  selfIdColumnName?: string;
  /**
   * 关系表所属schema
   */
  linkSchema?: string;
  /**
   * 关系表表名
   */
  linkTableName?: string;
  /**
   * 数据字典
   */
  dataDictionary?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 实体属性
 */
export type SavePropertyInput = Omit<Property, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * HTTP路由
 */
export interface Route {
  /**
   * id
   */
  id: number;
  /**
   * namespace
   */
  namespace: string;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 路由类型
   */
  type: RouteType;
  /**
   * HTTP Method
   */
  method: RouteHttpMethod;
  /**
   * Endpoint
   */
  endpoint: string;
  /**
   * Actions
   */
  actions?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * HTTP路由
 */
export type SaveRouteInput = Omit<Route, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 组装主体记录
 */
export interface MomAssemblyMain {
  /**
   * id
   */
  id: number;
  /**
   * 生产工单
   */
  workOrder?: Partial<MomWorkOrder>;
  /**
   * 生产流转单
   */
  workTrack?: Partial<MomWorkTrack>;
  /**
   * 生产任务
   */
  workTask?: Partial<MomWorkTask>;
  /**
   * 工艺路线
   */
  route?: Partial<MomRoute>;
  /**
   * 生产工序
   */
  routeProcess?: Partial<MomRouteProcess>;
  /**
   * 主物料
   */
  mainMaterial?: Partial<BaseMaterial>;
  /**
   * 主物料号
   */
  mainMaterialCode?: string;
  /**
   * 批号
   */
  mainLotNum?: string;
  /**
   * 序列号
   */
  mainSerialNum?: string;
  /**
   * 零件
   */
  parts?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 组装主体记录
 */
export type SaveMomAssemblyMainInput = Omit<MomAssemblyMain, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 组装零件记录
 */
export interface MomAssemblyPart {
  /**
   * id
   */
  id: number;
  /**
   * 主体记录
   */
  main?: Partial<MomAssemblyMain>;
  /**
   * 下级物料
   */
  partMaterial?: Partial<BaseMaterial>;
  /**
   * 主物料号
   */
  partMaterialCode?: string;
  /**
   * 批号
   */
  partLotNum?: string;
  /**
   * 序列号
   */
  partSerialNum?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 组装零件记录
 */
export type SaveMomAssemblyPartInput = Omit<MomAssemblyPart, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 设备
 */
export interface MomEquipment {
  /**
   * id
   */
  id: number;
  /**
   * 设备号
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 生产厂家
   */
  manufacturer?: string;
  /**
   * 型号
   */
  model?: string;
  /**
   * 分类
   */
  category?: Partial<MomEquipmentCategory>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 电源状态
   */
  powerState?: MomEquipmentPowerState;
  /**
   * 生产状态
   */
  productionState?: MomEquipmentProductionState;
  /**
   * 计划每日工作时间
   */
  planedDailyWorkingTime?: number;
  /**
   * 所在工位
   */
  station?: Partial<MomStation>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 外部ID
   */
  externalId?: string;
  /**
   * IOT设备
   */
  machine?: Partial<IotMachine>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 设备
 */
export type SaveMomEquipmentInput = Omit<MomEquipment, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 设备分类
 */
export interface MomEquipmentCategory {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum?: number;
  /**
   * 上级分类
   */
  parent?: Partial<MomEquipmentCategory>;
  /**
   * 设备
   */
  equipments?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 设备分类
 */
export type SaveMomEquipmentCategoryInput = Omit<MomEquipmentCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 设备采集参数
 */
export interface MomEquipmentCategoryDimension {
  /**
   * id
   */
  id: number;
  /**
   * 设备分类
   */
  equipmentCategory?: Partial<MomEquipmentCategory>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 排序号
   */
  orderNum?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 设备采集参数
 */
export type SaveMomEquipmentCategoryDimensionInput = Omit<MomEquipmentCategoryDimension, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工厂
 */
export interface MomFactory {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工厂
 */
export type SaveMomFactoryInput = Omit<MomFactory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品
 */
export interface MomGood {
  /**
   * id
   */
  id: number;
  /**
   * 跟踪码
   */
  trackingCode?: string;
  /**
   * 物料
   */
  material?: Partial<BaseMaterial>;
  /**
   * 物料号
   */
  materialCode?: string;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 箱号
   */
  binNum?: string;
  /**
   * 序列号
   */
  serialNum?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 库区
   */
  warehouseArea?: Partial<BaseLocation>;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 放入时间
   */
  putInTime?: string;
  /**
   * 来源
   */
  source?: Partial<MomGood>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 标签
   */
  labels?: any;
  /**
   * 状态
   */
  state: MomGoodState;
  /**
   * 扩展信息
   */
  extra?: Record<string, any>;
  /**
   * 生产日期
   */
  manufactureDate?: string;
  /**
   * 有效期至
   */
  validityDate?: string;
  /**
   * 批次信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品
 */
export type SaveMomGoodInput = Omit<MomGood, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品标签
 */
export interface MomGoodLabel {
  /**
   * id
   */
  id: number;
  /**
   * 物品
   */
  good?: Partial<MomGood>;
  /**
   * 标签名
   */
  name: string;
  /**
   * 值
   */
  textValue?: string;
  /**
   * 值
   */
  numberValue?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品标签
 */
export type SaveMomGoodLabelInput = Omit<MomGoodLabel, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品位置
 */
export interface MomGoodLocation {
  /**
   * id
   */
  id: number;
  /**
   * 物品
   */
  good?: Partial<MomGood>;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 放入时间
   */
  putInTime?: string;
  /**
   * 取出时间
   */
  takeOutTime?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品位置
 */
export type SaveMomGoodLocationInput = Omit<MomGoodLocation, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品转移记录
 */
export interface MomGoodTransfer {
  /**
   * id
   */
  id: number;
  /**
   * 操作记录
   */
  operation?: Partial<MomInventoryOperation>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 物品
   */
  good?: Partial<MomGood>;
  /**
   * 跟踪码
   */
  trackingCode?: string;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 箱号
   */
  binNum?: string;
  /**
   * 序列号
   */
  serialNum?: string;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 数量
   */
  quantity: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 转出位置
   */
  from?: Partial<BaseLocation>;
  /**
   * 转入位置
   */
  to?: Partial<BaseLocation>;
  /**
   * 转移时间
   */
  transferTime?: string;
  /**
   * 包数
   */
  packageNum?: string;
  /**
   * 生产日期
   */
  manufactureDate?: string;
  /**
   * 有效期至
   */
  validityDate?: string;
  /**
   * 打印时间
   */
  printTime?: string;
  /**
   * 批次信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 罐车运输
   */
  isTankerTransportation?: boolean;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品转移记录
 */
export type SaveMomGoodTransferInput = Omit<MomGoodTransfer, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验类型
 */
export interface MomInspectionCategory {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum?: number;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 上级分类
   */
  parent?: Partial<MomInspectionCategory>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验类型
 */
export type SaveMomInspectionCategoryInput = Omit<MomInspectionCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验特征
 */
export interface MomInspectionCharacteristic {
  /**
   * id
   */
  id: number;
  /**
   * 检验规则
   */
  rule?: Partial<MomInspectionRule>;
  /**
   * 名称
   */
  name?: string;
  /**
   * 可跳过检验
   */
  skippable?: boolean;
  /**
   * 必须合格
   */
  mustPass?: boolean;
  /**
   * 特征类型
   */
  category?: Partial<MomInspectionCharacteristicCategory>;
  /**
   * 检验方法
   */
  method?: Partial<MomInspectionMethod>;
  /**
   * 检验仪器类型
   */
  instrumentCategory?: Partial<MomInspectionInstrumentCategory>;
  /**
   * 检验仪器
   */
  instrument?: Partial<MomInspectionInstrument>;
  /**
   * 检验类型
   */
  kind?: InspectionKind;
  /**
   * 定量合格判定方式
   */
  determineType?: InspectionDetermineType;
  /**
   * 定性合格判定方式
   */
  qualitativeDetermineType?: QualitativeInspectionDetermineType;
  /**
   * 标准值
   */
  norminal?: string;
  /**
   * 上公差
   */
  upperTol?: number;
  /**
   * 下公差
   */
  lowerTol?: number;
  /**
   * 上限值
   */
  upperLimit?: number;
  /**
   * 下限值
   */
  lowerLimit?: number;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验特征
 */
export type SaveMomInspectionCharacteristicInput = Omit<MomInspectionCharacteristic, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验特征类型
 */
export interface MomInspectionCharacteristicCategory {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验特征类型
 */
export type SaveMomInspectionCharacteristicCategoryInput = Omit<MomInspectionCharacteristicCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 缺陷
 */
export interface MomInspectionDefect {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 分类
   */
  category: Partial<MomInspectionDefectCategory>;
  /**
   * 排序号
   */
  orderNum?: number;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 缺陷
 */
export type SaveMomInspectionDefectInput = Omit<MomInspectionDefect, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 缺陷分类
 */
export interface MomInspectionDefectCategory {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum?: number;
  /**
   * 上级分类
   */
  parent?: Partial<MomInspectionDefectCategory>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 缺陷
   */
  defects?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 缺陷分类
 */
export type SaveMomInspectionDefectCategoryInput = Omit<MomInspectionDefectCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 缺陷记录
 */
export interface MomInspectionDefectStat {
  /**
   * id
   */
  id: number;
  /**
   * 检验单
   */
  sheet?: Partial<MomInspectionSheet>;
  /**
   * 缺陷
   */
  defect?: Partial<MomInspectionDefect>;
  /**
   * 样本数量
   */
  sampleAmount?: number;
  /**
   * 缺陷数量
   */
  defectAmount?: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 缺陷记录
 */
export type SaveMomInspectionDefectStatInput = Omit<MomInspectionDefectStat, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验仪器
 */
export interface MomInspectionInstrument {
  /**
   * id
   */
  id: number;
  /**
   * 仪器编号
   */
  code: string;
  /**
   * 仪器类型
   */
  category?: Partial<MomInspectionInstrumentCategory>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验仪器
 */
export type SaveMomInspectionInstrumentInput = Omit<MomInspectionInstrument, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验仪器类型
 */
export interface MomInspectionInstrumentCategory {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验仪器类型
 */
export type SaveMomInspectionInstrumentCategoryInput = Omit<MomInspectionInstrumentCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验记录
 */
export interface MomInspectionMeasurement {
  /**
   * id
   */
  id: number;
  /**
   * 检验单
   */
  sheet?: Partial<MomInspectionSheet>;
  /**
   * 检验样本
   */
  sample?: Partial<MomInspectionSheetSample>;
  /**
   * 样本号
   */
  sampleCode?: string;
  /**
   * 检验特征
   */
  characteristic?: Partial<MomInspectionCharacteristic>;
  /**
   * 检验仪器类型
   */
  instrumentCategory?: Partial<MomInspectionInstrumentCategory>;
  /**
   * 检验仪器
   */
  instrument?: Partial<MomInspectionInstrument>;
  /**
   * 检验员
   */
  inspector?: Partial<OcUser>;
  /**
   * 检验时间
   */
  inspectedAt?: string;
  /**
   * 定性检验值
   */
  qualitativeValue?: string;
  /**
   * 定量检验值
   */
  quantitativeValue?: number;
  /**
   * 是否合格
   */
  isQualified?: boolean;
  /**
   * 检验轮次
   */
  round: number;
  /**
   * 锁定
   */
  locked?: boolean;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验记录
 */
export type SaveMomInspectionMeasurementInput = Omit<MomInspectionMeasurement, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验方法
 */
export interface MomInspectionMethod {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验方法
 */
export type SaveMomInspectionMethodInput = Omit<MomInspectionMethod, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验规则
 */
export interface MomInspectionRule {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 检验类型
   */
  category: Partial<MomInspectionCategory>;
  /**
   * 物品
   */
  material: Partial<BaseMaterial>;
  /**
   * 客户
   */
  customer?: Partial<BasePartner>;
  /**
   * 生产工序
   */
  routeProcess?: Partial<MomRouteProcess>;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 是否默认
   */
  isDefault?: boolean;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 车型
   */
  carModel?: string;
  /**
   * 零件号
   */
  partNumber?: string;
  /**
   * 零件名
   */
  partName?: string;
  /**
   * 配置
   */
  conf?: string;
  /**
   * 零件负责人
   */
  partManager?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验规则
 */
export type SaveMomInspectionRuleInput = Omit<MomInspectionRule, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验抽样
 */
export interface MomInspectionSampling {
  /**
   * id
   */
  id: number;
  /**
   * 物料类型
   */
  materialCategory: Partial<BaseMaterialCategory>;
  /**
   * 明细项
   */
  items?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验抽样
 */
export type SaveMomInspectionSamplingInput = Omit<MomInspectionSampling, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验抽样
 */
export interface MomInspectionSamplingItem {
  /**
   * id
   */
  id: number;
  /**
   * 采样规则
   */
  sampling?: Partial<MomInspectionSampling>;
  /**
   * 起始值
   */
  from: any;
  /**
   * 截止值
   */
  to: any;
  /**
   * 样本数
   */
  samplingCount: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验抽样
 */
export type SaveMomInspectionSamplingItemInput = Omit<MomInspectionSamplingItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验单
 */
export interface MomInspectionSheet {
  /**
   * id
   */
  id: number;
  /**
   * 检验单号
   */
  code?: string;
  /**
   * 审批状态
   */
  approvalState?: ApprovalState;
  /**
   * 检验单状态
   */
  state?: MomInspectionSheetState;
  /**
   * 检验结果
   */
  result?: InspectionResult;
  /**
   * 处理方式
   */
  treatment?: MomInspectionSheetTreatment;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 物料号
   */
  materialCode?: string;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 序列号
   */
  serialNum?: string;
  /**
   * 样本数量
   */
  sampleCount?: number;
  /**
   * 生产工单
   */
  workOrder?: Partial<MomWorkOrder>;
  /**
   * 生产流转单
   */
  workTrack?: Partial<MomWorkTrack>;
  /**
   * 生产任务
   */
  workTask?: Partial<MomWorkTask>;
  /**
   * 库存操作单
   */
  inventoryOperation?: Partial<MomInventoryOperation>;
  /**
   * 检验规则
   */
  rule?: Partial<MomInspectionRule>;
  /**
   * 生产工序
   */
  routeProcess?: Partial<MomRouteProcess>;
  /**
   * 送检人
   */
  sender?: Partial<OcUser>;
  /**
   * 检验员
   */
  inspector?: Partial<OcUser>;
  /**
   * 审核人
   */
  reviewer?: Partial<OcUser>;
  /**
   * 检验记录
   */
  measurements?: any;
  /**
   * 缺陷统计
   */
  defectStats?: any;
  /**
   * 批号信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 样本记录
   */
  samples?: any;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 检验轮次
   */
  round: number;
  /**
   * 检验完成时间
   */
  inspectedAt?: string;
  /**
   * 收货数量
   */
  acceptQuantity?: number;
  /**
   * 收货托数
   */
  acceptPalletCount?: number;
  /**
   * 图片
   */
  pictures?: any;
  /**
   * 报告文件
   */
  reportFile?: any;
  /**
   * GCMS报告文件
   */
  gcmsReportFile?: any;
  /**
   * GCMS检验结果
   */
  gcmsPassed?: InspectionResult;
  /**
   * 月度发票
   */
  invoiceReportFile?: any;
  /**
   * 常规检测
   */
  normalReportFile?: any;
  /**
   * 质保书
   */
  qualityReportFile?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 宜搭ID
   */
  yidaId?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验单
 */
export type SaveMomInspectionSheetInput = Omit<MomInspectionSheet, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 检验样本
 */
export interface MomInspectionSheetSample {
  /**
   * id
   */
  id: number;
  /**
   * 样本号
   */
  code: string;
  /**
   * 检验单
   */
  sheet?: Partial<MomInspectionSheet>;
  /**
   * 检验记录
   */
  measurements?: any;
  /**
   * 检验轮次
   */
  round: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 检验样本
 */
export type SaveMomInspectionSheetSampleInput = Omit<MomInspectionSheetSample, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品库存
 */
export interface MomInventory {
  /**
   * id
   */
  id: number;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 可用数量
   */
  availableQuantity?: number;
  /**
   * 可分配数量
   */
  allocableQuantity?: number;
  /**
   * 在单数量
   */
  onOrderQuantity?: number;
  /**
   * 采购在途数量
   */
  intransitQuantity?: number;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 已预定数量
   */
  reservedQuantity?: number;
  /**
   * 已分配数量
   */
  allocatedQuantity?: number;
  /**
   * 销售在途数量
   */
  shippingQuantity?: number;
  /**
   * 已交付数量
   */
  deliveredQuantity?: number;
  /**
   * 加工中数量
   */
  processingQuantity?: number;
  /**
   * 已加工数量
   */
  processedQuantity?: number;
  /**
   * 已产出数量
   */
  yieldQuantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 箱号
   */
  binNum?: string;
  /**
   * 序列号
   */
  serialNum?: string;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 标签
   */
  labels?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品库存
 */
export type SaveMomInventoryInput = Omit<MomInventory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存业务申请
 */
export interface MomInventoryApplication {
  /**
   * id
   */
  id: number;
  /**
   * 申请单号
   */
  code?: string;
  /**
   * 库存操作类型
   */
  operationType: MomInventoryOperationType;
  /**
   * 业务类型
   */
  businessType?: Partial<MomInventoryBusinessType>;
  /**
   * 申请人
   */
  applicant?: Partial<OcUser>;
  /**
   * 制单人
   */
  biller?: Partial<OcUser>;
  /**
   * 明细项
   */
  items?: any;
  /**
   * 申请状态
   */
  state: BusinessApplicationState;
  /**
   * 其它信息
   */
  extra?: Record<string, any>;
  /**
   * 合同号
   */
  contractNum?: string;
  /**
   * 转出仓库
   */
  from?: Partial<BaseLocation>;
  /**
   * 转入仓库
   */
  to?: Partial<BaseLocation>;
  /**
   * 供应商
   */
  supplier?: Partial<BasePartner>;
  /**
   * 客户
   */
  customer?: Partial<BasePartner>;
  /**
   * 库存操作状态
   */
  operationState?: MomInventoryOperationState;
  /**
   * 来源
   */
  source?: MomApplicationSource;
  /**
   * 流程实例
   */
  processInstance?: Partial<BpmInstance>;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 保管人
   */
  fSManager?: Partial<OcUser>;
  /**
   * 验收人
   */
  fFManager?: Partial<OcUser>;
  /**
   * 领料用途
   */
  fUse?: string;
  /**
   * 生产计划单编号
   */
  fPlanSn?: string;
  /**
   * KIS采购方式
   */
  fPOStyle?: string;
  /**
   * KIS供应商
   */
  fSupplyID?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存业务申请
 */
export type SaveMomInventoryApplicationInput = Omit<MomInventoryApplication, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存业务申请货品项
 */
export interface MomInventoryApplicationItem {
  /**
   * id
   */
  id: number;
  /**
   * 申请信息
   */
  application?: Partial<MomInventoryApplication>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 物品
   */
  good?: Partial<MomGood>;
  /**
   * 跟踪码
   */
  trackingCode?: string;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 箱号
   */
  binNum?: string;
  /**
   * 序列号
   */
  serialNum?: string;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 批号
   */
  lot?: Partial<BaseLot>;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 收货数量
   */
  acceptQuantity?: number;
  /**
   * 收货托数
   */
  acceptPalletCount?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存业务申请货品项
 */
export type SaveMomInventoryApplicationItemInput = Omit<MomInventoryApplicationItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存业务类型
 */
export interface MomInventoryBusinessType {
  /**
   * id
   */
  id: number;
  /**
   * 库存操作类型
   */
  operationType: MomInventoryOperationType;
  /**
   * 名称
   */
  name: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存业务类型
 */
export type SaveMomInventoryBusinessTypeInput = Omit<MomInventoryBusinessType, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存盘点记录
 */
export interface MomInventoryCheckRecord {
  /**
   * id
   */
  id: number;
  /**
   * 操作记录
   */
  operation?: Partial<MomInventoryOperation>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 物品
   */
  good?: Partial<MomGood>;
  /**
   * 跟踪码
   */
  trackingCode?: string;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 箱号
   */
  binNum?: string;
  /**
   * 序列号
   */
  serialNum?: string;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 数量
   */
  quantity: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 包数
   */
  packageNum?: string;
  /**
   * 生产日期
   */
  manufactureDate?: string;
  /**
   * 有效期至
   */
  validityDate?: string;
  /**
   * 批次信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存盘点记录
 */
export type SaveMomInventoryCheckRecordInput = Omit<MomInventoryCheckRecord, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存标签
 */
export interface MomInventoryLabel {
  /**
   * id
   */
  id: number;
  /**
   * 库存记录
   */
  inventory?: Partial<MomInventory>;
  /**
   * 标签名
   */
  name: string;
  /**
   * 值
   */
  textValue?: string;
  /**
   * 值
   */
  numberValue?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存标签
 */
export type SaveMomInventoryLabelInput = Omit<MomInventoryLabel, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存操作记录
 */
export interface MomInventoryOperation {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code?: string;
  /**
   * 操作类型
   */
  operationType: MomInventoryOperationType;
  /**
   * 业务类型
   */
  businessType?: Partial<MomInventoryBusinessType>;
  /**
   * 申请单信息
   */
  application?: Partial<MomInventoryApplication>;
  /**
   * 业务详情
   */
  businessDetails?: Record<string, any>;
  /**
   * 操作状态
   */
  state?: MomInventoryOperationState;
  /**
   * 审批状态
   */
  approvalState?: ApprovalState;
  /**
   * 变更明细
   */
  transfers?: any;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 合同号
   */
  contractNum?: string;
  /**
   * 生产计划单号
   */
  productionPlanSn?: string;
  /**
   * 供应商
   */
  supplier?: Partial<BasePartner>;
  /**
   * 客户
   */
  customer?: Partial<BasePartner>;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 车间
   */
  shop?: string;
  /**
   * 部门
   */
  department?: Partial<OcDepartment>;
  /**
   * 成品物料(用途)
   */
  finishedMaterial?: Partial<BaseMaterial>;
  /**
   * 供应商
   */
  supplier?: Partial<BasePartner>;
  /**
   * 是否处理
   */
  processed?: boolean;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存操作记录
 */
export type SaveMomInventoryOperationInput = Omit<MomInventoryOperation, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存统计表配置
 */
export interface MomInventoryStatTable {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存统计表配置
 */
export type SaveMomInventoryStatTableInput = Omit<MomInventoryStatTable, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品库存统计触发配置
 */
export interface MomInventoryStatTrigger {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品库存统计触发配置
 */
export type SaveMomInventoryStatTriggerInput = Omit<MomInventoryStatTrigger, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 实验室
 */
export interface MomLab {
  /**
   * id
   */
  id: number;
  /**
   * 建筑
   */
  building?: Partial<BaseBuilding>;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 实验室
 */
export type SaveMomLabInput = Omit<MomLab, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 生产线
 */
export interface MomLine {
  /**
   * id
   */
  id: number;
  /**
   * 车间
   */
  shop?: Partial<MomShop>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 生产线
 */
export type SaveMomLineInput = Omit<MomLine, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物料需求计划
 */
export interface MomManufacturingResourcePlan {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 结果
   */
  result?: Record<string, any>;
  /**
   * 计划状态
   */
  planningState?: MomMrpPlanningState;
  /**
   * 执行状态
   */
  executionState?: MomMrpExecutionState;
  /**
   * 主生产计划
   */
  productionSchedules?: any;
  /**
   * 生产工单
   */
  workOrders?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物料需求计划
 */
export type SaveMomManufacturingResourcePlanInput = Omit<MomManufacturingResourcePlan, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 主生产计划
 */
export interface MomMasterProductionSchedule {
  /**
   * id
   */
  id: number;
  /**
   * 生产计划号
   */
  code?: string;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 计划开始日期
   */
  scheduledStartDate?: string;
  /**
   * 计划完成日期
   */
  scheduledFinishDate?: string;
  /**
   * 实际开始日期
   */
  actualStartDate?: string;
  /**
   * 实际完成日期
   */
  actualFinishDate?: string;
  /**
   * 计划状态
   */
  scheduleState?: MomMpsScheduleState;
  /**
   * 执行状态
   */
  executionState?: MomMpsExecutionState;
  /**
   * 物料需求计划
   */
  mrp?: Partial<MomManufacturingResourcePlan>;
  /**
   * 生产工单
   */
  productionOrders?: any;
  /**
   * 采购订单
   */
  purchaseOrders?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 主生产计划
 */
export type SaveMomMasterProductionScheduleInput = Omit<MomMasterProductionSchedule, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 生产计划项
 */
export interface MomMasterProductionScheduleItem {
  /**
   * id
   */
  id: number;
  /**
   * 生产计划
   */
  productionPlan?: Partial<MomMasterProductionSchedule>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 生产计划项
 */
export type SaveMomMasterProductionScheduleItemInput = Omit<MomMasterProductionScheduleItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * BOM
 */
export interface MomMaterialBreakdown {
  /**
   * id
   */
  id: number;
  /**
   * 物料
   */
  material?: Partial<BaseMaterial>;
  /**
   * 版本
   */
  version?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 下级物料
   */
  parts?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * BOM
 */
export type SaveMomMaterialBreakdownInput = Omit<MomMaterialBreakdown, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 下级物料
 */
export interface MomMaterialBreakdownPart {
  /**
   * id
   */
  id: number;
  /**
   * BOM
   */
  materialBreakdown?: Partial<MomMaterialBreakdown>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 下级物料
   */
  subMaterial?: Partial<BaseMaterial>;
  /**
   * 匹配参数
   */
  matchTags?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 下级物料
 */
export type SaveMomMaterialBreakdownPartInput = Omit<MomMaterialBreakdownPart, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量-按物品分组
 */
export interface MomMaterialInventoryBalance {
  /**
   * id
   */
  id: number;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 可用数量
   */
  availableQuantity?: number;
  /**
   * 可分配数量
   */
  allocableQuantity?: number;
  /**
   * 在单数量
   */
  onOrderQuantity?: number;
  /**
   * 采购在途数量
   */
  intransitQuantity?: number;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 已预定数量
   */
  reservedQuantity?: number;
  /**
   * 已分配数量
   */
  allocatedQuantity?: number;
  /**
   * 销售在途数量
   */
  shippingQuantity?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量-按物品分组
 */
export type SaveMomMaterialInventoryBalanceInput = Omit<MomMaterialInventoryBalance, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量变更记录-按物品分组
 */
export interface MomMaterialInventoryLog {
  /**
   * id
   */
  id: number;
  /**
   * 库存量
   */
  balanceRecord?: Partial<MomMaterialInventoryBalance>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 可用数量
   */
  availableQuantity?: number;
  /**
   * 可用数量变化
   */
  availableQuantityChange?: number;
  /**
   * 可分配数量
   */
  allocableQuantity?: number;
  /**
   * 可分配数量变化
   */
  allocableQuantityChange?: number;
  /**
   * 在单数量
   */
  onOrderQuantity?: number;
  /**
   * 在单数量变化
   */
  onOrderQuantityChange?: number;
  /**
   * 采购在途数量
   */
  intransitQuantity?: number;
  /**
   * 采购在途数量变化
   */
  intransitQuantityChange?: number;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 在库数量变化
   */
  onHandQuantityChange?: number;
  /**
   * 已预定数量
   */
  reservedQuantity?: number;
  /**
   * 已预定数量变化
   */
  reservedQuantityChange?: number;
  /**
   * 已分配数量
   */
  allocatedQuantity?: number;
  /**
   * 已分配数量变化
   */
  allocatedQuantityChange?: number;
  /**
   * 销售在途数量
   */
  shippingQuantity?: number;
  /**
   * 销售在途数量变化
   */
  shippingQuantityChange?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量变更记录-按物品分组
 */
export type SaveMomMaterialInventoryLogInput = Omit<MomMaterialInventoryLog, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量-按物品、批次分组
 */
export interface MomMaterialLotInventoryBalance {
  /**
   * id
   */
  id: number;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 批号信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量-按物品、批次分组
 */
export type SaveMomMaterialLotInventoryBalanceInput = Omit<MomMaterialLotInventoryBalance, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量变更记录-按物品、批次分组
 */
export interface MomMaterialLotInventoryLog {
  /**
   * id
   */
  id: number;
  /**
   * 库存量
   */
  balanceRecord?: Partial<MomMaterialLotInventoryBalance>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 批号信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 在库数量变化
   */
  onHandQuantityChange?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量变更记录-按物品、批次分组
 */
export type SaveMomMaterialLotInventoryLogInput = Omit<MomMaterialLotInventoryLog, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量-按物品、批次和仓库分组
 */
export interface MomMaterialLotWarehouseInventoryBalance {
  /**
   * id
   */
  id: number;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 批号信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量-按物品、批次和仓库分组
 */
export type SaveMomMaterialLotWarehouseInventoryBalanceInput = Omit<MomMaterialLotWarehouseInventoryBalance, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量变更记录-按物品、批次和仓库分组
 */
export interface MomMaterialLotWarehouseInventoryLog {
  /**
   * id
   */
  id: number;
  /**
   * 库存量
   */
  balanceRecord?: Partial<MomMaterialLotWarehouseInventoryBalance>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 批号信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 在库数量变化
   */
  onHandQuantityChange?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量变更记录-按物品、批次和仓库分组
 */
export type SaveMomMaterialLotWarehouseInventoryLogInput = Omit<MomMaterialLotWarehouseInventoryLog, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量-按物品和仓库分组
 */
export interface MomMaterialWarehouseInventoryBalance {
  /**
   * id
   */
  id: number;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 可分配数量
   */
  allocableQuantity?: number;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 已分配数量
   */
  allocatedQuantity?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量-按物品和仓库分组
 */
export type SaveMomMaterialWarehouseInventoryBalanceInput = Omit<MomMaterialWarehouseInventoryBalance, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量变更记录-按物品和仓库分组
 */
export interface MomMaterialWarehouseInventoryLog {
  /**
   * id
   */
  id: number;
  /**
   * 库存量
   */
  balanceRecord?: Partial<MomMaterialWarehouseInventoryBalance>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 可分配数量
   */
  allocableQuantity?: number;
  /**
   * 可分配数量变化
   */
  allocableQuantityChange?: number;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 在库数量变化
   */
  onHandQuantityChange?: number;
  /**
   * 已分配数量
   */
  allocatedQuantity?: number;
  /**
   * 已分配数量变化
   */
  allocatedQuantityChange?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量变更记录-按物品和仓库分组
 */
export type SaveMomMaterialWarehouseInventoryLogInput = Omit<MomMaterialWarehouseInventoryLog, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量-按物品和仓库,库位分组
 */
export interface MomMaterialWarehouseLocationInventoryBalance {
  /**
   * id
   */
  id: number;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 库位
   */
  location?: Partial<BaseLocation>;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 可分配数量
   */
  allocableQuantity?: number;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 已分配数量
   */
  allocatedQuantity?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量-按物品和仓库,库位分组
 */
export type SaveMomMaterialWarehouseLocationInventoryBalanceInput = Omit<MomMaterialWarehouseLocationInventoryBalance, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 库存量变更记录-按物品和仓库分组
 */
export interface MomMaterialWarehouseLocationInventoryLog {
  /**
   * id
   */
  id: number;
  /**
   * 库存量
   */
  balanceRecord?: Partial<MomMaterialWarehouseLocationInventoryBalance>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 仓库
   */
  location?: Partial<BaseLocation>;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 可分配数量
   */
  allocableQuantity?: number;
  /**
   * 可分配数量变化
   */
  allocableQuantityChange?: number;
  /**
   * 在库数量
   */
  onHandQuantity?: number;
  /**
   * 在库数量变化
   */
  onHandQuantityChange?: number;
  /**
   * 已分配数量
   */
  allocatedQuantity?: number;
  /**
   * 已分配数量变化
   */
  allocatedQuantityChange?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 库存量变更记录-按物品和仓库分组
 */
export type SaveMomMaterialWarehouseLocationInventoryLogInput = Omit<MomMaterialWarehouseLocationInventoryLog, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品包
 */
export interface MomPackage {
  /**
   * id
   */
  id: number;
  /**
   * 数量
   */
  code?: string;
  /**
   * 物品
   */
  goods?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品包
 */
export type SaveMomPackageInput = Omit<MomPackage, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品包内物品
 */
export interface MomPackageGood {
  /**
   * id
   */
  id: number;
  /**
   * 包
   */
  package_id?: Partial<MomPackage>;
  /**
   * 物品
   */
  good?: Partial<MomGood>;
  /**
   * 状态
   */
  state?: MomPackageGoodState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品包内物品
 */
export type SaveMomPackageGoodInput = Omit<MomPackageGood, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 打印记录
 */
export interface MomPrintLog {
  /**
   * id
   */
  id: number;
  /**
   * 打印机编码
   */
  code: string;
  /**
   * 打印内容
   */
  tasks?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 打印记录
 */
export type SaveMomPrintLogInput = Omit<MomPrintLog, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 打印模版
 */
export interface MomPrintTemplate {
  /**
   * id
   */
  id: number;
  /**
   * 模版名称
   */
  name: string;
  /**
   * 模版编码
   */
  code: string;
  /**
   * 模版内容
   */
  content?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 打印模版
 */
export type SaveMomPrintTemplateInput = Omit<MomPrintTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工序
 */
export interface MomProcess {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 工序类型
   */
  category?: Partial<MomProcessCategory>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 标准周期时间
   */
  standardCycleTime?: number;
  /**
   * 生产设备
   */
  equipments?: any;
  /**
   * 产出物料
   */
  outputs?: any;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 车型
   */
  carModel?: string;
  /**
   * 零件号
   */
  partNumber?: string;
  /**
   * 零件名
   */
  partName?: string;
  /**
   * 配置
   */
  conf?: string;
  /**
   * 零件负责人
   */
  partManager?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工序
 */
export type SaveMomProcessInput = Omit<MomProcess, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工序分类
 */
export interface MomProcessCategory {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工序分类
 */
export type SaveMomProcessCategoryInput = Omit<MomProcessCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工艺流程
 */
export interface MomRoute {
  /**
   * id
   */
  id: number;
  /**
   * 物料
   */
  material?: Partial<BaseMaterial>;
  /**
   * 版本
   */
  version: string;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 发布状态
   */
  publishState: PublishState;
  /**
   * 工序
   */
  processes?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工艺流程
 */
export type SaveMomRouteInput = Omit<MomRoute, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工序
 */
export interface MomRouteProcess {
  /**
   * id
   */
  id: number;
  /**
   * 工艺流程
   */
  route: Partial<MomRoute>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 生产工序
   */
  process: Partial<MomProcess>;
  /**
   * 工序别名
   */
  aliasName?: string;
  /**
   * 输入物料
   */
  inputs?: any;
  /**
   * 输出物料
   */
  outputs?: any;
  /**
   * 标准周期时间
   */
  standardCycleTime?: number;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工序
 */
export type SaveMomRouteProcessInput = Omit<MomRouteProcess, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 生产工序输入物料
 */
export interface MomRouteProcessInput {
  /**
   * id
   */
  id: number;
  /**
   * 生产工序
   */
  routeProcess: Partial<MomRouteProcess>;
  /**
   * 物料
   */
  material: Partial<BaseMaterial>;
  /**
   * 数量
   */
  quantity: number;
  /**
   * 单位
   */
  unit: Partial<BaseUnit>;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 生产工序输入物料
 */
export type SaveMomRouteProcessInputInput = Omit<MomRouteProcessInput, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 生产工序输出物料
 */
export interface MomRouteProcessOutput {
  /**
   * id
   */
  id: number;
  /**
   * 生产工序
   */
  routeProcess?: Partial<MomRouteProcess>;
  /**
   * 物料
   */
  material?: Partial<BaseMaterial>;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 生产工序输出物料
 */
export type SaveMomRouteProcessOutputInput = Omit<MomRouteProcessOutput, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工艺参数
 */
export interface MomRouteProcessParameter {
  /**
   * id
   */
  id: number;
  /**
   * 工艺流程
   */
  route?: Partial<MomRoute>;
  /**
   * 排序号
   */
  orderNum?: number;
  /**
   * 生产工序
   */
  process: Partial<MomProcess>;
  /**
   * 设备
   */
  equipment?: Partial<MomEquipment>;
  /**
   * 数采指标
   */
  dimension?: Partial<MomEquipmentCategoryDimension>;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 标准值
   */
  nominal?: number;
  /**
   * 上限值
   */
  upperLimit?: number;
  /**
   * 下限值
   */
  lowerLimit?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工艺参数
 */
export type SaveMomRouteProcessParameterInput = Omit<MomRouteProcessParameter, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 设备数采记录
 */
export interface MomRouteProcessParameterMeasurement {
  /**
   * id
   */
  id: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 设备
   */
  equipment?: Partial<MomEquipment>;
  /**
   * 工序
   */
  process?: Partial<MomProcess>;
  /**
   * 生产工单
   */
  workOrder?: Partial<MomWorkOrder>;
  /**
   * 生产报工
   */
  workReport?: Partial<MomWorkReport>;
  /**
   * 工艺参数
   */
  parameter?: Partial<MomRouteProcessParameter>;
  /**
   * 数采参数
   */
  dimension?: Partial<MomEquipmentCategoryDimension>;
  /**
   * 标准值
   */
  nominal?: number;
  /**
   * 上限值
   */
  upperLimit?: number;
  /**
   * 下限值
   */
  lowerLimit?: number;
  /**
   * 实际值
   */
  value?: number;
  /**
   * 是否超标
   */
  isOutSpecification?: boolean;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 设备数采记录
 */
export type SaveMomRouteProcessParameterMeasurementInput = Omit<MomRouteProcessParameterMeasurement, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工艺流程模板
 */
export interface MomRouteTemplate {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 工序
   */
  processes?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工艺流程模板
 */
export type SaveMomRouteTemplateInput = Omit<MomRouteTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工艺流程模板工序
 */
export interface MomRouteTemplateProcess {
  /**
   * id
   */
  id: number;
  /**
   * 工艺流程模板
   */
  routeTemplate: Partial<MomRouteTemplate>;
  /**
   * 工序
   */
  process: Partial<MomProcess>;
  /**
   * 标准周期时间
   */
  standardCycleTime?: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工艺流程模板工序
 */
export type SaveMomRouteTemplateProcessInput = Omit<MomRouteTemplateProcess, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 班次
 */
export interface MomShift {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 班次
 */
export type SaveMomShiftInput = Omit<MomShift, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 车间
 */
export interface MomShop {
  /**
   * id
   */
  id: number;
  /**
   * 建筑
   */
  building?: Partial<BaseBuilding>;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 车间
 */
export type SaveMomShopInput = Omit<MomShop, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工站
 */
export interface MomStation {
  /**
   * id
   */
  id: number;
  /**
   * 建筑
   */
  building?: Partial<BaseBuilding>;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 车间
   */
  shop?: Partial<MomShop>;
  /**
   * 产线
   */
  line?: Partial<MomLine>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工站
 */
export type SaveMomStationInput = Omit<MomStation, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 运输单
 */
export interface MomTransportOperation {
  /**
   * id
   */
  id: number;
  /**
   * 运输单号
   */
  code?: string;
  /**
   * 申请人
   */
  applicant?: Partial<OcUser>;
  /**
   * 明细项
   */
  items?: any;
  /**
   * 状态
   */
  state: BusinessInstanceState;
  /**
   * 审批状态
   */
  approvalState?: ApprovalState;
  /**
   * 其它信息
   */
  extra?: Record<string, any>;
  /**
   * 订单号
   */
  orderNumb?: string;
  /**
   * 送货单位
   */
  supplier?: string;
  /**
   * Yida ID
   */
  yidaId?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 运输单
 */
export type SaveMomTransportOperationInput = Omit<MomTransportOperation, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 运输单详情
 */
export interface MomTransportOperationItem {
  /**
   * id
   */
  id: number;
  /**
   * 申请信息
   */
  operation?: Partial<MomTransportOperation>;
  /**
   * 跟踪码
   */
  trackingCode?: string;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 罐号
   */
  binNum?: string;
  /**
   * 序列号
   */
  serialNum?: string;
  /**
   * 铅封号
   */
  sealNum?: string;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 批号
   */
  lot?: Partial<BaseLot>;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 生产厂家
   */
  manufacturer?: string;
  /**
   * 送货委托单
   */
  deliveryOrderFile?: any;
  /**
   * 质检报告
   */
  qualityInspectionReportFile?: any;
  /**
   * 铅封号照片
   */
  sealNumPicture?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 运输单详情
 */
export type SaveMomTransportOperationItemInput = Omit<MomTransportOperationItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 仓库
 */
export interface MomWarehouse {
  /**
   * id
   */
  id: number;
  /**
   * 建筑
   */
  building?: Partial<BaseBuilding>;
  /**
   * 位置
   */
  location?: Partial<BaseLocation>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 状态
   */
  state?: EnabledDisabledState;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 仓库
 */
export type SaveMomWarehouseInput = Omit<MomWarehouse, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 仓库出入库策略
 */
export interface MomWarehouseStrategy {
  /**
   * id
   */
  id: number;
  /**
   * 物料类型
   */
  materialCategory?: Partial<BaseMaterialCategory>;
  /**
   * 仓库
   */
  warehouse?: Partial<BaseLocation>;
  /**
   * 操作类型
   */
  businessType?: Partial<MomInventoryBusinessType>;
  /**
   * 策略
   */
  strategy?: WarehouseStrategy;
  /**
   * 优先级
   */
  priority?: number;
  /**
   * 合格状态校验
   */
  qualifiedFilter?: boolean;
  /**
   * 有效期校验
   */
  validityFilter?: boolean;
  /**
   * 是否让步接收
   */
  isAOD?: boolean;
  /**
   * 启用
   */
  enabled?: boolean;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 仓库出入库策略
 */
export type SaveMomWarehouseStrategyInput = Omit<MomWarehouseStrategy, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 生产投料
 */
export interface MomWorkFeed {
  /**
   * id
   */
  id: number;
  /**
   * 生产工单
   */
  workOrder?: Partial<MomWorkOrder>;
  /**
   * 原材料
   */
  rawMaterial?: Partial<BaseMaterial>;
  /**
   * 生产流转单
   */
  workTrack?: Partial<MomWorkTrack>;
  /**
   * 生产任务
   */
  workTask?: Partial<MomWorkTask>;
  /**
   * 投料任务
   */
  workFeedTask?: Partial<MomWorkFeedTask>;
  /**
   * 工艺路线
   */
  route?: Partial<MomRoute>;
  /**
   * 生产工序
   */
  routeProcess?: Partial<MomRouteProcess>;
  /**
   * 工序
   */
  process?: Partial<MomProcess>;
  /**
   * 设备
   */
  equipment?: Partial<MomEquipment>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 批号
   */
  lotNum?: string;
  /**
   * 数量(kg)
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 操作工
   */
  operators?: any;
  /**
   * 其它信息
   */
  extra?: Record<string, any>;
  /**
   * 批号信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 存油罐编号
   */
  instoreTankNumber?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 生产投料
 */
export type SaveMomWorkFeedInput = Omit<MomWorkFeed, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工序任务
 */
export interface MomWorkFeedTask {
  /**
   * id
   */
  id: number;
  /**
   * 任务号
   */
  code?: string;
  /**
   * 生产工单
   */
  workOrder?: Partial<MomWorkOrder>;
  /**
   * 生产流转单
   */
  workTrack?: Partial<MomWorkTrack>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 工艺路线
   */
  route?: Partial<MomRoute>;
  /**
   * 生产工序
   */
  routeProcess?: Partial<MomRouteProcess>;
  /**
   * 工序
   */
  process?: Partial<MomProcess>;
  /**
   * 计划开始日期
   */
  scheduledStartDate?: string;
  /**
   * 计划完成日期
   */
  scheduledFinishDate?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 设备
   */
  equipment?: Partial<MomEquipment>;
  /**
   * 操作工
   */
  assignees?: any;
  /**
   * 最晚完成日期
   */
  deadline?: string;
  /**
   * 派工人员
   */
  assigner?: Partial<BaseEmployee>;
  /**
   * 派工时间
   */
  assignedAt?: string;
  /**
   * 领工时间
   */
  acceptedAt?: string;
  /**
   * 分配状态
   */
  assignmentState?: MomWorkTaskAssignmentState;
  /**
   * 执行状态
   */
  executionState?: MomWorkTaskExecutionState;
  /**
   * 生产报工单
   */
  workReports?: any;
  /**
   * 检验单
   */
  inspectionSheets?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 实际开始时间
   */
  actualStartTime?: string;
  /**
   * 实际完成时间
   */
  actualFinishTime?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工序任务
 */
export type SaveMomWorkFeedTaskInput = Omit<MomWorkFeedTask, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 生产工单
 */
export interface MomWorkOrder {
  /**
   * id
   */
  id: number;
  /**
   * 工单号
   */
  code?: string;
  /**
   * 物料需求计划
   */
  mrp?: Partial<MomManufacturingResourcePlan>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 批次号
   */
  lotNum?: string;
  /**
   * 批号信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 工艺路线
   */
  route?: Partial<MomRoute>;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 审批状态
   */
  approvalState?: ApprovalState;
  /**
   * 分配状态
   */
  assignmentState?: MomWorkOrderAssignmentState;
  /**
   * 执行状态
   */
  executionState?: MomWorkOrderExecutionState;
  /**
   * 计划开始日期
   */
  scheduledStartDate?: string;
  /**
   * 计划完成日期
   */
  scheduledFinishDate?: string;
  /**
   * 实际开始日期
   */
  actualStartDate?: string;
  /**
   * 实际完成日期
   */
  actualFinishDate?: string;
  /**
   * 生产任务
   */
  productionTasks?: any;
  /**
   * 生产报工单
   */
  workReports?: any;
  /**
   * 检验单
   */
  inspectionSheets?: any;
  /**
   * 投料单
   */
  feeds?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 工序
   */
  processes?: any;
  /**
   * 混油比例
   */
  oilMixtureRatio?: string;
  /**
   * 石蜡油数量(kg)
   */
  paraffinQuantity?: number;
  /**
   * 搅拌时间(分钟)
   */
  stirringTime?: number;
  /**
   * 搅拌压力(MP)
   */
  stirringPressure?: number;
  /**
   * 搅拌罐编号
   */
  tankNumber?: string;
  /**
   * 卸油视频
   */
  unloadingVideo?: any;
  /**
   * DCS液位重量照片
   */
  dcsPicture?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 生产工单
 */
export type SaveMomWorkOrderInput = Omit<MomWorkOrder, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 生产报工
 */
export interface MomWorkReport {
  /**
   * id
   */
  id: number;
  /**
   * 生产报工号
   */
  code?: string;
  /**
   * 生产工单
   */
  workOrder?: Partial<MomWorkOrder>;
  /**
   * 生产流转单
   */
  workTrack?: Partial<MomWorkTrack>;
  /**
   * 生产任务
   */
  workTask?: Partial<MomWorkTask>;
  /**
   * 工艺路线
   */
  route?: Partial<MomRoute>;
  /**
   * 生产工序
   */
  routeProcess?: Partial<MomRouteProcess>;
  /**
   * 工序
   */
  process?: Partial<MomProcess>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 合格数量
   */
  qualifiedQuantity?: number;
  /**
   * 不合格数量
   */
  unqualifiedQuantity?: number;
  /**
   * 报废数量
   */
  scrapQuantity?: number;
  /**
   * 实际开始时间
   */
  actualStartTime?: string;
  /**
   * 实际完成时间
   */
  actualFinishTime?: string;
  /**
   * 工作时长
   */
  duration?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 设备
   */
  equipment?: Partial<MomEquipment>;
  /**
   * 操作工
   */
  operators?: any;
  /**
   * 数采数据
   */
  measurements?: any;
  /**
   * 其它信息
   */
  extra?: Record<string, any>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 批次号
   */
  lotNum?: string;
  /**
   * 批号信息
   */
  lot?: Partial<BaseLot>;
  /**
   * 箱号
   */
  binNum?: string;
  /**
   * 执行状态
   */
  executionState?: MomWorkTaskExecutionState;
  /**
   * 序列号
   */
  serialNum?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 生产报工
 */
export type SaveMomWorkReportInput = Omit<MomWorkReport, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工序任务
 */
export interface MomWorkTask {
  /**
   * id
   */
  id: number;
  /**
   * 任务号
   */
  code?: string;
  /**
   * 生产工单
   */
  workOrder?: Partial<MomWorkOrder>;
  /**
   * 生产流转单
   */
  workTrack?: Partial<MomWorkTrack>;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 标签
   */
  tags?: string;
  /**
   * 工艺路线
   */
  route?: Partial<MomRoute>;
  /**
   * 生产工序
   */
  routeProcess?: Partial<MomRouteProcess>;
  /**
   * 工序
   */
  process?: Partial<MomProcess>;
  /**
   * 计划开始日期
   */
  scheduledStartDate?: string;
  /**
   * 计划完成日期
   */
  scheduledFinishDate?: string;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 设备
   */
  equipment?: Partial<MomEquipment>;
  /**
   * 操作工
   */
  assignees?: any;
  /**
   * 最晚完成日期
   */
  deadline?: string;
  /**
   * 派工人员
   */
  assigner?: Partial<BaseEmployee>;
  /**
   * 派工时间
   */
  assignedAt?: string;
  /**
   * 领工时间
   */
  acceptedAt?: string;
  /**
   * 分配状态
   */
  assignmentState?: MomWorkTaskAssignmentState;
  /**
   * 执行状态
   */
  executionState?: MomWorkTaskExecutionState;
  /**
   * 生产报工单
   */
  workReports?: any;
  /**
   * 检验单
   */
  inspectionSheets?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 实际开始时间
   */
  actualStartTime?: string;
  /**
   * 实际完成时间
   */
  actualFinishTime?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工序任务
 */
export type SaveMomWorkTaskInput = Omit<MomWorkTask, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 班组
 */
export interface MomWorkTeam {
  /**
   * id
   */
  id: number;
  /**
   * 车间
   */
  shop?: Partial<MomShop>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 组长
   */
  leader?: Partial<BaseEmployee>;
  /**
   * 组员
   */
  members?: Partial<BaseEmployee>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 班组
 */
export type SaveMomWorkTeamInput = Omit<MomWorkTeam, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 生产流转单
 */
export interface MomWorkTrack {
  /**
   * id
   */
  id: number;
  /**
   * 流转单号
   */
  code?: string;
  /**
   * 生产工单
   */
  workOrder?: Partial<MomWorkOrder>;
  /**
   * 分配状态
   */
  assignmentState?: MomWorkTrackAssignmentState;
  /**
   * 执行状态
   */
  executionState?: MomWorkTrackExecutionState;
  /**
   * 物品
   */
  material?: Partial<BaseMaterial>;
  /**
   * 工艺路线
   */
  route?: Partial<MomRoute>;
  /**
   * 数量
   */
  quantity?: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 计划开始日期
   */
  scheduledStartDate?: string;
  /**
   * 计划完成日期
   */
  scheduledFinishDate?: string;
  /**
   * 实际开始日期
   */
  actualStartDate?: string;
  /**
   * 实际完成日期
   */
  actualFinishDate?: string;
  /**
   * 生产任务
   */
  productionTasks?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 生产流转单
 */
export type SaveMomWorkTrackInput = Omit<MomWorkTrack, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 部门
 */
export interface OcDepartment {
  /**
   * id
   */
  id: number;
  /**
   * 上级部门
   */
  parent?: Partial<OcDepartment>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 用户
   */
  users?: any;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 部门
 */
export type SaveOcDepartmentInput = Omit<OcDepartment, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 角色
 */
export interface OcRole {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 用户
   */
  users?: any;
  /**
   * 操作
   */
  actions?: any;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 角色
 */
export type SaveOcRoleInput = Omit<OcRole, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 用户
 */
export interface OcUser {
  /**
   * id
   */
  id: number;
  /**
   * 姓名
   */
  name: string;
  /**
   * 登录账号
   */
  login: string;
  /**
   * 密码
   */
  password?: string;
  /**
   * 是否隐藏
   */
  hidden: boolean;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * Email
   */
  email?: string;
  /**
   * 部门
   */
  department?: Partial<OcDepartment>;
  /**
   * 角色
   */
  roles?: any;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 外部用户编号
   */
  externalUserCode?: string;
  /**
   * 钉钉用户ID
   */
  dingtalkUserId?: string;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 用户
 */
export type SaveOcUserInput = Omit<OcUser, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 车间配置系统-应用
 */
export interface ShopfloorApp {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 图标地址
   */
  icon?: string;
  /**
   * 当前生效版本
   */
  version?: string;
  /**
   * 权限
   */
  permissions?: Record<string, any>;
  /**
   * 内容
   */
  content?: Record<string, any>;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 发布时间
   */
  publishedAt?: string;
  /**
   * 发布人
   */
  publishedBy?: Partial<OcUser>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 车间配置系统-应用
 */
export type SaveShopfloorAppInput = Omit<ShopfloorApp, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 车间配置系统-应用-步骤
 */
export interface ShopfloorAppStep {
  /**
   * id
   */
  id: number;
  /**
   * 应用
   */
  app: Partial<ShopfloorApp>;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 类型
   */
  kind?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 触发器
   */
  triggers?: Record<string, any>;
  /**
   * 结构
   */
  schema?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 车间配置系统-应用-步骤
 */
export type SaveShopfloorAppStepInput = Omit<ShopfloorAppStep, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 车间配置系统-应用
 */
export interface ShopfloorAppVersion {
  /**
   * id
   */
  id: number;
  /**
   * 应用
   */
  app: Partial<ShopfloorApp>;
  /**
   * 版本
   */
  version?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 内容
   */
  content?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 车间配置系统-应用
 */
export type SaveShopfloorAppVersionInput = Omit<ShopfloorAppVersion, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 车间配置系统-显示设备
 */
export interface ShopfloorDisplayDevice {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 唯一标识
   */
  identifier?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 关联工位
   */
  stations?: any;
  /**
   * 是否删除
   */
  deleted?: boolean;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 功能列表
   */
  features?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 车间配置系统-显示设备
 */
export type SaveShopfloorDisplayDeviceInput = Omit<ShopfloorDisplayDevice, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 车间配置系统-显示设备
 */
export interface ShopfloorDisplayDeviceFeature {
  /**
   * id
   */
  id: number;
  /**
   * 显示设备
   */
  displayDevice?: Partial<ShopfloorDisplayDevice>;
  /**
   * 关联工序
   */
  process?: Partial<MomProcess>;
  /**
   * 关联应用
   */
  app?: Partial<ShopfloorApp>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 打印模版
   */
  printTemplate?: Partial<MomPrintTemplate>;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 车间配置系统-显示设备
 */
export type SaveShopfloorDisplayDeviceFeatureInput = Omit<ShopfloorDisplayDeviceFeature, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 车间配置系统-工位
 */
export interface ShopfloorStation {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 关联应用
   */
  apps?: any;
  /**
   * 是否删除
   */
  deleted?: boolean;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 工序
   */
  process?: Partial<MomProcess>;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 车间配置系统-工位
 */
export type SaveShopfloorStationInput = Omit<ShopfloorStation, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 打印任务
 */
export interface SvcPrintTask {
  /**
   * id
   */
  id: number;
  /**
   * 打印机
   */
  printer?: Partial<SvcPrinter>;
  /**
   * 名称
   */
  name?: string;
  /**
   * 类型
   */
  type?: string;
  /**
   * 打印数据
   */
  data?: string;
  /**
   * 状态
   */
  state: PrintTaskState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 打印任务
 */
export type SaveSvcPrintTaskInput = Omit<SvcPrintTask, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 打印机
 */
export interface SvcPrinter {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 网络状态
   */
  networkState: PrinterNetworkState;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 打印机
 */
export type SaveSvcPrinterInput = Omit<SvcPrinter, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 系统操作
 */
export interface SysAction {
  /**
   * id
   */
  id: number;
  /**
   * 分组
   */
  group: Partial<SysActionGroup>;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 系统操作
 */
export type SaveSysActionInput = Omit<SysAction, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 系统操作分组
 */
export interface SysActionGroup {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 系统操作分组
 */
export type SaveSysActionGroupInput = Omit<SysActionGroup, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 系统操作
 */
export interface SysAuditLog {
  /**
   * id
   */
  id: number;
  /**
   * 操作人
   */
  user?: Partial<OcUser>;
  /**
   * 操作对象
   */
  targetSingularCode?: SysAuditLogTarget;
  /**
   * 操作对象名称
   */
  targetSingularName?: string;
  /**
   * 操作方法
   */
  method?: SysAuditLogMethod;
  /**
   * 变更记录
   */
  changes?: Record<string, any>;
  /**
   * 工厂
   */
  factory?: Partial<MomFactory>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 系统操作
 */
export type SaveSysAuditLogInput = Omit<SysAuditLog, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * Webhook
 */
export interface Webhook {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * URL
   */
  url: string;
  /**
   * 密钥
   */
  secret?: string;
  /**
   * namespace
   */
  namespace: string;
  /**
   * 模型Code
   */
  modelSingularCode: string;
  /**
   * 事件
   */
  events?: Record<string, any>;
  /**
   * 是否启用
   */
  enabled: boolean;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * Webhook
 */
export type SaveWebhookInput = Omit<Webhook, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * YidaConfig
 */
export interface YidaConfig {
  /**
   * id
   */
  id: number;
  /**
   * API Endpoint
   */
  yida_api_endpoint?: string;
  /**
   * API Endpoint
   */
  dingtalk_api_endpoint?: string;
  /**
   * client_id
   */
  client_id?: string;
  /**
   * client_secret
   */
  client_secret?: string;
  /**
   * uid
   */
  uid?: number;
  /**
   * access_token
   */
  access_token?: string;
  /**
   * access_token_expire_in
   */
  access_token_expire_in: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * YidaConfig
 */
export type SaveYidaConfigInput = Omit<YidaConfig, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 流程实例
 */
export interface BpmInstance {
  /**
   * id
   */
  id: number;
  /**
   * 业务流程
   */
  process: Partial<BpmProcess>;
  /**
   * 流程实例号
   */
  code: string;
  /**
   * 标题
   */
  title: string;
  /**
   * entityCode
   */
  entityCode?: string;
  /**
   * entityId
   */
  entityId?: number;
  /**
   * 表单数据
   */
  formData?: Record<string, any>;
  /**
   * 流程变量
   */
  variables?: Record<string, any>;
  /**
   * 发起人
   */
  initiator?: Partial<OcUser>;
  /**
   * 发起时间
   */
  initiatedAt?: string;
  /**
   * 撤销时间
   */
  cancelledAt?: string;
  /**
   * 完成时间
   */
  completedAt?: string;
  /**
   * 流程状态
   */
  state: BusinessInstanceState;
  /**
   * 活动
   */
  jobs?: any;
  /**
   * 当前步骤
   */
  currentJob?: Partial<BpmJob>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 流程实例
 */
export type SaveBpmInstanceInput = Omit<BpmInstance, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 流程任务
 */
export interface BpmJob {
  /**
   * id
   */
  id: number;
  /**
   * 流程实例
   */
  instance: Partial<BpmInstance>;
  /**
   * 名称
   */
  name: string;
  /**
   * 类型
   */
  kind?: BusinessActivityKind;
  /**
   * 流程节点id
   */
  flowNodeId?: string;
  /**
   * 活动类型
   */
  activityType?: string;
  /**
   * 任务
   */
  tasks?: any;
  /**
   * 状态
   */
  state: BusinessActivityState;
  /**
   * 结果
   */
  resolution?: string;
  /**
   * 开始时间
   */
  startedAt?: string;
  /**
   * 完成时间
   */
  completedAt?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 流程任务
 */
export type SaveBpmJobInput = Omit<BpmJob, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 流程人工任务
 */
export interface BpmManualTask {
  /**
   * id
   */
  id: number;
  /**
   * 流程任务
   */
  job: Partial<BpmJob>;
  /**
   * 负责人
   */
  assignee: Partial<OcUser>;
  /**
   * 状态
   */
  state: BusinessTaskState;
  /**
   * 结果
   */
  resolution?: string;
  /**
   * 审批意见
   */
  comment?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 流程人工任务
 */
export type SaveBpmManualTaskInput = Omit<BpmManualTask, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 流程定义
 */
export interface BpmProcess {
  /**
   * id
   */
  id: number;
  /**
   * 分组
   */
  category?: Partial<BpmProcessCategory>;
  /**
   * 类型
   */
  type?: string;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 类型设置
   */
  typeConfig?: Record<string, any>;
  /**
   * 表单配置
   */
  formConfig?: Record<string, any>;
  /**
   * 流程配置
   */
  flowConfig?: Record<string, any>;
  /**
   * 列表配置
   */
  listConfig?: Record<string, any>;
  /**
   * 高级设置
   */
  advancedConfig?: Record<string, any>;
  /**
   * 状态
   */
  state: BusinessProcessState;
  /**
   * 当前版本
   */
  activeRevision?: Partial<BpmProcessRevision>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 流程定义
 */
export type SaveBpmProcessInput = Omit<BpmProcess, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 流程分组
 */
export interface BpmProcessCategory {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 流程分组
 */
export type SaveBpmProcessCategoryInput = Omit<BpmProcessCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 业务流程版本
 */
export interface BpmProcessRevision {
  /**
   * id
   */
  id: number;
  /**
   * 业务流程
   */
  process: Partial<BpmProcess>;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 表单配置
   */
  formConfig?: Record<string, any>;
  /**
   * 流程配置
   */
  flowConfig?: Record<string, any>;
  /**
   * 高级设置
   */
  advancedConfig?: Record<string, any>;
  /**
   * 状态
   */
  publishState: PublishState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 业务流程版本
 */
export type SaveBpmProcessRevisionInput = Omit<BpmProcessRevision, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * IoT数据源
 */
export interface IotDataSource {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 编号
   */
  code: string;
  /**
   * 备注
   */
  description?: string;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * IoT数据源
 */
export type SaveIotDataSourceInput = Omit<IotDataSource, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 属性
 */
export interface IotAttribute {
  /**
   * id
   */
  id: number;
  /**
   * 所属类型
   */
  type?: Partial<IotType>;
  /**
   * 数据类型
   */
  dataType: IotAttributeDataType;
  /**
   * 数据标签
   */
  isDataTag: boolean;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 属性
 */
export type SaveIotAttributeInput = Omit<IotAttribute, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 网关
 */
export interface IotGateway {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 属性
   */
  attributes?: Record<string, any>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 管理物品
   */
  managedThings?: any;
  /**
   * 访问令牌
   */
  accessToken?: string;
  /**
   * MQTT客户端id
   */
  mqtt_client_id?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 网关
 */
export type SaveIotGatewayInput = Omit<IotGateway, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 测量指标
 */
export interface IotMeasurement {
  /**
   * id
   */
  id: number;
  /**
   * 所属类型
   */
  type?: Partial<IotType>;
  /**
   * 数据类型
   */
  dataType: IotMeasurementDataType;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 长度
   */
  dataLength: number;
  /**
   * 计量单位
   */
  unit?: string;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 测量指标
 */
export type SaveIotMeasurementInput = Omit<IotMeasurement, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 规则
 */
export interface IotRule {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 触发器配置
   */
  triggerConfig?: Record<string, any>;
  /**
   * 响应配置
   */
  reactionConfig?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 规则
 */
export type SaveIotRuleInput = Omit<IotRule, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 物品
 */
export interface IotThing {
  /**
   * id
   */
  id: number;
  /**
   * 类型
   */
  type?: Partial<IotType>;
  /**
   * 编号
   */
  code: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 属性
   */
  attributes?: Record<string, any>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 网关
   */
  gateway?: Partial<IotGateway>;
  /**
   * 访问令牌
   */
  accessToken?: string;
  /**
   * MQTT客户端id
   */
  mqtt_client_id?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 物品
 */
export type SaveIotThingInput = Omit<IotThing, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 类型
 */
export interface IotType {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 属性
   */
  attributes?: any;
  /**
   * 测量指标
   */
  measurements?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 类型
 */
export type SaveIotTypeInput = Omit<IotType, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 机器
 */
export interface IotMachine {
  /**
   * id
   */
  id: number;
  /**
   * 机器号
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 备注
   */
  description?: string;
  /**
   * 最新字段
   */
  latestFields?: Record<string, any>;
  /**
   * 运行时字段
   */
  runtimeFields?: Record<string, any>;
  /**
   * 机器类型
   */
  machineType: Partial<IotMachineType>;
  /**
   * 状态
   */
  state?: Partial<IotMachineState>;
  /**
   * 外部编号
   */
  externalCode?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 机器
 */
export type SaveIotMachineInput = Omit<IotMachine, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 机器属性
 */
export interface IotMachineAttribute {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 编号
   */
  code: string;
  /**
   * 备注
   */
  description?: string;
  /**
   * 数据类型
   */
  dataType: IotAttributeDataType;
  /**
   * 已配机器类型
   */
  machines?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 机器属性
 */
export type SaveIotMachineAttributeInput = Omit<IotMachineAttribute, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 机器属性绑定
 */
export interface IotMachineAttributeBind {
  /**
   * id
   */
  id: number;
  /**
   * 机器类型
   */
  machineType: Partial<IotMachineType>;
  /**
   * 机器
   */
  machine: Partial<IotMachine>;
  /**
   * 机器属性
   */
  machineAttribute: Partial<IotMachineAttribute>;
  /**
   * 数据源
   */
  dataSource: Partial<IotDataSource>;
  /**
   * 配置
   */
  config: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 机器属性绑定
 */
export type SaveIotMachineAttributeBindInput = Omit<IotMachineAttributeBind, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 机器字段
 */
export interface IotMachineField {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 编号
   */
  code: string;
  /**
   * 备注
   */
  description?: string;
  /**
   * 数据类型
   */
  dataType: IotAttributeDataType;
  /**
   * 已配机器类型
   */
  machines?: any;
  /**
   * 新纪录时置空
   */
  clearOnNew?: boolean;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 机器字段
 */
export type SaveIotMachineFieldInput = Omit<IotMachineField, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 机器状态
 */
export interface IotMachineState {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 编号
   */
  code: string;
  /**
   * 备注
   */
  description?: string;
  /**
   * 颜色
   */
  color: string;
  /**
   * 标记为工作中
   */
  isUptime?: boolean;
  /**
   * 已配机器类型
   */
  machines?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 机器状态
 */
export type SaveIotMachineStateInput = Omit<IotMachineState, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 机器触发器
 */
export interface IotMachineTrigger {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 备注
   */
  description?: string;
  /**
   * 机器类型
   */
  machineType: Partial<IotMachineType>;
  /**
   * 事件类型
   */
  eventType: IotTriggerEventType;
  /**
   * 事件触发配置
   */
  eventValue: Record<string, any>;
  /**
   * 事件脚本配置
   */
  eventAction: Record<string, any>;
  /**
   * 是否启用
   */
  isEnabled?: boolean;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 机器触发器
 */
export type SaveIotMachineTriggerInput = Omit<IotMachineTrigger, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 机器类型
 */
export interface IotMachineType {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 编号
   */
  code: string;
  /**
   * 备注
   */
  description?: string;
  /**
   * 已配机器
   */
  machines?: any;
  /**
   * 机器字段
   */
  fields?: any;
  /**
   * 机器属性
   */
  attributes?: any;
  /**
   * 机器状态
   */
  states?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 机器类型
 */
export type SaveIotMachineTypeInput = Omit<IotMachineType, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 里程碑
 */
export interface PmMilestone {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project?: Partial<PmProject>;
  /**
   * 阶段
   */
  phase?: Partial<PmPhase>;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 截止日期
   */
  deadline?: string;
  /**
   * 状态
   */
  state?: PmMilestoneState;
  /**
   * 完成日期
   */
  completedAt?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 里程碑
 */
export type SavePmMilestoneInput = Omit<PmMilestone, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 阶段
 */
export interface PmPhase {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project?: Partial<PmProject>;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 计划开始日期
   */
  startDate?: string;
  /**
   * 计划结束日期
   */
  endDate?: string;
  /**
   * 状态
   */
  state?: PmPhaseState;
  /**
   * 实际开始日期
   */
  actualStartedAt?: string;
  /**
   * 实际完成日期
   */
  actualCompletedAt?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 阶段
 */
export type SavePmPhaseInput = Omit<PmPhase, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目
 */
export interface PmProject {
  /**
   * id
   */
  id: number;
  /**
   * 编号
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 项目类型
   */
  category?: Partial<PmProjectCategory>;
  /**
   * 事项编号前缀
   */
  workItemCodePrefix?: string;
  /**
   * 客户
   */
  customer?: Partial<BasePartner>;
  /**
   * 当前阶段
   */
  stage: PmProjectStage;
  /**
   * 状态
   */
  state: PmProjectState;
  /**
   * 负责人
   */
  owner?: Partial<OcUser>;
  /**
   * 销售
   */
  salesman?: Partial<OcUser>;
  /**
   * 项目经理
   */
  projectManager?: Partial<OcUser>;
  /**
   * 经销商
   */
  distributor?: Partial<BasePartner>;
  /**
   * 阶段
   */
  phases?: any;
  /**
   * 里程碑
   */
  milestones?: any;
  /**
   * 相关订单
   */
  orders?: any;
  /**
   * 工作项类型
   */
  workItemTypes?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目
 */
export type SavePmProjectInput = Omit<PmProject, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目预算
 */
export interface PmProjectBudget {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project: Partial<PmProject>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 类型
   */
  type: PmBudgetType;
  /**
   * 标题
   */
  title: string;
  /**
   * 产品/服务
   */
  subject?: Partial<BaseMaterial>;
  /**
   * 成本单价
   */
  cost: number;
  /**
   * 单价
   */
  price: number;
  /**
   * 数量
   */
  quantity: number;
  /**
   * 单位
   */
  unit?: Partial<BaseUnit>;
  /**
   * 税率
   */
  taxRate: number;
  /**
   * 业务类型
   */
  businessCategory?: Partial<FinBusinessCategory>;
  /**
   * 费用类型
   */
  expenseCategory?: Partial<FinExpenseCategory>;
  /**
   * 计划付款日期
   */
  scheduledPaymentDate?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目预算
 */
export type SavePmProjectBudgetInput = Omit<PmProjectBudget, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目类型
 */
export interface PmProjectCategory {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目类型
 */
export type SavePmProjectCategoryInput = Omit<PmProjectCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目成本
 */
export interface PmProjectCostBudget {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project: Partial<PmProject>;
  /**
   * 标题
   */
  title: string;
  /**
   * 金额
   */
  amount: number;
  /**
   * 成本类型
   */
  costCategory?: Partial<PmProjectCostCategory>;
  /**
   * 付款时间
   */
  paymentTime?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目成本
 */
export type SavePmProjectCostBudgetInput = Omit<PmProjectCostBudget, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目成本类型
 */
export interface PmProjectCostCategory {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目成本类型
 */
export type SavePmProjectCostCategoryInput = Omit<PmProjectCostCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目事件
 */
export interface PmProjectEvent {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project: Partial<PmProject>;
  /**
   * 标题
   */
  title: string;
  /**
   * 描述
   */
  content?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目事件
 */
export type SavePmProjectEventInput = Omit<PmProjectEvent, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目角色
 */
export interface PmProjectRole {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project: Partial<PmProject>;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 用户
   */
  users?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目角色
 */
export type SavePmProjectRoleInput = Omit<PmProjectRole, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目工作项步骤角色
 */
export interface PmProjectWorkItemStepRole {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project?: Partial<PmProject>;
  /**
   * 工作项类型
   */
  workItemType?: Partial<PmWorkItemType>;
  /**
   * 工作项步骤
   */
  workItemTypeStep?: Partial<PmWorkItemTypeStep>;
  /**
   * 项目角色
   */
  projectRole?: Partial<PmProjectRole>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目工作项步骤角色
 */
export type SavePmProjectWorkItemStepRoleInput = Omit<PmProjectWorkItemStepRole, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目工作项类型
 */
export interface PmProjectWorkItemType {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project?: Partial<PmProject>;
  /**
   * 工作项类型
   */
  workItemType?: Partial<PmWorkItemType>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目工作项类型
 */
export type SavePmProjectWorkItemTypeInput = Omit<PmProjectWorkItemType, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工作项
 */
export interface PmWorkItem {
  /**
   * id
   */
  id: number;
  /**
   * 工作项类型
   */
  workItemType?: Partial<PmWorkItemType>;
  /**
   * 项目
   */
  project?: Partial<PmProject>;
  /**
   * 里程碑
   */
  milestone?: Partial<PmMilestone>;
  /**
   * 编号
   */
  code: string;
  /**
   * 标题
   */
  title: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 父工作项
   */
  parent?: Partial<PmWorkItem>;
  /**
   * 子工作项
   */
  subItems?: Partial<PmWorkItem>;
  /**
   * 责任人
   */
  assignee?: Partial<OcUser>;
  /**
   * 分配人
   */
  assigner?: Partial<OcUser>;
  /**
   * 计划开始时间
   */
  scheduledStartTime?: string;
  /**
   * 计划完成时间
   */
  scheduledCompleteTime?: string;
  /**
   * 实际开始时间
   */
  actualStartTime?: string;
  /**
   * 实际完成时间
   */
  actualCompleteTime?: string;
  /**
   * 当前步骤
   */
  currentStep?: Partial<PmWorkItemTypeStep>;
  /**
   * 当前步骤责任人
   */
  currentStepAssignee?: Partial<OcUser>;
  /**
   * 步骤
   */
  steps?: any;
  /**
   * 预计工作量
   */
  estimate?: string;
  /**
   * 进度
   */
  progress: number;
  /**
   * 进度权重
   */
  progressCoefficient: number;
  /**
   * 状态
   */
  state: PmWorkItemState;
  /**
   * 关闭决定
   */
  resolution?: Partial<OcUser>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工作项
 */
export type SavePmWorkItemInput = Omit<PmWorkItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工作项关闭决定
 */
export interface PmWorkItemResolution {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工作项关闭决定
 */
export type SavePmWorkItemResolutionInput = Omit<PmWorkItemResolution, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工作项步骤记录
 */
export interface PmWorkItemStep {
  /**
   * id
   */
  id: number;
  /**
   * 工作项
   */
  workItem?: Partial<PmWorkItem>;
  /**
   * 步骤
   */
  workItemTypeStep?: Partial<PmWorkItemTypeStep>;
  /**
   * 责任人
   */
  assignee?: Partial<OcUser>;
  /**
   * 分配人
   */
  assigner?: Partial<OcUser>;
  /**
   * 计划开始时间
   */
  scheduledStartTime?: string;
  /**
   * 计划完成时间
   */
  scheduledCompleteTime?: string;
  /**
   * 实际开始时间
   */
  actualStartTime?: string;
  /**
   * 实际完成时间
   */
  actualCompleteTime?: string;
  /**
   * 状态
   */
  state: PmWorkItemStepState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工作项步骤记录
 */
export type SavePmWorkItemStepInput = Omit<PmWorkItemStep, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工作项类型
 */
export interface PmWorkItemType {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 项目
   */
  projects?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工作项类型
 */
export type SavePmWorkItemTypeInput = Omit<PmWorkItemType, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 工作项类型步骤
 */
export interface PmWorkItemTypeStep {
  /**
   * id
   */
  id: number;
  /**
   * 工作项类型
   */
  workItemType?: Partial<PmWorkItemType>;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 配置
   */
  config?: Record<string, any>;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 工作项类型步骤
 */
export type SavePmWorkItemTypeStepInput = Omit<PmWorkItemTypeStep, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 系统设置项分组设置
 */
export interface SystemSettingGroupSetting {
  /**
   * id
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 权限设置
   */
  permissionAssignments?: Record<string, any>;
  /**
   * 设置项
   */
  items?: any;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 系统设置项分组设置
 */
export type SaveSystemSettingGroupSettingInput = Omit<SystemSettingGroupSetting, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 系统设置项
 */
export interface SystemSettingItem {
  /**
   * id
   */
  id: number;
  /**
   * 分组代码
   */
  groupCode: string;
  /**
   * 设置项代码
   */
  itemCode: string;
  /**
   * 设置值
   */
  value?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 系统设置项
 */
export type SaveSystemSettingItemInput = Omit<SystemSettingItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 系统设置项设置
 */
export interface SystemSettingItemSetting {
  /**
   * id
   */
  id: number;
  /**
   * 设置项分组
   */
  group?: Partial<SystemSettingGroupSetting>;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 类型
   */
  type: SettingItemType;
  /**
   * 编码
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 其它设置
   */
  config?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 系统设置项设置
 */
export type SaveSystemSettingItemSettingInput = Omit<SystemSettingItemSetting, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 通知
 */
export interface Notification {
  /**
   * id
   */
  id: number;
  /**
   * 标题
   */
  title: string;
  /**
   * 内容
   */
  content?: string;
  /**
   * 已读
   */
  read?: boolean;
  /**
   * 详细信息
   */
  details?: Record<string, any>;
  /**
   * 用户
   */
  user?: Partial<OcUser>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 通知
 */
export type SaveNotificationInput = Omit<Notification, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
