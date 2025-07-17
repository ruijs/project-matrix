import type { ActionHandlerContext, CronJobConfiguration } from "@ruiapp/rapid-core";
import type { OcUser, SaveOcUserInput } from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default {
  code: "syncHuateUsers",

  cronTime: "*/5 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing syncHuateUsers job...");

    const yidaSDK = await new YidaHelper(server).NewAPIClient();
    const yidaAPI = new YidaApi(logger, yidaSDK);

    const users = await yidaAPI.getUsers();

    const userManager = server.getEntityManager<OcUser>("oc_user");

    for (const user of users) {
      try {
        const userInDb = await userManager.findEntity({
          filters: [
            {
              operator: "eq",
              field: "login",
              value: user.mobile,
            },
          ],
        });

        if (!userInDb) {
          await userManager.createEntity({
            entity: {
              name: user.name,
              login: user.mobile,
              dingtalkUserId: user.userid,
              state: "enabled",
            } as SaveOcUserInput,
          });
          continue;
        }

        if (userInDb.name !== user.name || userInDb.dingtalkUserId !== user.userid) {
          await userManager.updateEntityById({
            id: userInDb.id,
            entityToSave: {
              name: user.name,
              login: user.mobile,
              dingtalkUserId: user.userid,
              state: "enabled",
            } as SaveOcUserInput,
          });
        }
      } catch (e) {
        logger.error("同步钉钉用户失败。", { user });
        console.log(e);
      }
    }

    logger.info("Finished syncHuateUsers job...");
  },
} satisfies CronJobConfiguration;
