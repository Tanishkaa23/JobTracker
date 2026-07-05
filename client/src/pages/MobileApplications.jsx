import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ApplicationCard from '../components/ApplicationCard';

export default function MobileApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/applications');
            setApplications(res.data.applications);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Could not load applications.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const visibleApplications = applications.filter((app) => {
        if (filter === 'stale' && !app.isStale) return false;
        return true;
    });

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
                <div className="flex flex-col mb-6 gap-4">
                    <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Your Applications</h1>
                    
                    <div className="flex items-center gap-1.5 rounded-full p-1.5 w-fit" style={{ background: 'var(--color-border)' }}>
                        <button
                            onClick={() => setFilter('all')}
                            className="px-3 py-1.5 rounded-full text-sm font-medium font-sans transition"
                            style={filter === 'all' ? { background: 'var(--color-surface)', color: 'var(--color-text)' } : { color: 'var(--color-text-soft)' }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('stale')}
                            className="px-3 py-1.5 rounded-full text-sm font-medium font-sans transition"
                            style={filter === 'stale' ? { background: 'var(--color-surface)', color: 'var(--color-text)' } : { color: 'var(--color-text-soft)' }}
                        >
                            Stale
                        </button>
                    </div>
                </div>

                {loading && (
                    <p className="font-sans text-sm" style={{ color: 'var(--color-text-faint)' }}>Loading applications...</p>
                )}

                {!loading && error && (
                    <p className="font-sans text-sm" style={{ color: 'var(--color-danger)' }} role="alert">{error}</p>
                )}

                {!loading && !error && visibleApplications.length === 0 && (
                    <div className="text-center py-16">
                        <p className="font-serif text-xl mb-1" style={{ color: 'var(--color-text)' }}>
                            {filter === 'stale' ? 'Nothing stale right now' : 'No applications yet'}
                        </p>
                        <p className="text-sm font-sans" style={{ color: 'var(--color-text-faint)' }}>
                            {filter === 'stale'
                                ? 'Everything is either recent or resolved.'
                                : 'Add your first application to start tracking it.'}
                        </p>
                    </div>
                )}

                {!loading && !error && visibleApplications.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {visibleApplications.map((app, index) => {
                            const delayClass = `animation-delay-${((index % 4) + 1) * 100}`;
                            return (
                                <div key={app._id} className={`animate-slide-up ${delayClass}`}>
                                    <ApplicationCard
                                        application={app}
                                        onClick={() => navigate(`/applications/${app._id}`)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
