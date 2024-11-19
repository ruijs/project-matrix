import type { Page, RuiEvent, IPage, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import MultiplePrintTriggerMeta from "./MultiplePrintTriggerMeta";
import type { MultiplePrintTriggerRockConfig } from "./multiple-print-trigger-types";
import { message } from "antd";
import rapidApi from "~/rapidApi";
import rapidAppDefinition from "~/rapidAppDefinition";
import { useEffect, useState } from "react";
import { find } from "lodash";
import { replaceTemplatePlaceholder } from "../print-trigger/PrintTrigger";

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
      async print(formData: { code: string }, page?: Page) {
        let dataSource: {
          templateCode: string;
          taskData: Record<string, any>;
        }[] = [];
        if (typeof props.dataSource === "function") {
          dataSource = props.dataSource();
        } else {
          dataSource = props.dataSource;
        }

        try {
          const printTemplateStoreData = page?.scope?.getStore("printTemplateList")?.data?.list || [];
          console.log("printTemplateTaskData", dataSource);
          await rapidApi.post(`/svc/printer/printers/${formData.code}/tasks`, {
            tasks: (dataSource || [])
              .map((record) => {
                const templateCode = record.templateCode || "rawMaterialIdentificationCard" || "injectionMoldingCard";
                const printTemplate = templateCode && find(printTemplateStoreData, (item) => item.code === templateCode);
                return {
                  type: "zpl-label",
                  name: "标签打印",
                  data: replaceTemplatePlaceholder(printTemplate?.content, record?.taskData),
                };
              })
              .filter((item) => !!item.data),
          });
          setVisible(false);

          if (page) {
            page.sendComponentMessage(`${props.$id}_multiple_print_modal_form`, { name: "resetFields" });
          }

          message.success("已下发打印指令");
        } catch (err) {
          message.error("下发打印指令失败");
        }
      },
    };
  },

  onReceiveMessage(m, state, props) {
    if (m.name === "print") {
      state.open();
    }
  },

  Renderer(context, props, state) {
    useEffect(() => {
      const printerEntity = rapidAppDefinition.entities.find((entity) => entity.code === "SvcPrinter");
      const printTemplateEntity = rapidAppDefinition.entities.find((entity) => entity.code === "MomPrintTemplate");
      const stores = [
        {
          name: "printerList",
          type: "entityStore",
          entityModel: printerEntity,
        },
        {
          name: "printTemplateList",
          type: "entityStore",
          entityModel: printTemplateEntity,
        },
      ];

      stores.forEach((store) => {
        const existedStore = context.page.scope.getStore(store.name);
        if (!existedStore) {
          context.page.scope.addStore(store);
          context.page.scope.loadStoreData(store.name, {});
        }
      });
    }, []);

    let formItems = [
      {
        type: "select",
        code: "code",
        label: "打印机",
        formControlProps: {
          listDataSource: context.page.scope.getStore("printerList"),
          listTextFormat: "{{code}}({{description}})",
          // listTextFieldName: "code",
          listValueFieldName: "code",
        },
        required: true,
        rules: [{ required: true, message: "打印机必选" }],
      },
    ];

    const rockConfig: RockConfig = {
      $id: `${props.$id}_multiple_print_modal`,
      $type: "antdModal",
      title: "打印",
      open: state.visible,
      children: [
        {
          $id: `${props.$id}_multiple_print_modal_form`,
          $type: "rapidForm",
          items: formItems,
          onFinish: [
            {
              $action: "script",
              script: async (event: RuiEvent) => {
                let formData = await event.sender.form.validateFields();

                state.print(formData, context.page);
              },
            },
          ],
        },
      ],
      onOk: [
        {
          $action: "script",
          script: (event: RuiEvent) => {
            event.page.sendComponentMessage(`${props.$id}_multiple_print_modal_form`, { name: "submit" });
          },
        },
      ],
      onCancel: [
        {
          $action: "script",
          script: () => {
            state.close();
            context.page.sendComponentMessage(`${props.$id}_multiple_print_modal_form`, { name: "resetFields" });
          },
        },
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...MultiplePrintTriggerMeta,
} as Rock<MultiplePrintTriggerRockConfig>;
