'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, UserPlus, Edit2, Trash2, X, History, Calendar, IndianRupee, Clock, User as UserIcon } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

interface Customer {
    id: number;
    name: string;
    phone: string;
    notes?: string;
}

export default function CustomersPage() {
    const { user: currentUser } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        notes: ''
    });

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers/');
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await api.put(`/customers/${editingCustomer.id}`, formData);
            } else {
                await api.post('/customers/', formData);
            }
            setShowModal(false);
            setEditingCustomer(null);
            setFormData({ name: '', phone: '', notes: '' });
            fetchCustomers();
        } catch (error) {
            console.error('Failed to save customer', error);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            notes: customer.notes || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                console.error('Failed to delete customer', error);
            }
        }
    };

    const handleViewProfile = async (id: number) => {
        try {
            const response = await api.get(`/customers/${id}/profile`);
            setSelectedProfile(response.data);
            setShowProfile(true);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const handleUpdateVisitStatus = async (appointmentId: number, status: string, paymentStatus: string) => {
        try {
            await api.put(`/appointments/${appointmentId}/status?status=${status}&payment_status=${paymentStatus}`);
            // Refresh profile data
            if (selectedProfile) handleViewProfile(selectedProfile.customer.id);
        } catch (error) {
            alert('Failed to update visit');
        }
    };

    const handleDeleteAppointment = async (appointmentId: number) => {
        if (!confirm('Are you sure you want to delete this engagement record?')) return;
        try {
            await api.delete(`/appointments/${appointmentId}`);
            if (selectedProfile) handleViewProfile(selectedProfile.customer.id);
        } catch (error) {
            console.error('Failed to delete appointment', error);
            alert('Error deleting engagement record');
        }
    };

    const handleUpdateVisitDate = async (appointmentId: number, visit: any) => {
        const newDate = prompt('Enter new date (YYYY-MM-DD):', visit.date);
        if (!newDate) return;

        try {
            const updateData = {
                customer_id: selectedProfile.customer.id,
                date: newDate,
                time: visit.time,
                status: visit.status,
                payment_status: visit.payment_status,
                service_ids: [], // Backend might need this, but we're just updating date
                total_amount: visit.total_amount
            };
            // Note: Our backend update_appointment might need service_ids. 
            // Since we don't have them easily here, we'll use a specific status update or just let it be.
            // Actually, let's just use the status update endpoint to update payment status for now
            // as prompt-based date editing is a bit clunky.
        } catch (error) {
            console.error(error);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Customers</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your client directory and engagement history</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCustomer(null);
                        setFormData({ name: '', phone: '', notes: '' });
                        setShowModal(true);
                    }}
                    className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 font-black uppercase tracking-widest text-[10px] active:scale-95"
                >
                    <UserPlus size={18} />
                    Add Customer
                </button>
            </div>

            <div className="mb-10 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search client directory..."
                    className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-purple-500/5 focus:border-purple-600 transition-all shadow-soft font-bold text-sm tracking-tight placeholder:text-slate-300"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-soft overflow-hidden animate-in-fade relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-navy-500/5 blur-[100px] pointer-events-none rounded-full" />
                <table className="w-full text-left relative z-10">
                    <thead className="bg-gradient-to-r from-purple-600 to-navy-900">
                        <tr>
                            <th className="px-10 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Customer Name</th>
                            <th className="px-10 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Communication node</th>
                            <th className="px-10 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Registered Date</th>
                            <th className="px-10 py-8 text-right text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-purple-50/30 transition-colors cursor-pointer group" onClick={() => handleViewProfile(customer.id)}>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-black group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                                            {customer.name[0]}
                                        </div>
                                        <div className="font-bold text-slate-800 tracking-tight group-hover:text-purple-600 transition-colors">{customer.name}</div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-[11px] font-black text-slate-500 tracking-wider font-mono">{customer.phone}</div>
                                </td>
                                <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2 transition-all">
                                        {currentUser?.role === 'admin' && (
                                            <>
                                                <button onClick={() => handleEdit(customer)} className="p-2.5 text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white rounded-xl transition-all border border-purple-100 shadow-sm active:scale-90">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(customer.id)} className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-100 shadow-sm active:scale-90">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                        {currentUser?.role !== 'admin' && (
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">View Only</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 relative animate-in zoom-in-95 duration-500 border border-purple-100 shadow-2xl">
                        <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2.5 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                        <h2 className="font-display text-2xl font-black text-slate-800 mb-8 tracking-tight">{editingCustomer ? 'Edit Customer' : 'New Customer'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold text-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Communication Node</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold text-sm"
                                        placeholder="+91-0000000000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-medium text-sm h-32 resize-none"
                                    placeholder="Preferences, history, special requirements..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-navy-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-navy-800 transition shadow-lg shadow-navy-100 active:scale-95 border border-navy-800"
                            >
                                {editingCustomer ? 'Execute Update' : 'Add Customer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {showProfile && selectedProfile && (
                <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500 border border-slate-100">

                        <div className="flex justify-between items-center p-8 border-b border-slate-50">
                            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">Client <span className="text-purple-600">Dossier</span></h2>
                            <button
                                onClick={() => setShowProfile(false)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1 p-10 bg-slate-50/10">
                            {/* Profile Header */}
                            <div className="flex justify-between items-center mb-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-navy-900 to-purple-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-purple-900/10 border border-white/10">
                                        <UserIcon size={36} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-3xl font-black text-slate-900 tracking-tight">{selectedProfile.customer.name}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedProfile.customer.phone}</p>
                                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg font-black uppercase tracking-widest text-[9px] border border-purple-100">Couture Member</span>
                                        </div>
                                    </div>
                                </div>
                                {currentUser?.role === 'admin' && (
                                    <button
                                        onClick={() => {
                                            handleEdit(selectedProfile.customer);
                                            setShowProfile(false);
                                        }}
                                        className="flex items-center gap-2 px-6 py-3.5 bg-white text-navy-900 border border-slate-200 rounded-xl shadow-sm transition-all font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 active:scale-95"
                                    >
                                        <Edit2 size={14} />
                                        <span>Update Dossier</span>
                                    </button>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-6 mb-12">
                                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-soft group transition-all hover:border-purple-200">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                                        <History size={20} />
                                    </div>
                                    <div className="text-4xl font-display font-black text-slate-900 tracking-tighter">{selectedProfile.stats.total_visits}</div>
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Total Sessions</div>
                                </div>
                                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-soft group transition-all hover:border-navy-200">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 group-hover:bg-navy-900 group-hover:text-white transition-all shadow-sm">
                                        <IndianRupee size={20} />
                                    </div>
                                    <div className="text-4xl font-display font-black text-slate-900 tracking-tighter">₹{selectedProfile.stats.total_spent}</div>
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Lifetime Value</div>
                                </div>
                                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-soft group transition-all hover:border-purple-200">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="text-[13px] font-black text-slate-900 tracking-tight leading-tight uppercase">
                                        {selectedProfile.stats.last_visit ? selectedProfile.stats.last_visit : 'First Engagement'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Last Presence</div>
                                </div>
                            </div>

                            {/* History Section */}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-display text-xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                                        Engagement Log
                                        <div className="h-px w-32 bg-slate-100"></div>
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {selectedProfile.history.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                            <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Registry Empty</p>
                                        </div>
                                    ) : (
                                        selectedProfile.history.map((visit: any, idx: number) => (
                                            <div key={visit.id} className="relative group animate-in slide-in-from-bottom-6 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-soft hover:shadow-xl hover:border-purple-100 transition-all group/card">
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl font-display font-black text-navy-950 tracking-tight">{visit.date}</span>
                                                                {currentUser?.role === 'admin' && (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={async () => {
                                                                                const d = prompt('Update Session Date (YYYY-MM-DD)', visit.date);
                                                                                if (d) {
                                                                                    try {
                                                                                        await api.put(`/appointments/${visit.id}/status?status=${visit.status}&date=${d}`);
                                                                                        handleViewProfile(selectedProfile.customer.id);
                                                                                    } catch (err) {
                                                                                        alert('Invalid date format');
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="text-purple-600 hover:text-white transition p-2 bg-purple-50 hover:bg-purple-600 rounded-xl border border-purple-100 shadow-sm active:scale-90"
                                                                            title="Edit Engagement Date"
                                                                        >
                                                                            <Edit2 size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteAppointment(visit.id)}
                                                                            className="text-rose-600 hover:text-white transition p-2 bg-rose-50 hover:bg-rose-600 rounded-xl border border-rose-100 shadow-sm active:scale-90"
                                                                            title="Delete Engagement"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 flex items-center gap-2 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                                                                <Clock size={12} className="text-slate-400" />
                                                                {visit.time} Engagement
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-3xl font-display font-black text-slate-900 tracking-tighter">₹{visit.total_amount}</div>
                                                            <div className="flex gap-2 justify-end items-center mt-4">
                                                                <span className={`text-[8px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border ${visit.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/5' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                                    {visit.status}
                                                                </span>
                                                                <span className={`text-[8px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border ${visit.payment_status === 'paid' ? 'bg-purple-50 text-purple-600 border-purple-100 shadow-sm shadow-purple-500/5' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                                    {visit.payment_status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-8">
                                                        {visit.services.map((s: string, i: number) => (
                                                            <span key={i} className="bg-navy-50/50 text-navy-950 text-[9px] font-black px-4 py-2 rounded-xl border border-navy-100/20 uppercase tracking-widest shadow-sm">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white shadow-inner w-full px-6 py-4 rounded-2xl border border-slate-100">
                                                        <div className="w-6 h-6 bg-navy-900 rounded-lg flex items-center justify-center text-[10px] text-white shadow-md font-black border border-white/20">
                                                            {visit.staff_name?.[0] || 'S'}
                                                        </div>
                                                        <span>Lead Specialist: <span className="text-navy-950">{visit.staff_name}</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end shadow-inner">
                            <button
                                onClick={() => setShowProfile(false)}
                                className="px-10 py-4 bg-white text-slate-500 border border-slate-200 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                            >
                                Revert to Directory
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
