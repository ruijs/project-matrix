import { MoveStyleUtils, RockChildrenConfig, RockEvent, type Rock } from "@ruiapp/move-style";
import { renderRockChildren } from "@ruiapp/react-renderer";
import SplitBinNumActionMeta from "./SplitBinNumActionMeta";
import type { SplitBinNumActionRockConfig } from "./split-bin-num-action-types";
import { useSetState } from "ahooks";
import { useRef, useState } from "react";
import { get, sumBy } from "lodash";
import rapidApi, { rapidApiRequest } from "~/rapidApi";
import { decimalSum } from "~/utils/decimal";
import { message } from "antd";

export default {
  Renderer(context, props) {
    const { record } = props;

    const [currentState, setCurrentState] = useSetState<Record<string, any>>({});

    const closeModal = () => {
      setCurrentState({ visible: false });
      context.page.sendComponentMessage(`${props.$id}_${props.recordId}_form`, { name: "resetFields" });
    };

    const { splitBinNum, spliting } = useSplitBinNum(() => {
      closeModal();

      context.scope.getStore("list").loadData();
    });

    const rockChildrenConfig: RockChildrenConfig = [
      {
        ...(MoveStyleUtils.omitSystemRockConfigFields(props) as SplitBinNumActionRockConfig),
        $type: "rapidTableAction",
        onAction: [
          {
            $action: "script",
            script: () => {
              setCurrentState({ visible: true });
            },
          },
        ],
      },
      {
        $id: `${props.$id}_${props.recordId}_modal`,
        $type: "antdModal",
        title: "拆分标识卡",
        open: currentState.visible,
        children: [
          {
            $id: `${props.$id}_${props.recordId}_form`,
            $type: "rapidForm",
            items: [
              {
                type: "auto",
                code: "shelves",
                formControlType: "rapidEditableTable",
                formControlProps: {
                  width: "100%",
                  columns: [
                    {
                      name: "binNum",
                      title: `原标识卡：${get(record, "binNum")}`,
                      control: `function(r, i){
                        return '拆分' + (i + 1);
                      }`,
                      width: 150,
                    },
                    {
                      name: "weight",
                      title: `重量：${get(record, "quantity")}`,
                      control: "number",
                      width: 120,
                    },
                  ],
                },
              },
            ],
            onFinish: [
              {
                $action: "script",
                script: (e: RockEvent) => {
                  const formData = e.args?.[0];

                  const splitWeightSum = decimalSum(...(formData.shelves || []).map((s: any) => s.weight));
                  if (get(record, "quantity") !== splitWeightSum) {
                    message.error("拆分项重量总和需要与原标识卡重量一致");
                    return;
                  }

                  splitBinNum({
                    originGoodId: get(record, "id"),
                    shelves: (formData.shelves || []).filter((s: any) => s.weight),
                  });
                },
              },
            ],
          },
        ],
        confirmLoading: spliting,
        okText: "确定",
        cancelText: "取消",
        onOk: [
          {
            $action: "script",
            script: () => {
              context.page.sendComponentMessage(`${props.$id}_${props.recordId}_form`, { name: "submit" });
            },
          },
        ],
        onCancel: [
          {
            $action: "script",
            script: () => {
              closeModal();
            },
          },
        ],
      },
    ];

    return renderRockChildren({ context, rockChildrenConfig });
  },

  ...SplitBinNumActionMeta,
} as Rock<SplitBinNumActionRockConfig>;

function useSplitBinNum(onSuccess: () => void) {
  const [spliting, setSpliting] = useState<boolean>(false);

  const splitBinNum = async (params: { shelves: { weight: number }[]; originGoodId: string }) => {
    if (spliting) {
      return;
    }

    setSpliting(true);
    const { error } = await rapidApiRequest({
      method: "post",
      url: `/app/splitGoods`,
      data: params,
    });

    if (error) {
      message.error(error.message);
    } else {
      onSuccess();
    }

    setSpliting(false);
  };

  return { splitBinNum, spliting };
}
