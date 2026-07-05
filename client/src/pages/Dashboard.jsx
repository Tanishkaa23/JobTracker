import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ApplicationCard from '../components/ApplicationCard';
import ThemeSwitcher from '../components/ThemeSwitcher';
import ConfirmModal from '../components/ConfirmModal';
import GoogleConnectButton from '../components/GoogleConnectButton';
import ProfileDropdown from '../components/ProfileDropdown';
import CareerAssistant from '../components/CareerAssistant';
import DashboardAnalytics from '../components/DashboardAnalytics';
import { connectGoogle } from "../utils/googleConnect";

export default function Dashboard() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all' | 'stale'
    const [statusChartFilter, setStatusChartFilter] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [googleStatus, setGoogleStatus] = useState({ connected: false });
    const [googleStatusLoading, setGoogleStatusLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_URL ;

    async function fetchGoogleStatus() {
        setGoogleStatusLoading(true);
        try {
            const res = await api.get('/google/status');
            setGoogleStatus(res.data);
        } catch (err) {
            setGoogleStatus({ connected: false });
        } finally {
            setGoogleStatusLoading(false);
        }
    }

    useEffect(() => {
        fetchGoogleStatus();
    }, []);

    function handleConnectGoogle() {
        connectGoogle();
    }

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

    async function handleLogout() {
        await logout();
        setShowLogoutConfirm(false);
        navigate('/login');
    }

    const staleCount = applications.filter((a) => a.isStale).length;

    const visibleApplications = applications.filter((app) => {
        if (filter === 'stale' && !app.isStale) return false;
        if (statusChartFilter && app.status !== statusChartFilter) return false;
        return true;
    });

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
            <header
                className="border-b backdrop-blur-md bg-opacity-80 sticky top-0 z-20 transition-all duration-300"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
            >
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
                            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-soft)' }} />
                            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-stale)', opacity: 0.4 }} />
                        </div>
                        <span className="font-serif text-lg" style={{ color: 'var(--color-text)' }}>Job Tracker</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <ProfileDropdown
                            user={user}
                            googleStatus={googleStatus}
                            googleLoading={googleStatusLoading}
                            onEditProfile={() => navigate('/profile')}
                            onLogout={() => setShowLogoutConfirm(true)}
                            onConnectGoogle={handleConnectGoogle}
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
                        <p className="text-sm font-sans mt-1" style={{ color: 'var(--color-text-soft)' }}>
                            You are tracking {applications.length} applications.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/applications')}
                            className="md:hidden flex-1 px-4 py-2.5 rounded-xl text-sm font-bold font-sans border transition-all"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                        >
                            See applications →
                        </button>
                        <button
                            onClick={() => navigate('/applications/new')}
                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold font-sans transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow shrink-0 flex items-center justify-center"
                            style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
                        >
                            <span className="mr-2 text-lg leading-none">+</span> New
                        </button>
                    </div>
                </div>
                
                {/* Stats Summary section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 rounded-2xl border backdrop-blur-sm transition-all hover:shadow-md animate-slide-up" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-soft)' }}>Total Tracked</p>
                        <p className="font-serif text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{applications.length}</p>
                    </div>
                    <div className="p-5 rounded-2xl border backdrop-blur-sm transition-all hover:shadow-md animate-slide-up animation-delay-100" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-stale)' }}>Needs Follow-up</p>
                        <p className="font-serif text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{staleCount}</p>
                    </div>
                    <div className="p-5 rounded-2xl border backdrop-blur-sm transition-all hover:shadow-md animate-slide-up animation-delay-200" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-accent)' }}>Active Now</p>
                        <p className="font-serif text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{applications.length - staleCount}</p>
                    </div>
                </div>

                <div className="mb-8 animate-slide-up animation-delay-300">
                    <GoogleConnectButton />
                </div>

                {!loading && applications.length > 0 && (
                    <DashboardAnalytics
                        applications={applications}
                        activeStatusFilter={statusChartFilter}
                        onStatusFilterChange={setStatusChartFilter}
                    />
                )}

                <CareerAssistant />

                <div className="hidden md:block">
                <div className="flex items-center gap-1.5 rounded-full p-1.5 w-fit mb-4 animate-slide-up animation-delay-300" style={{ background: 'var(--color-border)' }}>
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

                <h2 id="applications-section" className="font-serif text-xl font-bold mb-4 scroll-mt-20" style={{ color: 'var(--color-text)' }}>
                    Your applications
                    {!loading && visibleApplications.length !== applications.length && (
                        <span className="text-sm font-sans font-normal ml-2" style={{ color: 'var(--color-text-soft)' }}>
                            ({visibleApplications.length} of {applications.length})
                        </span>
                    )}
                </h2>

                {loading && (
                    <p className="font-sans text-sm" style={{ color: 'var(--color-text-faint)' }}>Loading applications...</p>
                )}

                {!loading && error && (
                    <p className="font-sans text-sm" style={{ color: 'var(--color-danger)' }} role="alert">{error}</p>
                )}

                {!loading && !error && visibleApplications.length === 0 && (
                    <div className="text-center py-16">
                        <p className="font-serif text-xl mb-1" style={{ color: 'var(--color-text)' }}>
                            {filter === 'stale' ? 'Nothing stale right now' : statusChartFilter ? 'No applications in this status' : 'No applications yet'}
                        </p>
                        <p className="text-sm font-sans" style={{ color: 'var(--color-text-faint)' }}>
                            {filter === 'stale'
                                ? 'Everything is either recent or resolved.'
                                : statusChartFilter
                                    ? 'Try clearing the chart filter or add a new application.'
                                    : 'Add your first application to start tracking it.'}
                        </p>
                    </div>
                )}

                {!loading && !error && visibleApplications.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                </div>
            </main>

            <ConfirmModal
                open={showLogoutConfirm}
                title="Sign out?"
                message="You'll need to log in again to see your applications."
                confirmLabel="Sign out"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
}
