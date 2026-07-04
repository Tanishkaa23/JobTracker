import { useState, useEffect, useRef, forwardRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ApplicationForm from '../components/ApplicationForm';
import StatusPipeline from '../components/StatusPipeline';
import ConfirmModal from '../components/ConfirmModal';
import { downloadInterviewPrepPdf } from '../utils/interviewPrepPdf';

const FOLLOW_UP_STATUSES = ['applied', 'interviewing'];
const INTERVIEW_PREP_STATUSES = ['applied', 'interviewing'];
const ON_SCREEN_QUESTION_LIMIT = 3;

function formatDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ApplicationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialSection = searchParams.get('section');

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [emailDraft, setEmailDraft] = useState(null);
    const [emailStatus, setEmailStatus] = useState('');
    const [emailError, setEmailError] = useState('');
    const [draftLoading, setDraftLoading] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    const [jdText, setJdText] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [jdFile, setJdFile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [interviewPrep, setInterviewPrep] = useState(null);
    const [prepLoading, setPrepLoading] = useState(false);
    const [prepError, setPrepError] = useState('');

    const followUpRef = useRef(null);
    const interviewPrepRef = useRef(null);

    useEffect(() => {
        async function fetchOne() {
            setLoading(true);
            setLoadError('');
            try {
                const res = await api.get(`/applications/${id}`);
                setApplication(res.data.application);
            } catch (err) {
                setLoadError(err.response?.data?.message ?? 'Could not load this application.');
            } finally {
                setLoading(false);
            }
        }
        fetchOne();
    }, [id]);

    useEffect(() => {
        if (loading || !application) return;

        const targetRef = initialSection === 'interview-prep'
            ? interviewPrepRef
            : initialSection === 'follow-up'
                ? followUpRef
                : null;

        if (targetRef?.current) {
            targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, application, initialSection]);

    async function handleUpdate(payload) {
        setSubmitting(true);
        setFormError('');
        try {
            const res = await api.patch(`/applications/${id}`, payload);
            setApplication(res.data.application);
            setEditing(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? 'Could not save changes.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            await api.delete(`/applications/${id}`);
            navigate('/dashboard');
        } catch (err) {
            setShowDeleteConfirm(false);
            setLoadError(err.response?.data?.message ?? 'Could not delete this application.');
        } finally {
            setDeleting(false);
        }
    }

    async function handleGenerateFollowUp() {
        setDraftLoading(true);
        setEmailError('');
        setEmailStatus('');
        try {
            const res = await api.post(`/applications/${id}/follow-up/draft`);
            setEmailDraft(res.data);
        } catch (err) {
            setEmailError(err.response?.data?.message ?? 'Could not generate a follow-up email.');
        } finally {
            setDraftLoading(false);
        }
    }

    async function handleSendFollowUp() {
        setSendingEmail(true);
        setEmailError('');
        setEmailStatus('');
        try {
            await api.post(`/applications/${id}/follow-up/send`, emailDraft);
            setEmailStatus('Follow-up email sent.');
            setApplication((current) => ({
                ...current,
                recruiterEmail: emailDraft.to,
                lastReminderSentAt: new Date().toISOString()
            }));
        } catch (err) {
            setEmailError(err.response?.data?.message ?? 'Could not send the follow-up email.');
        } finally {
            setSendingEmail(false);
        }
    }

    async function handleGenerateInterviewPrep(event) {
        event.preventDefault();
        setPrepLoading(true);
        setPrepError('');
        setInterviewPrep(null);

        try {
            const formData = new FormData();
            if (jdText.trim()) formData.append('jobDescriptionText', jdText.trim());
            if (resumeText.trim()) formData.append('resumeText', resumeText.trim());
            if (jdFile) formData.append('jobDescriptionFile', jdFile);
            if (resumeFile) formData.append('resumeFile', resumeFile);

            const res = await api.post(`/applications/${id}/interview-prep`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setInterviewPrep(res.data);
        } catch (err) {
            setPrepError(err.response?.data?.message ?? 'Could not generate interview prep.');
        } finally {
            setPrepLoading(false);
        }
    }

    function updateEmailDraft(field, value) {
        setEmailDraft((current) => ({
            ...(current || { to: application.recruiterEmail || '', subject: '', body: '' }),
            [field]: value
        }));
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                <p className="font-sans text-sm" style={{ color: 'var(--color-text-faint)' }}>Loading...</p>
            </div>
        );
    }

    if (loadError && !application) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'var(--color-bg)' }}>
                <p className="font-sans text-sm" style={{ color: 'var(--color-danger)' }}>{loadError}</p>
                <Link to="/dashboard" className="text-sm font-sans underline" style={{ color: 'var(--color-text-soft)' }}>Back to dashboard</Link>
            </div>
        );
    }

    const canFollowUp = FOLLOW_UP_STATUSES.includes(application.status);
    const canInterviewPrep = INTERVIEW_PREP_STATUSES.includes(application.status) || Boolean(application.interviewDate);

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
            {/* Hero header */}
            <div
                className="relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, var(--detail-hero-from) 0%, var(--detail-hero-to) 100%)` }}
            >
                <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 20%, #ffffff 0%, transparent 50%)' }} />
                <div className="relative max-w-5xl mx-auto px-6 pt-6 pb-16">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1.5 text-sm font-sans mb-8 transition-opacity hover:opacity-80"
                        style={{ color: 'var(--detail-hero-muted)' }}
                    >
                        ← Back to dashboard
                    </Link>

                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--detail-hero-muted)' }}>
                                Application
                            </p>
                            <h1 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: 'var(--detail-hero-text)' }}>
                                {application.companyName}
                            </h1>
                            <p className="text-base font-sans mt-2" style={{ color: 'var(--detail-hero-muted)' }}>
                                {application.role}
                            </p>
                        </div>
                        {application.isStale && (
                            <span
                                className="text-xs font-bold font-sans px-3 py-1.5 rounded-full shrink-0"
                                style={{ background: 'var(--color-stale)', color: '#FFFFFF' }}
                            >
                                Needs follow-up
                            </span>
                        )}
                    </div>

                    <div className="mt-6">
                        <StatusPipeline status={application.status} variant="hero" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-8 pb-12 relative z-10">
                {!editing && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sidebar — application details */}
                        <div className="lg:col-span-1 space-y-4">
                            <div
                                className="rounded-2xl p-5 border space-y-3"
                                style={{
                                    background: 'var(--color-surface)',
                                    borderColor: 'var(--color-border)',
                                    boxShadow: 'var(--detail-card-shadow)',
                                }}
                            >
                                <h2 className="font-serif text-lg font-bold" style={{ color: 'var(--color-text)' }}>Details</h2>
                                <DetailRow label="Applied" value={formatDate(application.appliedDate)} />
                                {application.source && <DetailRow label="Source" value={application.source} />}
                                {application.recruiterEmail && <DetailRow label="Recruiter email" value={application.recruiterEmail} />}
                                {application.salary != null && <DetailRow label="Salary" value={application.salary} />}
                                {application.interviewDate && <DetailRow label="Interview date" value={formatDate(application.interviewDate)} />}
                                {application.jobUrl && (
                                    <DetailRow
                                        label="Job posting"
                                        value={
                                            <a
                                                href={application.jobUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="underline hover:opacity-80"
                                                style={{ color: 'var(--detail-section-prep)' }}
                                            >
                                                View posting
                                            </a>
                                        }
                                    />
                                )}
                                {application.notes && <DetailRow label="Notes" value={application.notes} />}
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setEditing(true)}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold font-sans transition hover:opacity-90"
                                    style={{ background: 'var(--detail-hero-from)', color: '#FFFFFF' }}
                                >
                                    Edit application
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm font-medium font-sans transition border"
                                    style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Main content — AI sections */}
                        <div className="lg:col-span-2 space-y-6">
                            {canFollowUp && (
                                <DetailSection
                                    ref={followUpRef}
                                    accentColor="var(--detail-section-followup)"
                                    badge="AI Career Assistant"
                                    title="Recruiter follow-up"
                                    description="Generate a tailored follow-up email for this application."
                                >
                                {!emailDraft && (
                                    <button
                                        type="button"
                                        onClick={handleGenerateFollowUp}
                                        disabled={draftLoading}
                                        className="px-4 py-2 rounded-lg text-sm font-medium font-sans transition disabled:opacity-50"
                                        style={{ background: 'var(--detail-section-followup)', color: '#FFFFFF' }}
                                    >
                                        {draftLoading ? 'Generating...' : 'Generate Follow-up Email'}
                                    </button>
                                )}

                                {emailDraft && (
                                    <div className="space-y-3">
                                        <EmailField label="To" type="email" value={emailDraft.to} onChange={(value) => updateEmailDraft('to', value)} />
                                        <EmailField label="Subject" value={emailDraft.subject} onChange={(value) => updateEmailDraft('subject', value)} />
                                        <div>
                                            <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>Body</label>
                                            <textarea
                                                value={emailDraft.body}
                                                onChange={(e) => updateEmailDraft('body', e.target.value)}
                                                rows={8}
                                                className="w-full px-3.5 py-2.5 rounded-lg text-sm font-sans border focus:outline-none focus:ring-2 transition"
                                                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleSendFollowUp}
                                                disabled={sendingEmail || !emailDraft.to || !emailDraft.subject || !emailDraft.body}
                                                className="px-4 py-2 rounded-lg text-sm font-medium font-sans transition disabled:opacity-50 shadow-sm"
                                                style={{ background: '#1a73e8', color: '#FFFFFF' }}
                                            >
                                                {sendingEmail ? 'Sending...' : 'Send from Google Mail'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleGenerateFollowUp}
                                                disabled={draftLoading}
                                                className="px-4 py-2 rounded-lg text-sm font-medium font-sans transition disabled:opacity-50"
                                                style={{ color: 'var(--color-text-soft)' }}
                                            >
                                                Regenerate
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {emailStatus && <p className="text-sm font-sans" style={{ color: 'var(--color-accent)' }}>{emailStatus}</p>}
                                {emailError && <p className="text-sm font-sans" style={{ color: 'var(--color-danger)' }} role="alert">{emailError}</p>}
                                </DetailSection>
                            )}

                            {canInterviewPrep && (
                                <DetailSection
                                    ref={interviewPrepRef}
                                    accentColor="var(--detail-section-prep)"
                                    badge="AI Career Assistant"
                                    title="Interview preparation"
                                    description="Paste or upload the job description and your resume. AI will analyze both and suggest questions and tips."
                                >
                                <form onSubmit={handleGenerateInterviewPrep} className="space-y-4">
                                    <FileUploadField
                                        label="Job description"
                                        textValue={jdText}
                                        onTextChange={setJdText}
                                        file={jdFile}
                                        onFileChange={setJdFile}
                                        textPlaceholder="Paste the job description here..."
                                        fileHint="Or upload a .pdf or .txt file"
                                    />
                                    <FileUploadField
                                        label="Your resume"
                                        textValue={resumeText}
                                        onTextChange={setResumeText}
                                        file={resumeFile}
                                        onFileChange={setResumeFile}
                                        textPlaceholder="Paste your resume text here..."
                                        fileHint="Or upload a .pdf or .txt file"
                                    />

                                    <button
                                        type="submit"
                                        disabled={prepLoading || (!jdText.trim() && !resumeText.trim() && !jdFile && !resumeFile)}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold font-sans transition disabled:opacity-50"
                                        style={{ background: 'var(--detail-section-prep)', color: '#FFFFFF' }}
                                    >
                                        {prepLoading ? 'Analyzing...' : 'Generate Interview Prep'}
                                    </button>
                                </form>

                                {prepError && <p className="text-sm font-sans" style={{ color: 'var(--color-danger)' }} role="alert">{prepError}</p>}

                                {interviewPrep && (
                                    <InterviewPrepResults prep={interviewPrep} application={application} />
                                )}
                                </DetailSection>
                            )}
                        </div>
                    </div>
                )}

                {editing && (
                    <div
                        className="rounded-2xl p-6 border mt-4"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--detail-card-shadow)' }}
                    >
                        <h1 className="font-serif text-2xl mb-1" style={{ color: 'var(--color-text)' }}>Edit application</h1>
                        <p className="text-sm font-sans mb-6" style={{ color: 'var(--color-text-soft)' }}>{application.companyName} — {application.role}</p>

                        <ApplicationForm mode="edit" initialData={application} onSubmit={handleUpdate} submitting={submitting} error={formError} />

                        <button onClick={() => { setEditing(false); setFormError(''); }} className="mt-3 text-sm font-sans" style={{ color: 'var(--color-text-soft)' }}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={showDeleteConfirm}
                title="Delete this application?"
                message={`This will permanently remove your ${application.companyName} application. This can't be undone.`}
                confirmLabel={deleting ? 'Deleting...' : 'Delete'}
                danger
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 text-sm font-sans py-1 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
            <span className="shrink-0" style={{ color: 'var(--color-text-faint)' }}>{label}</span>
            <span style={{ color: 'var(--color-text)' }} className="text-right break-all">{value}</span>
        </div>
    );
}

