import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: 'var(--color-bg)' }}>
            <div className="max-w-2xl text-center">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-accent)' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-stale)' }} />
                    <span className="font-serif text-2xl font-bold ml-1" style={{ color: 'var(--color-text)' }}>Job Tracker</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl leading-tight mb-6" style={{ color: 'var(--color-text)' }}>
                    Manage your career journey with ease.
                </h1>
                <p className="text-lg font-sans mb-8" style={{ color: 'var(--color-text-soft)' }}>
                    Track applications, prepare for interviews, and land your dream job without the spreadsheet chaos.
                </p>

                <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold font-sans transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
                >
                    Login
                </Link>
            </div>
        </section>
    );
}
