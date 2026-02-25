'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Users,
    Calendar,
    Settings,
    LayoutDashboard,
    LogOut,
    Scissors,
    BarChart3,
    CalendarDays
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['admin'] },
        { icon: Users, label: 'Customers', href: '/customers', roles: ['admin', 'staff'] },
        { icon: Settings, label: 'User/Staff Management', href: '/users', roles: ['admin'] },
        { icon: CalendarDays, label: 'Calendar', href: '/calendar', roles: ['admin', 'staff'] },
        { icon: Calendar, label: 'Bookings', href: '/appointments', roles: ['admin', 'staff'] },
        { icon: Scissors, label: 'Services', href: '/services', roles: ['admin', 'staff'] },
        { icon: BarChart3, label: 'Reports', href: '/reports', roles: ['admin'] },
    ];

    const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

    return (
        <div className="h-full w-72 bg-gradient-to-b from-[#1e1b4b] via-[#1e1b4b] to-[#9333ea] border-r border-white/10 flex flex-col shadow-2xl z-10 font-sans relative">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-white/5 blur-[100px] pointer-events-none" />

            <div className="p-8 mb-4 relative z-10">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md w-fit p-3 rounded-2xl shadow-lg border border-white/20 animate-float">
                    <Scissors className="text-white" size={24} />
                </div>
                <div className="mt-5">
                    <h1 className="font-display text-2xl font-black text-white tracking-tight">SALON<span className="text-purple-300">PRO</span></h1>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Couture Suite</p>
                </div>
            </div>

            <nav className="flex-1 px-6 space-y-1.5 custom-scrollbar overflow-y-auto relative z-10">
                {filteredMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 relative ${isActive
                                ? 'bg-white text-navy-800 shadow-xl shadow-navy-900/20'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-purple-600' : 'text-white/40 group-hover:text-white transition-colors'} />
                            <span className="text-sm tracking-tight">{item.label}</span>
                            {isActive && (
                                <div className="absolute right-4 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 mt-auto relative z-10 border-t border-white/10">
                <div className="bg-black/10 backdrop-blur-md rounded-[2rem] p-5 relative overflow-hidden border border-white/10 group transition-all duration-500 hover:bg-black/20">
                    <div className="relative z-10 flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-white border border-white/20 shadow-inner group-hover:scale-105 transition-transform">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-[11px] font-black text-white uppercase tracking-widest truncate">{user?.name}</div>
                            <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-0.5">{user?.role} ACCESS</div>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="relative z-10 flex items-center justify-center gap-2.5 px-4 py-3 w-full rounded-xl bg-white/10 hover:bg-white text-white hover:text-navy-800 text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 border border-white/10 hover:border-white shadow-sm"
                    >
                        <LogOut size={14} />
                        Logout Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <p className="font-display font-bold text-slate-400 animate-pulse text-sm tracking-widest uppercase">Initializing Suite</p>
            </div>
        </div>
    );
    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 selection:bg-purple-100 selection:text-purple-700">
            <Sidebar />
            <main className="flex-1 relative overflow-y-auto p-10 custom-scrollbar">
                {/* Background decoration */}
                <div className="fixed top-0 right-0 p-40 opacity-30 pointer-events-none">
                    <div className="w-[800px] h-[800px] bg-purple-100/40 blur-[150px] rounded-full" />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}
