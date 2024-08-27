/* eslint-disable react/display-name */
import { memo, useEffect, useRef, useState } from "react";
import { Checkbox, Col, Form, Input, message, Modal, Row } from "antd";
import ModelSelector from "../../components/ModelSelector";
import rapidAppDefinition from "~/rapidAppDefinition";
import { EntityStoreConfig, RapidEntity } from "@ruiapp/rapid-extension";
import { MoveStyleUtils, RockEvent, RockEventHandlerScript, RockInstanceContext } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import { isPlainObject, omit } from "lodash";
import { LinkshopAppRecordConfig } from "~/linkshop-extension/linkshop-types";

interface RecordSettingsFormModalProps {
  context: RockInstanceContext;
  recordConfig?: LinkshopAppRecordConfig;
  recordConfigs: LinkshopAppRecordConfig[];
  visible: boolean;
  onVisibleChange(visble: boolean): void;
  onFormSubmit(config: any): void;
}

const RecordSettingsFormModal = memo<RecordSettingsFormModalProps>((props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.visible) {
      form.setFieldsValue(
        props.recordConfig || {
          name: undefined,
          entityCode: undefined,
        },
      );
    }
  }, [props.visible, props.recordConfig]);

  return (
    <>
      <Modal
        title={props.recordConfig ? "修改数据记录" : "添加数据记录"}
        open={props.visible}
        onCancel={() => {
          props.onVisibleChange(false);
        }}
        onOk={() => {
          form.submit();
        }}
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          onFinish={(formData) => {
            let recordConfig = {
              ...(props.recordConfig || {}),
              ...formData,
            };
            if (!props.recordConfig) {
              recordConfig = {
                ...formData,
              };
            }

            props.onFormSubmit(recordConfig);
            props.onVisibleChange(false);
          }}
        >
          <Form.Item
            name="name"
            label="数据记录名称"
            required
            rules={[
              { required: true, message: "数据记录名称必填。" },
              {
                validator(rule, value, callback) {
                  const isExist = props.recordConfigs?.some((c) => props.recordConfig?.name !== c.name && c.name === value);
                  callback(isExist ? "已存在同名的数据记录。" : undefined);
                },
              },
            ]}
          >
            <Input disabled={props.recordConfig != null} placeholder="请输入" />
          </Form.Item>
          <Form.Item name="entityCode" label="数据模型" required rules={[{ required: true, message: "数据模型必选" }]}>
            <ModelSelector />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

export default RecordSettingsFormModal;
