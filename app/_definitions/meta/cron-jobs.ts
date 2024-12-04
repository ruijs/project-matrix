import type { CronJobConfiguration as TCronJobConfiguration } from '@ruiapp/rapid-core';
import detectOfflinePrinters from '../models/cron-jobs/detectOfflinePrinters';
import reportAutoComplete from '../models/cron-jobs/reportAutoComplete';
import syncHuateUsers from '../models/cron-jobs/syncHuateUsers';
import uploadHuateInventory from '../models/cron-jobs/uploadHuateInventory';
import uploadMeasurements from '../models/cron-jobs/uploadMeasurements';

export default [
  detectOfflinePrinters,
  reportAutoComplete,
  syncHuateUsers,
  uploadHuateInventory,
  uploadMeasurements,
] as TCronJobConfiguration[];
