export default function ConfirmModal({
    open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
    danger = false, onConfirm, onCancel,
}) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm rounded-xl p-5 shadow-xl"
                style={{ background: 'var(--color-surface)' }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <h2 className="font-serif text-lg mb-1.5" style={{ color: 'var(--color-text)' }}>{title}</h2>
                <p className="text-sm font-sans mb-5" style={{ color: 'var(--color-text-soft)' }}>{message}</p>

                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-3.5 py-2 rounded-lg text-sm font-medium font-sans transition"
                        style={{ color: 'var(--color-text-soft)' }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-3.5 py-2 rounded-lg text-sm font-medium font-sans transition"
                        style={{
                            background: danger ? 'var(--color-danger)' : 'var(--color-text)',
                            color: danger ? '#FFFFFF' : 'var(--color-bg)',
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}