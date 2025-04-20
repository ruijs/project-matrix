import { DownloadOutlined, InboxOutlined, LeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { Rock, SimpleRockConfig } from "@ruiapp/move-style";
import { Alert, Button, Checkbox, Divider, Form, FormInstance, Input, message, Result, Select, Space, Steps, Upload, UploadProps } from "antd";
import { useEffect, useState } from "react";
import ExcelDataPreviewer from "~/components/ExcelDataPreviewer";
import ImportDataValidationErrorList from "~/components/ImportDataValidationErrorList";
import rapidApi from "~/rapidApi";

const { Dragger } = Upload;

export interface ProductInspectionSheetImportRockConfig extends SimpleRockConfig {}

export type DataImportStep = "uploadFile" | "preview" | "done";
export type ImportingState = "importing" | "imported" | "failed";
export type ImportingMode = "overwrite" | "append";

export type PreviewData = any[][];

export default {
  $type: "productInspectionSheetImport",

  Renderer(context, props: ProductInspectionSheetImportRockConfig) {
    const [step, setStep] = useState<number | null>(null);
    const [previewColumns, setPreviewColumns] = useState<any>();
    const [validationErrors, setValidationErrors] = useState<ImportDataValidationError[]>();
    const [previewData, setPreviewData] = useState<PreviewData>();
    const [importingState, setImportingState] = useState<ImportingState>("importing");
    const [importFailedMessage, setImportFailedMessage] = useState("");
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [inspectionSheetsSaved, setInspectionSheetsSaved] = useState<any[]>([]);
    const [ignoreErrors, setIgnoreErrors] = useState(false);
    const downloadUrl = `/api/app/downloadProductInspectionSheetImportTemplate`;
    const uploadUrl = `/api/app/uploadProductInspectionSheetImportFile`;
    const importUrl = `/app/importProductInspectionSheet`;

    const [importingForm] = Form.useForm();

    useEffect(() => {
      setStep(0);
    }, []);

    const uploadProps: UploadProps = {
      name: "file",
      multiple: false,
      accept: ".xlsx",
      action: uploadUrl,
      onChange(info) {
        const uploadFile = info.file;
        const { status } = uploadFile;
        if (status !== "uploading") {
          console.log(uploadFile, info.fileList);
        }
        if (status === "done") {
          const response = uploadFile.response;
          setPreviewColumns(response.columns);
          setPreviewData(response.data);
          setValidationErrors(response.errors || []);
          setStep(1);

          message.success(`${uploadFile.name} file uploaded successfully.`);
        } else if (status === "error") {
          console.log("upload error", info);
          const response = uploadFile.response;
          message.error(response.error.message || `${uploadFile.name} file upload failed.`);
        }
      },
      onDrop(e) {
        console.log("Dropped files", e.dataTransfer.files);
      },
    };

    const onConfirmImportClick = async () => {
      setStep(2);
      setImportingState("importing");

      const importingSettings = importingForm.getFieldsValue();

      try {
        const response = await rapidApi.post(importUrl, {
          importingMode: importingSettings.importingMode,
          columns: previewColumns,
          data: previewData,
        });

        if (response.status === 200) {
          setImportingState("imported");
          setImportErrors(response.data.errors || []);
          setInspectionSheetsSaved(response.data.inspectionSheetsSaved || []);
        } else {
          const error = response.data.error;
          message.error(error.message);
          setImportFailedMessage(error.message);
          setImportingState("failed");
        }
      } catch (ex: any) {
        message.error(ex.message);
        setImportFailedMessage(ex.message);
        setImportingState("failed");
      }
    };

    const onCheckboxIgnoreErrorsClick = () => {
      setIgnoreErrors(!ignoreErrors);
    };

    return (
      <>
        <Steps
          current={step || 0}
          items={[
            {
              title: "上传文件",
            },
            {
              title: "预览数据",
            },
            {
              title: "导入数据",
            },
          ]}
        />

        {step === 0 && (
          <div style={{ padding: "20px 0" }}>
            <div>
              <div style={{ paddingBottom: "20px" }}>
                {/* <Button icon={<DownloadOutlined />} href={downloadUrl} target="_new">
                  下载模板
                </Button> */}
              </div>
              <div>
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击此处选择要导入的Excel文件，或者将Excel文件拖放到此处。</p>
                  <p className="ant-upload-hint">仅支持xlsx格式的Excel文件。仅会导入第一个Sheet中的数据。</p>
                </Dragger>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ padding: "20px 0" }}>
            <PreviewStepToolbar
              form={importingForm}
              importDisabled={!ignoreErrors && !!(validationErrors && validationErrors.length)}
              setStep={setStep}
              onConfirmImportClick={onConfirmImportClick}
              ignoreErrors={ignoreErrors}
              onCheckboxIgnoreErrorsClick={onCheckboxIgnoreErrorsClick}
            />
            <div style={{ padding: "20px 0" }}>
              <ExcelDataPreviewer data={previewData} height="500px" />
              {validationErrors && (
                <>
                  <Divider />
                  <ImportDataValidationErrorList validationErrors={validationErrors} />
                </>
              )}
            </div>
            <PreviewStepToolbar
              form={importingForm}
              importDisabled={!ignoreErrors && !!(validationErrors && validationErrors.length)}
              setStep={setStep}
              onConfirmImportClick={onConfirmImportClick}
              ignoreErrors={ignoreErrors}
              onCheckboxIgnoreErrorsClick={onCheckboxIgnoreErrorsClick}
            />
          </div>
        )}

        {step === 2 && (
          <div style={{ padding: "20px 0" }}>
            <Result
              status={importingState === "importing" ? "info" : importingState === "failed" ? "error" : "success"}
              icon={importingState === "importing" ? <LoadingOutlined /> : undefined}
              title={importingState === "importing" ? "正在导入，请稍候……" : importingState === "failed" ? "导入失败" : "导入完成"}
              subTitle={
                importingState === "imported"
                  ? `成功导入${inspectionSheetsSaved.length.toString()}条记录。`
                  : importingState === "failed"
                  ? importFailedMessage
                  : ""
              }
              extra={
                importingState === "imported" ? (
                  <div>
                    <div>
                      <Space direction="horizontal">
                        <Button key="viewPackageItemDetail" type="primary" href={`/pages/mom_inspection_sheet_list`}>
                          查看检测记录
                        </Button>
                        <Button key="importAgain" onClick={() => setStep(0)}>
                          再次导入
                        </Button>
                      </Space>
                    </div>
                    <div style={{ paddingTop: "20px", textAlign: "left" }}>
                      {importErrors.length > 0 && (
                        <Alert
                          message="以下检验记录未导入成功："
                          description={
                            <ul>
                              {importErrors.map((importError, index) => {
                                return <li key={index}>{importError}</li>;
                              })}
                            </ul>
                          }
                          type="warning"
                          showIcon
                        />
                      )}
                    </div>
                  </div>
                ) : importingState === "failed" ? (
                  [
                    <Button key="importAgain" onClick={() => setStep(0)}>
                      重新导入
                    </Button>,
                  ]
                ) : null
              }
            />
          </div>
        )}
      </>
    );
  },
} as Rock;

interface PreviewStepToolbarProps {
  setStep: any;
  ignoreErrors: boolean;
  importDisabled?: boolean;
  form: FormInstance<{
    importingMode: ImportingMode;
  }>;
  onConfirmImportClick: any;
  onCheckboxIgnoreErrorsClick: any;
}

function PreviewStepToolbar({ form, setStep, onConfirmImportClick, ignoreErrors, importDisabled, onCheckboxIgnoreErrorsClick }: PreviewStepToolbarProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <Button size="large" icon={<LeftOutlined />} onClick={() => setStep(0)}>
          重新上传
        </Button>
      </div>
      <div>
        <Form form={form} layout="inline" initialValues={{ importingMode: "overwrite" }} style={{ alignItems: "center" }}>
          <Form.Item>
            <Checkbox checked={!!ignoreErrors} onClick={onCheckboxIgnoreErrorsClick} />
            忽略错误检验记录
          </Form.Item>
          <Form.Item style={{ marginRight: 0 }}>
            <Button size="large" type="primary" disabled={importDisabled} onClick={onConfirmImportClick}>
              确认导入
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
