import type {ActionHandlerContext, IRpdServer, ServerOperation} from "@ruiapp/rapid-core";
import type {
  BaseLot,
  BaseMaterial,
  BaseUnit,
  MomGood,
  MomGoodTransfer,
  MomInspectionRule,
  MomInspectionSamplingItem,
  MomInventoryOperation,
  SaveBaseLotInput,
  SaveMomGoodInput,
  SaveMomGoodTransferInput,
  SaveMomInspectionSheetInput,
} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import SequenceService, {GenerateSequenceNumbersInput} from "@ruiapp/rapid-core/src/plugins/sequence/SequenceService";

export type CreateGoodTransferInput = {
  operationId: number;
  material?: number;
  lotNum: string;
  lotId?: number;
  manufactureDate: string;
  palletCount?: number;
  palletWeight: number;
  packageNum: number;
  isTankerTransportation: boolean;
  transfers: {
    palletWeight?: number;
  }[];
  print?: boolean;
  locationId?: number;
};

export default {
  code: "createGoodTransfers",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: CreateGoodTransferInput = ctx.input;

    await createGoodTransferIn(server, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

async function createGoodTransferIn(server: IRpdServer, input: CreateGoodTransferInput) {
  const goodManager = server.getEntityManager<MomGood>("mom_good");
  const materialManager = server.getEntityManager<BaseMaterial>("base_material");
  const inspectRuleManager = server.getEntityManager<MomInspectionRule>("mom_inspection_rule");
  const unitManager = server.getEntityManager<BaseUnit>("base_unit");
  const goodTransferManager = server.getEntityManager<MomGoodTransfer>("mom_good_transfer");
  const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");

  const sequenceService = server.getService<SequenceService>("sequenceService");

  const [inventoryOperation, material] = await Promise.all([
    inventoryOperationManager.findEntity({
      filters: [{ operator: "eq", field: "id", value: input.operationId }],
      properties: ["id", "category", "businessType"],
    }),
    materialManager.findEntity({
      filters: [{ operator: "eq", field: "id", value: input?.material }],
      properties: ["id", "code", "defaultUnit", "qualityGuaranteePeriod"],
    }),
  ]);

  if (!material) {
    throw new Error("Material not found");
  }

  const validityDate = dayjs(input.manufactureDate)
    .add(parseInt(material.qualityGuaranteePeriod || "0", 10), "day")
    .format("YYYY-MM-DD");

  const lotInfo = await saveMaterialLotInfo(server, {
    lotNum: input.lotNum,
    material: { id: input.material },
    sourceType: inventoryOperation?.businessType?.config?.defaultSourceType || null,
    qualificationState: inventoryOperation?.businessType?.config?.defaultQualificationState || "qualified",
    validityDate: validityDate,
    isAOD: false,
    state: "pending",
  });

  input.lotId = lotInfo?.id;

  let palletCount = 0;
  if (input.palletCount) {
    palletCount = input.palletCount;
  }
  if (input.transfers) {
    palletCount = (input.palletCount || 0) + input.transfers.length;
  }

  const unit = await unitManager.findById({ id: material.defaultUnit?.id });

  const originBinNums = await sequenceService.generateSn(server, {
    ruleCode: "qixiang.binNum",
    amount: 1
  } as GenerateSequenceNumbersInput)

  const binNums = await sequenceService.generateSn(server, {
    ruleCode: "qixiang.binNum.split",
    amount: palletCount,
    parameters: {
      originBinNum: originBinNums[0],
    }
  } as GenerateSequenceNumbersInput)

  let goods: SaveMomGoodInput[] = [];
  if (input.palletCount && input.palletCount > 0) {
    goods = goods.concat(Array.from({ length: input.palletCount }, (_, index) => createGoodInput(material, unit, input, validityDate, `${ binNums[index] }`, input.palletWeight)))
  }
  if (input.transfers && input.transfers.length > 0) {
    let palletCount = input.palletCount || 0;
    goods = goods.concat(input.transfers.map((transfer, index) => createGoodInput(material, unit, input, validityDate, `${ binNums[palletCount + index] }`, transfer.palletWeight)))
  }

  let totalWeight = 0;

  for (const goodInput of goods) {
    totalWeight += goodInput.quantity || 0;
    const good = await findOrCreateGood(goodManager, goodInput);
    await createGoodTransfer(goodTransferManager, input.operationId, good, input?.print, input.locationId);
  }

  if (inventoryOperation?.businessType?.config?.inspectionCategoryId && inventoryOperation?.businessType?.config?.inspectionCategoryId > 0) {
    const inspectRule = await inspectRuleManager.findEntity({
      filters: [
        { operator: "eq", field: "material_id", value: material.id },
        { operator: "eq", field: "category_id", value: inventoryOperation?.businessType?.config?.inspectionCategoryId },
      ],
      properties: ["id"],
    });

    const samplingRule = await server.getEntityManager<MomInspectionSamplingItem>("mom_inspection_sampling_item").findEntity({
      filters: [
        {
          operator: "exists",
          field: "sampling",
          filters: [{ operator: "eq", field: "material_category_id", value: material.category?.id }]
        },
        { operator: "lte", field: "to", value: totalWeight },
      ],
      orderBy: [{ field: "to", desc: true }],
      properties: ["id", "sampling", "samplingCount"],
    })


    if (inspectRule) {
      await saveInspectionSheet(server, {
        inventoryOperation: { id: input.operationId },
        lotNum: input.lotNum,
        lot: { id: lotInfo.id },
        rule: { id: inspectRule?.id },
        material: { id: input.material },
        approvalState: "approving",
        state: "pending",
        sampleCount: input.isTankerTransportation ? 2 : samplingRule?.samplingCount,
        round: 1,
      });
    } else {
      await saveInspectionSheet(server, {
        inventoryOperation: { id: input.operationId },
        lotNum: input.lotNum,
        lot: { id: lotInfo.id },
        material: { id: input.material },
        approvalState: "approving",
        state: "pending",
        sampleCount: input.isTankerTransportation ? 2 : samplingRule?.samplingCount,
        round: 1,
      });
    }
  }
}

function createGoodInput(
  material: BaseMaterial,
  unit: BaseUnit | null,
  input: CreateGoodTransferInput,
  validityDate: string,
  binNum: string,
  palletWeight?: number,
): SaveMomGoodInput {
  let saveInput = {
    material: { id: material.id },
    materialCode: material.code,
    lotNum: input.lotNum,
    lot: { id: input.lotId },
    binNum: binNum,
    quantity: palletWeight,
    unit: { id: unit?.id },
    state: "pending",
    manufactureDate: input.manufactureDate,
    validityDate,
  } as SaveMomGoodInput;

  if (input.locationId && input.locationId > 0) {
    saveInput.location = { id: input.locationId };
  }
  return saveInput;
}

async function findOrCreateGood(goodManager: any, input: SaveMomGoodInput) {
  let good = await goodManager.findEntity({
    filters: [
      { operator: "eq", field: "material_id", value: input.material?.id },
      { operator: "eq", field: "lot_num", value: input.lotNum },
      { operator: "eq", field: "bin_num", value: input.binNum },
    ],
    properties: ["id", "material", "lotNum", "binNum", "quantity", "unit", "lot"],
  });

  if (!good) {
    good = await goodManager.createEntity({ entity: input });
    good = await goodManager.findEntity({
      filters: [{ operator: "eq", field: "id", value: good.id }],
      properties: ["id", "material", "lotNum", "binNum", "quantity", "unit", "lot"],
    });
  }

  return good;
}

async function createGoodTransfer(goodTransferManager: any, operationId: number, good: MomGood, print: boolean = false, locationId?: number) {

  let saveInput = {
    operation: { id: operationId },
    good: { id: good.id },
    material: { id: good.material?.id },
    lotNum: good.lotNum,
    lot: { id: good?.lot?.id },
    binNum: good.binNum,
    quantity: good.quantity,
    unit: { id: good.unit?.id },
    transferTime: dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]"),
    printTime: print ? dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]") : null,
  } as SaveMomGoodTransferInput

  if (locationId && locationId > 0) {
    saveInput.to = { id: locationId };
  }

  await goodTransferManager.createEntity({
    entity: saveInput,
  });
}

