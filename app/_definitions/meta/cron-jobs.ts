import type { CronJobConfiguration as TCronJobConfiguration } from '@ruiapp/rapid-core';
import detectOfflinePrinters from '../models/cron-jobs/detectOfflinePrinters';
import reportAutoComplete from '../models/cron-jobs/reportAutoComplete';
import uploadHuateInventory from '../models/cron-jobs/uploadHuateInventory';

export default [
  detectOfflinePrinters,
  reportAutoComplete,
  uploadHuateInventory,
] as TCronJobConfiguration[];
