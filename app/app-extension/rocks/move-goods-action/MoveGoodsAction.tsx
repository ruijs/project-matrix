import { RockChildrenConfig, RuiEvent, type Rock } from "@ruiapp/move-style";
import { convertToEventHandlers, renderRockChildren } from "@ruiapp/react-renderer";
import MoveGoodsActionMeta from "./MoveGoodsActionMeta";
import type { BatchDeleteActionRockConfig } from "./move-goods-action-types";
import { get } from "lodash";
import { message, Modal } from "antd";
import { rapidAppDefinition } from "@ruiapp/rapid-extension";
import { rapidApiRequest } from "~/rapidApi";
import { useState } from "react";

export default {
  Renderer(context, props) {
    const [saving, setSaving] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const eventHandlers = convertToEventHandlers({ context, rockConfig: props }) as any;

    const selectedRecords = get(context.scope.vars, "selectedRecords") || [];

    const moveGoodsToLocation = async (locationId: number) => {
      if (saving) {
        return;
      }

      setSaving(true);
      const { error } = await rapidApiRequest({
        url: `/app/inventory/moveGoods`,
        method: "POST",
        data: {
          goodIds: selectedRecords.map((r: any) => r.id),
          locationId,
        },
      });

      if (!error) {
        message.success("库位修改成功");
        setModalOpen(false);
        eventHandlers.onSuccess?.();
      } else {
        message.error(error?.message || "库位修改失败");
      }

      setSaving(false);
    };

    const rockChildrenConfig: RockChildrenConfig = [
      {
        $type: "antdButton",
        $id: `${props.id}-button`,
        disabled: !selectedRecords.length,
        loading: saving,
        children: {
          $type: "text",
          text: props.title || `修改库位`,
        },
        onClick: [
          {
            $action: "script",
            script: () => {
              setModalOpen(true);
            },
          },
          {
            $action: "sendComponentMessage",
            componentId: `${props.$id}-form`,
            message: {
              name: "reset",
            },
          },
        ],
      },
      {
        $type: "antdModal",
        $id: `${props.$id}-modal`,
        title: props.title || `修改库位`,
        open: modalOpen,
        confirmLoading: saving,
        children: [
          {
            $type: "rapidForm",
            $id: `${props.$id}-form`,
            items: [
              {
                code: "warehouse",
                label: "仓库",
                formControlType: "rapidTableSelect",
                formControlProps: {
                  allowClear: true,
                  placeholder: "请选择",
                  listFilterFields: ["name", "code"],
                  searchPlaceholder: "按名称、编号搜索",
                  columns: [
                    { title: "编号", code: "code" },
                    { title: "名称", code: "name" },
                  ],
                  requestConfig: {
                    url: "/app/base_locations/operations/find",
                    method: "post",
                    params: {
                      fixedFilters: [
                        {
                          field: "type",
                          operator: "eq",
                          value: "warehouse",
                        },
                      ],
                      orderBy: [{ field: "code" }],
                    },
                  },
                },
              },
              {
                code: "toLocation",
                label: "目标库位",
                formControlType: "rapidTableSelect",
                formControlProps: {
                  allowClear: true,
                  placeholder: "请选择",
                  listFilterFields: ["name", "code"],
                  searchPlaceholder: "按名称、编号搜索",
                  columns: [
                    { title: "编号", code: "code" },
                    { title: "名称", code: "name" },
                  ],
                  requestConfig: {
                    url: "/app/base_locations/operations/find",
                    method: "post",
                    params: {
                      fixedFilters: [
                        {
                          field: "parent_id",
                          operator: "eq",
                        },
                        {
                          field: "type",
                          operator: "eq",
                          value: "storageArea",
                        },
                      ],
                      orderBy: [{ field: "code" }],
                    },
                  },
                },
                $exps: {
                  "formControlProps.requestConfig.params.fixedFilters[0].value": "$self.form.getFieldValue('warehouse')",
                },
              },
            ],
            onFinish: [
              {
                $action: "script",
                script: async (event: RuiEvent) => {
                  const formData = await event.sender.form.validateFields();
                  await moveGoodsToLocation(formData.toLocation);
                },
              },
            ],
          },
        ],
        onOk: [
          {
            $action: "sendComponentMessage",
            componentId: `${props.$id}-form`,
            message: {
              name: "submit",
            },
          },
        ],
        onCancel: [
          {
            $action: "script",
            script: () => {
              setModalOpen(false);
            },
          },
        ],
      },
    ];

    return renderRockChildren({ context, rockChildrenConfig });
  },

  ...MoveGoodsActionMeta,
} as Rock<BatchDeleteActionRockConfig>;
