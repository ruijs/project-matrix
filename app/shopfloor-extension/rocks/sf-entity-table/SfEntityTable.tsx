import { CommonProps, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import SfEntityTableMeta from "./SfEntityTableMeta";
import type { SfEntityTableRockConfig, SfEntityTableState } from "./sf-entity-table-types";
import { find, pick } from "lodash";
import { generateRockConfigOfError, rapidAppDefinition, RapidEntity } from "@ruiapp/rapid-extension";

export default {
  Renderer(context, props, state) {
    const { pageSize = 20 } = props;

    const entities = rapidAppDefinition.getEntities();
    const entityConfig = props.entityConfig;
    let mainEntity: RapidEntity | undefined;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";
    wrapStyle.overflowY = "auto";

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

    const tableRockConfig: RockConfig = {
      $id: `${props.$id}-entity-list`,
      $type: "rapidEntityList",
      dataSourceCode: entityConfig?.name,
      listActions: props.listActions,
      extraActions: props.extraActions,
      selectionMode: props.selectionMode,
      selectOnClickRow: props.selectOnClickRow,
      onSelectedIdsChange: props.onSelectedIdsChange,
      viewMode: "table",
      pageSize,
      actions: props.actions || [],
      columns: props.columns || [],
      fixedFilters: props.fixedFilters || [],
    };

    return <div style={wrapStyle}>{renderRock({ context, rockConfig: tableRockConfig })}</div>;
  },

  ...SfEntityTableMeta,
} as Rock<SfEntityTableRockConfig, SfEntityTableState>;
