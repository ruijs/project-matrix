import { Framework, Page } from "@ruiapp/move-style";
import type { PageConfig } from "@ruiapp/move-style";
import { Rui } from "@ruiapp/react-renderer";
import { Rui as RuiRock, ErrorBoundary, Show, HtmlElement, Anchor, Box, Label, List, Scope, Text } from "@ruiapp/react-rocks";
import AntdExtension from "@ruiapp/antd-extension";
import MonacoExtension from "@ruiapp/monaco-extension";
import DesignerExtension from "@ruiapp/designer-extension";
import RapidExtension, { RapidExtensionSetting, rapidAppDefinition } from "@ruiapp/rapid-extension";
import { useMemo } from "react";
import _ from "lodash";
import { redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { RapidEntity, RapidDataDictionary } from "@ruiapp/rapid-extension";
import qs from "qs";

import dataDictionaryModels from "~/_definitions/meta/data-dictionary-models";
import entityModels from "~/_definitions/meta/entity-models";

import AppExtension from "~/app-extension/mod";
import LinkshopExtension from "~/linkshop-extension/mod";
import ShopfloorExtension from "~/shopfloor-extension/mod";

import antdStyles from "antd/dist/antd.css";
import indexStyles from "~/styles/index.css";
import customizeStyles from "~/styles/customize.css";
import linkshopBuilderStyles from "~/styles/linkshop-builder.css";
import flexStyles from "~/styles/flex.css";
import rapidService from "~/rapidService";
import sfComponentStyles from "~/shopfloor-extension/rocks/style";

import { ShopfloorApp } from "~/_definitions/meta/entity-types";
import { RuiLoggerProvider } from "rui-logger";

export function links() {
  return [antdStyles, indexStyles, customizeStyles, linkshopBuilderStyles, flexStyles, ...sfComponentStyles].map((styles) => {
    return { rel: "stylesheet", href: styles };
  });
}

const framework = new Framework();
framework.setLoggerProvider(new RuiLoggerProvider());

framework.registerExpressionVar("_", _);
framework.registerExpressionVar("qs", qs);

framework.registerComponent(RuiRock);
framework.registerComponent(ErrorBoundary);
framework.registerComponent(Show);
framework.registerComponent(HtmlElement);
framework.registerComponent(Scope);
framework.registerComponent(Text);

framework.registerComponent(Anchor);
framework.registerComponent(Box);
framework.registerComponent(Label);
framework.registerComponent(List);

framework.loadExtension(AntdExtension);
framework.loadExtension(MonacoExtension);
framework.loadExtension(RapidExtension);
framework.loadExtension(DesignerExtension);
framework.loadExtension(AppExtension);
framework.loadExtension(LinkshopExtension);
framework.loadExtension(ShopfloorExtension);

RapidExtensionSetting.setDefaultRendererPropsOfRendererType("rapidCurrencyRenderer", {
  usingThousandSeparator: true,
  decimalPlaces: 2,
  currencyCode: "CNY",
});

type ViewModel = {
  myProfile: any;
  myAllowedActions: string[];
  pageAccessAllowed: boolean;
  appId: string;
  shopfloorApp: ShopfloorApp;
  entities: RapidEntity[];
  dataDictionaries: RapidDataDictionary[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const myProfile = (
    await rapidService.get(`me`, {
      headers: {
        Cookie: request.headers.get("Cookie"),
      },
    })
  ).data?.user;

  if (!myProfile) {
    return redirect("/signin");
  }

  return {
    myProfile,
    entities: entityModels,
    dataDictionaries: dataDictionaryModels,
    pageAccessAllowed: true,
  };
};

export default function Index() {
  const viewModel = useLoaderData<ViewModel>();
  const { myProfile, myAllowedActions } = viewModel;

  framework.registerExpressionVar("me", {
    profile: myProfile,
    allowedActions: myAllowedActions,
  });

  rapidAppDefinition.setAppDefinition({
    entities: entityModels,
    dataDictionaries: dataDictionaryModels,
  });

  const page = useMemo(() => {
    let ruiPageConfig: PageConfig | undefined;

    ruiPageConfig = {
      $id: "previewPage",
      stores: [
        {
          type: "linkshopAppDesignerStore",
          name: "designerStore",
        },
      ],
      view: [
        {
          $type: "designerPreviewWrapper",
          children: {
            $type: "errorBoundary",
            children: [
              {
                $id: "canvas",
                $type: "rui",
                $exps: {
                  framework: "$framework",
                  page: "$stores.designerStore.page",
                },
              },
            ],
          },
        },
      ],
    };
    return new Page(framework, ruiPageConfig);
  }, []);

  return <Rui framework={framework} page={page} />;
}
