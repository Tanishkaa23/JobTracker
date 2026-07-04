import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

export default function usePriorities() {
    const [priorities, setPriorities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPriorities = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const res = await api.get('/dashboard/priorities');
            setPriorities(res.data);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Could not load today\'s priorities.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPriorities();
    }, [fetchPriorities]);

    return {
        priorities,
        loading,
        error,
        refetch: fetchPriorities
    };
}
