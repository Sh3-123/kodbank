import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Home, BarChart2, Folder, ArrowRightLeft,
    Search, Bell, LayoutDashboard, MoreVertical, CreditCard, Plus, LogOut
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';

axios.defaults.withCredentials = true;

const financeData = [
    { name: '01', value: 2400 },
    { name: '02', value: 1398 },
    { name: '03', value: 4200 },
    { name: '04', value: 3000 },
    { name: '05', value: 4800 },
    { name: '06', value: 3800 },
    { name: '07', value: 4231 },
];

const expensesData = [
    { name: 'Shopping', value: 40 },
    { name: 'Entertainment', value: 30 },
    { name: 'Food', value: 20 },
    { name: 'Miscellaneous', value: 10 },
];
const COLORS = ['#51d283', '#3fb26d', '#8b8e98', '#24252b'];

const transactions = [
    { id: '#01F99E22A7097', date: '2 June 2022', time: '3:45PM', title: 'Pension Payment', sub: 'Resetia Funds', amount: 3200.00, in: true },
    { id: '#11F99E22A7X53', date: '2 June 2022', time: '2:45PM', title: 'CBA AUD 2 Franked 50%', sub: 'Resetia Funds', amount: 1000.00, in: false },
    { id: '#01F99E22A8097', date: '2 June 2022', time: '1:45PM', title: 'Developer Salary', sub: 'Resetia Funds', amount: 5000.00, in: true },
];

