
export const CLOSED_STATUSES = ['rejected', 'offered'];
export const STALE_THRESHOLD_DAYS = 7;
export const STALE_THRESHOLD_MS = STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

export function buildStaleFilter(staleValue) {
    const threshold = new Date(Date.now() - STALE_THRESHOLD_MS);

    if (staleValue) {
        return {
            updatedAt: { $lt: threshold },
            status: { $nin: CLOSED_STATUSES }
        };
    }
    return {
        $or: [
            { updatedAt: { $gte: threshold } },
            { status: { $in: CLOSED_STATUSES } }
        ]
    };
}