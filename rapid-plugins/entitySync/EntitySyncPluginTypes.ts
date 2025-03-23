import { IRpdServer, Logger, RouteContext } from "@ruiapp/rapid-core";

export type EntitySyncPluginInitOptions = {
  syncContracts: EntitySyncContract[];
};

export type EntitySyncContract<TSourceEntity = any, TTargetEntity = any, TSyncContextState = Record<string, any>, TFetchSourceOptions = any> = {
  /**
   * 名称
   */
  name: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 同步cron表达式。
   */
  jobCronTime: string;

  /**
   * 源实体类型代号
   */
  sourceEntityTypeCode: string;

  /**
   * 源实体类型名称
   */
  sourceEntityTypeName?: string;

  /**
   * 源实体Id字段
   */
  sourceEntityIdField: string;

  /**
   * 源实体编号字段
   */
  sourceEntityCodeField?: string;

  /**
   * 源实体名称字段
   */
  sourceEntityNameField?: string;

  /**
   * 源实体展示字段
   */
  sourceEntityDisplayField?: string;

  /**
   * 加载源实体数据时的选项
   */
  fetchSourceOptions?: TFetchSourceOptions;

  /**
   * 过滤源实体数据时的选项
   */
  filterSourceOptions?: Record<string, any>;

  /**
   * 目标实体类型代号
   */
  targetEntityTypeCode: string;

  /**
   * 目标实体Id字段
   */
  targetEntityIdField: string;

  /**
   * 目标实体编号字段
   */
  targetEntityCodeField?: string;

  /**
   * 目标实体名称字段
   */
  targetEntityNameField?: string;

  /**
   * 目标实体的唯一键。可以配置多个唯一键。
   */
  targetEntityUniqueKeys: (keyof TTargetEntity | (keyof TTargetEntity)[])[];

  /**
   * 需要同步更新目标实体的哪些字段，此设置会被用来判断是否需要更新目标实体。
   * - 没有设置的其它字段不会被更新，以避免目标系统中修改过的信息被覆盖。
   * - 如果希望源实体同步后不再被更新，可将此项设置为空数组。
   */
  targetEntityFieldsToUpdate: string[];

  /**
   * 同步助理，负责实体的加载、过滤、转换、保存等。
   */
  assistantCreator: SyncAssistantCreator<TSourceEntity, TTargetEntity, TSyncContextState>;
};

export type SyncProgress = {
  current: number;
  total: number;
};

export type SyncContext<TSourceEntity, TTargetEntity, TSyncContextState = Record<string, any>> = {
  server: IRpdServer;
  routeContext: RouteContext;
  logger: Logger;
  contract: EntitySyncContract<TSourceEntity, TTargetEntity, TSyncContextState>;
  progress: SyncProgress;
  states: TSyncContextState;
};

export interface SyncAssistantCreator<TSourceEntity, TTargetEntity, TSyncContextState> {
  (server: IRpdServer, routeContext: RouteContext, contract: EntitySyncContract<TSourceEntity, TTargetEntity>): Promise<
    EntitySyncAssistant<TSourceEntity, TTargetEntity, TSyncContextState>
  >;
}

export interface EntitySyncAssistant<TSourceEntity = any, TTargetEntity = any, TSyncContextState = Record<string, any>> {
  /**
   * 加载源实体数据
   */
  fetchSourceEntities(syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>): Promise<TSourceEntity[]>;

  /**
   * 过滤源实体数据
   */
  filterSourceEntities?: (
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    sourceEntities: Partial<TSourceEntity>[],
  ) => Promise<Partial<TSourceEntity>[]>;

  /**
   * 将源实体转换为目标实体
   * @param source
   */
  mapToTargetEntity: (
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    source: Partial<TSourceEntity>,
  ) => Promise<Partial<TTargetEntity>>;

  /**
   * 在目标系统中查找符合条件的目标实体
   * @param predicate
   */
  findTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    predicate: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity> | undefined>;

  /**
   * 在目标系统中创建目标实体
   * @param target
   */
  createTargetEntity?: (
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    target: Partial<TTargetEntity>,
  ) => Promise<Partial<TTargetEntity>>;

  /**
   * 在目标系统中更新目标实体
   * @param targetToSave
   */
  updateTargetEntity?: (
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    targetToSave: Partial<TTargetEntity>,
    currentTargetEntity: Partial<TTargetEntity>,
  ) => Promise<Partial<TTargetEntity>>;

  /**
   * 在目标系统中更新删除目标实体
   * @param target
   */
  deleteTargetEntity?: (
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    target: Partial<TTargetEntity>,
  ) => Promise<Partial<TTargetEntity>>;

  /**
   * 在目标系统中恢复目标实体
   * @param target
   */
  restoreTargetEntity?: (
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    target: Partial<TTargetEntity>,
  ) => Promise<Partial<TTargetEntity>>;

  /**
   * 在目标系统中创建已被软删除的目标实体
   * @param target
   */
  createSoftDeletedEntity?: (
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    target: Partial<TTargetEntity>,
  ) => Promise<Partial<TTargetEntity>>;

  /**
   * 在目标系统中恢复并更新已被软删除的目标实体
   * @param target
   */
  restoreAndUpdateEntity?: (
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    targetToSave: Partial<TTargetEntity>,
    currentTargetEntity: Partial<TTargetEntity>,
  ) => Promise<Partial<TTargetEntity>>;

  /**
   * 检测 targetEntityToSave 和 currentTargetEntity 之间否存在差异，以便决定是否需要更新目标实体。
   * @param source
   * @param targetEntityToSave
   * @param currentTargetEntity
   */
  detectChangedFieldsOfTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    source: Partial<TSourceEntity>,
    targetEntityToSave: Partial<TTargetEntity>,
    currentTargetEntity: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity> | null>;
}

export type SyncActionType =
  | "doNothing"
  | "createEntity"
  | "createSoftDeletedEntity"
  | "updateEntity"
  | "deleteEntity"
  | "restoreEntity"
  | "restoreAndUpdateEntity";

export type EntitySyncDecision<TTargetEntity> = {
  syncAction: SyncActionType;
  targetEntityToSave?: Partial<TTargetEntity>;
  targetEntityToDelete?: Partial<TTargetEntity>;
};

export type SyncSourceEntityInput = {};
