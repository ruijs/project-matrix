import { IPage, RuiEvent, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import PrintTriggerMeta from "./PrintTriggerMeta";
import type { PrintTriggerRockConfig } from "./print-trigger-types";
import { message } from "antd";
import rapidApi from "~/rapidApi";
import rapidAppDefinition from "~/rapidAppDefinition";
import { useState } from "react";
import { find } from "lodash";

export default {
  onInit(context, props) {
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
      context.scope.addStore(store);
    });
  },

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
      async print(formData: { code: string; content: string }, page?: IPage) {
        let dataSource: Record<string, any>[] = [];
        if (typeof props.dataSource === "function") {
          dataSource = props.dataSource();
        } else {
          dataSource = props.dataSource;
        }

        try {
          await rapidApi.post(`/svc/printer/printers/${formData.code}/tasks`, {
            tasks: (dataSource || []).map((record) => {
              return {
                type: "zpl-label",
                name: "标签打印",
                data: replaceTemplatePlaceholder(formData.content, record),
              };
            }),
          });
          setVisible(false);

          if (page) {
            page.sendComponentMessage(`${props.$id}_print_modal_form`, { name: "resetFields" });
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
    let formItems = [
      {
        type: "select",
        code: "code",
        label: "打印机",
        formControlProps: {
          listDataSourceCode: "printerList",
          listTextFieldName: "code",
          listValueFieldName: "code",
        },
        required: true,
        rules: [{ required: true, message: "打印机必选" }],
      },
      {
        type: "select",
        label: "打印模板",
        code: "content",
        formControlProps: {
          listDataSourceCode: "printTemplateList",
          listTextFieldName: "name",
          listValueFieldName: "content",
        },
        required: true,
        rules: [{ required: true, message: "打印模板机必选" }],
      },
    ];

    const { scope } = context;
    const printTemplateStoreData = scope.getStore("printTemplateList")?.data?.list || [];
    const printTemplate = props.printTemplateCode && find(printTemplateStoreData, (item) => item.code === props.printTemplateCode);
    if (printTemplate) {
      formItems = formItems.filter((item) => item.code !== "content");
    }

    const rockConfig: RockConfig = {
      $id: `${props.$id}_print_modal`,
      $type: "antdModal",
      title: "打印",
      open: state.visible,
      children: [
        {
          $id: `${props.$id}_print_modal_form`,
          $type: "rapidForm",
          items: formItems,
          onFinish: [
            {
              $action: "script",
              script: async (event: RuiEvent) => {
                let formData = await event.sender.form.validateFields();
                if (!formData.content) {
                  formData.content = printTemplate?.content;
                }

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
            event.page.sendComponentMessage(`${props.$id}_print_modal_form`, { name: "submit" });
          },
        },
      ],
      onCancel: [
        {
          $action: "script",
          script: () => {
            state.close();
            context.page.sendComponentMessage(`${props.$id}_print_modal_form`, { name: "resetFields" });
          },
        },
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...PrintTriggerMeta,
} as Rock<PrintTriggerRockConfig>;

export function replaceTemplatePlaceholder(tpl: string, data: Record<string, any>) {
  if (!tpl) {
    return "";
  }

  let obj = data || {};

  const fields = tpl.match(/\{\{[.\w]+\}\}/g)?.map((c) => c.replace(/[\{\}\.]+/g, ""));

  return fields?.reduce((str, field) => str.replace(`{{.${field}}}`, obj[field] != null ? obj[field] : ""), tpl);
}
