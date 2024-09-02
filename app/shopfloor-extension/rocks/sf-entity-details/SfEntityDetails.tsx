import { CommonProps, RockConfig, type Rock } from "@ruiapp/move-style";
import SfEntityDetailsMeta from "./SfEntityDetailsMeta";
import type { SfEntityDetailsRockConfig } from "./sf-entity-details-types";
import { find, pick } from "lodash";
import { renderRock } from "@ruiapp/react-renderer";
import { generateRockConfigOfError, rapidAppDefinition, RapidEntity } from "@ruiapp/rapid-extension";

export default {
  onReceiveMessage(message, state, props) {},

  Renderer(context, props: SfEntityDetailsRockConfig) {
    const { column = 3, items = [], entityConfig } = props;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";
    wrapStyle.overflow = "auto";

    const entities = rapidAppDefinition.getEntities();
    let mainEntity: RapidEntity | undefined;

    if (entityConfig?.entityCode) {
      mainEntity = find(entities, (item) => item.code === entityConfig.entityCode);
      if (!mainEntity) {
        const errorRockConfig = generateRockConfigOfError(new Error(`Entitiy with code '${entityConfig.entityCode}' not found.`));
        return renderRock({
          context,
          rockConfig: {
            ...errorRockConfig,
            style: wrapStyle,
          },
        });
      }
    }

    const detailsRockConfig: RockConfig = {
      $type: "rapidEntityForm",
      entityCode: entityConfig?.entityCode,
      dataSourceCode: `${entityConfig?.name}_details`,
      mode: "view",
      column,
      items,
      $exps: props.$exps,
    };

    return (
      <div style={wrapStyle} className="lsb-antd-row">
        {renderRock({
          context,
          rockConfig: detailsRockConfig,
        })}
      </div>
    );
  },

  ...SfEntityDetailsMeta,
} as Rock;
