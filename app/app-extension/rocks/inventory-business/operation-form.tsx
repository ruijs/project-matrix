import { useNavigate } from "@remix-run/react";
import { RockEvent, type Rock } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import { useDebounceFn } from "ahooks";
import { Button, Form, Input, InputNumber, Modal, Space, Table } from "antd";
import { useState } from "react";
import rapidApi from "~/rapidApi";

export default {
  $type: "inventoryOperationForm",

  slots: {},

  propertyPanels: [],

  Renderer(context, props) {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [materialItems, setMaterialItems] = useState<any[]>([]);

    const { saveOperation, saving } = useSaveOperation(() => {
      navigate("/pages/mom_inventory_application_list");
    });

    return (
      <div style={{ padding: "24px 0 0" }}>
        <Form
          form={form}
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 5 }}
          onFinish={(values) => {
            // saveOperation({
            //   operationState: "pending",
            //   operationType: "in",
            //   state: "approved",
            //   ...values,
            //   items: materialItems?.map((item) => ({
            //     material: item.material?.id,
            //     unit: item.unit?.id,
            //     lotNum: item.lotNum,
            //     quantity: item.quantity,
            //   })),
            // });
          }}
        >
          <Form.Item required label="业务类型" name="application" rules={[{ required: true, message: "业务类型必填" }]}>
            {renderRock({
              context,
              rockConfig: {
                $type: "rapidTableSelect",
                placeholder: "请选择",
                listFilterFields: ["code"],
                columns: [{ title: "申请单号", code: "code" }],
                requestConfig: { url: "/mom/mom_inventory_applications/operations/find", method: "post" },
              },
            })}
          </Form.Item>
          <Form.Item label="转出仓库" name="businessType">
            {renderRock({
              context,
              rockConfig: {
                $type: "rapidTableSelect",
                placeholder: "请选择",
                columns: [{ title: "名称", code: "name" }],
                requestConfig: { url: "/mom/mom_inventory_business_types/operations/find", method: "post" },
                onSelectedRecord: [
                  {
                    $action: "script",
                    script: (e: RockEvent) => {
                      const record: any = e.args[0];
                      form.setFieldValue("operationType", record?.operationType);
                    },
                  },
                ],
              },
            })}
          </Form.Item>
          <Form.Item
            label="物品明细"
            name="items"
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 22 }}
            rules={[
              {
                validator: (r, val: any, cb) => {
                  const hasError = materialItems.some((v) => !v.material);
                  if (hasError) {
                    cb("物品不可为空");
                    return;
                  }

                  cb();
                },
              },
            ]}
          >
            <Table
              size="middle"
              dataSource={materialItems}
              columns={[
                {
                  title: "物品",
                  dataIndex: "material",
                  width: 150,
                },
                {
                  title: "批次号",
                  dataIndex: "lotNum",
                  width: 120,
                },
                {
                  title: "托盘号",
                  dataIndex: "binNum",
                  width: 120,
                },
                {
                  title: "数量",
                  dataIndex: "quantity",
                  width: 120,
                },
                {
                  title: "单位",
                  dataIndex: "unit",
                  width: 120,
                },
                {
                  title: "生产日期",
                  dataIndex: "unit",
                  width: 120,
                },
                {
                  width: 60,
                  render: (_, r, index) => {
                    return (
                      <span
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setMaterialItems(materialItems.filter((m, i) => i !== index));
                        }}
                      >
                        移除
                      </span>
                    );
                  },
                },
              ]}
              pagination={false}
            />
            <Button
              block
              type="dashed"
              onClick={() => {
                setMaterialItems([...materialItems, {}]);
              }}
            >
              添加
            </Button>
          </Form.Item>
          <Form.Item wrapperCol={{ span: 22, offset: 2 }} style={{ marginTop: 36 }}>
            <Space size={24}>
              <Button
                disabled={saving}
                onClick={() => {
                  navigate("/pages/mom_inventory_application_list");
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                loading={saving}
                onClick={() => {
                  form.submit();
                }}
              >
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
        <Modal></Modal>
      </div>
    );
  },
} as Rock<any>;

function useSaveOperation(onSuccess: () => void) {
  const [saving, setSaving] = useState<boolean>(false);

  const saveOperation = async (formData: Record<string, any>) => {
    if (saving) {
      return;
    }

    setSaving(true);
    await rapidApi
      .post("/mom/mom_inventory_operations", formData)
      .then((res) => {
        if (res.status >= 200 && res.status < 400) {
          onSuccess();
        }
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const save = useDebounceFn(saveOperation, { wait: 300 });

  return { saveOperation: save.run, saving };
}
