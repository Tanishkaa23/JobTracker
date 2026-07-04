import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function GoogleConnectButton() {
    const [status, setStatus] = useState({ connected: false, email: '' });
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    async function fetchStatus() {
        try {
            setLoading(true);
            const res = await api.get('/google/status');
            setStatus(res.data);
        } catch (error) {
            setStatus({ connected: false, email: '' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStatus();
    }, []);

    async function handleConnect() {
        window.location.href = `${apiBaseUrl}/google/connect`;
    }

    async function handleDisconnect() {
        try {
            setActionLoading(true);
            await api.post('/google/disconnect');
            await fetchStatus();
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="text-sm font-sans" style={{ color: 'var(--color-text-soft)' }}>
                Checking Google connection...
            </div>
        );
    }

    if (!status.connected) {
        return (
            <div className="rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', boxShadow: 'var(--detail-card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))' }}>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                        <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--color-text)' }}>Google Not Connected</h3>
                    </div>
                    <p className="text-sm font-sans mb-1" style={{ color: 'var(--color-text-soft)' }}>
                        Connect Google to unlock calendar sync, interview reminders, and stale follow-up alerts.
                    </p>
                    <p className="text-xs font-sans" style={{ color: 'var(--color-text-faint)' }}>
                        Connecting Google helps the app create interview calendar events automatically and send timely follow-up reminders.
                    </p>
                </div>
                <button
                    onClick={handleConnect}
                    className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold font-sans transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                    style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
                >
                    Connect Google
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border p-4 max-w-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <p className="text-sm font-semibold font-sans" style={{ color: 'var(--color-text)' }}>
                Google Connected
            </p>
            <p className="text-sm font-sans mt-1" style={{ color: 'var(--color-text-soft)' }}>
                {status.email}
            </p>
            <button
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="mt-3 px-3 py-2 rounded-lg text-sm font-semibold font-sans transition"
                style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}
            >
                {actionLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
        </div>
    );
}
