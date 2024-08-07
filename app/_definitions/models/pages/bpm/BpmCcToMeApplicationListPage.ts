import type { RapidPage } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "bpm_cc_to_me_application_list",
  name: "抄送给我的审批",
  title: "抄送给我的审批",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "BpmInstance",
      viewMode: "table",
      selectionMode: "none",
      extraProperties: ["process"],
      columns: [
        {
          type: "auto",
          code: "title",
          fixed: "left",
          width: "250px",
        },
        {
          type: "auto",
          code: "formData",
          title: "摘要",
          minWidth: "200px",
          rendererType: "rapidDescriptionsRenderer",
          rendererProps: {
            size: "small",
            $exps: {
              items: "_.get($slot.record, 'process.listConfig.listSummaryColumnRenderProps.items') || []",
            },
          },
        },
        {
          type: "auto",
          code: "initiator",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "initiatedAt",
          width: "150px",
        },
        {
          type: "auto",
          code: "state",
          width: "150px",
        },
      ],
    },
  ],
};

export default page;
