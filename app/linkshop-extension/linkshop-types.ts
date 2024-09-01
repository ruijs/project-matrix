import type { ContainerRockConfig, PageCommand, RockConfigBase, SimpleRockConfig } from "@ruiapp/move-style";
import type { FindEntityOptions } from "@ruiapp/rapid-extension";

export type LinkshopWidgetCommonConfig = {
  left: number;

  top: number;

  width: number;

  height: number;
};

export type LinkshopWidgetRockConfig = RockConfigBase & LinkshopWidgetCommonConfig;

export type LinkshopAppRockConfig = SimpleRockConfig & {
  $type: "linkshopApp";

  /**
   * 应用变量
   */
  variables: LinkshopAppVariableConfig[];

  /**
   * 数据记录
   */
  records: LinkshopAppRecordConfig[];

  /**
   * 数据源
   */
  stores: LinkshopAppEntityStoreConfig[];

  /**
   * 应用步骤
   */
  layouts: LinkshopAppLayoutRockConfig[];

  /**
   * 应用步骤
   */
  steps: LinkshopAppStepRockConfig[];
};

export type LinkshopAppLayoutRockConfig = ContainerRockConfig &
  LinkshopWidgetCommonConfig & {
    $type: "linkshopAppLayout";

    name: string;

    /**
     * 背景颜色
     */
    backgroundColor?: string;
  };

export type LinkshopAppStepRockConfig = ContainerRockConfig &
  LinkshopWidgetCommonConfig & {
    $type: "linkshopAppStep";

    name: string;

    /**
     * 背景颜色
     */
    backgroundColor?: string;

    /**
     * 布局模板Id
     */
    layoutId?: string;
  };

export type DesignerPageCommand =
  | PageCommand
  | DesignerCommandAddStep
  | DesignerCommandModifyStep
  | DesignerCommandRemoveStep
  | DesignerCommandCopyStep
  | DesignerCommandAddVariable
  | DesignerCommandModifyVariable
  | DesignerCommandRemoveVariable
  | DesignerCommandSetRuntimeStateVariables;

export type DesignerCommandAddStep = {
  name: "addStep";
  payload: {
    step: Record<string, any>;
  };
};

export type DesignerCommandModifyStep = {
  name: "modifyStep";
  payload: {
    step: Record<string, any>;
  };
};

export type DesignerCommandRemoveStep = {
  name: "removeStep";
  payload: {
    step: Record<string, any>;
  };
};

export type DesignerCommandCopyStep = {
  name: "copyStep";
  payload: {
    step: Record<string, any>;
  };
};

export type DesignerCommandAddVariable = {
  name: "addVariable";
  payload: {
    variable: LinkshopAppVariableConfig;
  };
};

export type DesignerCommandModifyVariable = {
  name: "modifyVariable";
  payload: {
    variable: LinkshopAppVariableConfig;
  };
};

export type DesignerCommandRemoveVariable = {
  name: "removeVariable";
  payload: {
    variable: LinkshopAppVariableConfig;
  };
};

export type DesignerCommandSetRuntimeStateVariables = {
  name: "setRuntimeStateVariables";
  payload: {
    variables: LinkshopAppVariableConfig[];
  };
};

export type LinkshopAppVariableConfig = {
  name: string;
  type: LinkshopAppVariableType;
  defaultValue: any;
};

export type LinkshopAppVariableType = "string" | "integer" | "float" | "boolean";

export type LinkshopAppRecordConfig = {
  name: string;
  entityCode: string;
};

export interface LinkshopAppEntityStoreConfig extends FindEntityOptions {
  type: "entityStore";
  name: string;
  entityCode: string;
}
