import { Framework, MoveStyleUtils, Page, PageConfig, RuiEvent } from "@ruiapp/move-style";
import { Rui } from "@ruiapp/react-renderer";
import { HtmlElement, Box, Label, Text } from "@ruiapp/react-rocks";
import AntdExtension from "@ruiapp/antd-extension";
import { useMemo, useState } from "react";

import signinStyles from "~/styles/signin.css";
import styles from "antd/dist/antd.css";
import RapidExtension, { RapidFormRockConfig } from "@ruiapp/rapid-extension";
import { message } from "antd";
import { RuiLoggerProvider } from "rui-logger";
import { redirectOriginPath } from "~/utils/navigate";
import { useLoaderData } from "@remix-run/react";
import rapidService from "~/rapidService";
import { LoaderFunction } from "@remix-run/node";

type ViewModel = {
  systemSettings: Record<string, any>;
};

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: signinStyles },
  ];
}
export const loader: LoaderFunction = async ({ request }) => {
  const systemSettings = (
    await rapidService.get(`svc/systemSettingValues?groupCode=public`, {
      headers: {
        Cookie: request.headers.get("Cookie"),
      },
    })
  ).data;

  return {
    systemSettings,
  };
};

const framework = new Framework();
framework.setLoggerProvider(new RuiLoggerProvider());

framework.registerComponent(HtmlElement);
framework.registerComponent(Box);
framework.registerComponent(Label);
framework.registerComponent(Text);

framework.loadExtension(AntdExtension);
framework.loadExtension(RapidExtension);

function getPageConfig(viewModel: ViewModel) {
  const pageConfig: PageConfig = {
    view: [
      {
        $type: "box",
        className: "rui-signin-page",
        children: [
          {
            $type: "htmlElement",
            htmlTag: "div",
            attributes: {
              className: "rui-signin-form",
            },
            children: [
              {
                $type: "htmlElement",
                htmlTag: "div",
                attributes: {
                  className: "rui-signin-form--title",
                },
                children: [
                  {
                    $type: "text",
                    text: viewModel.systemSettings.systemName || "麒祥高新材料WMS",
                  },
                ],
              },
              {
                $type: "rapidForm",
                className: "rui-signin-form",
                layout: "vertical",
                items: [
                  {
                    type: "text",
                    code: "account",
                    label: "用户名",
                    required: true,
                    rules: [
                      // eslint-disable-next-line no-template-curly-in-string
                      { required: true, message: "请输入${label}" },
                    ],
                  },
                  {
                    type: "password",
                    code: "password",
                    label: "密码",
                    required: true,
                    rules: [
                      // eslint-disable-next-line no-template-curly-in-string
                      { required: true, message: "请输入${label}" },
                    ],
                  },
                ],
                actions: [
                  {
                    actionType: "submit",
                    actionText: "登录",
                    actionProps: {
                      block: true,
                    },
                  },
                ],
                onFinish: [
                  {
                    $action: "script",
                    script: async (event: RuiEvent) => {
                      const formData = await event.sender.form.validateFields();
                      try {
                        const response = await MoveStyleUtils.request({
                          method: "POST",
                          url: "/api/signin",
                          data: formData,
                        });

                        const result = response.data;
                        if (response.status !== 200 || result.error) {
                          let errorMessage = result.error?.message;
                          if (!errorMessage) {
                            errorMessage = response.statusText;
                          }
                          throw new Error("登录失败：" + errorMessage);
                        }

                        message.success("登录成功");
                        redirectOriginPath(viewModel.systemSettings.homePageUrl);
                      } catch (err: any) {
                        console.error("Signin failed.", err);
                        const errorMessage = err?.response?.data?.error?.message || err.message;
                        message.error(errorMessage);
                      }
                    },
                  },
                ],
              } as RapidFormRockConfig,
            ],
          },
        ],
      },
    ],
  };

  return pageConfig;
}

export default function Index() {
  const viewModel = useLoaderData<ViewModel>();
  const initialPageConfig = useMemo(() => {
    return getPageConfig(viewModel);
  }, [viewModel]);

  const [pageConfig] = useState(initialPageConfig);
  const [page] = useState(() => new Page(framework, pageConfig));

  return <Rui framework={framework} page={page} />;
}
