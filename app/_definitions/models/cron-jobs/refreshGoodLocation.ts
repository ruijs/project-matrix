import type { ActionHandlerContext, CronJobConfiguration } from "@ruiapp/rapid-core";

export default {
  code: "refreshGoodLocation",

  cronTime: "30 0/1 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;

    const abnormalGoods = await server.queryDatabaseObject(
      `
select g.id,
       g.lot_num,
       g.bin_num,
       g.location_id,
       lt.last_location_id
from mom_goods g
         left join LATERAL (
    select t.to_location_id as last_location_id
    from mom_good_transfers t
    where t.good_id = g.id
      and to_location_id is not null
    order by id desc
    limit 1
    ) lt on true
where g.state = 'normal'
  and last_location_id is not null
  and location_id <> last_location_id;
      `,
      [],
      routeContext.getDbTransactionClient(),
    );

    for (const abnormalGood of abnormalGoods) {
      await server.queryDatabaseObject(
        `
update mom_goods set location_id=$1 where id=$2;
      `,
        [abnormalGood.last_location_id, abnormalGood.id],
        routeContext.getDbTransactionClient(),
      );
    }
  },
} satisfies CronJobConfiguration;
