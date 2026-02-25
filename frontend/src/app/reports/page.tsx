'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
    TrendingUp,
    Calendar,
    Scissors,
    UserCheck,
    X
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

export default function ReportsPage() {
    const { user: currentUser } = useAuth();
    const [reports, setReports] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        if (currentUser?.role !== 'admin') {
            setLoading(false);
            return;
        }
        try {
            const response = await api.get('/dashboard/reports');
            setReports(response.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
                <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin shadow-lg"></div>
                <div className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Synthesizing Intelligence...</div>
            </div>
        </DashboardLayout>
    );

    if (currentUser?.role !== 'admin') {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center p-14 bg-white rounded-[3rem] border border-slate-100 shadow-soft max-w-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-navy-500/10 transition-all duration-700" />
                        <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-8 border border-rose-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <X size={44} strokeWidth={2.5} />
                        </div>
                        <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight uppercase">Restricted <span className="text-rose-600">Access</span></h1>
                        <p className="mt-6 text-slate-400 font-bold leading-relaxed uppercase tracking-widest text-[10px]">Exclusive anatomical analytics are reserved for verified salon administrators only.</p>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="mt-10 px-8 py-4 bg-navy-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-navy-800 transition-all shadow-xl active:scale-95 border border-navy-800 w-full"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!reports) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <div className="text-rose-500 font-black uppercase tracking-[0.3em] text-xs text-center">Intelligence feed unavailable.</div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Verify uplink status with central command</p>
            </div>
        </DashboardLayout>
    );

    const dailyData = reports.daily_revenue.map((d: any) => ({ date: d.date?.slice(5), revenue: d.revenue }));
    const monthlyData = reports.monthly_revenue.map((m: any) => ({ month: m.month, revenue: m.revenue }));

    return (
        <DashboardLayout>
            <div className="mb-12">
                <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight uppercase">Reports Analytics</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-4">Deep architectural insights into performance and luxury yield</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Daily Revenue Chart */}
                <div className="bg-white p-8 rounded-[3rem] shadow-soft border border-slate-100 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase font-display">Daily Revenue</h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Last 30 days</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-white bg-purple-600 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-purple-100">Live feed</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="30%">
                            <defs>
                                <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.85} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(dailyData.length / 6)} />
                            <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} width={48} />
                            <Tooltip
                                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', padding: '10px 16px' }}
                                labelStyle={{ color: '#a78bfa', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                                itemStyle={{ color: '#fff', fontSize: 11, fontWeight: 900 }}
                                formatter={(v: any) => [`₹${v}`, 'Revenue']}
                                cursor={{ fill: '#f5f3ff' }}
                            />
                            <Bar dataKey="revenue" fill="url(#dailyGrad)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-white p-8 rounded-[3rem] shadow-soft border border-slate-100 group relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy-500/5 blur-[100px] pointer-events-none rounded-full" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center border border-navy-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <Calendar className="text-navy-900" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase font-display">Monthly Revenue</h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Aggregate annual performance</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-white bg-navy-900 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-navy-900/10">Full Scale</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} width={48} />
                            <Tooltip
                                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', padding: '10px 16px' }}
                                labelStyle={{ color: '#a78bfa', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                                itemStyle={{ color: '#fff', fontSize: 11, fontWeight: 900 }}
                                formatter={(v: any) => [`₹${v}`, 'Revenue']}
                                cursor={{ stroke: '#7c3aed', strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fill="url(#monthlyGrad)" dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Popular Services Table */}
                <div className="bg-white rounded-[3rem] shadow-soft border border-slate-100 overflow-hidden xl:col-span-1 group">
                    <div className="p-10 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-purple-200 group-hover:rotate-12 transition-transform duration-500">
                            <Scissors size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase font-display">Most Popular Services</h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Service popularity stratification</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-navy-950 text-[10px] font-black text-white uppercase tracking-[0.2em] font-display">
                                    <th className="px-10 py-6">Service</th>
                                    <th className="px-10 py-6">Category</th>
                                    <th className="px-10 py-6 text-center">Volume</th>
                                    <th className="px-10 py-6 text-right">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reports.popular_services.map((service: any, i: number) => (
                                    <tr key={i} className="hover:bg-purple-50/30 transition-colors group/row">
                                        <td className="px-10 py-6 font-black text-slate-800 tracking-tight uppercase text-xs font-display">{service.name}</td>
                                        <td className="px-10 py-6">
                                            <span className="bg-navy-50 text-navy-900 px-3 py-1.5 rounded-xl border border-navy-100 uppercase font-black text-[9px] tracking-widest">
                                                {service.category}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-center font-black text-slate-600 text-sm">{service.bookings}</td>
                                        <td className="px-10 py-6 text-right font-black text-purple-600 text-sm">₹{service.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Frequent Customers Table */}
                <div className="bg-white rounded-[3rem] shadow-soft border border-slate-100 overflow-hidden xl:col-span-1 group">
                    <div className="p-10 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                        <div className="w-12 h-12 bg-navy-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-navy-100 group-hover:rotate-12 transition-transform duration-500">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase font-display">Most Frequent Customers</h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">High-yield clientele dossiers</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-navy-950 text-[10px] font-black text-white uppercase tracking-[0.2em] font-display">
                                    <th className="px-10 py-6">Customer Name</th>
                                    <th className="px-10 py-6 text-center">Visits</th>
                                    <th className="px-10 py-6 text-right">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reports.frequent_customers.map((cust: any, i: number) => (
                                    <tr key={i} className="hover:bg-navy-50/30 transition-colors group/row">
                                        <td className="px-10 py-6">
                                            <div className="font-black text-slate-900 tracking-tight uppercase text-xs font-display">{cust.name}</div>
                                            <div className="text-[9px] text-slate-400 font-black tracking-[0.2em] mt-1.5 uppercase">{cust.phone}</div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-purple-600 text-white font-black text-[9px] uppercase tracking-[0.2em] border border-purple-500 shadow-lg shadow-purple-100">
                                                {cust.visits} SESSIONS
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right font-black text-navy-950 text-sm">₹{cust.spent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
