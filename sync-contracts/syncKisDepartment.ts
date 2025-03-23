import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { OcDepartment } from "~/_definitions/meta/entity-types";

const syncKisDepartment: KisToWmsSyncContract<any, OcDepartment> = {
  name: "syncKisDepartment",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "Department",
  sourceEntityTypeName: "部门",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  targetEntityTypeCode: "oc_department",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: ["externalCode", "code"],
  targetEntityFieldsToUpdate: ["code", "name", "externalCode"],
  fetchSourceOptions: {
    fetchAll: true,
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    appCode: "APP006992",
    async mapToTargetEntity(syncContext, source): Promise<Partial<OcDepartment>> {
      return {
        code: source.FNumber,
        name: source.FName,
        externalCode: source.FItemID.toString(),
        orderNum: 1,
      };
    },
  }),
};
export default syncKisDepartment;
