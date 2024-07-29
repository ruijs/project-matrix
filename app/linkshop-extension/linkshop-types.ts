import type { ContainerRockConfig, PageCommand, RockConfigBase, SimpleRockConfig, StoreConfig } from "@ruiapp/move-style";
import { EntityStoreConfig } from "@ruiapp/rapid-extension";

export type LinkshopWidgetCommonConfig = {
  left: number;

  top: number;

  width: number;

  height: number;
};

export type LinkshopWidgetRockConfig = RockConfigBase & LinkshopWidgetCommonConfig;

export type LinkshopAppRockConfig = SimpleRockConfig &
  LinkshopWidgetCommonConfig & {
    $type: "linkshopApp";

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

export type DesignerPageCommand = PageCommand | DesignerCommandAddStep | DesignerCommandModifyStep | DesignerCommandRemoveStep;

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
