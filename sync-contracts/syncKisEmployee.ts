import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { OcUser } from "~/_definitions/meta/entity-types";

const syncKisEmployee: KisToWmsSyncContract<any, OcUser> = {
  name: "syncKisEmployee",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "Employee",
  sourceEntityTypeName: "职员",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  sourceEntityDisplayField: "FName",
  targetEntityTypeCode: "oc_user",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: ["externalCode", "login"],
  targetEntityFieldsToUpdate: ["login", "name", "employeeCode", "externalCode"],
  fetchSourceOptions: {
    fetchAll: true,
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    appCode: "APP006992",
    async mapToTargetEntity(syncContext, source): Promise<Partial<OcUser>> {
      return {
        login: source.FName,
        name: source.FName,
        employeeCode: source.FNumber,
        hidden: false,
        state: "enabled",
        externalCode: source.FItemID,
      };
    },
  }),
};
export default syncKisEmployee;
