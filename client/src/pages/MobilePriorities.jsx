import { useNavigate, Link } from 'react-router-dom';
import CareerAssistant from '../components/CareerAssistant';

export default function MobilePriorities() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen pb-16" style={{ background: 'var(--color-bg)' }}>
            <header
                className="border-b backdrop-blur-md bg-opacity-80 sticky top-0 z-20 transition-all duration-300"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
            >
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1.5 text-sm font-sans transition-opacity hover:opacity-80 font-medium"
                        style={{ color: 'var(--color-text-soft)' }}
                    >
                        ← Back to dashboard
                    </Link>
                    <button
                        onClick={() => navigate('/applications/new')}
                        className="px-4 py-2 rounded-xl text-sm font-bold font-sans transition-all duration-200 shadow-sm shrink-0"
                        style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
                    >
                        + New
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-6 animate-fade-in">
                <CareerAssistant />
            </main>
        </div>
    );
}
