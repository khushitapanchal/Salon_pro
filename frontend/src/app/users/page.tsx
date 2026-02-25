'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Service {
    id: number;
    name: string;
    category: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    services?: Service[];
}

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
        status: 'active',
        service_ids: [] as number[]
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            // Non-admin users might not have access, handle gracefully or show error
        }
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                password: '', // Don't show existing password
                role: user.role,
                status: user.status,
                service_ids: user.services?.map(s => s.id) || []
            });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', phone: '', password: '', role: 'staff', status: 'active', service_ids: [] });
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingUser) {
                // Update
                const updateData = { ...formData };
                if (!updateData.password) {
                    // Prevent sending empty password if not changing
                    delete (updateData as any).password;
                }
                await api.put(`/users/${editingUser.id}`, updateData);
            } else {
                // Create
                if (!formData.password) {
                    setError('Password is required for new users');
                    return;
                }
                await api.post('/users', formData);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'An error occurred');
        }
    };

    const handleDelete = async (id: number) => {
        if (id === currentUser?.id) {
            alert('You cannot delete your own account.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (err) {
                console.error(err);
                alert('Error deleting user');
            }
        }
    };

    // If current user is not admin, they are unauthorized to see this page.
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
                        <p className="mt-6 text-slate-400 font-bold leading-relaxed uppercase tracking-widest text-[10px]">Exclusive specialist orchestration is reserved for verified salon administrators only.</p>
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

    const servicesByCategory = services.reduce((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight uppercase">Staff & <span className="text-purple-600">Specialists</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">Advanced orchestration of luxury talent and artisan personnel</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 border border-purple-500"
                >
                    <Plus size={18} />
                    Add User / Staff
                </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-soft overflow-hidden animate-in-fade relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-navy-500/5 blur-[100px] pointer-events-none rounded-full" />
                <table className="w-full text-left relative z-10">
                    <thead className="bg-gradient-to-r from-purple-600 to-navy-900">
                        <tr>
                            <th className="px-10 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Specialist Name</th>
                            <th className="px-10 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Communication channel</th>
                            <th className="px-10 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Service Expertise</th>
                            <th className="px-10 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Authority tier</th>
                            <th className="px-10 py-8 text-right text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-purple-50/20 transition-colors group">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-navy-900 text-white rounded-2xl flex items-center justify-center font-black shadow-xl group-hover:scale-110 transition-transform duration-500 font-display text-lg uppercase">
                                            {u.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 uppercase tracking-tight text-sm font-display">{u.name}</div>
                                            <div className={`text-[9px] uppercase font-black tracking-[0.2em] mt-1.5 px-2.5 py-1 rounded-lg w-fit ${u.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                                {u.status}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="text-navy-950 font-black text-[13px] tracking-tight truncate max-w-[180px]">{u.email}</div>
                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{u.phone || '-'}</div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex flex-wrap gap-2">
                                        {u.services && u.services.length > 0 ? (
                                            u.services.map(s => (
                                                <span key={s.id} className="bg-white text-navy-900 text-[9px] font-black px-3 py-1.5 rounded-xl border border-navy-100 uppercase tracking-widest shadow-sm">
                                                    {s.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-300 font-black text-[9px] uppercase tracking-[0.3em] font-display italic">Unspecialized</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg border ${u.role === 'admin'
                                        ? 'bg-purple-600 text-white border-purple-500 shadow-purple-200/50'
                                        : 'bg-navy-900 text-white border-navy-800 shadow-navy-100/50'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <div className="flex justify-end gap-3 transition-all">
                                        <button
                                            onClick={() => handleOpenModal(u)}
                                            className="p-3 text-slate-400 hover:text-purple-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-purple-100 shadow-sm"
                                            title="Edit Specialist"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            disabled={u.id === currentUser?.id}
                                            className={`p-3 rounded-2xl transition-all border border-transparent shadow-sm ${u.id === currentUser?.id
                                                ? 'text-slate-200 cursor-not-allowed bg-slate-50'
                                                : 'text-slate-400 hover:text-rose-500 hover:bg-white hover:border-rose-100'
                                                }`}
                                            title="Delete Specialist"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center px-12 py-10 border-b border-slate-50 bg-slate-50/30">
                            <div>
                                <h2 className="font-display text-3xl font-black text-slate-800 tracking-tighter uppercase">
                                    {editingUser ? 'Update Artisan' : 'User/Staff Member'}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Specialist Personnel Dossier</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-white p-3 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                                <X size={24} />
                            </button>
                        </div>

                        <form id="user-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-8">
                            {error && <div className="p-5 bg-rose-50 text-rose-600 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] border border-rose-100 shadow-inner">{error}</div>}

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-black uppercase text-sm font-display tracking-tight"
                                        placeholder="Enter designation"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phone No</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-black text-sm"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mail</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-black text-sm"
                                            placeholder="email@luxury.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                            Password {editingUser && <span className="font-black text-purple-400 font-sans tracking-tight lowercase">(renewal only)</span>}
                                        </label>
                                        <input
                                            type="password"
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-black text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer font-black uppercase text-[11px] tracking-widest"
                                        >
                                            <option value="staff">Staff artisan</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer font-black uppercase text-[11px] tracking-widest"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.role === 'staff' && (
                                    <div className="pt-10 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <label className="block text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Qualified Domain Specializations</label>
                                            <span className="text-[10px] text-white font-black bg-navy-950 px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-navy-900/10">
                                                {formData.service_ids.length} EXPERTISE
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 max-h-80 overflow-y-auto p-2 custom-scrollbar pr-4">
                                            {Object.entries(servicesByCategory).map(([category, catServices]) => (
                                                <div key={category} className="space-y-4">
                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-3">
                                                        <span>{category}</span>
                                                        <span className="flex-1 h-px bg-slate-50"></span>
                                                    </h3>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {catServices.map(s => (
                                                            <label
                                                                key={s.id}
                                                                className={`flex items-center gap-5 p-5 rounded-[1.5rem] transition-all cursor-pointer border shadow-sm group ${formData.service_ids.includes(s.id)
                                                                    ? 'bg-white border-purple-200 ring-4 ring-purple-500/5'
                                                                    : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-100'
                                                                    }`}
                                                            >
                                                                <div className="relative flex items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.service_ids.includes(s.id)}
                                                                        onChange={(e) => {
                                                                            const ids = e.target.checked
                                                                                ? [...formData.service_ids, s.id]
                                                                                : formData.service_ids.filter(id => id !== s.id);
                                                                            setFormData({ ...formData, service_ids: ids });
                                                                        }}
                                                                        className="peer h-7 w-7 cursor-pointer appearance-none rounded-[10px] border-2 border-slate-200 transition-all checked:border-purple-600 checked:bg-purple-600 shadow-inner"
                                                                    />
                                                                    <Check className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className={`text-xs font-black uppercase tracking-tight font-display ${formData.service_ids.includes(s.id) ? 'text-purple-600' : 'text-slate-600'}`}>
                                                                        {s.name}
                                                                    </span>
                                                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{s.category}</span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {services.length === 0 && (
                                                <div className="col-span-2 py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] font-display italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                    No specialty domains registered.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="p-12 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-5 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-[1.5rem] transition-all active:scale-95 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="user-form"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const form = document.getElementById('user-form') as HTMLFormElement;
                                    form.requestSubmit();
                                }}
                                className="px-12 py-5 bg-navy-900 text-white rounded-[1.5rem] hover:bg-navy-800 font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-navy-900/20 transition-all active:scale-95 border border-navy-800"
                            >
                                {editingUser ? 'Finalize Updates' : 'Add User/Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
