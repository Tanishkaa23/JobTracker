import { useNavigate } from 'react-router-dom';
import CareerAssistantCard from './CareerAssistantCard';
import usePriorities from '../hooks/usePriorities';

function SkeletonCard() {
    return (
        <div
            className="rounded-2xl border p-5 min-h-[280px] animate-pulse"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
            <div className="flex items-center gap-2 mb-5">
                <div className="h-8 w-8 rounded-full" style={{ background: 'var(--color-border)' }} />
                <div className="h-5 w-28 rounded-full" style={{ background: 'var(--color-border)' }} />
            </div>
            <div className="h-6 w-40 rounded mb-3" style={{ background: 'var(--color-border)' }} />
            <div className="h-4 w-32 rounded mb-8" style={{ background: 'var(--color-border)' }} />
            <div className="space-y-3">
                <div className="h-4 w-full rounded" style={{ background: 'var(--color-border)' }} />
                <div className="h-4 w-10/12 rounded" style={{ background: 'var(--color-border)' }} />
                <div className="h-16 w-full rounded-xl" style={{ background: 'var(--color-border)' }} />
            </div>
        </div>
    );
}

export default function CareerAssistant() {
    const navigate = useNavigate();
    const { priorities, loading, error } = usePriorities();

    function handleAction(priority) {
        const section = priority.actionType === 'INTERVIEW' ? 'interview-prep' : 'follow-up';
        navigate(`/applications/${priority.id}?section=${section}`);
    }

    return (
        <section className="mb-8 animate-slide-up animation-delay-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-accent)' }}>
                        AI Career Assistant
                    </p>
                    <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Today's Priorities
                    </h2>
                </div>
                <p className="text-sm font-sans max-w-md" style={{ color: 'var(--color-text-soft)' }}>
                    Focused on upcoming interviews and stale applications that need a recruiter follow-up.
                </p>
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {!loading && error && (
                <div
                    className="rounded-2xl border p-5 text-sm font-sans"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-danger)' }}
                    role="alert"
                >
                    {error}
                </div>
            )}

            {!loading && !error && priorities.length === 0 && (
                <div
                    className="rounded-2xl border p-6 text-sm font-sans"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }}
                >
                    No urgent priorities right now. Upcoming interviews and stale applications will appear here.
                </div>
            )}

            {!loading && !error && priorities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {priorities.map((priority) => (
                        <CareerAssistantCard key={priority.id} priority={priority} onAction={handleAction} />
                    ))}
                </div>
            )}
        </section>
    );
}
