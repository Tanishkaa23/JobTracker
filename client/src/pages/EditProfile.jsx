import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ThemeSwitcher from '../components/ThemeSwitcher';
import ProfileDropdown from '../components/ProfileDropdown';
import { connectGoogle } from "../utils/googleConnect";

export default function EditProfile() {
    const { user, updateProfile, logout } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [googleStatus, setGoogleStatus] = useState({ connected: false });
    const [googleStatusLoading, setGoogleStatusLoading] = useState(true);
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

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

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError('');
        setStatus('');
        try {
            await updateProfile({ name, email });
            setStatus('Profile updated successfully.');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update profile.');
        } finally {
            setSaving(false);
        }
    }

    function handleConnectGoogle() {
        connectGoogle();
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
            <header
                className="border-b backdrop-blur-md bg-opacity-80 sticky top-0 z-20 transition-all duration-300"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
            >
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
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
                            onLogout={async () => {
                                await logout();
                                navigate('/login');
                            }}
                            onConnectGoogle={handleConnectGoogle}
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="rounded-3xl border bg-[var(--color-surface)] p-8 shadow-sm"
                    style={{ borderColor: 'var(--color-border)' }}
                >
                    <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Edit Profile</h1>
                    <p className="mt-2 text-sm font-sans" style={{ color: 'var(--color-text-soft)' }}>
                        Update your name and email to keep your profile current.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-2xl px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ background: 'var(--color-accent)', color: '#fff' }}
                            >
                                {saving ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>

                        {status && <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{status}</p>}
                        {error && <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>{error}</p>}
                    </form>
                </div>
            </main>
        </div>
    );
}
