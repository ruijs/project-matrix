import { Select } from "antd";
import { camelCase, orderBy, upperFirst } from "lodash";
import { memo, PropsWithChildren, useEffect, useMemo, useState } from "react";
import rapidApi from "~/rapidApi";

type IProps = PropsWithChildren<{
  value?: string;
  onChange?(v: string): void;
}>;

function ModelSelector(props: IProps) {
  const { loadModels, loading, models } = useModels();

  useEffect(() => {
    loadModels();
  }, []);

  // TODO: should use singularCode, because code is not saved in database.
  const options = useMemo(() => {
    return (models || []).map((m) => ({ label: `${m.name} (${m.singularCode})`, value: upperFirst(camelCase(m.singularCode)) }));
  }, [models]);

  return (
    <Select placeholder="请选择" loading={loading} options={options} value={props.value} onChange={props.onChange} showSearch={true} optionFilterProp="label" />
  );
}

export default memo<IProps>(ModelSelector);

function useModels() {
  const [loading, setLoading] = useState<boolean>(false);
  const [models, setModels] = useState<any[]>([]);

  const loadModels = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    await rapidApi
      .post(`/meta/models/operations/find`, {
        orderBy: [
          {
            field: "name",
          },
        ],
      })
      .then((res) => {
        setModels(res.data?.list || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { loading, loadModels, models };
}
