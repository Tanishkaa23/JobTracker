const TOP_PRIORITY_LIMIT = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const UPCOMING_INTERVIEW_WINDOW_DAYS = 7;
const STALE_THRESHOLD_DAYS = 7;

const ACTION_TYPES = {
    FOLLOW_UP: 'FOLLOW_UP',
    INTERVIEW: 'INTERVIEW'
};

const CLOSED_STATUSES = ['rejected', 'offered'];

function startOfDay(date) {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
}

function daysFromToday(date, today = new Date()) {
    if (!date) return null;

    const target = startOfDay(date);
    const base = startOfDay(today);
    return Math.round((target.getTime() - base.getTime()) / MS_PER_DAY);
}

function isStale(application) {
    const lastTouched = application.updatedAt || application.createdAt;
    if (!lastTouched) return false;

    return Date.now() - new Date(lastTouched).getTime() > STALE_THRESHOLD_DAYS * MS_PER_DAY;
}

function daysUntilInterview(application) {
    return daysFromToday(application.interviewDate);
}

function hasUpcomingInterview(application) {
    const daysUntil = daysUntilInterview(application);
    return daysUntil !== null && daysUntil >= 0 && daysUntil <= UPCOMING_INTERVIEW_WINDOW_DAYS;
}

const priorityRules = [
    {
        priority: 120,
        reason: 'Interview Today',
        actionType: ACTION_TYPES.INTERVIEW,
        matches: (application) => daysUntilInterview(application) === 0
    },
    {
        priority: 100,
        reason: 'Interview Tomorrow',
        actionType: ACTION_TYPES.INTERVIEW,
        matches: (application) => daysUntilInterview(application) === 1
    },
    {
        priority: 90,
        reason: 'Upcoming Interview',
        actionType: ACTION_TYPES.INTERVIEW,
        matches: (application) => hasUpcomingInterview(application)
    },
    {
        priority: 80,
        reason: 'Application is Stale',
        actionType: ACTION_TYPES.FOLLOW_UP,
        matches: isStale
    }
];

function getPriorityLabel(priority) {
    if (priority >= 100) return 'Critical';
    if (priority >= 85) return 'High Priority';
    if (priority >= 70) return 'Important';
    return 'Review';
}

function getIcon(actionType) {
    const icons = {
        [ACTION_TYPES.FOLLOW_UP]: 'mail',
        [ACTION_TYPES.INTERVIEW]: 'calendar'
    };

    return icons[actionType] || 'spark';
}

function scoreApplication(application) {
    if (CLOSED_STATUSES.includes(application.status)) {
        return null;
    }

    if (!hasUpcomingInterview(application) && !isStale(application)) {
        return null;
    }

    const matchedRule = priorityRules.find((rule) => rule.matches(application));

    if (!matchedRule) {
        return null;
    }

    return {
        applicationId: application._id.toString(),
        company: application.companyName,
        role: application.role,
        priority: matchedRule.priority,
        reason: matchedRule.reason,
        actionType: matchedRule.actionType,
        priorityLabel: getPriorityLabel(matchedRule.priority),
        icon: getIcon(matchedRule.actionType)
    };
}

/**
 * Scores applications with deterministic rules and returns the top priorities.
 * @param {Array<object>} applications
 * @returns {Array<object>}
 */
export function getTopPriorities(applications) {
    return applications
        .map(scoreApplication)
        .filter(Boolean)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, TOP_PRIORITY_LIMIT);
}

export { ACTION_TYPES };
