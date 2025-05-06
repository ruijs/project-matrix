import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import { find, first } from "lodash";
import { MomInspectionMeasurement, MomInspectionSheet, type SystemSettingItem } from "~/_definitions/meta/entity-types";

type QueryInventoryWithInspectionResultInput = {
  materialIds: number[];
};

type QueryInventoryWithInspectionResultOutput = {
  inspectionCharNames: string[];
  inventories: {
    materialId: number;
    material: {
      id: number;
      code: string;
      name: string;
      specification: string;
    };
    lotNum: string;
    warehouseId: number;
    warehouse: {
      id: number;
      code: string;
      name: string;
    };
    locations: {
      id: number;
      code: string;
      name: string;
    }[];
    quality: number;
    inspectionSheet?: MomInspectionSheet;
  }[];
};

export default {
  code: "inventory/queryInventoryWithInspectionResult",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext, input } = ctx;
    const currentUserId = ctx.routerContext.state.userId;

    if (!currentUserId) {
      throw new Error("您的登录已失效。");
    }

    let { materialIds } = input as QueryInventoryWithInspectionResultInput;
    if (!materialIds) {
      materialIds = [];
    }

    const systemSettingItemManager = server.getEntityManager<SystemSettingItem>("system_setting_item");
    const systemSettingItem = await systemSettingItemManager.findEntity({
      routeContext,
      filters: [
        {
          operator: "eq",
          field: "groupCode",
          value: "inventory",
        },
        {
          operator: "eq",
          field: "itemCode",
          value: "queryInventoryResult.inspectionCharNames",
        },
      ],
    });

    if (!systemSettingItem) {
      throw new Error("系统设置项 inventory:queryInventoryResult.inspectionCharNames 不存在。");
    }

    const inspectionCharNames: string[] = (systemSettingItem.value as any) || [];

    const inventories = await getInventoriesGroupByLotNum(server, routeContext, materialIds);

    for (const inventory of inventories) {
      inventory.inspectionSheet = await getInspectionSheetOfMaterialLot(server, routeContext, inventory.materialId, inventory.lotNum);
    }

    ctx.output = {
      inventories,
      inspectionCharNames,
    } satisfies QueryInventoryWithInspectionResultOutput;
  },
} satisfies ServerOperation;

async function getInventoriesGroupByLotNum(server: IRpdServer, routeContext: RouteContext, materialIds: number[]) {
  const sql = `
with goods_group_by_location as (select g.material_id,
                                        g.lot_num,
                                        g.warehouse_id,
                                        g.location_id,
                                        sum(g.quantity) as quality
                                 from mom_goods g
                                 where g.state = 'normal'
                                   and g.material_id = ANY($1::int[])
                                 group by g.material_id, g.lot_num, g.warehouse_id, g.location_id),

     goods_group_by_lot_num as (select gl.material_id,
                                       gl.warehouse_id,
                                       gl.lot_num,
                                       sum(gl.quality) as quality,
                                       jsonb_agg(jsonb_build_object(
                                               'id', bl.id,
                                               'code', bl.code,
                                               'name', bl.name,
                                               'quality', gl.quality
                                                 ))    as locations
                                from goods_group_by_location gl
                                         inner join base_locations bl on gl.location_id = bl.id
                                group by gl.material_id, gl.lot_num, gl.warehouse_id
                                order by gl.material_id)

select gln.material_id                            as "materialId",
       jsonb_build_object(
               'id', bm.id,
               'code', bm.code,
               'name', bm.name,
               'specification', bm.specification) as material,
       gln.lot_num                                as "lotNum",
       gln.warehouse_id                           as "warehouseId",
       jsonb_build_object(
               'id', blw.id,
               'code', blw.code,
               'name', blw.name)                  as warehouse,
       gln.locations,
       gln.quality
from goods_group_by_lot_num gln
         inner join base_materials bm on gln.material_id = bm.id
         inner join base_locations blw on gln.warehouse_id = blw.id
order by bm.code;

  `;
  const inventories = await server.queryDatabaseObject(sql, [materialIds], routeContext.getDbTransactionClient());
  return inventories;
}

async function getInspectionSheetOfMaterialLot(server: IRpdServer, routeContext: RouteContext, materialId: number, lotNum: string) {
  // 获取物料检验单
  const inspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");
  const inspectionSheets = await inspectionSheetManager.findEntities({
    routeContext,
    filters: [
      {
        operator: "eq",
        field: "material_id",
        value: materialId,
      },
      {
        operator: "eq",
        field: "lotNum",
        value: lotNum,
      },
    ],
    orderBy: [
      {
        field: "id",
        desc: true,
      },
    ],
  });

  let inspectionSheet = find(inspectionSheets, (inspectionSheet) => {
    return inspectionSheet.approvalState === "approved";
  });

  if (!inspectionSheet) {
    inspectionSheet = first(inspectionSheets);
  }

  if (!inspectionSheet) {
    return null;
  }

  const inspectionMeasurementManager = server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement");
  const inspectionMeasurements = await inspectionMeasurementManager.findEntities({
    routeContext,
    relations: {
      characteristic: true,
    },
    filters: [
      {
        operator: "eq",
        field: "sheet_id",
        value: inspectionSheet.id,
      },
    ],
  });

  inspectionSheet.measurements = inspectionMeasurements;
  return inspectionSheet;
}
