import { runScheduledTasks } from '../services/cron.service.js';
import { sendRegEmail, sendStaleApplicationReminderEmail, sendWeeklyApplicationReportEmail } from '../services/email.service.js';

export async function triggerCronJobs(req, res) {
    try {
        console.log(`[cron] Manual trigger requested by ${req.user?.email || 'unknown user'}`);
        await runScheduledTasks();
        return res.status(200).json({
            message: 'Cron jobs triggered successfully.'
        });
    } catch (error) {
        console.error('[cron] Manual trigger failed:', error.message);
        return res.status(500).json({
            message: 'Could not trigger cron jobs.',
            error: error.message
        });
    }
}
