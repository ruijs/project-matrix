import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "code",
      formControlProps: {
        disabled: true,
      },
    },
    {
      type: "auto",
      code: "networkState",
    },
    {
      type: "auto",
      code: "description",
    },
    {
      type: "auto",
      code: "orderNum",
    },
  ],
};

const page: RapidPage = {
  code: "sys_printer_list",
  name: "打印机列表",
  title: "打印机管理",
  permissionCheck: { any: ["dev.manage"] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "SvcPrinter",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索编码",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code"],
        },
      ],
      columns: [
        {
          type: "auto",
          code: "orderNum",
          width: "80px",
        },
        {
          type: "auto",
          code: "code",
          width: "150px",
          fixed: "left",
        },
        {
          type: "auto",
          code: "networkState",
          width: "150px",
        },
        {
          type: "auto",
          code: "description",
        },
      ],
      actionsColumnWidth: "200px",
      actions: [
        {
          $type: "rapidTableAction",
          code: "enable",
          actionText: "打印测试标签",
          $exps: {
            _hidden: "$slot.record.networkState !== '1'",
          },
          onAction: [
            {
              $action: "printToConsole",
            },
            {
              $action: "sendHttpRequest",
              method: "POST",
              data: {
                tasks: [
                  {
                    type: "zpl-label",
                    name: "测试标签",
                    data: "^XA^CFA,30^FO50,30^FDTest Label^FS^XZ",
                  },
                ],
              },
              onSuccess: [
                {
                  $action: "antdToast",
                  type: "success",
                  content: "已下发打印指令。",
                },
              ],
              onError: [
                {
                  $action: "antdToast",
                  type: "error",
                  $exps: {
                    content: "$event.args[0].message",
                  },
                },
              ],
              $exps: {
                url: `"/api/svc/printer/printers/" + $event.args[0].record.code + "/tasks"`,
                "data.tasks[0].data": `"^XA^CFA,30^FO30,30^FDTest Label^FS^FO30,70^FD" + $event.args[0].record.code + "^FS^XZ"`,
              },
            },
          ],
        },
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "SvcPrinter",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
