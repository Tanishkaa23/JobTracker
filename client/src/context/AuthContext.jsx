import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while we check "is there a valid session?"

    // On app load, ask the backend "who am I?" using the cookie that's already there (if any)
    useEffect(() => {
        async function checkSession() {
            try {
                const res = await api.get('/auth/user/dashboard');
                setUser(res.data.user); // { name, email }
            } catch (err) {
                setUser(null); // no valid cookie / session expired — that's fine, just means logged out
            } finally {
                setLoading(false);
            }
        }
        checkSession();
    }, []);

    async function login(email, password) {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data.user); // login response already includes { name, email } — no extra request needed
        return res.data;
    }

    async function register(name, email, password) {
        // NOTE: registerUser also sets a cookie (currently without httpOnly/sameSite options — backend bug to fix),
        // and logs the user in immediately. We mirror that here so the UI reflects it.
        const res = await api.post('/auth/register', { name, email, password });
        setUser(res.data.user); // { name, email }
        return res.data;
    }

    async function logout() {
        await api.get('/auth/logout');
        setUser(null);
    }

    async function updateProfile({ name, email }) {
        const res = await api.patch('/auth/user', { name, email });
        setUser(res.data.user);
        return res.data;
    }

    const value = { user, loading, login, register, logout, updateProfile };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
    return ctx;
}