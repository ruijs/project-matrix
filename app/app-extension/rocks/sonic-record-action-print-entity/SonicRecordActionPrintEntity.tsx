import { MoveStyleUtils } from "@ruiapp/move-style";
import type { RockChildrenConfig, type Rock } from "@ruiapp/move-style";

import { renderRock, renderRockChildren } from "@ruiapp/react-renderer";
import SonicRecordActionPrintEntityMeta from "./SonicRecordActionPrintEntityMeta";
import type { SonicRecordActionPrintEntityRockConfig } from "./sonic-record-action-print-entity-types";
import { parseRockExpressionFunc } from "~/utils/func-util";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    let dataSource = props.record ? [props.record] : [];
    if (typeof props.dataSourceAdapter === "string") {
      const adapter = parseRockExpressionFunc(props.dataSourceAdapter, { data: dataSource }, context);
      dataSource = adapter();
    } else if (typeof props.dataSourceAdapter === "function") {
      dataSource = props.dataSourceAdapter({ data: dataSource, ...context.framework.getExpressionVars() });
    }

    const rockChildrenConfig: RockChildrenConfig = [
      {
        ...(MoveStyleUtils.omitSystemRockConfigFields(props) as SonicRecordActionPrintEntityRockConfig),
        $type: "rapidTableAction",
        onAction: [
          {
            $action: "script",
            script: () => {
              context.page.sendComponentMessage(`${props.$id}_${props.recordId}_trigger`, { name: "print" });
            },
          },
        ],
      },
      {
        $type: "multiplePrintTrigger",
        $id: `${props.$id}_${props.recordId}_trigger`,
        dataSource,
      },
    ];

    return renderRockChildren({ context, rockChildrenConfig });
  },

  ...SonicRecordActionPrintEntityMeta,
} as Rock<SonicRecordActionPrintEntityRockConfig>;
