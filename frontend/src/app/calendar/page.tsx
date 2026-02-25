'use client';

import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    isSameDay,
    isToday,
    startOfDay,
    parseISO
} from 'date-fns';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    User,
    CheckCircle2,
    Calendar as CalendarIcon,
    X
} from 'lucide-react';

interface Appointment {
    id: number;
    customer_id: number;
    customer_name?: string;
    date: string;
    time: string;
    status: string;
    total_amount: number;
    services: { id: number, name: string }[];
}

export default function CalendarPage() {
    const [view, setView] = useState<'day' | 'week' | 'month'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

    const fetchData = async () => {
        try {
            const [appRes, custRes] = await Promise.all([
                api.get('/appointments/'),
                api.get('/customers/')
            ]);

            // Map customer names to appointments
            const appsWithNames = appRes.data.map((app: any) => ({
                ...app,
                customer_name: custRes.data.find((c: any) => c.id === app.customer_id)?.name || 'Walk-in'
            }));

            setAppointments(appsWithNames);
            setCustomers(custRes.data);
        } catch (error) {
            console.error('Failed to fetch calendar data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const navigate = (direction: 'next' | 'prev') => {
        if (view === 'month') {
            setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        } else if (view === 'week') {
            setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        } else {
            setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
        }
    };

    // --- Month View Logic ---
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-navy-50 bg-navy-50/20">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-5 px-2 text-center text-[10px] font-black text-navy-950 uppercase tracking-[0.2em] font-display">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, i) => {
                        const dayApps = appointments.filter(app => isSameDay(parseISO(app.date), day));
                        const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);

                        return (
                            <div key={i} className={`min-h-[150px] border border-gray-300 p-3 transition hover:bg-purple-50/30 ${isCurrentMonth ? '' : 'bg-slate-50/20'}`}>
                                <div className={`text-sm font-black mb-4 flex items-center justify-center w-9 h-9 rounded-xl transition-all ${isToday(day) ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-600'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-2">
                                    {dayApps.slice(0, 3).map(app => (
                                        <button
                                            key={app.id}
                                            onClick={() => setSelectedApp(app)}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-[9px] truncate border-none transition-all hover:translate-x-1 ${app.status === 'completed' ? 'bg-emerald-50 text-emerald-700 font-black uppercase tracking-tight' :
                                                app.status === 'cancelled' ? 'bg-rose-50 text-rose-700 font-black uppercase tracking-tight' :
                                                    'bg-navy-900 text-white font-black uppercase tracking-[0.1em] shadow-sm'
                                                }`}
                                        >
                                            <span className="opacity-60 mr-1.5">{app.time.slice(0, 5)}</span>
                                            {app.customer_name}
                                        </button>
                                    ))}
                                    {dayApps.length > 3 && (
                                        <div className="text-[9px] text-slate-300 font-black uppercase tracking-widest text-center py-1">
                                            + {dayApps.length - 3} sessions
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- Week / Day View Logic ---
    const renderTimeGrid = () => {
        const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 9 AM to 9 PM
        const days = view === 'week'
            ? eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) })
            : [currentDate];

        return (
            <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-100 overflow-hidden flex flex-col h-[750px] relative">
                <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-slate-50/10">
                    <div className="flex border-b border-navy-50 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
                        <div className="w-24 shrink-0 border-r border-navy-50 sticky left-0 z-40 bg-white/95 backdrop-blur-sm"></div>
                        {days.map((day, i) => (
                            <div key={i} className={`flex-1 min-w-[120px] py-6 text-center border-r-2 border-slate-200 ${isToday(day) ? 'bg-purple-50/50' : ''}`}>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-display">{format(day, 'EEE')}</div>
                                <div className={`mt-3 inline-flex items-center justify-center w-11 h-11 rounded-2xl text-xl font-black transition-all ${isToday(day) ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-navy-950 font-display'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex">
                        {/* Time labels */}
                        <div className="w-24 shrink-0 bg-white/95 backdrop-blur-sm border-r border-navy-50 sticky left-0 z-20">
                            {hours.map(h => (
                                <div key={h} className="h-24 text-[10px] font-black text-slate-400 text-right pr-6 pt-0 uppercase tracking-[0.1em] border-b border-transparent">
                                    <span className="relative -top-3 bg-white px-2 rounded-lg">{h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Columns */}
                        {days.map((day, di) => (
                            <div key={di} className="flex-1 min-w-[120px] border-r-2 border-slate-200 relative group box-border">
                                {hours.map(h => (
                                    <div key={h} className="h-24 border-b-2 border-slate-200 border-solid box-border"></div>
                                ))}
                                {/* Appointments */}
                                {appointments.filter(app => isSameDay(parseISO(app.date), day)).map(app => {
                                    const [h, m] = app.time.split(':').map(Number);
                                    if (h < 9 || h > 21) return null;
                                    const top = ((h - 9) * 96) + (m / 60 * 96);
                                    return (
                                        <button
                                            key={app.id}
                                            onClick={() => setSelectedApp(app)}
                                            className={`absolute left-2 right-2 p-3 rounded-2xl text-left shadow-lg border border-white/40 transition-all hover:-translate-y-1 hover:shadow-2xl z-10 flex flex-col justify-center ${app.status === 'completed' ? 'bg-emerald-50/90 text-emerald-800' :
                                                app.status === 'cancelled' ? 'bg-rose-50/90 text-rose-800' :
                                                    'bg-purple-900/95 text-white shadow-purple-900/20'
                                                } backdrop-blur-md`}
                                            style={{ top: `${top}px`, height: '80px', minHeight: '60px' }}
                                        >
                                            <div className="text-[9px] font-black opacity-70 mb-1 uppercase tracking-[0.2em] flex items-center gap-1.5"><Clock size={10} /> {app.time.slice(0, 5)}</div>
                                            <div className="text-sm font-black truncate tracking-tight uppercase">{app.customer_name}</div>
                                            <div className="text-[9px] truncate font-black opacity-60 uppercase mt-0.5 tracking-widest">{app.services[0]?.name}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                <div>
                    <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Calendar <span className="text-purple-600">Scheduler</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">Advanced booking and resource orchestration</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[2.5rem] shadow-soft border border-slate-100">
                    <div className="flex gap-1.5">
                        {['day', 'week', 'month'].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v as any)}
                                className={`px-7 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.2em] ${view === v ? 'bg-navy-900 text-white shadow-xl shadow-navy-900/20' : 'text-slate-400 hover:text-navy-900 hover:bg-slate-50'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <button
                        onClick={() => window.location.href = '/appointments'}
                        className="bg-purple-600 text-white px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 hover:bg-purple-700 transition shadow-lg shadow-purple-200 active:scale-95"
                    >
                        <Plus size={16} />
                        Book Appointment
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-8">
                    <h2 className="font-display text-3xl font-black text-slate-900 min-w-[240px] tracking-tighter capitalize">
                        {format(currentDate, view === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('prev')} className="p-3 bg-white border border-slate-100 hover:border-purple-200 rounded-2xl text-slate-400 hover:text-purple-600 transition-all shadow-sm active:scale-95"><ChevronLeft size={20} /></button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-navy-900 border border-navy-100 hover:bg-navy-50 transition-all shadow-sm active:scale-95 bg-white"
                        >
                            Present
                        </button>
                        <button onClick={() => navigate('next')} className="p-3 bg-white border border-slate-100 hover:border-purple-200 rounded-2xl text-slate-400 hover:text-purple-600 transition-all shadow-sm active:scale-95"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className="flex gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-navy-900 shadow-sm shadow-navy-900/40"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">In Queue</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Validated</span>
                    </div>
                </div>
            </div>

            {view === 'month' ? renderMonthView() : renderTimeGrid()}

            {/* Appointment Details Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-slate-100">
                        <div className="bg-gradient-to-br from-navy-900 to-purple-600 p-12 text-white relative shrink-0">
                            <button onClick={() => setSelectedApp(null)} className="absolute top-8 right-8 text-white/60 hover:text-white bg-white/10 p-2.5 rounded-xl transition">
                                <X size={20} />
                            </button>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">Engagement Dossier</div>
                            <h3 className="font-display text-4xl font-black truncate tracking-tighter uppercase">{selectedApp.customer_name}</h3>
                            <div className={`mt-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black border border-white/20 bg-white/10 uppercase tracking-[0.2em] backdrop-blur-md`}>
                                {selectedApp.status === 'completed' && <CheckCircle2 size={14} />}
                                {selectedApp.status}
                            </div>
                        </div>

                        <div className="p-12 space-y-10 overflow-y-auto custom-scrollbar flex-1 relative">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Date</div>
                                    <div className="flex items-center gap-3 text-navy-900 font-black text-sm tracking-tight">
                                        <CalendarIcon size={18} className="text-purple-500" />
                                        {selectedApp.date}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time Window</div>
                                    <div className="flex items-center gap-3 text-navy-900 font-black text-sm tracking-tight">
                                        <Clock size={18} className="text-purple-500" />
                                        {selectedApp.time.slice(0, 5)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curated Services</div>
                                <div className="space-y-3">
                                    {selectedApp.services.map(s => (
                                        <div key={s.id} className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner group cursor-default">
                                            <span className="font-black text-navy-950 text-sm tracking-tight uppercase group-hover:text-purple-600 transition-colors">{s.name}</span>
                                            <span className="text-slate-300 text-[8px] font-black uppercase tracking-[0.2em] group-hover:text-purple-300 transition-colors">Elite Tier</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-10 border-t border-slate-100 flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Settlement Value</div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-display font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                        Verified Rate
                                    </div>
                                </div>
                                <div className="text-4xl font-display font-black text-navy-900 tracking-tighter">₹{selectedApp.total_amount}</div>
                            </div>

                            <button
                                onClick={() => setSelectedApp(null)}
                                className="w-full bg-navy-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/20 active:scale-95 border border-navy-800"
                            >
                                Release View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
