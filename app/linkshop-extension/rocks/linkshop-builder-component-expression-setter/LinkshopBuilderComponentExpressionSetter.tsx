import type { Rock, RockConfig, RockEvent, RockInstance } from "@ruiapp/move-style";
import LinkshopBuilderComponentExpressionSetterMeta from "./LinkshopBuilderComponentExpressionSetterMeta";
import { renderRock } from "@ruiapp/react-renderer";
import { LinkshopBuilderComponentExpressionSetterRockConfig } from "./linkshop-builder-component-expression-setter-types";
import { get } from "lodash";
import { Radio, RadioChangeEvent, RadioGroupProps } from "antd";
import { useEffect, useState } from "react";
import { sendDesignerCommand } from "~/linkshop-extension/utilities/DesignerUtility";

export type ComponentMethods = {
  commitChanges: () => void;
};

export type ComponentInstance = RockInstance<
  LinkshopBuilderComponentExpressionSetterRockConfig,
  LinkshopBuilderComponentExpressionSetterState,
  ComponentMethods
>;

export interface LinkshopBuilderComponentExpressionSetterState {
  bindingMode?: "dataBind" | "expression";
  selectedBindableKey?: string;
  expandedBindableKeys?: string[];
  cmdsEditor?: {
    getCodeContent(): string;
    setCodeContent(codeContent: string): void;
  };

  setState?: any;
}

function refreshView(props: LinkshopBuilderComponentExpressionSetterRockConfig, state: any) {
  const { designerStore, propName } = props;
  const selectedComponentId = designerStore.selectedComponentId;
  if (!selectedComponentId || !propName) {
    return;
  }

  const designingPage = designerStore.page;
  const componentConfig = designingPage.getComponent(selectedComponentId);
  const propDataBind = get(componentConfig.$dataBind, propName);
  const propExpression = get(componentConfig.$exps, propName);

  if (propDataBind || !propExpression) {
    state.setState({
      bindingMode: "dataBind",
      selectedBindableKey: propDataBind,
    } as Partial<LinkshopBuilderComponentExpressionSetterState>);
  } else {
    state.setState({
      bindingMode: "expression",
      selectedBindableKey: "",
    } as Partial<LinkshopBuilderComponentExpressionSetterState>);
  }
}

export default {
  onResolveState(props, state, instance) {
    if (!state) {
      return {
        bindingMode: undefined,
        selectedBindableKey: undefined,
      } as Partial<LinkshopBuilderComponentExpressionSetterState>;
    }

    return null;
  },

  async onReceiveMessage(message, state: LinkshopBuilderComponentExpressionSetterState, props: LinkshopBuilderComponentExpressionSetterRockConfig) {
    if (message.name === "refreshView") {
      refreshView(props, state);
    } else if (message.name === "commitChanges") {
      const { page } = message;
      const { designerStore, propName } = props;
      const selectedComponentId = designerStore.selectedComponentId;
      if (!selectedComponentId || !propName) {
        return;
      }

      const { cmdsEditor, bindingMode, selectedBindableKey } = state;
      if (bindingMode === "dataBind") {
        const dataBindSettings = designerStore.page.getComponentProperty(selectedComponentId, "$dataBind") || {};
        dataBindSettings[propName] = selectedBindableKey;

        sendDesignerCommand(page, designerStore, {
          name: "setComponentProperty",
          payload: {
            componentId: selectedComponentId,
            propName: "$dataBind",
            propValue: dataBindSettings,
          },
        });
      } else if (bindingMode === "expression") {
        if (!cmdsEditor) {
          return;
        }
        const propExpression = cmdsEditor.getCodeContent();
        sendDesignerCommand(page, designerStore, {
          name: "setComponentPropertyExpression",
          payload: {
            componentId: selectedComponentId,
            propName,
            propExpression,
          },
        });
      }
    }
  },

  Renderer(context, props: LinkshopBuilderComponentExpressionSetterRockConfig, state: LinkshopBuilderComponentExpressionSetterState) {
    const { $id, designerStore, propName } = props;
    const { bindingMode } = state;

    const [cmdsEditor, setCmdsEditor] = useState<{
      getCodeContent(): string;
      setCodeContent(codeContent: string): void;
    }>();

    state.cmdsEditor = cmdsEditor;

    const designingPage = designerStore.page;
    const selectedComponentId = designerStore.selectedComponentId;

    useEffect(() => {
      refreshView(props, state);
    }, [selectedComponentId, propName, designingPage]);

    useEffect(() => {
      if (!selectedComponentId || !propName) {
        return;
      }

      const componentConfig = designingPage.getComponent(selectedComponentId);
      const propDataBind = get(componentConfig.$dataBind, propName);
      const propExpression = get(componentConfig.$exps, propName);

      if (!propDataBind && propExpression) {
        if (cmdsEditor) {
          cmdsEditor.setCodeContent(propExpression || "");
        }
      }
    }, [selectedComponentId, propName, cmdsEditor, designingPage]);

    if (!selectedComponentId || !propName) {
      return null;
    }

    const componentConfig = designingPage.getComponent(selectedComponentId);
    const propDataBinding = get(componentConfig.$dataBind, propName);
    const propExpression = get(componentConfig.$exps, propName);

    const onBindingModeChange = ({ target }: RadioChangeEvent) => {
      const bindingMode: LinkshopBuilderComponentExpressionSetterState["bindingMode"] = target.value;
      state.setState({ bindingMode });
      if (bindingMode === "expression") {
        cmdsEditor?.setCodeContent(propExpression || "");
      }
    };

    const bindingModes: RadioGroupProps["options"] = [
      {
        label: "快速绑定",
        value: "dataBind",
      },
      {
        label: "自定义表达式",
        value: "expression",
      },
    ];

    const bindableSelectorRockConfig: RockConfig = {
      $id: `${$id}-bindableSelector`,
      $type: "linkshopBuilderBindableSelector",
      runtimeState: designerStore.runtimeState,
      expandedBindableKeys: state.expandedBindableKeys,
      selectedBindableKey: state.selectedBindableKey,
      onSelectedBindableKeyChange: [
        {
          $action: "script",
          script: (event: RockEvent) => {
            state.setState({
              selectedBindableKey: event.args[0],
            });
          },
        },
      ],
      onExpandedBindableKeysChange: [
        {
          $action: "script",
          script: (event: RockEvent) => {
            state.setState({
              expandedBindableKeys: event.args[0],
            });
          },
        },
      ],
    };

    const expressionEditorRockConfig: RockConfig = {
      $id: `${$id}-monacoEditor`,
      $type: "monacoEditor",
      cmds: (cmds: any) => {
        setCmdsEditor(cmds);
      },
      width: "100%",
      height: "200px",
      language: "javascript",
    };

    return (
      <>
        <div style={{ textAlign: "center", paddingBottom: "10px" }}>
          <Radio.Group options={bindingModes} onChange={onBindingModeChange} value={bindingMode} optionType="button" buttonStyle="solid" />
        </div>
        <div>
          {bindingMode === "expression"
            ? renderRock({
                context,
                rockConfig: expressionEditorRockConfig,
              })
            : renderRock({
                context,
                rockConfig: bindableSelectorRockConfig,
              })}
        </div>
      </>
    );
  },

  ...LinkshopBuilderComponentExpressionSetterMeta,
} as Rock;
