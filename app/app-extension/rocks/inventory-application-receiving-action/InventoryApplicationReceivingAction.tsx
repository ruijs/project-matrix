/* eslint-disable jsx-a11y/anchor-is-valid */
import { type Rock } from "@ruiapp/move-style";
import { Spin } from "antd";
import dayjs from "dayjs";
import { first, get } from "lodash";
import { useRef, useState } from "react";
import { rapidApiRequest } from "~/rapidApi";

export default {
  $type: "inventoryApplicationReceivingAction",

  slots: {},

  propertyPanels: [],

  Renderer(context, props) {
    const { createOperationRecord, creating } = useApplicationOperationRecords(async () => {
      await context.page.getStore("operationList").loadData();

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

      const getManfactureDate = async () => {
        if (applicationDetail?.businessType?.name == "生产入库") {
          const dateText = get(props.record, "lotNum")?.split("-")[0];
          const date = dayjs(dateText);
          if (date.isValid()) {
            return dateText;
          }
          return null;
        }

        if (applicationDetail?.businessType?.name === "生产退料入库") {
          const lotNum = get(props.record, "lotNum");
          const { result } = await rapidApiRequest({
            method: "POST",
            url: `/mom/mom_goods/operations/find`,
            data: {
              filters: [
                {
                  operator: "or",
                  filters: [
                    {
                      field: "lotNum",
                      operator: "contains",
                      value: `${lotNum}`,
                    },
                    {
                      field: "binNum",
                      operator: "contains",
                      value: `${lotNum}`,
                    },
                    {
                      field: "material",
                      operator: "exists",
                      filters: [
                        {
                          operator: "or",
                          filters: [
                            {
                              field: "name",
                              operator: "contains",
                              value: "202409-WX20240819007",
                            },
                            {
                              field: "code",
                              operator: "contains",
                              value: "202409-WX20240819007",
                            },
                            {
                              field: "specification",
                              operator: "contains",
                              value: "202409-WX20240819007",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
              orderBy: [
                {
                  field: "createdAt",
                  desc: true,
                },
              ],
              properties: [
                "id",
                "material",
                "material.category",
                "lotNum",
                "binNum",
                "quantity",
                "unit",
                "state",
                "warehouse",
                "warehouseArea",
                "location",
                "manufactureDate",
                "validityDate",
                "lot",
                "createdAt",
              ],
              relations: {
                material: {
                  properties: ["id", "code", "name", "specification", "category"],
                  relations: {
                    category: {
                      properties: ["id", "code", "name", "printTemplate"],
                    },
                  },
                },
              },
              pagination: {
                limit: 20,
                offset: 0,
              },
            },
          });
          return dayjs(result.list[0]?.manufactureDate)?.format("YYYY-MM-DD");
        }
        return null;
      };

      console.log("getManfactureDate", getManfactureDate);

      context.page.sendComponentMessage("goodTransferList_records-newForm", {
        name: "resetFields",
      });
      context.page.sendComponentMessage("goodTransferList_records-newForm", {
        name: "setFieldsValue",
        payload: {
          ...props.record,
          manufactureDate: await getManfactureDate(),
          material: get(props.record, "material.id"),
        },
      });
    };

    const operationDetail = first(get(context.page.getStore("operationList"), "data.list"));

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