const DetailSection = forwardRef(function DetailSection(
    { accentColor, badge, title, description, children },
    ref
) {
    return (
        <div
            ref={ref}
            className="rounded-2xl border overflow-hidden scroll-mt-6"
            style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--detail-card-shadow)',
            }}
        >
            <div className="h-1" style={{ background: accentColor }} />
            <div className="p-5 space-y-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: accentColor }}>{badge}</p>
                    <h2 className="font-serif text-xl font-bold" style={{ color: 'var(--color-text)' }}>{title}</h2>
                    <p className="text-sm font-sans mt-1" style={{ color: 'var(--color-text-soft)' }}>{description}</p>
                </div>
                {children}
            </div>
        </div>
    );
});

function EmailField({ label, type = 'text', value, onChange }) {
    return (
        <div>
            <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm font-sans border focus:outline-none focus:ring-2 transition"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
        </div>
    );
}

function FileUploadField({ label, textValue, onTextChange, file, onFileChange, textPlaceholder, fileHint }) {
    return (
        <div>
            <label className="block text-xs font-medium mb-1.5 font-sans" style={{ color: 'var(--color-text-soft)' }}>{label}</label>
            <textarea
                value={textValue}
                onChange={(e) => onTextChange(e.target.value)}
                rows={4}
                placeholder={textPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm font-sans border focus:outline-none focus:ring-2 transition mb-2"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <p className="text-xs font-sans mb-1.5" style={{ color: 'var(--color-text-faint)' }}>{fileHint}</p>
            <input
                type="file"
                accept=".pdf,.txt,text/plain,application/pdf"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="block w-full text-sm font-sans file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-sm file:font-medium"
                style={{ color: 'var(--color-text-soft)' }}
            />
            {file && (
                <p className="text-xs font-sans mt-1" style={{ color: 'var(--color-accent)' }}>
                    Selected: {file.name}
                </p>
            )}
        </div>
    );
}

function InterviewPrepResults({ prep, application }) {
    const totalQuestions = prep.likelyQuestions?.length ?? 0;
    const visibleQuestions = prep.likelyQuestions?.slice(0, ON_SCREEN_QUESTION_LIMIT) ?? [];
    const hasMoreQuestions = totalQuestions > ON_SCREEN_QUESTION_LIMIT;

    return (
        <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-sans" style={{ color: 'var(--color-text-soft)' }}>
                    {hasMoreQuestions
                        ? `Showing ${ON_SCREEN_QUESTION_LIMIT} of ${totalQuestions} questions. Download the PDF for the full guide, including preparation tips, strengths, and gaps.`
                        : 'Download the PDF for preparation tips, strengths to highlight, and gaps to address.'}
                </p>
                <button
                    type="button"
                    onClick={() => downloadInterviewPrepPdf(prep, application)}
                    className="px-4 py-2 rounded-lg text-sm font-medium font-sans transition shrink-0"
                    style={{ background: 'var(--color-accent)', color: '#FFFFFF' }}
                >
                    Download PDF
                </button>
            </div>

            <PrepSection title="Key topics to review" items={prep.topics} accentColor="var(--detail-section-prep)" />
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--detail-section-prep)' }}>Likely questions & tips</h3>
                <div className="space-y-3">
                    {visibleQuestions.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-xl p-4 border-l-4"
                            style={{ background: 'var(--color-bg)', borderColor: 'var(--detail-section-prep)' }}
                        >
                            <p className="text-sm font-sans font-medium" style={{ color: 'var(--color-text)' }}>{item.question}</p>
                            <p className="text-sm font-sans mt-1 leading-6" style={{ color: 'var(--color-text-soft)' }}>{item.tip}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PrepSection({ title, items, accentColor = 'var(--color-accent)' }) {
    if (!items?.length) return null;

    return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{title}</h3>
            <ul className="space-y-1.5">
                {items.map((item, index) => (
                    <li key={index} className="text-sm font-sans leading-6" style={{ color: 'var(--color-text-soft)' }}>
                        • {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
