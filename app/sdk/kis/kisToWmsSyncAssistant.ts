import { detectChangedFieldsOfEntity, EntityManager, Logger, type FindEntityOptions, type IRpdServer, type RouteContext } from "@ruiapp/rapid-core";
import type { EntitySyncAssistant, EntitySyncContract, SyncContext } from "rapid-plugins/entitySync/EntitySyncPluginTypes";
import KingdeeSDK, { KisListApiResult, newKisApiError } from "./api";
import KisHelper from "./helper";
import { get, isArray, isNil, pick } from "lodash";

export type FuncHandleFetchSourceEntities<TSourceEntity, TTargetEntity, TSyncContextState> = (
  syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
) => Promise<TSourceEntity[]>;

export type FuncSourceEntityFilter<TSourceEntity, TTargetEntity, TSyncContextState> = (
  syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
  source: Partial<TSourceEntity>,
) => Promise<boolean>;

export type FuncMapToTargetEntity<TSourceEntity, TTargetEntity, TSyncContextState> = (
  syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
  source: Partial<TSourceEntity>,
) => Promise<Partial<TTargetEntity>>;

export type FuncHandleFindTargetEntity<TSourceEntity, TTargetEntity, TSyncContextState> = (
  syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
  predicate: Partial<TTargetEntity>,
) => Promise<Partial<TTargetEntity> | undefined>;

export type FetchKisEntitiesApiName = "List" | "GetListDetails";

export type GenKisToWmsSyncAssistantCreatorOptions<TSourceEntity, TTargetEntity, TSyncContextState> = {
  /**
   * 获取源实体的接口名。默认为List
   */
  fetchSourceEntitiesApiName?: FetchKisEntitiesApiName;

  handleFetchSourceEntities?: FuncHandleFetchSourceEntities<TSourceEntity, TTargetEntity, TSyncContextState>;

  /**
   * 判断源实体是否需要同步
   * @param source
   * @returns
   */
  sourceEntityFilter?: FuncSourceEntityFilter<TSourceEntity, TTargetEntity, TSyncContextState>;

  /**
   * 将源实体映射成目标实体
   * @param source
   * @returns
   */
  mapToTargetEntity: FuncMapToTargetEntity<TSourceEntity, TTargetEntity, TSyncContextState>;

  /**
   * 查找目标实体。如果没有实现此方法，则根据 contract.targetEntityUniqueKeys 设置来查找。
   * @param server
   * @param predicate
   * @returns
   */
  handleFindTargetEntity?: FuncHandleFindTargetEntity<TSourceEntity, TTargetEntity, TSyncContextState>;
};

export function genKisToWmsSyncAssistantCreator<TSourceEntity, TTargetEntity extends { id: any }, TSyncContextState>(
  options: GenKisToWmsSyncAssistantCreatorOptions<TSourceEntity, TTargetEntity, TSyncContextState>,
) {
  return async function createKisToWmsSyncAssistant(
    server: IRpdServer,
    routeContext: RouteContext,
    contract: EntitySyncContract<TSourceEntity, TTargetEntity, TSyncContextState>,
  ): Promise<EntitySyncAssistant<TSourceEntity, TTargetEntity, TSyncContextState>> {
    const assistant = new KisToWmsSyncAssistant<TSourceEntity, TTargetEntity, TSyncContextState>({
      server,
      routeContext,
      contract,
      fetchSourceEntitiesApiName: options.fetchSourceEntitiesApiName,
      handleFetchSourceEntities: options.handleFetchSourceEntities,
      sourceEntityFilter: options.sourceEntityFilter,
      mapToTargetEntity: options.mapToTargetEntity,
      handleFindTargetEntity: options.handleFindTargetEntity,
    });

    await assistant.init();
    return assistant;
  };
}

export type FetchKisEntitiesOptions = {
  fetchAll: boolean;

  fetchPageSize?: number;

  requestParams?: Record<string, any>;
};

export type KisToWmsSyncContract<TSourceEntity, TTargetEntity, TSyncContextState = Record<string, any>> = EntitySyncContract<
  TSourceEntity,
  TTargetEntity,
  TSyncContextState,
  FetchKisEntitiesOptions
>;

