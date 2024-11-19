import type { RockChildrenConfig, type Rock } from "@ruiapp/move-style";
import { renderRockChildren } from "@ruiapp/react-renderer";
import CreateBatchNumberActionMeta from "./CreateBatchNumberActionMeta";
import type { CreateBatchNumberActionRockConfig } from "./create-batch-number-action-action";

export default {
  Renderer(context, props) {
    const detail = context.page.getStore("detail").data?.list?.[0];
    const equipment = context.scope.getStore("list").data?.list?.[0]?.equipment?.id;

    const rockChildrenConfig: RockChildrenConfig = [
      {
        $type: "antdButton",
        children: {
          $type: "text",
          text: props.title,
        },
        onClick: [
          {
            $action: "script",
            script: () => {
              context.page.sendComponentMessage(`${props.$id}_create_batch_trigger`, { name: "new" });
            },
          },
        ],
      },
      {
        $type: "createBatchTrigger",
        $id: `${props.$id}_create_batch_trigger`,
        dataSource: {
          ...detail,
          equipment,
        },
      },
    ];

    return renderRockChildren({ context, rockChildrenConfig });
  },

  ...CreateBatchNumberActionMeta,
} as Rock<CreateBatchNumberActionRockConfig>;
