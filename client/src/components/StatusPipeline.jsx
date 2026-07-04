const STEPS = ['applied', 'interviewing', 'offered'];

const LABELS = {
    applied: 'Applied',
    interviewing: 'Interviewing',
    offered: 'Offered',
    rejected: 'Rejected',
};

export default function StatusPipeline({ status, variant = 'default' }) {
    const isHero = variant === 'hero';
    const activeColor = isHero ? '#FFFFFF' : 'var(--color-accent)';
    const inactiveColor = isHero ? 'rgba(255,255,255,0.35)' : 'var(--color-border)';
    const labelColor = isHero ? 'var(--detail-hero-muted)' : 'var(--color-text-soft)';
    const dangerColor = isHero ? '#fca5a5' : 'var(--color-danger)';

    if (status === 'rejected') {
        return (
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dangerColor }} />
                <span className="text-xs font-medium font-sans" style={{ color: dangerColor }}>Rejected</span>
            </div>
        );
    }

    const currentIndex = STEPS.indexOf(status);

    return (
        <div className="flex items-center gap-1">
            {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-1">
                    <span
                        className={`rounded-full ${isHero ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}
                        style={{ background: i <= currentIndex ? activeColor : inactiveColor }}
                    />
                    {i < STEPS.length - 1 && (
                        <span
                            className={`h-px ${isHero ? 'w-6' : 'w-4'}`}
                            style={{ background: i < currentIndex ? activeColor : inactiveColor }}
                        />
                    )}
                </div>
            ))}
            <span className={`font-medium font-sans ml-1.5 ${isHero ? 'text-sm' : 'text-xs'}`} style={{ color: isHero ? '#FFFFFF' : labelColor }}>
                {LABELS[status]}
            </span>
        </div>
    );
}