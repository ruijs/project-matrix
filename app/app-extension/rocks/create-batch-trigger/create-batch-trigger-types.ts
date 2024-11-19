import type { SimpleRockConfig } from "@ruiapp/move-style";

export interface CreateBatchTriggerRockConfig extends SimpleRockConfig {
  dataSource: {
    code: string;
    equipment: string;
    executionState: string;
    factory: {
      code: string;
      id: string;
      name: string;
    };
    id: number;
    material: {
      id: string;
      code: string;
      name: string;
    };
    processes: {
      id: string;
      code: string;
      name: string;
    }[];
  };
}
