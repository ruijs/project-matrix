/* eslint-disable react/display-name */
import { memo, useEffect, useRef, useState } from "react";
import { Checkbox, Col, Form, Input, message, Modal, Row } from "antd";
import ModelSelector from "../../components/ModelSelector";
import { EntityStoreConfig, rapidAppDefinition, RapidEntity } from "@ruiapp/rapid-extension";
import { MoveStyleUtils, RockEvent, RockEventHandlerScript, RockInstanceContext } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import { isPlainObject, omit } from "lodash";

interface StoreSettingsFormModalProps {
  context: RockInstanceContext;
  entityStoreConfig?: EntityStoreConfig;
  storeConfigs: EntityStoreConfig[];
  visible: boolean;
  onVisibleChange(visble: boolean): void;
  onFormSubmit(config: any): void;
}

const StoreSettingsFormModal = memo<StoreSettingsFormModalProps>((props) => {
  const [form] = Form.useForm();
  const cmdsEditor = useRef<{
    getCodeContent(): string;
    setCodeContent(codeContent: string): void;
  }>();

  const [codeEditorVisible, setCodeEditorVisible] = useState<boolean>(false);
  const [selectEntity, setSelectedEntity] = useState<RapidEntity>();

  useEffect(() => {
    if (props.visible) {
      form.setFieldsValue(
        props.entityStoreConfig || {
          name: undefined,
          entityCode: undefined,
          properties: [],
        },
      );

      const entiry = rapidAppDefinition.getEntities().find((e) => e.code === props.entityStoreConfig?.entityCode);
      setSelectedEntity(entiry);
    }
  }, [props.visible, props.entityStoreConfig]);

  const onModalOk: RockEventHandlerScript["script"] = (event: RockEvent) => {
    const codeContent = cmdsEditor.current?.getCodeContent() || "";
    try {
      var value = JSON.parse(codeContent);
      if (isPlainObject(value)) {
        setCodeEditorVisible(false);
        form.setFieldsValue(value || {});
      } else {
        console.error("Store: 数据结构格式配置错误");
      }
    } catch (ex) {
      console.error("Invalid JSON string.");
    }
  };

  const onModalCancel: RockEventHandlerScript["script"] = (event: RockEvent) => {
    setCodeEditorVisible(false);
  };

  return (
    <>
      <Modal
        title={props.entityStoreConfig ? "修改数据" : "添加数据"}
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
            let storeConfig = {
              ...(props.entityStoreConfig || {}),
              ...formData,
            };
            if (!props.entityStoreConfig) {
              storeConfig = {
                type: "entityStore",
                ...formData,
              };
            }

            props.onFormSubmit(storeConfig);
            props.onVisibleChange(false);
          }}
          onValuesChange={(values) => {
            if ("entityCode" in values) {
              const entiry = rapidAppDefinition.getEntities().find((e) => e.code === values.entityCode);
              setSelectedEntity(entiry);
              form.setFieldValue(
                "properties",
                (entiry?.fields || []).map((f) => f.code),
              );
            }
          }}
        >
          <Form.Item
            name="name"
            label="数据名称"
            required
            rules={[
              { required: true, message: "数据名称必填" },
              {
                validator(rule, value, callback) {
                  const isExist = props.storeConfigs?.some((c) => props.entityStoreConfig?.name !== c.name && c.name === value);
                  callback(isExist ? "数据名称已存在" : undefined);
                },
              },
            ]}
          >
            <Input disabled={props.entityStoreConfig != null} placeholder="请输入" />
          </Form.Item>
          <Form.Item name="entityCode" label="数据模型" required rules={[{ required: true, message: "数据模型必选" }]}>
            <ModelSelector />
          </Form.Item>
          <Form.Item name="properties" label="模型属性" required rules={[{ required: true, message: "模型属性必选" }]}>
            <Checkbox.Group style={{ width: "100%" }}>
              {selectEntity ? (
                <Row gutter={24}>
                  {selectEntity?.fields?.map((f) => (
                    <Col key={f.code} span={8}>
                      <Checkbox value={f.code}>{f.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              ) : (
                <span className="ant-select-selection-placeholder">请选择数据模型</span>
              )}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name="filters" hidden />
          <Form.Item name="orderBy" hidden />
          <Form.Item name="pagination" hidden />
          <Form.Item label="json配置">
            <a
              onClick={() => {
                (async () => {
                  setCodeEditorVisible(true);
                  await MoveStyleUtils.waitVariable("current", cmdsEditor);
                  const config = form.getFieldsValue() || {};
                  cmdsEditor.current?.setCodeContent((config && JSON.stringify(config, null, 4)) || "");
                })();
              }}
            >
              配置
            </a>
          </Form.Item>
        </Form>
      </Modal>
      {renderRock({
        context: props.context,
        rockConfig: {
          $id: `store-config-editor-modal`,
          $type: "antdModal",
          title: "Edit code",
          open: codeEditorVisible,
          width: "800px",
          height: "500px",
          children: [
            {
              $id: `store-config-editor`,
              $type: "monacoEditor",
              cmds: cmdsEditor,
              width: "100%",
              height: "500px",
              language: "json",
            },
          ],
          onOk: {
            $action: "script",
            script: onModalOk,
          },
          onCancel: {
            $action: "script",
            script: onModalCancel,
          },
        },
      })}
    </>
  );
});

export default StoreSettingsFormModal;
