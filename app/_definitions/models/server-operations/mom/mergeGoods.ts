import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type { MomGood, SaveMomGoodInput } from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import SequenceService, { GenerateSequenceNumbersInput } from "@ruiapp/rapid-core/src/plugins/sequence/SequenceService";
import { updateInventoryBalance } from "~/_definitions/models/server-operations/mom/splitGoods";

export type MergeGoodsInput = {
  goodIds: number[];
  locationId: number;
};

// 标识卡拆分操作接口
export default {
  code: "mergeGoods",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext } = ctx;
    const input: MergeGoodsInput = ctx.input;

    await mergeGoods(server, routerContext, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

async function mergeGoods(server: IRpdServer, routeContext: RouteContext, input: MergeGoodsInput) {
  const goodManager = server.getEntityManager<MomGood>("mom_good");

  const sequenceService = server.getService<SequenceService>("sequenceService");

  const goods = await goodManager.findEntities({
    routeContext,
    filters: [
      {
        operator: "and",
        filters: [
          { operator: "in", field: "id", value: input.goodIds },
          { operator: "eq", field: "state", value: "normal" },
        ],
      },
    ],
    properties: ["id", "lotNum", "binNum", "material", "location", "quantity", "manufactureDate", "validityDate", "unit", "putInTime", "lot"],
  });

  // Check if all goods exist and lotNum and material should be matched
  if (goods.length !== input.goodIds.length) {
    throw new Error("部分标识卡不存在或已合并");
  }

  const originGood = goods[0];
  if (goods.some((good) => good.lotNum !== originGood.lotNum || good.material?.id !== originGood.material?.id)) {
    throw new Error("标识卡批次号或物料不一致");
  }

  let newGood: MomGood;

  // 检查 originBinNum 中包含两个 '-'
  let originBinNum = originGood.binNum;
  if (originBinNum) {
    if ((originBinNum.match(/-/g) || []).length === 2) {
      originBinNum = originBinNum.split("-").slice(0, 2).join("-");
    }
  }

  const binNums = await sequenceService.generateSn(routeContext, server, {
    ruleCode: "qixiang.binNum.split",
    amount: 1,
    parameters: {
      originBinNum: originBinNum,
    },
  } as GenerateSequenceNumbersInput);

  let saveGoodInput: SaveMomGoodInput = {
    material: originGood.material,
    location: { id: input.locationId },
    quantity: goods.reduce((acc, curr) => acc + (curr?.quantity || 0), 0),
    manufactureDate: originGood.manufactureDate,
    putInTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    unit: originGood.unit,
    lotNum: originGood.lotNum,
    binNum: binNums[0],
    validityDate: originGood.validityDate,
    state: "normal",
  };

  if (originGood.lot) {
    //   create new good and update old goods state to merged
    saveGoodInput.lot = originGood.lot;
  }

  newGood = await goodManager.createEntity({
    routeContext,
    entity: saveGoodInput,
  });

  await Promise.all(
    goods.map(async (good) => {
      await goodManager.updateEntityById({
        routeContext,
        id: good.id,
        entityToSave: {
          state: "merged",
          target: newGood,
        } as SaveMomGoodInput,
      });
    }),
  );

  await updateInventoryBalance(server, routeContext);
}
