import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, Check } from 'lucide-react';

const Typewriter = ({ text }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 120);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text]);

    return (
        <span className="inline-flex items-center text-white">
            {currentText}
            <span className="w-[4px] h-[40px] lg:h-[60px] bg-accent ml-2 animate-[pulse_1s_ease-in-out_infinite]"></span>
        </span>
    );
};

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [remember, setRemember] = useState(true);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/register', form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    }

    return (
        <div className="flex min-h-screen bg-background text-white font-sans w-full overflow-hidden">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1a1c23] to-[#14291e] overflow-hidden items-center justify-center p-12 lg:p-24">
                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-accent/20 blur-[80px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px]"></div>

                {/* Diagonal pill shapes */}
                <div className="absolute w-[400px] h-20 bg-gradient-to-r from-accent/0 to-accent/40 rounded-full rotate-45 bottom-[10%] left-[-10%] blur-[2px]"></div>
                <div className="absolute w-[500px] h-24 bg-gradient-to-r from-accent/0 to-accent/30 rounded-full rotate-45 bottom-[30%] left-[-20%] blur-[2px]"></div>
                <div className="absolute w-[300px] h-16 bg-gradient-to-r from-accent/0 to-accent/50 rounded-full rotate-45 bottom-[20%] left-[15%] blur-[2px]"></div>
                <div className="absolute w-64 h-12 bg-gradient-to-r from-accent/0 to-accent/40 rounded-full rotate-45 bottom-[45%] left-[5%] blur-[2px]"></div>
                <div className="absolute w-48 h-8 bg-gradient-to-r from-accent/0 to-accent/20 rounded-full rotate-45 bottom-[60%] left-[-5%] blur-[2px]"></div>

                <div className="relative z-10 w-full max-w-xl">
                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
                        <Typewriter text="Kodbank" />
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed font-light mt-4">
                        The banking app trusted by thousands of users.
                    </p>
                </div>
            </div>

            {/* Right Panel (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-background relative z-10 lg:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-y-auto">
                <div className="w-full max-w-md my-auto pt-8">
                    <h2 className="text-2xl font-bold mb-8 text-center text-accent tracking-wide uppercase">CREATE ACCOUNT</h2>

                    {error && <p className="text-red-400 mb-6 text-sm text-center bg-red-900/30 p-3 rounded-xl border border-red-500/30">{error}</p>}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/70 w-5 h-5 pointer-events-none" />
                            <input required type="text" name="username" onChange={handleChange} className="w-full py-4 pr-6 pl-14 bg-inputBg text-white rounded-full border border-transparent focus:outline-none focus:border-accent/50 focus:bg-[#2a2c35] transition-all placeholder:text-textMuted/70 shadow-inner shadow-black/20" placeholder="Username" />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/70 w-5 h-5 pointer-events-none" />
                            <input required type="email" name="email" onChange={handleChange} className="w-full py-4 pr-6 pl-14 bg-inputBg text-white rounded-full border border-transparent focus:outline-none focus:border-accent/50 focus:bg-[#2a2c35] transition-all placeholder:text-textMuted/70 shadow-inner shadow-black/20" placeholder="Email" />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/70 w-5 h-5 pointer-events-none" />
                            <input type="text" name="phone" onChange={handleChange} className="w-full py-4 pr-6 pl-14 bg-inputBg text-white rounded-full border border-transparent focus:outline-none focus:border-accent/50 focus:bg-[#2a2c35] transition-all placeholder:text-textMuted/70 shadow-inner shadow-black/20" placeholder="Phone" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/70 w-5 h-5 pointer-events-none" />
                            <input required type="password" name="password" onChange={handleChange} className="w-full py-4 pr-6 pl-14 bg-inputBg text-white rounded-full border border-transparent focus:outline-none focus:border-accent/50 focus:bg-[#2a2c35] transition-all placeholder:text-textMuted/70 shadow-inner shadow-black/20" placeholder="Password" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-textMuted px-2 font-medium">
                            <label className="flex items-center gap-2 cursor-pointer group hover:text-gray-300 transition-colors">
                                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${remember ? 'bg-accent/80 text-black shadow-[0_0_10px_rgba(81,210,131,0.4)]' : 'bg-inputBg border border-gray-600'}`}>
                                    {remember && <Check size={14} strokeWidth={3} />}
                                </div>
                                <input type="checkbox" className="hidden" checked={remember} onChange={() => setRemember(!remember)} />
                                I agree to the terms
                            </label>
                        </div>

                        <div className="pt-6 flex justify-center">
                            <button type="submit" className="w-[200px] py-3.5 bg-gradient-to-r from-accent to-[#4ac079] hover:from-[#4ac079] hover:to-[#3fb26d] text-black font-bold rounded-full shadow-[0_4px_14px_0_rgba(81,210,131,0.39)] hover:shadow-[0_6px_20px_rgba(81,210,131,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider text-sm flex items-center justify-center">
                                REGISTER
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-textMuted font-medium pb-8">
                        Already have an account? <Link to="/login" className="text-accent hover:text-accentDark transition-colors ml-1">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
