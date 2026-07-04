console.log('Cron file loaded');
import cron from 'node-cron';
import applicationModel from '../models/application.model.js';
import userModel from '../models/user.model.js';
import { CLOSED_STATUSES, STALE_THRESHOLD_MS } from '../constants/constants.js';
import { sendStaleApplicationReminderEmail, sendWeeklyApplicationReportEmail } from './email.service.js';
import { createInterviewCalendarEvent } from './google.service.js';

let isRunning = false;
let cronTask = null;
let isReady = false;
let lastRunAt = null;
const RUN_COOLDOWN_MS = 5 * 60 * 1000;

async function scheduleInterviewCalendarEvents() {
    console.log('[cron] Running scheduleInterviewCalendarEvents');
    const now = new Date(); //26 june 
    const startWindow = new Date(now); // 26 june
    startWindow.setDate(now.getDate() + 1); //27
    startWindow.setHours(0, 0, 0, 0);

    const endWindow = new Date(startWindow);
    endWindow.setDate(startWindow.getDate() + 2);

    console.log('[cron] startWindow:', startWindow.toISOString());
    console.log('[cron] endWindow:', endWindow.toISOString());

    const query = {
        interviewDate: { $gte: startWindow, $lt: endWindow },
        status: { $nin: ['rejected', 'offered'] },
        googleEventId: null
    };
    console.log('[cron] interview query:', JSON.stringify(query));

    const applications = await applicationModel.find(query);
    console.log('[cron] interview calendar candidates:', applications.length);

    for (const application of applications) {
        const user = await userModel.findById(application.userId);
        if (!application.interviewDate) {
            console.log(`[cron] Skipping ${application.companyName}: interviewDate missing`);
            continue;
        }
        if (!user) {
            console.log(`[cron] Skipping ${application.companyName}: user not found`);
            continue;
        }
        if (!user.google?.connected) {
            console.log(`[cron] Skipping ${application.companyName}: Google not connected`);
            continue;
        }
        if (application.googleEventId) {
            console.log(`[cron] Skipping ${application.companyName}: googleEventId already exists`);
            continue;
        }

        try {
            const claimed = await applicationModel.updateOne(
                { _id: application._id, googleEventId: null },
                { $set: { googleEventId: 'PENDING' } }
            );

            if (claimed.modifiedCount !== 1) {
                console.log(`[cron] Another run already claimed ${application.companyName}, skipping`);
                continue;
            }

            const eventId = await createInterviewCalendarEvent(user, application);
            await applicationModel.updateOne(
                { _id: application._id, googleEventId: 'PENDING' },
                { $set: { googleEventId: eventId } }
            );
            console.log(`[cron] Calendar event created for ${application.companyName}: ${eventId}`);
        } catch (error) {
            await applicationModel.updateOne(
                { _id: application._id, googleEventId: 'PENDING' },
                { $set: { googleEventId: null } }
            );
            console.error(`[cron] Calendar event error for ${application.companyName}:`, error);
        }
    }
}

