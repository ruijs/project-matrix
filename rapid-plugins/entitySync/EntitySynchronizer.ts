import type { IRpdServer, Logger, RouteContext } from "@ruiapp/rapid-core";
import type { EntitySyncAssistant, EntitySyncContract, EntitySyncDecision, SyncContext } from "./EntitySyncPluginTypes";
import { get, isNil, pick } from "lodash";

export type PerformSyncCycleOptions<TSourceEntity = any, TTargetEntity = any> = {
  server: IRpdServer;
  routeContext: RouteContext;
  contract: EntitySyncContract<TSourceEntity, TTargetEntity>;
};

export async function performSyncCycle<TSourceEntity = any, TTargetEntity = any, TSyncContextState extends Record<string, any> = Record<string, any>>(
  options: PerformSyncCycleOptions,
) {
  const { server, routeContext, contract } = options;
  const { assistantCreator } = contract;
  const logger = server.getLogger().child({
    label: "EntitySynchronizer",
  });

  logger.info("开始同步%s……", contract.sourceEntityTypeName);

  const assistant = await assistantCreator(server, routeContext, contract);

  const syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState> = {
    server,
    logger,
    routeContext,
    contract,
    progress: {
      current: 0,
      total: 0,
    },
    states: {} as TSyncContextState,
  };

  let sourceEntities = await assistant.fetchSourceEntities(syncContext);

  if (assistant.filterSourceEntities) {
    sourceEntities = await assistant.filterSourceEntities(syncContext, sourceEntities);
  }

  let currentNumToSync = 0;
  const totalSourceEntitiesToSync = sourceEntities.length;
  syncContext.progress = {
    current: currentNumToSync,
    total: totalSourceEntitiesToSync,
  };

  for (const sourceEntity of sourceEntities) {
    try {
      currentNumToSync++;
      syncContext.progress = {
        current: currentNumToSync,
        total: totalSourceEntitiesToSync,
      };
      await syncEntity<TSourceEntity, TTargetEntity, TSyncContextState>(syncContext, {
        logger,
        contract,
        assistant,
        sourceEntity,
      });
    } catch (ex: any) {
      const sourceId = (sourceEntity as any)[contract.sourceEntityIdField] || "";
      const sourceCode = contract.sourceEntityCodeField ? (sourceEntity as any)[contract.sourceEntityCodeField] || "" : "";
      logger.error("实体同步失败。%s 源实体类型：%s，Id：%s，Code：%s", ex.message, contract.sourceEntityTypeCode, sourceId, sourceCode);
    }
  }
}

export type SyncEntityOptions<TSourceEntity = any, TTargetEntity = any, TSyncContextState = Record<string, any>> = {
  logger: Logger;
  contract: EntitySyncContract<TSourceEntity, TTargetEntity>;
  assistant: EntitySyncAssistant<TSourceEntity, TTargetEntity, TSyncContextState>;
  sourceEntity: TSourceEntity;
};

