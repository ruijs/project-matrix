import type {ActionHandlerContext, CronJobConfiguration} from "@ruiapp/rapid-core";
import type {OcUser, SaveOcUserInput} from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default {
  code: "syncHuateUsers",

  cronTime: "*/5 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing syncHuateUsers job...");

    const yidaSDK = await new YidaHelper(server).NewAPIClient();
    const yidaAPI = new YidaApi(yidaSDK);

    const users = await yidaAPI.getUsers();

    const userManager = server.getEntityManager<OcUser>("oc_user");

    for (const user of users) {
      try {
        await userManager.createEntity({
          entity: {
            name: user.name,
            login: user.mobile,
            dingtalkUserId: user.userid,
            state: 'enabled',
          } as SaveOcUserInput
        })
      } catch (e) {
        console.log(e)
      }
    }

    logger.info("Finished syncHuateUsers job...");
  },
} satisfies CronJobConfiguration;
