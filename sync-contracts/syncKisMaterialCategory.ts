import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { BaseMaterialCategory } from "~/_definitions/meta/entity-types";

const syncKisMaterialCategory: KisToWmsSyncContract<any, BaseMaterialCategory> = {
  name: "syncKisMaterialCategory",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "Material",
  sourceEntityTypeName: "物料分类",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  sourceEntityDisplayField: "FName",
  targetEntityTypeCode: "base_material_category",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: ["externalCode", "code"],
  targetEntityFieldsToUpdate: ["code", "name", "externalCode"],
  fetchSourceOptions: {
    fetchAll: true,
    requestParams: {
      ParentId: 0,
      Detail: false,
    },
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    appCode: "APP006992",
    async sourceEntityFilter(syncContext, source) {
      // FDetail 为 true 表示物料，否则表示物料分类
      return !source.FDetail;
    },
    async mapToTargetEntity(syncContext, source): Promise<Partial<BaseMaterialCategory>> {
      return {
        code: source.FNumber,
        name: source.FName,
        externalCode: source.FItemID.toString(),
        orderNum: 1,
      };
    },
  }),
};
export default syncKisMaterialCategory;
