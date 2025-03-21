import { Table, TableProps } from "antd";
import { ColumnType } from "antd/lib/table";
import { memo } from "react";

export interface ExcelDataPreviewerProps {
  data?: any[][];
  height?: string;
}

const ExcelDataPreviewer: React.FC<ExcelDataPreviewerProps> = (props) => {
  const { data, height } = props;
  if (!data) {
    return null;
  }

  const headers = data[0];
  const columns: TableProps<any>["columns"] = headers.map((header, index) => {
    return {
      key: index.toString(),
      dataIndex: index,
      title: header,
      width: "100px",
    } satisfies ColumnType<any>;
  });
  const dataSource = data.slice(1);
  return <Table scroll={{ x: "100%", y: height }} columns={columns} dataSource={dataSource} size="small" pagination={false} />;
};

export default memo(ExcelDataPreviewer);
