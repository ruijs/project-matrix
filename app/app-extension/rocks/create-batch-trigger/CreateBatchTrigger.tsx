import type { Page, RuiEvent, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import CreateBatchTriggerMeta from "./CreateBatchTriggerMeta";
import type { CreateBatchTriggerRockConfig } from "./create-batch-trigger-types";
import { useState } from "react";
import rapidApi from "~/rapidApi";
import { message } from "antd";

export default {
  onInit(context, props) {},

  onResolveState(props, state) {
    const [visible, setVisible] = useState<boolean>(false);

    return {
      visible,
      open() {
        setVisible(true);
      },
      close() {
        setVisible(false);
      },

      async createBatch(formData: { count: string }, page?: Page) {
        const details = props.dataSource;

        const workOrder = {
          id: details.id,
          code: details.code,
        };
        const process = details?.processes[0];
        const equipment = details?.equipment;

        const { count } = formData;
        let entities = [];
        for (let i = 0; i < Number(count); i++) {
          entities.push({
            workOrder,
            process,
            equipment,
          });
        }

        try {
          await rapidApi.post(`/mom/mom_work_reports/operations/create_batch`, {
            entities,
          });
          setVisible(false);

          if (page) {
            page.sendComponentMessage(`${props.$id}_create_batch_print_form`, { name: "resetFields" });
          }

          message.success("创建成功");
        } catch (err) {
          message.error("创建失败");
        }
      },
    };
  },

  onReceiveMessage(m, state, props) {
    console.log(m, "999");
    if (m.name === "new") {
      state.open();
    }
  },

  Renderer(context, props, state) {
    const details = props.dataSource;

    let formItems = [
      {
        type: "input",
        label: "数量",
        code: "count",
        required: true,
        rules: [{ required: true, message: "数量必填" }],
      },
    ];

    const rockConfig: RockConfig = {
      $id: `${props.$id}_create_batch_print_modal`,
      $type: "antdModal",
      title: "批量新建",
      open: state.visible,
      children: [
        {
          $id: `${props.$id}_create_batch_print_modal_form`,
          $type: "rapidForm",
          items: formItems,
          defaultValues: details,
          onFinish: [
            {
              $action: "script",
              script: async (event: RuiEvent) => {
                let formData = await event.sender.form.validateFields();

                state.createBatch(formData, context.page);
              },
            },
          ],
        },
      ],
      onOk: [
        {
          $action: "script",
          script: (event: RuiEvent) => {
            event.page.sendComponentMessage(`${props.$id}_create_batch_print_modal_form`, { name: "submit" });
          },
        },
        // {
        //   $action: "reloadPage",
        // },
      ],
      onCancel: [
        {
          $action: "script",
          script: () => {
            state.close();
            context.page.sendComponentMessage(`${props.$id}_create_batch_print_modal_form`, { name: "resetFields" });
          },
        },
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...CreateBatchTriggerMeta,
} as Rock<CreateBatchTriggerRockConfig>;
