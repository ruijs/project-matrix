import { genKisToWmsSyncAssistantCreator } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { KisToWmsSyncContract } from "~/sdk/kis/kisToWmsSyncAssistant";
import type { OcUser } from "~/_definitions/meta/entity-types";

const syncKisUser: KisToWmsSyncContract<any, OcUser> = {
  name: "syncKisUser",
  enabled: true,
  jobCronTime: "*/10 * * * *",
  sourceEntityTypeCode: "User",
  sourceEntityTypeName: "用户",
  sourceEntityIdField: "FItemID",
  sourceEntityCodeField: "FNumber",
  sourceEntityDisplayField: "FName",
  targetEntityTypeCode: "oc_user",
  targetEntityIdField: "id",
  targetEntityCodeField: "code",
  targetEntityNameField: "name",
  targetEntityUniqueKeys: ["externalCode", "login"],
  targetEntityFieldsToUpdate: ["login", "name", "employeeCode", "externalCode", "externalUserCode"],
  fetchSourceOptions: {
    fetchAll: true,
  },
  assistantCreator: genKisToWmsSyncAssistantCreator({
    async mapToTargetEntity(syncContext, source): Promise<Partial<OcUser>> {
      return {
        login: source.FName,
        name: source.FName,
        employeeCode: source.EmpNumber,
        hidden: false,
        state: "enabled",
        externalUserCode: source.FUserID,
        externalCode: source.EmpID,
      };
    },
  }),
};
export default syncKisUser;
