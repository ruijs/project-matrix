/* eslint-disable react/display-name */
import { Button } from "antd";
import { memo, useRef } from "react";
import { printDOM } from "./print";
import { PrinterOutlined } from "@ant-design/icons";

const PrintOrderTemplate = memo((props: { printContent: any }) => {
  const { printContent } = props;
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div className="button-location">
        <Button
          type="default"
          icon={<PrinterOutlined />}
          onClick={() => {
            printDOM(ref.current!);
          }}
        >
          打印
        </Button>
      </div>
      <div style={{ display: "none" }}>
        <div ref={ref}>{printContent}</div>
      </div>
    </>
  );
});

export default PrintOrderTemplate;
