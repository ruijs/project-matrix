import { Alert } from "antd";

export interface ImportDataValidationErrorListProps {
  validationErrors?: ImportDataValidationError[];
}

export interface ImportDataValidationError {
  message: string;
  code?: string;
  cellAddress?: string;
}

const ImportDataValidationErrorList: React.FC<ImportDataValidationErrorListProps> = (props) => {
  const { validationErrors } = props;
  if (!validationErrors || !validationErrors.length) {
    return null;
  }

  const errorList = (
    <ul>
      {validationErrors.map((validationError, index) => {
        return <li key={index}>{validationError.cellAddress ? `${validationError.cellAddress}: ${validationError.message}` : `${validationError.message}`}</li>;
      })}
    </ul>
  );

  return <Alert message="文件内容验证错误" description={errorList} type="error" showIcon />;
};

export default ImportDataValidationErrorList;
