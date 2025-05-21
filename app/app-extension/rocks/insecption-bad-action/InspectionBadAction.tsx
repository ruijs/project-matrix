import { type Rock } from "@ruiapp/move-style";
import { Dropdown, MenuProps, message, Spin } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { rapidApiRequest } from "~/rapidApi";

export default {
  $type: "inspectionBadAction",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const { updateTreatment, updating } = useUpdateTreatment(props.record?.id, () => {
      context.scope.getStore("list").loadData();
    });

    const actionItems: MenuProps["items"] = [
      {
        label: "特采（让步接收）",
        key: "special",
      },
      {
        label: "退货",
        key: "withdraw",
      },
      {
        label: "强制合格",
        key: "forced",
      },
    ];

    const actionLink = (
      <a className="rui-table-action-link" onClick={(e) => e.preventDefault()}>
        <span style={{ marginRight: 4 }}>不良处理</span>
        <DownOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      </a>
    );

    if (updating) {
      return (
        <Spin wrapperClassName="insecption-bad-action--spin" size="small" spinning>
          {actionLink}
        </Spin>
      );
    }

    return (
      <Dropdown
        menu={{
          items: actionItems,
          onClick: ({ key }) => {
            if (props.record.treatment === key) {
              return;
            }

            updateTreatment(key);
          },
        }}
      >
        {actionLink}
      </Dropdown>
    );
  },
} as Rock<any>;

function useUpdateTreatment(inspectionSheetId: string, onSuccess: () => void) {
  const [updating, setUpdating] = useState<boolean>(false);

  const updateTreatment = async (treatment: string) => {
    if (updating) {
      return;
    }

    setUpdating(true);

    let othersData: Record<string, any> = {};
    if (treatment === "forced") {
      othersData = { result: "qualified" };
    }

    const { error } = await rapidApiRequest({
      url: `/mom/mom_inspection_sheets/${inspectionSheetId}`,
      method: "PATCH",
      data: {
        treatment,
        ...othersData,
      },
    });

    if (error?.message) {
      message.error(error?.message);
    } else {
      onSuccess();
    }

    setUpdating(false);
  };

  return { updating, updateTreatment };
}
