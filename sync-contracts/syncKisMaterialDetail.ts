import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { BaseMaterial, BaseUnit } from "~/_definitions/meta/entity-types";
import KingdeeSDK, { KisListApiResult, newKisApiError } from "~/sdk/kis/api";
import { filter, get, map } from "lodash";
import { chunkArray } from "~/utils/array-utils";

const syncKisMaterialDetail: KisToWmsSyncContract<any, BaseMaterial> = {
  name: "syncKisMaterialDetail",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "Material",
  sourceEntityTypeName: "物料详情",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  sourceEntityDisplayField: "FName",
  targetEntityTypeCode: "base_material",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: ["externalCode", "code"],
  targetEntityFieldsToUpdate: ["code", "name", "externalCode", "specification", "defaultUnit"],
  fetchSourceOptions: {
    fetchAll: true,
    requestParams: {},
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    appCode: "APP006992",
    fetchSourceEntitiesApiName: "GetListDetails",

    async handleFetchSourceEntities(syncContext) {
      const { server, contract, states } = syncContext;

      const materials = await server.getEntityManager<BaseMaterial>("base_material").findEntities({
        properties: ["id", "externalCode"],
        filters: [
          {
            operator: "notNull",
            field: "externalCode",
          },
        ],
      });
      const materialIds = filter(
        map(materials, (item) => parseInt(item.externalCode || "", 10)),
        (item) => !!item,
      );

      if (!materialIds.length) {
        return [];
      }

      const kis = states.kis as KingdeeSDK;

      const chunks = chunkArray(materialIds, 20); // KIS 接口限制，ItemIds长度不能超过20

      let sourceEntities: any[] = [];
      for (const chunk of chunks) {
        const fetchedItems = await fetchKisDetailsList(kis, { entityCode: contract.sourceEntityTypeCode, itemIds: chunk });
        sourceEntities = sourceEntities.concat(fetchedItems);
      }

      return sourceEntities;
    },

    async mapToTargetEntity(syncContext, source): Promise<Partial<BaseMaterial>> {
      const { server } = syncContext;
      const defaultUnit = await server.getEntityManager<BaseUnit>("base_unit").findEntity({
        properties: ["id"],
        filters: [
          {
            operator: "eq",
            field: "externalCode",
            value: source.FUnitID,
          },
        ],
      });
      return {
        code: source.FNumber,
        name: source.FName,
        externalCode: source.FItemID,
        specification: source.FModel,
        defaultUnit,
      };
    },
  }),
};
export default syncKisMaterialDetail;

export type FetchKisDetailsListOptions = {
  entityCode: string;
  itemIds: number[];
};

async function fetchKisDetailsList(kis: KingdeeSDK, options: FetchKisDetailsListOptions) {
  const { entityCode, itemIds } = options;

  const apiName = "GetListDetails";
  const url = `/koas/APP006992/api/${entityCode}/${apiName}`;
  const request = {
    ItemIds: itemIds,
  };
  const response = await kis.PostResourceRequest(url, request);

  const apiResult: KisListApiResult = response.data || {};
  const errcode = apiResult.errcode;
  if (errcode) {
    throw newKisApiError("获取源系统数据失败。", apiResult);
  }

  const fetchedItems = get(apiResult, "data.List", []);
  return fetchedItems;
}