export async function syncEntity<TSourceEntity, TTargetEntity, TSyncContextState>(
  syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
  options: SyncEntityOptions<TSourceEntity, TTargetEntity, TSyncContextState>,
): Promise<void> {
  const { logger, progress } = syncContext;
  const { contract, sourceEntity, assistant } = options;

  logger.debug("Synchronizing entity.", { sourceEntity });

  const targetEntityToSave = await assistant.mapToTargetEntity(syncContext, sourceEntity);

  const currentTargetEntity = await assistant.findTargetEntity(syncContext, targetEntityToSave);

  logger.debug("Saving target entity.", { targetEntityToSave });

  const syncDecision = await decideSyncAction<TSourceEntity, TTargetEntity, TSyncContextState>(syncContext, {
    contract,
    assistant,
    sourceEntity,
    targetEntityToSave,
    currentTargetEntity,
  });

  const { syncAction } = syncDecision;
  logger.debug("syncAction: %s", syncAction);

  let targetEntityToAction: Partial<TTargetEntity> | null = null;
  if (syncAction === "createEntity" || syncAction === "createSoftDeletedEntity") {
    targetEntityToAction = targetEntityToSave;
  } else if (syncAction === "updateEntity" || syncAction === "restoreAndUpdateEntity") {
    targetEntityToAction = syncDecision.targetEntityToSave!;
  } else if (syncAction === "deleteEntity") {
    targetEntityToAction = syncDecision.targetEntityToDelete!;
  } else if (syncAction === "restoreEntity") {
    targetEntityToAction = currentTargetEntity!;
  }

  let sourceDisplayValue = "";
  const sourceDisplayField = contract.sourceEntityDisplayField || contract.sourceEntityCodeField || contract.sourceEntityIdField;
  if (sourceDisplayField) {
    sourceDisplayValue = get(sourceEntity, sourceDisplayField, "") as string;
  }
  const sourceEntityType = contract.sourceEntityTypeName || contract.sourceEntityTypeCode;
  logger.info(`(${progress.current}/${progress.total}) 正在同步${sourceEntityType} ${sourceDisplayValue}。Action: ${syncDecision.syncAction}`, {
    targetEntityToAction,
  });

  try {
    if (syncAction === "createEntity") {
      if (!assistant.createTargetEntity) {
        throw new Error("SyncAssistant 没有实现 createTargetEntity 方法。");
      }
      await assistant.createTargetEntity(syncContext, targetEntityToAction!);
    } else if (syncAction === "updateEntity") {
      if (!assistant.updateTargetEntity) {
        throw new Error("SyncAssistant 没有实现 updateTargetEntity 方法。");
      }

      await assistant.updateTargetEntity(syncContext, targetEntityToAction!, currentTargetEntity!);
    } else if (syncAction === "deleteEntity") {
      if (!assistant.deleteTargetEntity) {
        throw new Error("SyncAssistant 没有实现 deleteTargetEntity 方法。");
      }
      await assistant.deleteTargetEntity(syncContext, targetEntityToAction!);
    } else if (syncAction === "restoreEntity") {
      if (!assistant.restoreTargetEntity) {
        throw new Error("SyncAssistant 没有实现 restoreTargetEntity 方法。");
      }
      await assistant.restoreTargetEntity(syncContext, targetEntityToAction!);
    } else if (syncAction === "createSoftDeletedEntity") {
      if (!assistant.createSoftDeletedEntity) {
        throw new Error("SyncAssistant 没有实现 createSoftDeletedEntity 方法。");
      }
      await assistant.createSoftDeletedEntity(syncContext, targetEntityToAction!);
    } else if (syncAction === "restoreAndUpdateEntity") {
      if (!assistant.restoreAndUpdateEntity) {
        throw new Error("SyncAssistant 没有实现 restoreAndUpdateEntity 方法。");
      }
      await assistant.restoreAndUpdateEntity(syncContext, targetEntityToAction!, currentTargetEntity!);
    } else {
      // do nothing
    }
  } catch (ex: any) {
    const errorMessage = `执行 ${syncAction} 同步操作失败：${ex.message}`;
    logger.error(errorMessage, { targetEntityToAction });
    throw new Error(errorMessage);
  }
}

export type DecideSyncActionOptions<TSourceEntity, TTargetEntity, TSyncContextState> = {
  contract: EntitySyncContract<TSourceEntity, TTargetEntity>;
  assistant: EntitySyncAssistant<TSourceEntity, TTargetEntity, TSyncContextState>;
  sourceEntity: Partial<TSourceEntity>;
  targetEntityToSave: Partial<TTargetEntity>;
  currentTargetEntity?: Partial<TTargetEntity>;
};

export async function decideSyncAction<TSourceEntity, TTargetEntity, TSyncContextState>(
  syncContext: SyncContext<TSourceEntity, TTargetEntity, TSyncContextState>,
  options: DecideSyncActionOptions<TSourceEntity, TTargetEntity, TSyncContextState>,
): Promise<EntitySyncDecision<TTargetEntity>> {
  const { contract, assistant, sourceEntity, currentTargetEntity } = options;
  let { targetEntityToSave } = options;

  const sourceEntityDeleted = false;
  const targetEntitySoftDeleteEnabled = false;
  const targetEntitySoftDeleted = false;

  if (sourceEntityDeleted) {
    if (isNil(currentTargetEntity)) {
      if (targetEntitySoftDeleteEnabled) {
        return {
          syncAction: "createSoftDeletedEntity",
          targetEntityToSave,
        };
      } else {
        return {
          syncAction: "doNothing",
        };
      }
    } else {
      return {
        syncAction: "deleteEntity",
        targetEntityToDelete: currentTargetEntity,
      };
    }
  } else {
    if (isNil(currentTargetEntity)) {
      return {
        syncAction: "createEntity",
        targetEntityToSave,
      };
    } else {
      if (contract.targetEntityFieldsToUpdate) {
        targetEntityToSave = pick(targetEntityToSave, contract.targetEntityFieldsToUpdate);
      }
      const changes = await assistant.detectChangedFieldsOfTargetEntity(syncContext, sourceEntity, targetEntityToSave, currentTargetEntity);
      const shouldUpdate = !!(changes && Object.keys(changes).length);
      if (targetEntitySoftDeleted) {
        if (shouldUpdate) {
          return {
            syncAction: "restoreAndUpdateEntity",
            targetEntityToSave: changes as any,
          };
        } else {
          return {
            syncAction: "restoreEntity",
          };
        }
      } else {
        if (shouldUpdate) {
          return {
            syncAction: "updateEntity",
            targetEntityToSave: changes as any,
          };
        } else {
          return {
            syncAction: "doNothing",
          };
        }
      }
    }
  }
}
