// backend/src/services/scheduler.service.js
// Automated scheduler for focus monitoring and notification dispatch

const cron = require('node-cron');
const logger = require('../utils/logger');
const { checkActiveSessions } = require('./ai/focusMonitoring.service');
const { dispatchPendingNotifications } = require('./notificationQueue.service');

let focusMonitoringTask = null;
let notificationDispatchTask = null;

/**
 * Start all scheduled tasks
 */
function startScheduler() {
  const schedulerEnabled = process.env.SCHEDULER_ENABLED !== 'false';
  
  if (!schedulerEnabled) {
    logger.info('Scheduler disabled by environment variable');
    return;
  }

  logger.info('Starting scheduler service...');

  // Focus monitoring: every 2 minutes
  focusMonitoringTask = cron.schedule('*/2 * * * *', async () => {
    try {
      logger.info('Running scheduled focus monitoring check...');
      const result = await checkActiveSessions();
      logger.info('Focus monitoring check completed', {
        alertsTriggered: result.alertsTriggered || 0,
        sessionsChecked: result.sessionsChecked || 0
      });
    } catch (error) {
      logger.error('Error in scheduled focus monitoring', {
        error: error.message,
        stack: error.stack
      });
    }
  });

  // Notification dispatch: every 1 minute
  notificationDispatchTask = cron.schedule('*/1 * * * *', async () => {
    try {
      logger.info('Running scheduled notification dispatch...');
      const result = await dispatchPendingNotifications();
      if (result.processed > 0) {
        logger.info('Notification dispatch completed', {
          processed: result.processed,
          success: result.success,
          failed: result.failed
        });
      }
    } catch (error) {
      logger.error('Error in scheduled notification dispatch', {
        error: error.message,
        stack: error.stack
      });
    }
  });

  logger.info('Scheduler started successfully', {
    focusMonitoring: 'Every 2 minutes',
    notificationDispatch: 'Every 1 minute'
  });
}

/**
 * Stop all scheduled tasks
 */
function stopScheduler() {
  logger.info('Stopping scheduler service...');
  
  if (focusMonitoringTask) {
    focusMonitoringTask.stop();
    focusMonitoringTask = null;
  }
  
  if (notificationDispatchTask) {
    notificationDispatchTask.stop();
    notificationDispatchTask = null;
  }
  
  logger.info('Scheduler stopped');
}

module.exports = {
  startScheduler,
  stopScheduler
};

