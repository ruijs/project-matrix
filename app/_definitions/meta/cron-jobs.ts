import type { CronJobConfiguration as TCronJobConfiguration } from '@ruiapp/rapid-core';
import detectOfflinePrinters from '../models/cron-jobs/detectOfflinePrinters';
import kisRefreshAccessTokenJob from '../models/cron-jobs/kisRefreshAccessTokenJob';
import kisRefreshAuthDataJob from '../models/cron-jobs/kisRefreshAuthDataJob';
import kisSyncInventoryApplicationsJob from '../models/cron-jobs/kisSyncInventoryApplicationsJob';
import kis_sync_audit_status from '../models/cron-jobs/kis_sync_audit_status';
import kis_sync_base_data_job from '../models/cron-jobs/kis_sync_base_data_job';
import kis_sync_inventory_data_job from '../models/cron-jobs/kis_sync_inventory_data_job';
import update_inventory_balance from '../models/cron-jobs/update_inventory_balance';

export default [
  detectOfflinePrinters,
  kisRefreshAccessTokenJob,
  kisRefreshAuthDataJob,
  kisSyncInventoryApplicationsJob,
  kis_sync_audit_status,
  kis_sync_base_data_job,
  kis_sync_inventory_data_job,
  update_inventory_balance,
] as TCronJobConfiguration[];
