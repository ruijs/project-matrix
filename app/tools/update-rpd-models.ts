import path from "path";
import { type RapidModelsUpdateOptions, RapidModelsUpdater } from "@ruiapp/rapid-configure-tools";

import dataDictionaryModels from "~/_definitions/meta/data-dictionary-models";
import entityModels from "~/_definitions/meta/entity-models";

const env = process.env;

const updateOptions: RapidModelsUpdateOptions = {
  appDataDirLocation: path.join(__dirname, "..", ".benzene-data"),
  rapidApiUrl: env.RAPID_API_URL || "http://127.0.0.1:3000/api",
  entities: entityModels,
  dataDictionaries: dataDictionaryModels,
};

const updater = new RapidModelsUpdater(updateOptions);
updater.updateRapidSystemConfigurations();
