import type { Rock, RockConfig } from "@ruiapp/move-style";
import ShopfloorAppBuilderMeta from "./ShopfloorAppBuilderMeta";
import type { ShopfloorAppBuilderRockConfig } from "./shopfloor-app-builder-types";
import { renderRock } from "@ruiapp/react-renderer";
import { find } from "lodash";
import { rapidAppDefinition } from "@ruiapp/rapid-extension";

export default {
  onInit(context, props) {
    const detailDataStoreConfig = {
      type: "entityStore",
      name: "appDetail",
      entityModel: find(rapidAppDefinition.getEntities(), { code: "ShopfloorApp" }),
      properties: ["id", "name", "content"],
      filters: [
        {
          field: "id",
          operator: "eq",
          value: "",
        },
      ],
      // TODO: Expression should be a static string, so that we can configure it at design time.
      $exps: {
        frozon: `!(${props.$exps?.appId || `${props.appId}`})`,
        "filters[0].value": props.$exps?.appId || `${props.appId}`,
      },
    };
    context.scope.addStore(detailDataStoreConfig);
  },

  Renderer(context, props: ShopfloorAppBuilderRockConfig) {
    const { appId } = props;

    if (!appId) {
      return "0";
    }

    const rockConfig: RockConfig = {
      $id: `${props.$id}-scope`,
      $type: "scope",
    };

    return renderRock({ context, rockConfig });
  },

  ...ShopfloorAppBuilderMeta,
} as Rock;
