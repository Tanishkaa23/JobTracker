import { useEffect, useRef, useState } from 'react';

export default function ProfileDropdown({ user, googleStatus, googleLoading, onEditProfile, onLogout, onConnectGoogle }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const profileInitial = user?.name?.[0]?.toUpperCase() || 'U';
    const connected = googleStatus?.connected;
    const statusLabel = googleLoading ? 'Checking...' : connected ? 'Connected' : 'Not connected';

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition hover:shadow-sm"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
                <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-text)' }}
                >
                    {profileInitial}
                </span>
                <span className="hidden sm:inline">{user?.name || 'Profile'}</span>
                <span className="inline-flex h-3 w-3 rounded-full"
                    style={{ background: connected ? '#22C55E' : '#F59E0B' }}
                    aria-label={connected ? 'Google connected' : 'Google not connected'}
                />
            </button>

            <div className="absolute right-0 top-full z-30 mt-3 w-72 rounded-3xl border bg-[var(--color-surface)] p-4 shadow-lg transition-opacity duration-200"
                style={{ borderColor: 'var(--color-border)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
            >
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{user?.name || 'Your profile'}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{user?.email}</p>
                    </div>
                    <span className="inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ background: connected ? '#22C55E' : '#F59E0B' }}
                    />
                </div>

                <div className="mt-4 space-y-3">
                    <button
                        onClick={() => {
                            onEditProfile();
                            setOpen(false);
                        }}
                        className="w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition hover:bg-[var(--color-accent-soft)]"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                        Edit profile
                    </button>

                    <div className="rounded-2xl border bg-[var(--color-bg)] p-3" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                    {connected ? 'Google is connected' : 'Connect Google'}
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-soft)' }}>
                                    {connected ? 'Calendar sync active' : 'Enable interview reminders and reminders for stale jobs.'}
                                </p>
                            </div>
                            <div className="relative group">
                                <button
                                    onClick={() => {
                                        if (!connected) onConnectGoogle();
                                    }}
                                    disabled={googleLoading}
                                    className="rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                                    style={{
                                        background: connected ? 'var(--color-border)' : 'var(--color-accent)',
                                        color: connected ? 'var(--color-text)' : '#fff'
                                    }}
                                >
                                    {googleLoading ? 'Checking...' : connected ? 'Connected' : 'Connect'}
                                </button>
                                {!connected && (
                                    <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-72 rounded-2xl border bg-[var(--color-surface)] p-3 text-xs text-[var(--color-text-soft)] shadow-lg group-hover:block"
                                        style={{ borderColor: 'var(--color-border)' }}
                                    >
                                        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Why connect Google?</p>
                                        <p className="mt-1 text-[12px]">Connect Google to unlock interview reminders, calendar events, and smarter stale follow-ups.</p>
                                        <p className="mt-2 text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--color-text-soft)' }}>Profile → Connect Google</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!connected && (
                            <div className="mt-3 rounded-2xl bg-[var(--color-accent-soft)] p-3 text-xs" style={{ color: 'var(--color-text)' }}>
                                <p className="font-semibold">Connect now</p>
                                <p className="mt-1 text-[12px]" style={{ color: 'var(--color-text-soft)' }}>
                                    Connect Google to unlock calendar event sync and smarter follow-up reminders.
                                </p>
                                <p className="mt-2 text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--color-text-soft)' }}>
                                    Profile → Connect Google
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            onLogout();
                            setOpen(false);
                        }}
                        className="w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <div className="absolute right-0 top-full mt-2 w-72 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100">
                {/* Tooltip is handled in the header via adjacent info icon */}
            </div>
        </div>
    );
}
