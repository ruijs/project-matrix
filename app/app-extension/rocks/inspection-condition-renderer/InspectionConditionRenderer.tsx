import { Rock } from "@ruiapp/move-style";
import { renderCharacteristicQualifiedConditions } from "~/utils/inspection-utility";

export default {
  $type: "inspectionConditionRenderer",

  slots: {},

  propertyPanels: [],

  Renderer(context, props: any) {
    const record = props.$slot?.record;

    return renderCharacteristicQualifiedConditions(record);
  },
} as Rock;
