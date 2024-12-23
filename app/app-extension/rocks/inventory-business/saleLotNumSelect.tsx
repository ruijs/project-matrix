import { Select } from "antd";
import dayjs from "dayjs";
import { orderBy, unionBy } from "lodash";
import React, { useEffect, useState } from "react";
import rapidApi from "~/rapidApi";

interface IProps {
  materialId: string;
  value: string;
  onChange: (val: any) => void;
}
export default function SaleLotNumSelect({ materialId, value, onChange }: IProps) {
  const { loadingSaleOutInventory, saleOutInventory } = useSaleOutInventory();

  useEffect(() => {
    loadingSaleOutInventory(materialId);
  }, [materialId]);

  console.log(materialId, "materialID88");
  return (
    <Select
      value={value}
      disabled={!materialId}
      options={saleOutInventory}
      labelInValue
      onChange={(val: any) => {
        onChange(val.label);
      }}
    />
  );
}

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
            value: dayjs().subtract(15, "day"),
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
