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

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
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
                            path="/applications/new"
                            element={<ProtectedRoute><CreateApplication /></ProtectedRoute>}
                        />
                        <Route
                            path="/applications/:id"
                            element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>}
                        />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}