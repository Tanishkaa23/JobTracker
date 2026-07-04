import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ApplicationForm from '../components/ApplicationForm';

export default function CreateApplication() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(payload) {
        setSubmitting(true);
        setError('');
        try {
            await api.post('/applications', payload);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message ?? 'Could not create application.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
            <div className="max-w-xl mx-auto px-4 py-8">
                <Link to="/dashboard" className="text-sm font-sans mb-6 inline-block" style={{ color: 'var(--color-text-soft)' }}>
                    ← Back to dashboard
                </Link>

                <h1 className="font-serif text-2xl mb-1" style={{ color: 'var(--color-text)' }}>Add an application</h1>
                <p className="text-sm font-sans mb-6" style={{ color: 'var(--color-text-soft)' }}>
                    Just the basics for now — you can fill in the rest later.
                </p>

                <ApplicationForm mode="create" onSubmit={handleSubmit} submitting={submitting} error={error} />
            </div>
        </div>
    );
}