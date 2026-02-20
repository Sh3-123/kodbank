import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

axios.defaults.withCredentials = true;

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/login', form);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    }

    return (
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-3xl font-semibold mb-6 text-center text-white">Welcome Back</h2>
            {error && <p className="text-red-400 mb-4 text-sm text-center bg-red-900 bg-opacity-30 p-2 rounded">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Username</label>
                    <input required type="text" name="username" onChange={handleChange} className="w-full p-3 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Enter username" />
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Password</label>
                    <input required type="password" name="password" onChange={handleChange} className="w-full p-3 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Enter password" />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors mt-2">
                    Login
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-400">
                Don't have an account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
            </p>
        </div>
    );
}
