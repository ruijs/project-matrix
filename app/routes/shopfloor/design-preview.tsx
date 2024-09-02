import { Framework, Page } from "@ruiapp/move-style";
import type { PageConfig } from "@ruiapp/move-style";
import { Rui } from "@ruiapp/react-renderer";
import ReactRocks from "@ruiapp/react-rocks";
import AntdExtension from "@ruiapp/antd-extension";
import DataBindingExtension from "@ruiapp/data-binding-extension";
import MonacoExtension from "@ruiapp/monaco-extension";
import DesignerExtension from "@ruiapp/designer-extension";
import RapidExtension, { RapidExtensionSetting, rapidAppDefinition } from "@ruiapp/rapid-extension";
import { useMemo } from "react";
import _ from "lodash";
import { redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { RapidEntity, RapidDataDictionary } from "@ruiapp/rapid-extension";
import qs from "qs";

import AppExtension from "~/app-extension/mod";
import LinkshopExtension from "~/linkshop-extension/mod";
import ShopfloorExtension from "~/shopfloor-extension/mod";

import antdStyles from "antd/dist/antd.css";
import linkshopPreviewerStyles from "~/styles/linkshop-previewer.css";
import indexStyles from "~/styles/index.css";
import linkshopBuilderStyles from "~/styles/linkshop-builder.css";
import shopfloorExtensionStyles from "~/shopfloor-extension/mod.css";

import rapidService from "~/rapidService";

import { ShopfloorApp } from "~/_definitions/meta/entity-types";
import { RuiLoggerProvider } from "rui-logger";
import { redirectToSignin } from "~/utils/navigate";
import { AppDefinition } from "@ruiapp/rapid-extension/src/rapidAppDefinition";

export function links() {
  return [antdStyles, indexStyles, linkshopBuilderStyles, linkshopPreviewerStyles, shopfloorExtensionStyles].map((styles) => {
    return { rel: "stylesheet", href: styles };
  });
}

const framework = new Framework();
framework.setLoggerProvider(new RuiLoggerProvider());

framework.registerExpressionVar("_", _);
framework.registerExpressionVar("qs", qs);

framework.loadExtension(DataBindingExtension);
framework.loadExtension(ReactRocks);
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

export const loader: LoaderFunction = async ({ context, request, params }) => {
  const appDefinition = context.appDefinition as AppDefinition;

  const myProfile = (
    await rapidService.get(`me`, {
      headers: {
        Cookie: request.headers.get("Cookie"),
      },
    })
  ).data?.user;

  if (!myProfile) {
    return redirectToSignin(request.url);
  }

  return {
    myProfile,
    entities: appDefinition.entities,
    dataDictionaries: appDefinition.dataDictionaries,
    pageAccessAllowed: true,
  };
};

export default function Index() {
  const viewModel = useLoaderData<ViewModel>();
  const { myProfile, myAllowedActions, entities, dataDictionaries } = viewModel;

  framework.registerExpressionVar("me", {
    profile: myProfile,
    allowedActions: myAllowedActions,
  });

  rapidAppDefinition.setAppDefinition({
    entities,
    dataDictionaries,
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
