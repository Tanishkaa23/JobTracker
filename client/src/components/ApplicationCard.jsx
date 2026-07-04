import StatusPipeline from './StatusPipeline';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function ApplicationCard({ application, onClick }) {
    const { companyName, role, status, appliedDate, isStale } = application;

    return (
        <button
            onClick={onClick}
            className="w-full h-full text-left rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group relative overflow-hidden backdrop-blur-sm flex flex-col justify-between"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
            {/* Subtle gradient hover effect inside card */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ background: 'linear-gradient(120deg, transparent, var(--color-accent), transparent)' }}
            ></div>

            <div className="relative z-10 flex items-start justify-between gap-3 mb-6">
                <div className="min-w-0">
                    <h3 className="font-serif text-xl font-bold truncate mb-1 transition-colors group-hover:text-[var(--color-accent)]" style={{ color: 'var(--color-text)' }}>
                        {companyName}
                    </h3>
                    <p className="text-sm font-sans font-medium truncate" style={{ color: 'var(--color-text-soft)' }}>
                        {role}
                    </p>
                </div>

                {isStale && (
                    <div
                        className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-full shadow-sm animate-pulse-glow"
                        style={{ background: 'var(--color-stale)' }}
                    >
                        <span style={{ background: 'var(--color-bg)' }} className="w-1.5 h-1.5 rounded-full" />
                        <span className="text-[11px] font-bold font-sans uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-bg)' }}>
                            Follow-up
                        </span>
                    </div>
                )}
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <StatusPipeline status={status} />
                <span className="text-xs font-semibold font-sans uppercase tracking-wider" style={{ color: 'var(--color-text-faint)' }}>
                    {formatDate(appliedDate)}
                </span>
            </div>
        </button>
    );
}