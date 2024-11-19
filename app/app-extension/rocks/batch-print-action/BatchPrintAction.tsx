import type { RockChildrenConfig, type Rock } from "@ruiapp/move-style";

import { renderRockChildren } from "@ruiapp/react-renderer";
import BatchPrintActionMeta from "./BatchPrintActionMeta";
import type { BatchPrintActionRockConfig } from "./batch-print-action-types";
import { get } from "lodash";
import { parseRockExpressionFunc } from "~/utils/func-util";

export default {
  Renderer(context, props) {
    const selectedRecords = get(context.scope.vars, "selectedRecords") || [];
    const getDataSource = () => {
      return selectedRecords.map((record: any) => {
        let data = record;
        if (typeof props.dataSourceAdapter === "string") {
          const adapter = parseRockExpressionFunc(props.dataSourceAdapter, { record }, context);
          data = adapter();
        } else if (typeof props.dataSourceAdapter === "function") {
          data = props.dataSourceAdapter({ record, ...context.framework.getExpressionVars() });
        }

        return data;
      });
    };

    const rockChildrenConfig: RockChildrenConfig = [
      {
        $type: "antdButton",
        disabled: !selectedRecords.length,
        children: {
          $type: "text",
          text: props.title || `打印`,
        },
        onClick: [
          {
            $action: "script",
            script: () => {
              context.page.sendComponentMessage(`${props.$id}_batch_print_trigger`, { name: "print" });
            },
          },
        ],
      },
      {
        $type: "multiplePrintTrigger",
        $id: `${props.$id}_batch_print_trigger`,
        dataSource: getDataSource,
      },
    ];

    return renderRockChildren({ context, rockChildrenConfig });
  },

  ...BatchPrintActionMeta,
} as Rock<BatchPrintActionRockConfig>;
