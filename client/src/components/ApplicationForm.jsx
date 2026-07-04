import { useState } from 'react';

const STATUS_OPTIONS = ['applied', 'interviewing', 'offered', 'rejected'];

export default function ApplicationForm({ initialData, mode, onSubmit, submitting, error }) {
    const [companyName, setCompanyName] = useState(initialData?.companyName ?? '');
    const [role, setRole] = useState(initialData?.role ?? '');
    const [status, setStatus] = useState(initialData?.status ?? 'applied');
    const [source, setSource] = useState(initialData?.source ?? '');
    const [recruiterEmail, setRecruiterEmail] = useState(initialData?.recruiterEmail ?? '');
    const [jobUrl, setJobUrl] = useState(initialData?.jobUrl ?? '');
    const [salary, setSalary] = useState(initialData?.salary ?? '');
    const [notes, setNotes] = useState(initialData?.notes ?? '');
    const [interviewDate, setInterviewDate] = useState(
        initialData?.interviewDate ? initialData.interviewDate.slice(0, 10) : ''
    );

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit({
            companyName,
            role,
            status,
            source: source || undefined,
            recruiterEmail: recruiterEmail || undefined,
            jobUrl: jobUrl || undefined,
            salary: salary === '' ? undefined : Number(salary),
            notes: notes || undefined,
            interviewDate: interviewDate || undefined,
        });
    }

    const inputClass = 'w-full px-3.5 py-2.5 rounded-lg text-sm font-sans border focus:outline-none focus:ring-2 transition';
    const inputStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Company</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputClass} style={inputStyle} placeholder="Samsung" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Role</label>
                    <input type="text" value={role} onChange={(e) => setRole(e.target.value)} required className={inputClass} style={inputStyle} placeholder="Technical Intern" />
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} style={inputStyle}>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Source</label>
                    <input type="text" value={source} onChange={(e) => setSource(e.target.value)} className={inputClass} style={inputStyle} placeholder="LinkedIn" />
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Recruiter email</label>
                    <input type="email" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className={inputClass} style={inputStyle} placeholder="recruiter@company.com" />
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Job URL</label>
                    <input type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} className={inputClass} style={inputStyle} placeholder="https://..." />
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Salary</label>
                    <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className={inputClass} style={inputStyle} placeholder="15000" />
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Interview date</label>
                    <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className={inputClass} style={inputStyle} />
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} style={inputStyle} placeholder="Anything worth remembering about this one..." />
                </div>
            </div>

            {error && <p className="text-sm font-sans" style={{ color: 'var(--color-danger)' }} role="alert">{error}</p>}

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg text-sm font-medium font-sans transition disabled:opacity-50"
                style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
            >
                {submitting ? (mode === 'create' ? 'Adding...' : 'Saving...') : (mode === 'create' ? 'Add application' : 'Save changes')}
            </button>
        </form>
    );
}
