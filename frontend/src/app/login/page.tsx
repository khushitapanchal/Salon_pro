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
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data?.access_token) {
                await login(response.data.access_token);
            } else {
                setError("Invalid server response.");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(
                err.response?.data?.detail ||
                err.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-navy-200 blur-[100px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white animate-in-fade relative z-10 transition-all duration-700 hover:shadow-premium">

                {/* Visual Section */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-navy-900 via-navy-800 to-purple-950 text-white relative">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 blur-[100px] rounded-full"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-16">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                                <ShieldCheck size={28} className="text-purple-400" />
                            </div>
                            <span className="font-display text-2xl font-black tracking-tighter uppercase">Salon <span className="text-purple-400">CMS</span></span>
                        </div>

                        <div className="space-y-6">
                            <h1 className="font-display text-6xl font-black leading-[1.1] tracking-tighter">
                                Executive <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-navy-300">Management</span>
                            </h1>
                            <p className="text-navy-200 font-bold uppercase tracking-[0.3em] text-[10px] bg-white/5 w-fit px-4 py-2 rounded-lg border border-white/10">Version 4.0 // Elite Edition</p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="w-1.5 h-12 bg-purple-500 rounded-full"></div>
                            <p className="text-sm font-medium leading-relaxed italic text-navy-50">"The standard in high-end salon orchestration. Precision, intelligence, and luxury interface design."</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span>© 2026 SALON CMS GLOBAL</span>
                            <div className="flex gap-4">
                                <span className="text-purple-400">ENCRYPTED</span>
                                <span>SYSTEM STATUS: OK</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-10 lg:p-20 bg-white flex flex-col justify-center relative">
                    <div className="mb-12">
                        <div className="lg:hidden flex items-center gap-3 mb-8">
                            <ShieldCheck size={24} className="text-purple-600" />
                            <span className="font-display font-black text-slate-900 tracking-tight uppercase">Salon CMS</span>
                        </div>
                        <h2 className="font-display text-4xl font-black text-slate-900 tracking-tight mb-3">System Access</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Enter credentials to initialize session</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4">
                                <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse shrink-0"></div>
                                <p className="text-[11px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-purple-600 transition-colors">Credential Identity</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-all" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all font-bold text-sm tracking-tight placeholder:text-slate-200"
                                        placeholder="admin@saloncms.com"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-purple-600 transition-colors">Access Keyphrase</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-all" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all font-bold text-sm tracking-tight placeholder:text-slate-200"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-navy-900 text-white group flex items-center justify-center gap-4 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 border border-navy-800"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Initialize Session</span>
                                    <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-16 pt-10 border-t border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                        <User size={14} />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                Join <span className="text-navy-900">4,200+</span> luxury professionals <br />
                                managing their salons with precision.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
