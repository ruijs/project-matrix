import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import {BaseLot, MomGood, MomGoodTransfer} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import {updateInventoryBalance} from "~/_definitions/models/server-operations/mom/splitGoods";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "base_lot_modify_application",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, payload } = ctx;
      let before = payload.before;

      const originLot = await server.getEntityManager<BaseLot>("base_lot").findEntity({
        filters: [
          { operator: "eq", field: "material_id", value: before.material },
          { operator: "eq", field: "lotNum", value: before.originLotNum },
        ],
        properties: ["id", "material", "manufactureDate"]

      });

      const newLot = await server.getEntityManager<BaseLot>("base_lot").findEntity({
        filters: [
          { operator: "eq", field: "material_id", value: before.material },
          { operator: "eq", field: "lotNum", value: before.lotNum },
        ],
        properties: ["id", "material", "manufactureDate"]

      });

      if (newLot) {
        throw new Error("新批次号已存在.");
      }

      if (originLot) {
        if (before.manufactureDate) {
          before.expireTime = dayjs(before.manufactureDate).add(parseInt(originLot?.material?.qualityGuaranteePeriod || '0', 10), 'day').format('YYYY-MM-DD');
        } else {
          before.manufactureDate = originLot.manufactureDate
          before.expireTime = originLot.expireTime
        }
        await server.getEntityManager<BaseLot>("base_lot").updateEntityById({
          id: originLot.id,
          entityToSave: {
            lotNum: before.lotNum,
            manufactureDate: before.manufactureDate,
            expireTime: before.expireTime,
          }
        })

        const goods = await server.getEntityManager<MomGood>("mom_good").findEntities({
          filters: [
            { operator: "eq", field: "material_id", value: before.material },
            { operator: "eq", field: "lotNum", value: before.originLotNum },
          ],
          properties: ["id"]

        });

        for (const good of goods) {
          await server.getEntityManager<MomGood>("mom_good").updateEntityById({
            id: good.id,
            entityToSave: {
              lotNum: before.lotNum,
              manufactureDate: before.manufactureDate,
              expireTime: before.expireTime,
            }
          })
        }

        const goodTransfers = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntities({
          filters: [
            { operator: "eq", field: "material_id", value: before.material },
            { operator: "eq", field: "lotNum", value: before.originLotNum },
          ],
          properties: ["id"]
        });

        for (const good of goodTransfers) {
          await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").updateEntityById({
            id: good.id,
            entityToSave: {
              lotNum: before.lotNum,
            }
          })
        }


        await updateInventoryBalance(server)
      }
    }
  },
] satisfies EntityWatcher<any>[];
