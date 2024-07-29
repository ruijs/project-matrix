import { Rock } from "@ruiapp/move-style";

const stepActionMap: Record<string, Rock["onReceiveMessage"]> = {
  refresh: (message, state, props) => {},
};

export default stepActionMap;
