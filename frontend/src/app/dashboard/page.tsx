'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Users, Calendar, IndianRupee, TrendingUp, ShieldCheck } from 'lucide-react';

interface DashboardSummary {
    total_customers: number;
    total_appointments: number;
    revenue_today: number;
    total_revenue: number;
    popular_services: { name: string; count: number }[];
}

export default function DashboardPage() {
    const { user: currentUser } = useAuth();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            if (currentUser?.role !== 'admin') return;
            try {
                const response = await api.get('/dashboard/summary');
                setSummary(response.data);
            } catch (error) {
                console.error('Failed to fetch summary', error);
            }
        };
        fetchSummary();
    }, [currentUser]);

    if (currentUser?.role !== 'admin') {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center glass p-12 rounded-[3rem] border border-white shadow-premium animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-inner">
                            <ShieldCheck size={40} />
                        </div>
                        <h1 className="font-display text-4xl font-black text-slate-800 tracking-tight">Access Restricted</h1>
                        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Administrative Clearance Required</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!summary) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin shadow-lg" />
                <p className="font-display font-medium text-slate-400 animate-pulse uppercase tracking-[0.2em] text-xs">Aggregating Intelligence</p>
            </div>
        </DashboardLayout>
    );

    const stats = [
        { label: 'Total Customers', value: summary.total_customers, icon: Users, color: 'text-navy-600', bg: 'bg-navy-50', border: 'border-navy-100' },
        { label: 'Total Bookings', value: summary.total_appointments, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        { label: 'Revenue Today', value: `₹${summary.revenue_today}`, icon: IndianRupee, color: 'text-navy-600', bg: 'bg-navy-50', border: 'border-navy-100' },
        { label: 'Annual Velocity', value: `₹${summary.total_revenue}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    ];

    return (
        <DashboardLayout>
            <div className="mb-10">
                <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Couture <span className="text-navy-600 underline decoration-purple-100 underline-offset-8">Intelligence</span></h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">Live performance and luxury analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {stats.map((stat, idx) => (
                    <div
                        key={stat.label}
                        className="glass p-8 rounded-[2.5rem] border border-slate-200/60 shadow-soft card-hover relative overflow-hidden group animate-in slide-in-from-bottom-6 duration-500 fill-mode-both"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-navy-500/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-purple-500/10 transition-all duration-500" />

                        <div className={`${stat.bg} ${stat.border} border w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon className={stat.color} size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-display font-black text-slate-800 tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-10 rounded-[2.5rem] border border-slate-200/60 shadow-soft relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-navy-500/5 blur-[80px] rounded-full -mr-24 -mb-24" />

                    <h2 className="font-display text-2xl font-black mb-8 text-slate-800 flex items-center gap-4">
                        <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <TrendingUp size={20} />
                        </div>
                        Performance Distribution
                    </h2>

                    <div className="space-y-4">
                        {summary.popular_services.map((service) => (
                            <div key={service.name} className="flex items-center gap-6 group/item">
                                <span className="w-32 text-xs font-black text-slate-500 uppercase tracking-tight">{service.name}</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-navy-600 to-purple-600 rounded-full shadow-lg animate-in slide-in-from-left duration-1000"
                                        style={{ width: `${(service.count / summary.total_appointments) * 100}%` }}
                                    />
                                </div>
                                <span className="w-24 text-right text-[10px] font-black text-navy-600 bg-navy-50 px-3 py-1.5 rounded-xl border border-navy-100 group-hover/item:scale-110 transition-transform">
                                    {service.count} BOOKINGS
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass p-10 rounded-[2.5rem] border border-slate-200/60 shadow-soft group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-navy-500/10 transition-all duration-500" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-14 h-14 bg-navy-50 border border-navy-100 text-navy-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-all duration-500">
                            <IndianRupee size={28} />
                        </div>
                        <h3 className="font-display text-3xl font-black text-slate-800 tracking-tight mb-2">Live Revenue</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Real-time terminal pulse</p>

                        <div className="mt-auto">
                            <div className="text-5xl font-display font-black text-slate-900 tracking-tighter">
                                ₹{summary.revenue_today}
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 w-fit px-4 py-2 rounded-full border border-emerald-100">
                                <TrendingUp size={12} />
                                Trending Up
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
