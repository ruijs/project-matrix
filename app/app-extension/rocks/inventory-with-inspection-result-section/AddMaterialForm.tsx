import { renderRock } from "@ruiapp/react-renderer";
import { Button, Form } from "antd";

export default function AddMaterialForm(props: any) {
  const { context, onAddMaterial } = props;
  const [addMaterialForm] = Form.useForm();

  const onFormSubmit = async (formData: any) => {
    addMaterialForm.resetFields();

    const { materialId } = formData;
    if (!materialId) {
      return;
    }
    await onAddMaterial(materialId);
  };

  return (
    <Form form={addMaterialForm} layout="inline" onFinish={onFormSubmit}>
      <Form.Item label="物料" name="materialId">
        {renderRock({
          context,
          rockConfig: {
            $type: "rapidEntityTableSelect",
            $id: `${props.$id}_material`,
            entityCode: "BaseMaterial",
            placeholder: "请选择",
            dropdownMatchSelectWidth: 500,
            labelRendererType: "materialLabelRenderer",
            listFilterFields: ["name", "code", "specification"],
            orderBy: [{ field: "code" }],
            searchPlaceholder: "按料号、名称或规格搜索",
            columns: [{ code: "code" }, { code: "name" }, { code: "specification" }],
          },
        })}
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          添加
        </Button>
      </Form.Item>
    </Form>
  );
}
