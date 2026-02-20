import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

export default function Dashboard() {
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCheckBalance = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/getBalance');
            setBalance(res.data.balance);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Failed to fetch balance');
            }
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed');
        }
    }

    return (
        <div className="w-full max-w-lg p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-white">Dashboard</h2>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition-colors">Logout</button>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-700 text-center">
                <h3 className="text-gray-400 text-sm mb-2 uppercase tracking-wide">Available Balance</h3>
                {balance !== null ? (
                    <p className="text-4xl font-bold text-green-400">
                        ${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                ) : (
                    <p className="text-xl font-medium text-gray-500">*******</p>
                )}
            </div>

            {error && <p className="text-red-400 mb-4 text-sm text-center bg-red-900 bg-opacity-30 p-2 rounded">{error}</p>}

            <button
                onClick={handleCheckBalance}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
                {loading ? 'Checking...' : 'Check Balance'}
            </button>
        </div>
    );
}
