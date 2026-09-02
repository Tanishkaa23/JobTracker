const ACTION_LABELS = {
    FOLLOW_UP: 'Generate Follow-up Email',
    INTERVIEW: 'Generate Interview Prep'
};

const ICON_LABELS = {
    interview: 'I',
    mail: 'M',
    spark: 'S'
};

export default function CareerAssistantCard({ priority, onAction }) {
    const recommendation = priority.aiRecommendation;
    const actionLabel = ACTION_LABELS[priority.actionType] || 'Review Application';
    const iconLabel = ICON_LABELS[priority.icon] || ICON_LABELS.spark;

    return (
        <article
            className="rounded-2xl border p-5 flex flex-col gap-4 min-h-[280px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold font-sans"
                            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                            aria-hidden="true"
                        >
                            {iconLabel}
                        </span>
                        <span
                            className="text-[11px] font-bold font-sans uppercase tracking-wider px-2.5 py-1 rounded-full"
                            style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
                        >
                            {priority.priorityLabel}
                        </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold truncate" style={{ color: 'var(--color-text)' }}>
                        {priority.company}
                    </h3>
                    <p className="text-sm font-sans font-medium truncate mt-1" style={{ color: 'var(--color-text-soft)' }}>
                        {priority.role}
                    </p>
                </div>
                <span className="text-xs font-bold font-sans" style={{ color: 'var(--color-text-faint)' }}>
                    {priority.priority}
                </span>
            </div>

            <div className="space-y-3 flex-1">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-accent)' }}>
                        {priority.reason}
                    </p>
                    <h4 className="font-serif text-lg font-bold leading-snug" style={{ color: 'var(--color-text)' }}>
                        {recommendation.title}
                    </h4>
                </div>
                <p className="text-sm font-sans leading-6" style={{ color: 'var(--color-text-soft)' }}>
                    {recommendation.description}
                </p>
                <div className="rounded-xl p-3" style={{ background: 'var(--color-accent-soft)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-faint)' }}>
                        Suggested Action
                    </p>
                    <p className="text-sm font-sans font-medium leading-5" style={{ color: 'var(--color-text)' }}>
                        {recommendation.suggestedAction}
                    </p>
                </div>
                <p className="text-sm font-serif italic leading-6" style={{ color: 'var(--color-text-soft)' }}>
                    "{recommendation.motivation}"
                </p>
            </div>

            <button
                type="button"
                onClick={() => onAction(priority)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold font-sans transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
            >
                {actionLabel}
            </button>
        </article>
    );
}
