import type { RapidPage } from "@ruiapp/rapid-extension";

import { materialFormatStrTemplate } from "~/utils/fmt";

const page: RapidPage = {
  code: "mom_priling_stock_out_Inspection_sheet_details",
  //@ts-ignore
  parentCode: "mom_priling_stock_out_Inspection_sheet_list",
  name: "造粒出库检验单",
  title: "造粒出库检验单详情",

  permissionCheck: { any: [] },
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "MomInspectionSheet",
      mode: "view",
      column: 3,
      extraProperties: ["sampleCount", "round"],
      relations: {
        rule: {
          relations: {
            category: true,
          },
        },
        material: {
          properties: ["id", "code", "name", "specification", "category"],
          relations: {
            category: {
              properties: ["id", "code", "name", "printTemplate"],
            },
          },
        },
      },
      items: [
        {
          code: "code",
          type: "auto",
        },
        {
          code: "state",
          type: "auto",
        },
        {
          type: "auto",
          code: "approvalState",
        },
        {
          code: "result",
          type: "auto",
        },
        {
          code: "material",
          type: "auto",
          rendererProps: {
            format: materialFormatStrTemplate,
          },
          formControlProps: {
            dropdownMatchSelectWidth: 500,
            listTextFormat: materialFormatStrTemplate,
            listFilterFields: ["name", "code", "specification"],
            columns: [
              { code: "code", title: "编号", width: 120 },
              { code: "name", title: "名称", width: 120 },
              { code: "specification", title: "规格", width: 120 },
            ],
          },
        },
        {
          code: "lotNum",
          type: "auto",
        },
        {
          code: "reportFile",
          label: "检验报告",
          type: "auto",
        },
        // {
        //   code: "gcmsReportFile",
        //   type: "auto",
        // },
        // {
        //   type: "auto",
        //   code: "gcmsPassed",
        // },
        {
          code: "rule",
          type: "auto",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          code: "rule",
          type: "auto",
          label: "检验类型",
          rendererType: "text",
          rendererProps: {
            $exps: {
              text: "$stores.detail?.data?.list[0]?.rule?.category?.name",
            },
          },
        },
        {
          code: "sender",
          type: "auto",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "remark",
        },
        {
          code: "inspector",
          type: "auto",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          code: "reviewer",
          type: "auto",
          rendererProps: {
            format: "{{name}}",
          },
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    },
    {
      $type: "antdTabs",
      items: [
        {
          key: "measurements",
          label: "检验记录",
          children: [
            {
              $type: "inspectionMeasurement",
              $exps: {
                permissionCheck: "xzyInspectionStockOut.manage",
                entityId: "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
    {
      $type: "sectionSeparator",
      showLine: false,
    },
    // {
    //   $type: "rapidToolbar",
    //   items: [
    //     {
    //       $type: "rapidToolbarButton",
    //       text: "批准",
    //
    //       actionStyle: "primary",
    //       size: "large",
    //       $permissionCheck: "xzyInspectionStockOut.manage",
    //       onAction: [
    //         {
    //           $action: "sendHttpRequest",
    //           method: "PATCH",
    //           data: { approvalState: "approved", state: "inspected" },
    //           $exps: {
    //             url: `"/api/mom/mom_inspection_sheets/" + $rui.parseQuery().id`,
    //           },
    //         },
    //         {
    //           $action: "antdMessage",
    //           title: "审核成功",
    //           onClose: [
    //             {
    //               $action: "reloadPage",
    //             },
    //           ],
    //         },
    //       ],
    //       $exps: {
    //         _hidden: "!(_.get(_.first(_.get($stores.detail, 'data.list')), 'approvalState') === 'approving')",
    //       },
    //     },
    //     {
    //       $type: "rapidToolbarButton",
    //       text: "拒绝",
    //       danger: true,
    //       size: "large",
    //       $permissionCheck: "xzyInspectionStockOut.manage",
    //       onAction: [
    //         {
    //           $action: "sendHttpRequest",
    //           method: "PATCH",
    //           data: { approvalState: "rejected", state: "pending" },
    //           $exps: {
    //             url: `"/api/mom/mom_inspection_sheets/" + $rui.parseQuery().id`,
    //           },
    //         },
    //         {
    //           $action: "antdMessage",
    //           title: "审核成功",
    //           onClose: [
    //             {
    //               $action: "reloadPage",
    //             },
    //           ],
    //         },
    //       ],
    //       $exps: {
    //         _hidden: "!(_.get(_.first(_.get($stores.detail, 'data.list')), 'approvalState') === 'approving')",
    //       },
    //     },
    //   ],
    // },
  ],
};

export default page;
