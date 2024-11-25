import type { CronJobConfiguration as TCronJobConfiguration } from '@ruiapp/rapid-core';
import detectOfflinePrinters from '../models/cron-jobs/detectOfflinePrinters';
import reportAutoComplete from '../models/cron-jobs/reportAutoComplete';
import syncHuateUsers from '../models/cron-jobs/syncHuateUsers';
import uploadHuateInventory from '../models/cron-jobs/uploadHuateInventory';

export default [
  detectOfflinePrinters,
  reportAutoComplete,
  syncHuateUsers,
  uploadHuateInventory,
] as TCronJobConfiguration[];
