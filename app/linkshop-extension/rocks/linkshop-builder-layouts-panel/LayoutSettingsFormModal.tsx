import { memo, useEffect } from "react";
import { Form, Input, Modal } from "antd";
import type { LinkshopAppLayoutRockConfig } from "~/linkshop-extension/linkshop-types";
import { genRandomComponentId } from "~/linkshop-extension/utilities/DesignerUtility";

interface StepSettingsFormModalProps {
  layouts: LinkshopAppLayoutRockConfig[];
  layoutConfig?: LinkshopAppLayoutRockConfig;
  open: boolean;
  onVisibleChange(visble: boolean): void;
  onFormSubmit(config: any): void;
}

const LayoutSettingsFormModal = (props: StepSettingsFormModalProps) => {
  const { open, layoutConfig, layouts, onVisibleChange } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        layoutConfig || {
          $name: undefined,
        },
      );
    }
  }, [open, form, layoutConfig]);

  const onFormFinish = (formData: any) => {
    let layoutConfig: Partial<LinkshopAppLayoutRockConfig> = {
      ...(props.layoutConfig || {}),
      ...formData,
    };

    if (!layoutConfig.$id) {
      layoutConfig = {
        $id: genRandomComponentId(),
        $type: "linkshopAppLayout",
        $name: formData.$name,
        children: [],
      };
    }

    props.onFormSubmit(layoutConfig);
    props.onVisibleChange(false);
  };

  return (
    <Modal
      title={layoutConfig ? "修改模板" : "添加模板"}
      open={open}
      onCancel={() => {
        onVisibleChange(false);
      }}
      onOk={() => {
        form.submit();
      }}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} onFinish={onFormFinish}>
        <Form.Item
          name="$name"
          label="模板名称"
          required
          rules={[
            { required: true, message: "模板名称必填" },
            {
              validator: (rule, value, cb) => {
                const isExist = layouts?.some((step) => step.$name === value);
                if (isExist) {
                  cb("模板名称已存在");
                }

                cb();
              },
            },
          ]}
        >
          <Input placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default memo(LayoutSettingsFormModal);