export default function Dashboard() {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showBalance, setShowBalance] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        handleCheckBalance();
        // eslint-disable-next-line
    }, []);

    const handleCheckBalance = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/getBalance');
            setBalance(res.data.balance);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
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

    const toggleBalance = () => {
        if (!showBalance && balance !== null) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        setShowBalance(!showBalance);
    };

    // A helper to format numbers elegantly for Indian Rupees (lakhs/crores)
    const formatCurr = (num) => num ? Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "******";

    return (
        <div className="min-h-screen bg-background text-white flex w-full">
            {/* Sidebar */}
            <aside className="w-16 md:w-24 shrink-0 bg-sidebar flex flex-col items-center py-6 md:py-8 border-r border-[#2e3039]">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-xl flex items-center justify-center mb-8 md:mb-10 shadow-[0_0_15px_rgba(81,210,131,0.4)]">
                    <LayoutDashboard className="text-black w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 flex flex-col gap-6 md:gap-8 text-textMuted">
                    <button className="p-2 md:p-3 bg-accent/10 text-accent rounded-xl border-l-4 border-accent relative right-[-2px]">
                        <Home className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 flex flex-col max-h-screen overflow-y-auto">

                {/* Header */}
                <header className="flex justify-between items-center mb-6 md:mb-8 gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted w-4 h-4 md:w-5 md:h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-inputBg rounded-full py-2.5 md:py-3 pr-4 pl-10 md:pl-12 focus:outline-none focus:ring-1 focus:ring-accent text-sm text-gray-300 border border-transparent placeholder:text-textMuted transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <button onClick={handleLogout} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-inputBg hover:bg-red-500/10 border border-transparent hover:border-red-500/30 flex items-center justify-center text-textMuted hover:text-red-400 transition-all shadow-sm" title="Logout">
                            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent/20 border border-accent/40 overflow-hidden flex items-center justify-center shrink-0">
                            {/* Profile placeholder */}
                            <img src="https://i.pravatar.cc/100?img=33" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                    {/* Left Column (Expenses & Transactions) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Top Widgets Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
                            {/* My Expenses Chart */}
                            <div className="bg-card rounded-2xl p-6 relative flex flex-col justify-between border border-[#2e3039]">
                                <div className="flex justify-between items-center z-10">
                                    <h3 className="font-semibold text-gray-200">My Expenses</h3>
                                    <span className="text-xs text-textMuted bg-inputBg py-1 px-3 rounded-md">Last 7 Days ▾</span>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                                    <div className="w-full h-32 ml-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={expensesData}
                                                    cx="50%"
                                                    cy="100%"
                                                    startAngle={180}
                                                    endAngle={0}
                                                    innerRadius={70}
                                                    outerRadius={90}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    stroke="none"
                                                    cornerRadius={4}
                                                >
                                                    {expensesData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="absolute top-[60%] text-center">
                                        <p className="text-3xl font-bold">₹{formatCurr(3476)}</p>
                                        <p className="text-xs text-textMuted mt-1">Spendings This Week</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-center text-[10px] text-textMuted z-10 mt-auto">
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-accent"></div> Shopping</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-accentDark"></div> Entertainment</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-textMuted"></div> Food</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#24252b] border border-gray-600"></div> Misc</span>
                                </div>
                            </div>

                            {/* My Finances Line Chart */}
                            <div className="bg-card rounded-2xl p-6 relative flex flex-col border border-[#2e3039]">
                                <div className="flex justify-between items-center mb-2 z-10">
                                    <h3 className="font-semibold text-gray-200">My Finances</h3>
                                    <span className="text-xs text-textMuted bg-inputBg py-1 px-3 rounded-md">Last 7 Days ▾</span>
                                </div>
                                <div className="absolute top-16 right-10 z-10">
                                    <p className="font-bold text-xl">₹{formatCurr(4231)}</p>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={financeData} margin={{ top: 40, right: 10, left: -20, bottom: 0 }}>
                                        <Line type="monotone" dataKey="value" stroke="#51d283" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: "#fff", stroke: "#51d283", strokeWidth: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="flex justify-between text-[10px] text-textMuted mt-4 px-2">
                                    <span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span>
                                </div>
                            </div>
                        </div>

                        {/* Transitions List */}
                        <div className="bg-card rounded-2xl p-6 flex-1 flex flex-col border border-[#2e3039]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-gray-200">My Transactions</h3>
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs text-textMuted">Transaction Overview</span>
                                    <span className="text-xs text-textMuted bg-inputBg py-1 px-3 rounded-md">Last 7 Days ▾</span>
                                </div>
                            </div>

                            <div className="w-full text-xs text-textMuted mb-4 grid grid-cols-[1fr_2fr_1.5fr_1fr_auto] gap-4 px-2">
                                <div>Date</div>
                                <div>Transaction Details</div>
                                <div>Transaction ID</div>
                                <div className="text-right pr-4">Total Amount</div>
                                <div></div>
                            </div>

                            <div className="space-y-4">
                                {transactions.map((tx, i) => (
                                    <div key={i} className="flex items-center text-sm grid grid-cols-[1fr_2fr_1.5fr_1fr_auto] gap-4 px-2 py-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="text-textMuted text-xs">
                                            <p className="text-gray-300">{tx.date}</p>
                                            <p>{tx.time}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-inputBg flex items-center justify-center">
                                                <div className={`w-6 h-6 rounded-md ${tx.in ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-400'} flex items-center justify-center`}>
                                                    <CreditCard size={14} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-gray-200">{tx.title}</p>
                                                <p className="text-textMuted text-xs">{tx.sub}</p>
                                            </div>
                                        </div>
                                        <div className="text-textMuted font-mono text-xs flex items-center">{tx.id}</div>
                                        <div className={`text-right pr-4 flex items-center justify-end font-medium ${tx.in ? 'text-accent' : 'text-red-400'}`}>
                                            {tx.in ? '+' : '-'}₹{formatCurr(tx.amount)} {tx.in ? <ArrowRightLeft size={12} className="ml-1 opacity-50 rotate-90" /> : <ArrowRightLeft size={12} className="ml-1 opacity-50 -rotate-90" />}
                                        </div>
                                        <div className="flex items-center text-textMuted hover:text-white cursor-pointer"><MoreVertical size={16} /></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Card & Quick Transfers) */}
                    <div className="bg-card rounded-2xl p-6 flex flex-col border border-[#2e3039]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-gray-200">My Card</h3>
                            <button className="text-xs text-textMuted hover:text-white">Recent ---</button>
                        </div>

                        {/* Credit Card UI */}
                        <div className="w-full h-52 bg-gradient-to-br from-accent to-[#5efc9d] rounded-2xl p-6 shadow-[0_10px_30px_rgba(81,210,131,0.2)] flex flex-col justify-between mb-8 overflow-hidden relative">
                            {/* Decorative element */}
                            <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex justify-between items-start z-10">
                                <div className="w-10 h-8 bg-black/20 rounded-md"></div>
                                <div className="flex gap-2 mr-2 opacity-60">
                                    <div className="w-1 h-3 bg-black/50 rounded-full"></div>
                                    <div className="w-1 h-4 bg-black/50 rounded-full"></div>
                                    <div className="w-1 h-5 bg-black/50 rounded-full"></div>
                                    <div className="w-1 h-4 bg-black/50 rounded-full"></div>
                                </div>
                            </div>
                            <div className="z-10 font-mono text-black text-xl tracking-widest mt-4">
                                {loading ? '**** **** **** ****' : '1234 5678 9000 0000'}
                            </div>
                            <div className="flex justify-between items-end z-10">
                                <div className="text-black/80">
                                    <p className="text-[10px] uppercase font-bold opacity-80 mb-1">Card Holder</p>
                                    <p className="text-sm font-semibold">{loading ? 'Loading...' : 'Current User'}</p>
                                </div>
                                <div className="text-black/80">
                                    <p className="text-[10px] uppercase font-bold opacity-80 mb-1">Valid Thru</p>
                                    <p className="text-sm font-semibold">12/24</p>
                                </div>
                                <div className="font-bold text-2xl italic pr-2 text-black/90">VISA</div>
                            </div>
                        </div>

                        {/* Balance Details */}
                        <div className="flex justify-between items-end mb-8 border-b border-[#2e3039] pb-6">
                            <div>
                                <p className="text-textMuted text-xs mb-1">Balance</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-3xl font-bold text-white">
                                        ₹{showBalance && balance !== null ? formatCurr(balance) : '******'}
                                    </p>
                                    <button
                                        onClick={toggleBalance}
                                        className="text-xs text-accent hover:text-accentDark bg-accent/10 hover:bg-accent/20 px-3 py-1 rounded-md transition-colors font-medium border border-accent/20"
                                    >
                                        {showBalance ? 'Hide' : 'Reveal'}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-textMuted text-xs mb-1">Gains/Losses</p>
                                <p className="text-sm text-red-400">-₹34.50</p>
                            </div>
                        </div>

                        {/* Quick Transfers */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="font-semibold text-gray-200 mb-4">Quick Transfers</h3>

                            <div className="flex gap-4 mb-6 relative">
                                <button className="w-12 h-12 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-textMuted hover:text-white hover:border-gray-400 transition-colors">
                                    <Plus size={20} />
                                </button>
                                <img src="https://i.pravatar.cc/100?img=12" alt="User 1" className="w-12 h-12 rounded-full border-2 border-card object-cover ml-2 z-10" />
                                <img src="https://i.pravatar.cc/100?img=34" alt="User 2" className="w-12 h-12 rounded-full border-2 border-card object-cover -ml-4 z-20" />
                                <img src="https://i.pravatar.cc/100?img=45" alt="User 3" className="w-12 h-12 rounded-full border-2 border-card object-cover -ml-4 z-30" />
                                <button className="w-6 h-6 rounded-full bg-inputBg text-textMuted flex items-center justify-center text-[10px] absolute right-4 top-3 border border-gray-700 hover:text-white">❯</button>
                            </div>

                            {/* Transfer Form */}
                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="text-xs text-textMuted mb-2 block">Card Number</label>
                                    <div className="relative">
                                        <input type="text" placeholder="**** **** **** ****" className="w-full bg-inputBg border border-[#2e3039] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-accent text-white font-mono" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold italic text-white/50">VISA</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-textMuted mb-2 block">Expiry Date</label>
                                        <input type="text" placeholder="MM/YY" className="w-full bg-inputBg border border-[#2e3039] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-accent text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-textMuted mb-2 block">CVV</label>
                                        <input type="text" placeholder="***" className="w-full bg-inputBg border border-[#2e3039] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-accent text-white" />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4 mt-auto">
                                    <button className="flex-1 bg-accent hover:bg-accentDark text-black font-semibold py-3 rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2">
                                        Send Money
                                    </button>
                                    <button className="flex-1 bg-inputBg hover:bg-[#282a32] text-white border border-[#2e3039] font-medium py-3 rounded-xl transition-all">
                                        Save Draft
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