export type KisToWmsSyncAssistantInitOptions<TSourceEntity, TTargetEntity, TSyncContextState> = {
  server: IRpdServer;
  routeContext: RouteContext;
  contract: KisToWmsSyncContract<TSourceEntity, TTargetEntity, TSyncContextState>;

  /**
   * 获取源实体的接口名。默认为List
   */
  fetchSourceEntitiesApiName?: FetchKisEntitiesApiName;

  handleFetchSourceEntities?: FuncHandleFetchSourceEntities<TSourceEntity, TTargetEntity, TSyncContextState>;

  /**
   * 判断源实体是否需要同步
   * @param source
   * @returns
   */
  sourceEntityFilter?: FuncSourceEntityFilter<TSourceEntity, TTargetEntity, TSyncContextState>;

  /**
   * 将源实体映射成目标实体
   * @param source
   * @returns
   */
  mapToTargetEntity: FuncMapToTargetEntity<TSourceEntity, TTargetEntity, TSyncContextState>;

  /**
   * 查找目标实体。
   * @param server
   * @param predicate
   * @returns
   */
  handleFindTargetEntity?: FuncHandleFindTargetEntity<TSourceEntity, TTargetEntity, TSyncContextState>;
};

export default class KisToWmsSyncAssistant<TSourceEntity, TTargetEntity extends { id: any }, TSyncContextState>
  implements EntitySyncAssistant<TSourceEntity, TTargetEntity, TSyncContextState>
{
  private server: IRpdServer;
  private logger: Logger;
  private routeContext: RouteContext;
  private contract: KisToWmsSyncContract<TSourceEntity, TTargetEntity, TSyncContextState>;
  private kis!: KingdeeSDK;

  private targetEntityManager: EntityManager<TTargetEntity>;

  private fetchSourceEntitiesApiName?: FetchKisEntitiesApiName;

  private handleFetchSourceEntities?: FuncHandleFetchSourceEntities<TSourceEntity, TTargetEntity, TSyncContextState>;

  private sourceEntityFilter?: FuncSourceEntityFilter<TSourceEntity, TTargetEntity, TSyncContextState>;

  private handleFindTargetEntity?: FuncHandleFindTargetEntity<TSourceEntity, TTargetEntity, TSyncContextState>;

  constructor(options: KisToWmsSyncAssistantInitOptions<TSourceEntity, TTargetEntity, TSyncContextState>) {
    this.server = options.server;
    this.logger = this.server.getLogger().child({ label: "KisToWmsSyncAssistant" });
    this.routeContext = options.routeContext;
    this.contract = options.contract;

    this.targetEntityManager = this.server.getEntityManager<TTargetEntity>(this.contract.targetEntityTypeCode);

    this.fetchSourceEntitiesApiName = options.fetchSourceEntitiesApiName;
    this.handleFetchSourceEntities = options.handleFetchSourceEntities;
    this.sourceEntityFilter = options.sourceEntityFilter;
    this.mapToTargetEntity = options.mapToTargetEntity;

    if (options.handleFindTargetEntity) {
      this.handleFindTargetEntity = options.handleFindTargetEntity;
    }
  }

  async init() {
    this.kis = await new KisHelper(this.server).NewAPIClient(this.server.getLogger());
  }

  async fetchSourceEntities(syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>): Promise<TSourceEntity[]> {
    (syncContext.states as any).kis = this.kis;

    if (this.handleFetchSourceEntities) {
      return await this.handleFetchSourceEntities(syncContext);
    }

    const { fetchSourceOptions } = this.contract;

    let pageNum = 1;
    const pageSize = fetchSourceOptions?.fetchPageSize || 100;
    let fetchAll = get(fetchSourceOptions, "fetchAll", true);

    let sourceEntities: TSourceEntity[] = [];

    while (true) {
      const request = {
        CurrentPage: pageNum,
        ItemsOfPage: pageSize,
        ...fetchSourceOptions?.requestParams,
      };
      const apiName = "List";
      const url = `/koas/APP006992/api/${this.contract.sourceEntityTypeCode}/${apiName}`;
      const response = await this.kis.PostResourceRequest(url, request);

      const apiResult: KisListApiResult = response.data || {};
      const errcode = apiResult.errcode;
      if (errcode) {
        throw newKisApiError("获取源系统数据失败。", apiResult);
      }

      const fetchedItems = get(apiResult, "data.List", []);
      sourceEntities = sourceEntities.concat(fetchedItems);

      if (!fetchAll || !apiResult.data.HasNextPage) {
        break;
      }

      pageNum++;
    }

    return sourceEntities;
  }

  async filterSourceEntities(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    sourceEntities: Partial<TSourceEntity>[],
  ): Promise<Partial<TSourceEntity>[]> {
    if (!this.sourceEntityFilter) {
      return sourceEntities;
    }

    const result: Partial<TSourceEntity>[] = [];

    for (const source of sourceEntities) {
      const isMatch = await this.sourceEntityFilter(syncContext, source);
      if (isMatch) {
        result.push(source);
      }
    }
    return result;
  }

  async mapToTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    source: Partial<TSourceEntity>,
  ): Promise<Partial<TTargetEntity>> {
    throw new Error("Method mapToTargetEntity not implemented.");
  }

  async findTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    predicate: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity> | undefined> {
    if (this.handleFindTargetEntity) {
      return await this.handleFindTargetEntity(syncContext, predicate);
    }

    let { targetEntityUniqueKeys } = this.contract;
    if (!targetEntityUniqueKeys) {
      throw new Error("查找目标实体失败，targetEntityUniqueKeys未配置。");
    }

    for (let targetEntityUniqueKey of targetEntityUniqueKeys) {
      if (!isArray(targetEntityUniqueKey)) {
        targetEntityUniqueKey = [targetEntityUniqueKey] as any;
      }

      const filters: FindEntityOptions["filters"] = [];
      for (const keyField of targetEntityUniqueKey as (keyof TTargetEntity)[]) {
        const fieldValue = predicate[keyField];
        if (isNil(fieldValue)) {
          filters.push({
            operator: "null",
            field: keyField as string,
          });
        } else {
          filters.push({
            operator: "eq",
            field: keyField as string,
            value: fieldValue,
          });
        }
      }

      const entities = await this.targetEntityManager.findEntities({
        filters,
        keepNonPropertyFields: true,
      });

      if (entities.length > 1) {
        const matchValues = pick(predicate, targetEntityUniqueKey);
        throw new Error(`找到多个匹配的目标实体。${JSON.stringify(matchValues)}`);
      }

      if (entities.length === 1) {
        return entities[0];
      }
    }
  }

  async createTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    target: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity>> {
    return await this.targetEntityManager.createEntity({
      entity: target,
      postponeUniquenessCheck: true,
    });
  }

  async updateTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    targetToSave: Partial<TTargetEntity>,
    currentTargetEntity: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity>> {
    return await this.targetEntityManager.updateEntityById({
      id: currentTargetEntity.id,
      entityToSave: targetToSave,
      postponeUniquenessCheck: true,
    });
  }

  async deleteTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    target: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity>> {
    throw new Error("Method deleteTargetEntity not implemented.");
  }

  async restoreTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    target: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity>> {
    throw new Error("Method restoreTargetEntity not implemented.");
  }

  async createSoftDeletedEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    target: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity>> {
    throw new Error("Method createSoftDeletedEntity not implemented.");
  }

  async restoreAndUpdateEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    targetToSave: Partial<TTargetEntity>,
    currentTargetEntity: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity>> {
    throw new Error("Method restoreAndUpdateEntity not implemented.");
  }

  async detectChangedFieldsOfTargetEntity(
    syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
    source: Partial<TSourceEntity>,
    targetEntityToSave: Partial<TTargetEntity>,
    currentTargetEntity: Partial<TTargetEntity>,
  ): Promise<Partial<TTargetEntity> | null> {
    const server = this.server;
    const model = server.getModel({
      singularCode: this.contract.targetEntityTypeCode,
    });

    if (!model) {
      // 理论上不会出现这种情况。
      throw new Error(`无法检测是否需要更新目标实体。目标实体类型 ${this.contract.targetEntityTypeCode} 无效。`);
    }

    const changes = detectChangedFieldsOfEntity(this.server, model, currentTargetEntity, targetEntityToSave);
    return changes as any;
  }
}