async function saveInspectionSheet(server: IRpdServer, sheet: SaveMomInspectionSheetInput) {
  if (!sheet.lotNum || !sheet.material || !sheet.material.id) {
    throw new Error("lotNum and material are required when saving lot info.");
  }

  const inspectionSheetManager = server.getEntityManager("mom_inspection_sheet");

  let inspectionSheet = await inspectionSheetManager.findEntity({
    filters: [
      { operator: "eq", field: "lot_num", value: sheet.lotNum },
      { operator: "eq", field: "material_id", value: sheet.material.id },
      { operator: "eq", field: "inventory_operation_id", value: sheet.inventoryOperation?.id },
    ],
    keepNonPropertyFields: true,
  });

  if (inspectionSheet) {
    return inspectionSheet
  }

  inspectionSheet = await inspectionSheetManager.findEntity({
    filters: [
      { operator: "eq", field: "lot_num", value: sheet.lotNum },
      { operator: "eq", field: "material_id", value: sheet.material.id },
      { operator: "null", field: "inventory_operation_id" },
    ],
    keepNonPropertyFields: true,
  });

  if (inspectionSheet) {
    await inspectionSheetManager.updateEntityById(
      {
        id: inspectionSheet.id,
        entityToSave: {
          lot: { id: sheet.lot?.id },
          inventoryOperation: { id: sheet.inventoryOperation?.id },
        }
      }
    );
    return inspectionSheet;
  }

  return await inspectionSheetManager.createEntity({ entity: sheet });
}

async function saveMaterialLotInfo(server: IRpdServer, lot: SaveBaseLotInput) {
  if (!lot.lotNum || !lot.material || !lot.material.id) {
    throw new Error("lotNum and material are required when saving lot info.");
  }

  const baseLotManager = server.getEntityManager<BaseLot>("base_lot");
  const lotInDb = await baseLotManager.findEntity({
    filters: [
      { operator: "eq", field: "lot_num", value: lot.lotNum },
      { operator: "eq", field: "material_id", value: lot.material.id },
    ],
  });

  return lotInDb || (await baseLotManager.createEntity({ entity: lot }));
}
