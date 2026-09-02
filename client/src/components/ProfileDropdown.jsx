import { useEffect, useRef, useState } from 'react';

export default function ProfileDropdown({ user, onEditProfile, onLogout }) {
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
            </button>

            <div className="absolute right-0 top-full z-30 mt-3 w-72 rounded-3xl border bg-[var(--color-surface)] p-4 shadow-lg transition-opacity duration-200"
                style={{ borderColor: 'var(--color-border)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
            >
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{user?.name || 'Your profile'}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{user?.email}</p>
                    </div>
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
