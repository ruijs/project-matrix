import { type Rock } from "@ruiapp/move-style";
import { Spin } from "antd";
import { first, get } from "lodash";
import { useRef, useState } from "react";
import { rapidApiRequest } from "~/rapidApi";

export default {
  $type: "inventoryApplicationReceivingAction",

  slots: {},

  propertyPanels: [],

  Renderer(context, props) {
    const { createOperationRecord, creating } = useApplicationOperationRecords(async () => {
      await context.scope.getStore("operationList").loadData();

      context.page.sendComponentMessage("operationInfoBlock", {
        name: "rerenderRock",
      });

      await new Promise((res) => {
        setTimeout(() => {
          res(null);
        }, 100);
      });

      openCreateModal();
    });

    const openCreateModal = async () => {
      const applicationDetail: any = first(get(context.page.getStore("detail"), "data.list"));
      context.page.getScope("goodTransferList_records-scope").setVars({
        "modal-newEntity-open": true,
      });

      await new Promise((res) => {
        setTimeout(() => {
          res(null);
        }, 200);
      });

      context.page.sendComponentMessage("goodTransferList_records-newForm", {
        name: "resetFields",
      });
      context.page.sendComponentMessage("goodTransferList_records-newForm", {
        name: "setFieldsValue",
        payload: {
          ...props.record,
          manufactureDate:
            applicationDetail?.businessType?.name == "生产入库" || applicationDetail?.businessType?.name === "生产退料入库"
              ? get(props.record, "lotNum")?.split("-")[0]
              : null,
          material: get(props.record, "material.id"),
        },
      });
    };

    const operationDetail = first(get(context.scope.getStore("operationList"), "data.list"));

    if (operationDetail) {
      return (
        <a
          style={{ marginLeft: 8 }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            openCreateModal();
          }}
        >
          收货
        </a>
      );
    }

    return (
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        <Spin size="small" spinning={creating}>
          <a
            style={{ marginLeft: 8 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();

              const applicationDetail: any = first(get(context.page.getStore("detail"), "data.list"));
              createOperationRecord({
                application: applicationDetail?.id,
                approvalState: "uninitiated",
                businessType: applicationDetail?.businessType?.id,
                operationType: applicationDetail?.operationType,
                sourceType: applicationDetail?.businessType?.config?.defaultSourceType,
                state: "processing",
              });
            }}
          >
            收货
          </a>
        </Spin>
      </span>
    );
  },
} as Rock<any>;

function useApplicationOperationRecords(onSuccess: () => void) {
  const [creating, setCreating] = useState<boolean>(false);

  const createOperationRecord = async (formData: any) => {
    if (creating) {
      return;
    }

    setCreating(true);
    const { error } = await rapidApiRequest({
      url: `/mom/mom_inventory_operations`,
      method: "POST",
      data: formData,
    });

    if (!error) {
      onSuccess();
    }
    setCreating(false);
  };

  return { creating, createOperationRecord };
}
