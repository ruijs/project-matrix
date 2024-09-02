import { Framework, Page } from "@ruiapp/move-style";
import type { PageConfig, RockConfig, StoreConfig } from "@ruiapp/move-style";
import { Rui } from "@ruiapp/react-renderer";
import ReactRocks from "@ruiapp/react-rocks";
import AntdExtension from "@ruiapp/antd-extension";
import DataBindingExtension from "@ruiapp/data-binding-extension";
import MonacoExtension from "@ruiapp/monaco-extension";
import RapidExtension, { rapidAppDefinition, RapidExtensionSetting } from "@ruiapp/rapid-extension";
import { useMemo } from "react";
import _, { first, get } from "lodash";
import { redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { RapidPage, RapidEntity, RapidDataDictionary } from "@ruiapp/rapid-extension";
import qs from "qs";

import AppExtension from "~/app-extension/mod";
import LinkshopExtension from "~/linkshop-extension/mod";
import ShopfloorExtension from "~/shopfloor-extension/mod";

import antdStyles from "antd/dist/antd.css";
import indexStyles from "~/styles/index.css";
import linkshopBuilderStyles from "~/styles/linkshop-builder.css";
import shopfloorExtensionStyles from "~/shopfloor-extension/mod.css";

import rapidService from "~/rapidService";

import { ShopfloorApp } from "~/_definitions/meta/entity-types";
import { RuiLoggerProvider } from "rui-logger";
import { redirectToSignin } from "~/utils/navigate";
import axios from "axios";
import { LinkshopAppRuntimeStateStoreConfig } from "~/linkshop-extension/stores/LinkshopAppRuntimeStateStore";
import { AppDefinition } from "@ruiapp/rapid-extension/src/rapidAppDefinition";

export function links() {
  return [antdStyles, indexStyles, linkshopBuilderStyles, shopfloorExtensionStyles].map((styles) => {
    return { rel: "stylesheet", href: styles };
  });
}

const framework = new Framework();
framework.setLoggerProvider(new RuiLoggerProvider());

framework.registerExpressionVar("axios", axios);
framework.registerExpressionVar("_", _);
framework.registerExpressionVar("qs", qs);

framework.loadExtension(DataBindingExtension);
framework.loadExtension(ReactRocks);
framework.loadExtension(AntdExtension);
framework.loadExtension(MonacoExtension);
framework.loadExtension(RapidExtension);
framework.loadExtension(AppExtension);
framework.loadExtension(LinkshopExtension);
framework.loadExtension(ShopfloorExtension);

RapidExtensionSetting.setDefaultRendererPropsOfRendererType("rapidCurrencyRenderer", {
  usingThousandSeparator: true,
  decimalPlaces: 2,
  currencyCode: "CNY",
});

export interface GenerateRuiPageConfigOption<TPage = RapidPage> {
  sdPage: TPage;
  entities: RapidEntity[];
  dataDictionaries: RapidDataDictionary[];
}

export function generateRuiPage(option: GenerateRuiPageConfigOption) {
  const { sdPage } = option;
  const viewRocks = (sdPage.view ? (sdPage.view.length ? sdPage.view : [sdPage.view]) : []) as RockConfig[];

  const ruiPageConfig: PageConfig = {
    $id: sdPage.code,
    stores: sdPage.stores || [],
    view: viewRocks.map((child, index) => {
      return {
        $type: "box",
        $id: `page-section-${index + 1}`,
        className: "rui-page-section",
        children: child,
      };
    }),
    eventSubscriptions: sdPage.eventSubscriptions,
  };

  return ruiPageConfig;
}

export type Params = {
  code: string;
};

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

  let { searchParams } = new URL(request.url);
  let appId = searchParams.get("appId");

  if (!appId) {
    return redirect("/shopfloor/begin");
  }

  const myAllowedActions = (
    await rapidService.get(`app/listMyAllowedSysActions`, {
      headers: {
        Cookie: request.headers.get("Cookie"),
      },
    })
  ).data;

  const shopfloorApps = (
    await rapidService.post(
      `shopfloor/shopfloor_apps/operations/find`,
      {
        filters: [
          {
            field: "id",
            operator: "eq",
            value: appId,
          },
        ],
        properties: ["id", "name", "content"],
      },
      {
        headers: {
          Cookie: request.headers.get("Cookie"),
        },
      },
    )
  ).data.list;

  const shopfloorApp = first(shopfloorApps);

  return {
    myProfile,
    myAllowedActions,
    appId,
    shopfloorApp,
    entities: appDefinition.entities,
    dataDictionaries: appDefinition.dataDictionaries,
    pageAccessAllowed: true,
  };
};

export default function Index() {
  const viewModel = useLoaderData<ViewModel>();
  const { myProfile, myAllowedActions, pageAccessAllowed, appId, shopfloorApp, entities, dataDictionaries } = viewModel;

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
    if (!pageAccessAllowed) {
      ruiPageConfig = {
        view: [{ $type: "text", text: `You are not allowed to visit this Shopfloor App.` }],
      };
      return new Page(framework, ruiPageConfig);
    }

    if (!shopfloorApp) {
      ruiPageConfig = {
        view: [{ $type: "text", text: `Shopfloor app with id '${appId}' was not found.` }],
      };
      return new Page(framework, ruiPageConfig);
    }

    const shopfloorAppConfig = shopfloorApp.content;
    if (!shopfloorAppConfig) {
      ruiPageConfig = {
        $id: "playerPage",
        view: [
          {
            $type: "antdAlert",
            type: "error",
            message: "应用未配置完成。",
          },
        ],
      };
    } else {
      const stores: StoreConfig[] = [
        {
          type: "linkshopAppRuntimeStateStore",
          name: "runtimeStore",
          variables: shopfloorAppConfig.variables,
          records: shopfloorAppConfig.records,
        } as LinkshopAppRuntimeStateStoreConfig,
        //TODO: appConfig中的stores配置应仅作声明用，Page.stores中的entity stores应由组件在渲染时创建
        ...get(shopfloorAppConfig, "stores", []),
      ];

      ruiPageConfig = {
        $id: "playerPage",
        initialVars: {
          linkshopAppConfig: {
            stores: shopfloorAppConfig.stores,
          },
        },
        stores,
        view: [
          {
            $id: "linkshopScannerProvider",
            $type: "linkshopScannerProvider",
            children: [
              {
                $id: "linkshopApp",
                $type: "linkshopApp",
                layouts: get(shopfloorAppConfig, "layouts", []),
                steps: get(shopfloorAppConfig, "steps", []),
              },
            ],
          },
        ],
      } as any;
    }

    return new Page(framework, ruiPageConfig);
  }, [appId, shopfloorApp, pageAccessAllowed]);

  return (
    <>
      <Rui framework={framework} page={page} />
    </>
  );
}
