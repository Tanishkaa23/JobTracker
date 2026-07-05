import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateApplication from './pages/CreateApplication';
import ApplicationDetail from './pages/ApplicationDetail';
import EditProfile from './pages/EditProfile';
import MobileApplications from './pages/MobileApplications';

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route
                                    path="/dashboard"
                                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                                />
                                <Route
                                    path="/profile"
                                    element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
                                />
                                <Route
                                    path="/applications"
                                    element={<ProtectedRoute><MobileApplications /></ProtectedRoute>}
                                />
                                <Route
                                    path="/applications/new"
                                    element={<ProtectedRoute><CreateApplication /></ProtectedRoute>}
                                />
                                <Route
                                    path="/applications/:id"
                                    element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>}
                                />
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </main>
                        <footer className="py-8 text-center border-t mt-auto" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                            <p className="text-sm font-sans" style={{ color: 'var(--color-text-soft)' }}>
                                Need help? Contact us: <a href="mailto:trackyourjob.app@gmail.com" className="font-medium underline hover:opacity-80" style={{ color: 'var(--color-text)' }}>trackyourjob.app@gmail.com</a>
                            </p>
                        </footer>
                    </div>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}