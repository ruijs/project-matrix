import type { CronJobConfiguration as TCronJobConfiguration } from '@ruiapp/rapid-core';
import detectOfflinePrinters from '../models/cron-jobs/detectOfflinePrinters';
import reportAutoComplete from '../models/cron-jobs/reportAutoComplete';

export default [
  detectOfflinePrinters,
  reportAutoComplete,
] as TCronJobConfiguration[];
