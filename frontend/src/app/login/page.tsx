'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { User, ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            await login(response.data.access_token);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const quickLogin = (role: 'admin' | 'staff') => {
        if (role === 'admin') {
            setEmail('admin@example.com');
            setPassword('admin123');
        } else {
            setEmail('staff@example.com');
            setPassword('staff123');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden font-sans selection:bg-purple-100 selection:text-purple-700">
            {/* Mesh Gradient Background */}
            <div className="absolute top-0 left-0 w-screen h-screen opacity-50 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-navy-100/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-navy-50 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full relative z-10 p-6 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo / Title Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] to-[#9333ea] text-white mb-8 shadow-2xl animate-float rotate-3 hover:rotate-0 transition-transform duration-500 scale-110 border border-white/20">
                        <ShieldCheck size={48} strokeWidth={1.5} />
                    </div>
                    <h1 className="font-display text-5xl font-black text-slate-900 tracking-tighter uppercase">SALON<span className="text-purple-600">PRO</span></h1>
                    <p className="text-slate-400 mt-4 font-black uppercase tracking-[0.4em] text-[10px]">Architectural Suite Access</p>
                </div>

                <div className="bg-white rounded-[3rem] shadow-premium p-12 border border-slate-100 relative overflow-hidden group">
                    {/* Interior decoration */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-[60px] rounded-full -mr-24 -mt-24 group-hover:bg-purple-500/10 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-navy-900/5 blur-[60px] rounded-full -ml-24 -mb-24 group-hover:bg-navy-900/10 transition-all duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="w-1.5 h-8 bg-purple-600 rounded-full shadow-lg shadow-purple-200"></span>
                            <div>
                                <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight uppercase">Credentials</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Identity Verification Protocol</p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-7 py-5 rounded-[2rem] text-[10px] mb-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 shadow-inner">
                                <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse shadow-sm shadow-rose-200 shrink-0"></span>
                                <span className="font-black uppercase tracking-[0.15em] leading-relaxed">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Login ID</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-transform group-focus-within/input:scale-110">
                                        <Mail className="text-slate-300 group-focus-within/input:text-purple-600 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="terminal@salonpro.com"
                                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-8 focus:ring-purple-500/5 focus:border-purple-600 transition-all font-black text-slate-800 placeholder:text-slate-200 shadow-inner text-sm uppercase tracking-tight"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Password</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-transform group-focus-within/input:scale-110">
                                        <Lock className="text-slate-300 group-focus-within/input:text-purple-600 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-8 focus:ring-purple-500/5 focus:border-purple-600 transition-all font-black text-slate-800 placeholder:text-slate-200 shadow-inner text-sm tracking-widest"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-5 py-6 bg-navy-900 hover:bg-navy-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-navy-950/20 transition-all active:scale-[0.98] hover:gap-7 disabled:opacity-70 group/btn border border-navy-800"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Authorize Session</span>
                                        <LogIn size={20} className="group-hover/btn:translate-x-1.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-14">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-100"></span>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-6 text-slate-400 font-black uppercase tracking-[0.4em] text-[9px]">Simulation Tiers</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <button
                                    onClick={() => quickLogin('admin')}
                                    className="flex items-center justify-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:border-purple-200 hover:bg-white hover:shadow-2xl hover:shadow-purple-100/50 transition-all group active:scale-95"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-inner border border-purple-100">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Admin</span>
                                </button>
                                <button
                                    onClick={() => quickLogin('staff')}
                                    className="flex items-center justify-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:border-navy-200 hover:bg-white hover:shadow-2xl hover:shadow-navy-100/50 transition-all group active:scale-95"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-900 transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-inner border border-navy-100">
                                        <User size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Staff</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-300 text-[10px] mt-12 font-black uppercase tracking-[0.5em] flex items-center justify-center gap-2">
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    2026 SALONPRO SUITE ACCESS
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                </p>
            </div>
        </div>
    );
}
