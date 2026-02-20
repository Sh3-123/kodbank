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
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-lg border border-[#2e3039]">
                <h2 className="text-3xl font-semibold mb-6 text-center text-white">Welcome Back</h2>
                {error && <p className="text-red-400 mb-4 text-sm text-center bg-red-900 bg-opacity-30 p-2 rounded">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-textMuted text-sm mb-1">Username</label>
                        <input required type="text" name="username" onChange={handleChange} className="w-full p-3 bg-inputBg text-white rounded-lg border border-[#2e3039] focus:outline-none focus:border-accent transition-colors" placeholder="Enter username" />
                    </div>
                    <div>
                        <label className="block text-textMuted text-sm mb-1">Password</label>
                        <input required type="password" name="password" onChange={handleChange} className="w-full p-3 bg-inputBg text-white rounded-lg border border-[#2e3039] focus:outline-none focus:border-accent transition-colors" placeholder="Enter password" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-accent hover:bg-accentDark text-black font-semibold rounded-lg shadow-md transition-colors mt-2">
                        Login
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-textMuted">
                    Don't have an account? <Link to="/register" className="text-accent hover:text-white transition-colors">Register</Link>
                </p>
            </div>
        </div>
    );
}