async function sendDailyStaleReminders() {
    console.log('[cron] Running sendDailyStaleReminders');
    const now = new Date();
    const threshold = new Date(now.getTime() - STALE_THRESHOLD_MS);
    console.log('[cron] currentDate:', now.toISOString());
    console.log('[cron] thresholdDate:', threshold.toISOString());
    console.log('[cron] STALE_THRESHOLD_MS:', STALE_THRESHOLD_MS);

    const query = {
        status: { $nin: CLOSED_STATUSES },
        updatedAt: { $lt: threshold },
        $or: [
            { lastReminderSentAt: null },
            { lastReminderSentAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
    };
    console.log('[cron] stale reminder query:', JSON.stringify(query));

    const staleApplications = await applicationModel.find(query).sort({ updatedAt: 1 });
    console.log('[cron] stale reminder candidates:', staleApplications.length);

    const userApplicationsMap = new Map();

    for (const application of staleApplications) {
        const user = await userModel.findById(application.userId);
        console.log('[cron] stale app debug', {
            id: application._id.toString(),
            companyName: application.companyName,
            status: application.status,
            updatedAt: application.updatedAt,
            lastReminderSentAt: application.lastReminderSentAt,
            userFound: Boolean(user),
            userEmail: user?.email || null
        });

        if (!user?.email) {
            console.log(`[cron] Skipping stale reminder for ${application.companyName}: user email missing`);
            continue;
        }

        if (!userApplicationsMap.has(user._id.toString())) {
            userApplicationsMap.set(user._id.toString(), {
                user,
                applications: []
            });
        }

        userApplicationsMap.get(user._id.toString()).applications.push(application);
    }

    for (const { user, applications } of userApplicationsMap.values()) {
        try {
            await sendStaleApplicationReminderEmail(user.email, user.name, applications);
            console.log(`[cron] Stale reminder email sent successfully to ${user.email}`);
            for (const application of applications) {
                application.lastReminderSentAt = new Date();
                await application.save();
            }
        } catch (error) {
            console.error(`[cron] Stale reminder email error for ${user.email}:`, error);
        }
    }
}

async function sendWeeklyReports() {
    console.log('[cron] Running sendWeeklyReports');
    const today = new Date();
    console.log('[cron] today:', today.toISOString());
    console.log('[cron] today.getDay():', today.getDay());

    if (today.getDay() !== 2) { //change to 1 
        console.log('[cron] Weekly report skipped: not Tuesday');
        return;
    }

    const users = await userModel.find({
        $or: [
            { lastWeeklyReportSentAt: null },
            { lastWeeklyReportSentAt: { $lt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } }
        ]
    });
    console.log('[cron] weekly report users:', users.length);

    for (const user of users) {
        if (!user?.email) {
            console.log(`[cron] Skipping weekly report for user ${user?._id}: no email`);
            continue;
        }

        const applications = await applicationModel.find({ userId: user._id }).sort({ createdAt: -1 });
        console.log(`[cron] Weekly report candidates for ${user.email}:`, applications.length);
        try {
            await sendWeeklyApplicationReportEmail(user.email, user.name, applications);
            user.lastWeeklyReportSentAt = new Date();
            await user.save();
            console.log(`[cron] Weekly report email sent successfully to ${user.email}`);
        } catch (error) {
            console.error(`[cron] Weekly report email error for ${user.email}:`, error);
        }
    }
}

export async function runScheduledTasks() {
    if (!isReady) {
        console.log('[cron] Skipping run because database is not ready yet');
        return;
    }

    const now = new Date();
    if (lastRunAt && (now.getTime() - lastRunAt.getTime()) < RUN_COOLDOWN_MS) {
        console.log('[cron] Skipping run because a recent cron run already completed');
        return;
    }

    if (isRunning) {
        console.log('[cron] runScheduledTasks already in progress, skipping');
        return;
    }

    lastRunAt = now;
    isRunning = true;
    console.log('[cron] Scheduled task run started');
    try {
        console.log('[cron] Running scheduleInterviewCalendarEvents');
        await scheduleInterviewCalendarEvents();
        console.log('[cron] Finished scheduleInterviewCalendarEvents');

        console.log('[cron] Running sendDailyStaleReminders');
        await sendDailyStaleReminders();
        console.log('[cron] Finished sendDailyStaleReminders');

        console.log('[cron] Running sendWeeklyReports');
        await sendWeeklyReports();
        console.log('[cron] Finished sendWeeklyReports');
    } finally {
        isRunning = false;
        console.log('[cron] Scheduled task run completed');
    }
}

function registerCron() {
    console.log('[cron] Registering cron job');
    cronTask = cron.schedule('54 22 * * *', async () => {
        console.log('[cron] callback fired');
        await runScheduledTasks();
    }, {
        timezone: process.env.TZ || 'UTC'
    });
    console.log('[cron] Cron job registered');
}

export function startCron() {
    isReady = true;
    if (cronTask) {
        console.log('[cron] Cron already started');
        return cronTask;
    }
    registerCron();
    return cronTask;
}

export function stopCron() {
    if (cronTask) {
        cronTask.stop();
        cronTask = null;
        console.log('[cron] Cron stopped');
    }
}

export default { startCron, stopCron, runScheduledTasks };
