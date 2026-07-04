import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message ?? 'Something went wrong. Try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const inputClass = 'w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 bg-transparent';
    const inputStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
            {/* Left Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
                <div 
                    className="absolute inset-0"
                    style={{ 
                        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-soft) 100%)',
                        opacity: 0.1 
                    }}
                ></div>
                
                {/* Abstract animated shapes */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-glow" style={{ background: 'var(--color-accent)' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-glow animation-delay-200" style={{ background: 'var(--color-stale)' }}></div>
                
                <div className="relative z-10 p-12 max-w-lg text-left animate-slide-up">
                    <div className="flex items-center gap-2 mb-8">
                        <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-accent)' }} />
                        <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-stale)' }} />
                        <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Job Tracker</h2>
                    </div>
                    <h1 className="font-serif text-5xl leading-tight mb-6" style={{ color: 'var(--color-text)' }}>
                        Manage your career journey with ease.
                    </h1>
                    <p className="text-lg font-sans" style={{ color: 'var(--color-text-soft)' }}>
                        Track applications, prepare for interviews, and land your dream job without the spreadsheet chaos.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 animate-fade-in">
                <div 
                    className="w-full max-w-md p-8 sm:p-10 rounded-2xl shadow-xl backdrop-blur-xl border relative"
                    style={{ 
                        background: 'var(--color-surface)', 
                        borderColor: 'var(--color-border)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <div className="flex items-center gap-1.5 mb-8 justify-center lg:hidden">
                        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
                        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-stale)' }} />
                        <span className="font-serif font-bold ml-1" style={{ color: 'var(--color-text)' }}>Job Tracker</span>
                    </div>

                    <h2 className="font-serif text-3xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
                        Welcome back
                    </h2>
                    <p className="text-center text-sm mb-8 font-sans" style={{ color: 'var(--color-text-soft)' }}>
                        Pick up where your applications left off.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider font-sans" style={{ color: 'var(--color-text-soft)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={inputClass}
                                style={inputStyle}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider font-sans" style={{ color: 'var(--color-text-soft)' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={inputClass}
                                style={inputStyle}
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg text-sm font-sans animate-fade-in" style={{ background: 'var(--color-danger)', color: '#fff', opacity: 0.9 }} role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold font-sans transition-all duration-200 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
                        >
                            {submitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-8 font-sans" style={{ color: 'var(--color-text-soft)' }}>
                        New here?{' '}
                        <Link to="/register" className="font-medium hover:underline transition-colors" style={{ color: 'var(--color-accent)' }}>
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}