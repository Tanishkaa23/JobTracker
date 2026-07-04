const STATUS_LABELS = {
    applied: 'Applied',
    interviewing: 'Interviewing',
    offered: 'Offered',
    rejected: 'Rejected',
};

export const STATUS_COLORS = {
    applied: '#6366F1',
    interviewing: '#8B5CF6',
    offered: '#10B981',
    rejected: '#EF4444',
};

export function getStatusLabel(status) {
    return STATUS_LABELS[status] || status;
}

export function computeStatusBreakdown(applications) {
    const counts = { applied: 0, interviewing: 0, offered: 0, rejected: 0 };

    applications.forEach((app) => {
        if (counts[app.status] !== undefined) {
            counts[app.status] += 1;
        }
    });

    return Object.entries(counts).map(([status, count]) => ({
        status,
        name: STATUS_LABELS[status],
        value: count,
        fill: STATUS_COLORS[status],
    }));
}

export function computeMonthlyTrend(applications, months = 6) {
    const now = new Date();
    const buckets = [];

    for (let i = months - 1; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({
            key: `${date.getFullYear()}-${date.getMonth()}`,
            label: date.toLocaleDateString('en-US', { month: 'short' }),
            count: 0,
        });
    }

    applications.forEach((app) => {
        const applied = new Date(app.appliedDate);
        const key = `${applied.getFullYear()}-${applied.getMonth()}`;
        const bucket = buckets.find((item) => item.key === key);
        if (bucket) bucket.count += 1;
    });

    return buckets.map(({ label, count }) => ({ month: label, applications: count }));
}

export function computePipelineRates(applications) {
    const total = applications.length;
    if (!total) {
        return { interviewRate: 0, offerRate: 0, rejectionRate: 0 };
    }

    const interviewingPlus = applications.filter((app) =>
        ['interviewing', 'offered', 'rejected'].includes(app.status)
    ).length;
    const offered = applications.filter((app) => app.status === 'offered').length;
    const rejected = applications.filter((app) => app.status === 'rejected').length;

    return {
        interviewRate: Math.round((interviewingPlus / total) * 100),
        offerRate: Math.round((offered / total) * 100),
        rejectionRate: Math.round((rejected / total) * 100),
    };
}

export function computeSourceBreakdown(applications) {
    const counts = {};

    applications.forEach((app) => {
        const source = app.source?.trim() || 'Unknown';
        counts[source] = (counts[source] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
}
