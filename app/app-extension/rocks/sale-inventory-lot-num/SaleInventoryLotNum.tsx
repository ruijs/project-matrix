import type { Rock } from "@ruiapp/move-style";
import SaleInventoryLotNumMeta from "./SaleInventoryLotNumMeta";
import type { SaleInventoryLotNumRockConfig } from "./sale-inventory-lot-num-types";
import rapidApi from "~/rapidApi";
import { unionBy } from "lodash";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Select } from "antd";

export default {
  Renderer(context, props: SaleInventoryLotNumRockConfig) {
    const { materialId, value } = props;
    const { loadingSaleOutInventory, saleOutInventory } = useSaleOutInventory();

    useEffect(() => {
      loadingSaleOutInventory(materialId);
    }, [materialId]);

    return (
      <Select
        value={value}
        disabled={!materialId}
        options={saleOutInventory}
        labelInValue
        onChange={(val: any) => {
          props.form.setFieldValue("lotNum", val.label);
        }}
      />
    );
  },

  ...SaleInventoryLotNumMeta,
} as Rock;

function useSaleOutInventory() {
  const [loading, setLoading] = useState<boolean>(false);
  const [saleOutInventory, setSaleOutInventory] = useState<any[]>([]);

  const loadingSaleOutInventory = async (materialId: string) => {
    if (loading) return;
    try {
      setLoading(true);
      const params = {
        filters: [
          {
            field: "material",
            operator: "eq",
            value: materialId,
          },
          {
            field: "createdAt",
            operator: "gt",
            value: dayjs().subtract(2, "month"),
          },
          {
            field: "createdAt",
            operator: "lt",
            value: dayjs(),
          },
          {
            field: "operation",
            operator: "exists",
            filters: [
              {
                field: "businessType",
                operator: "exists",
                filters: [
                  {
                    field: "name",
                    operator: "eq",
                    value: "领料出库",
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
        properties: ["id", "material", "lotNum", "lot", "operation", "from", "to", "createdAt"],
        relations: {
          material: true,
          operation: {
            relations: {
              buisnessType: true,
            },
          },
        },
        pagination: {
          limit: 1000,
          offset: 0,
        },
      };
      const res = await rapidApi.post("/mom/mom_good_transfers/operations/find", params);
      if (res.status === 200) {
        const lotNumArr = unionBy(res.data.list, "lotNum")
          .map((item: any) => {
            return {
              label: item.lotNum,
              value: item.lot.id,
            };
          })
          .splice(0, 30);
        setSaleOutInventory(lotNumArr);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return { loadingSaleOutInventory, saleOutInventory, loading };
}
