'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, X, Scissors, Clock, DollarSign } from 'lucide-react';

interface Service {
    id: number;
    name: string;
    category: string;
    price: number;
    duration: number;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: 0,
        duration: 30
    });

    const fetchServices = async () => {
        try {
            const response = await api.get('/services/');
            setServices(response.data);
        } catch (error) {
            console.error('Failed to fetch services', error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;
        try {
            if (editingService) {
                await api.put(`/services/${editingService.id}`, formData);
            } else {
                await api.post('/services/', formData);
            }
            setShowModal(false);
            setEditingService(null);
            setFormData({ name: '', category: '', price: 0, duration: 30 });
            fetchServices();
        } catch (error) {
            console.error('Failed to save service', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) return;
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await api.delete(`/services/${id}`);
                fetchServices();
            } catch (error) {
                console.error('Failed to delete service', error);
            }
        }
    };

    const categories = Array.from(new Set(services.map(s => s.category)));

    const groupedServices = categories.reduce((acc, cat) => {
        acc[cat] = services.filter(s => s.category === cat);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">Services</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Curate your luxury treatment and service menu</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setEditingService(null);
                            setFormData({ name: '', category: '', price: 0, duration: 30 });
                            setShowModal(true);
                        }}
                        className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 font-black uppercase tracking-widest text-[10px] active:scale-95"
                    >
                        <Plus size={18} />
                        Add service
                    </button>
                )}
            </div>

            <div className="space-y-16">
                {categories.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-soft">
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No services registered in the catalog</p>
                    </div>
                )}

                {categories.map((category) => (
                    <div key={category} className="animate-in-fade">
                        <div className="flex items-center gap-6 mb-8">
                            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
                                {category}
                            </h2>
                            <div className="h-px flex-1 bg-slate-200"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {groupedServices[category].map((service) => (
                                <div key={service.id} className="glass p-8 rounded-[2rem] border border-slate-200/60 shadow-soft card-hover relative group transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-navy-900 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                            <Scissors size={24} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</div>
                                            <span className="text-2xl font-display font-black text-navy-900 tracking-tighter">₹{service.price}</span>
                                        </div>
                                    </div>

                                    <h3 className="font-display text-xl font-black text-slate-800 mb-2 truncate">{service.name}</h3>

                                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-100">
                                        <Clock size={14} className="text-purple-500" />
                                        {service.duration} MINS
                                    </div>

                                    {isAdmin && (
                                        <div className="flex justify-end gap-2 pt-6 border-t border-slate-100">
                                            <button
                                                onClick={() => {
                                                    setEditingService(service);
                                                    setFormData({
                                                        name: service.name,
                                                        category: service.category,
                                                        price: service.price,
                                                        duration: service.duration
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-purple-100 shadow-sm"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 relative animate-in zoom-in-95 duration-500 border border-purple-100 shadow-2xl">
                        <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2.5 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                        <h2 className="font-display text-2xl font-black text-slate-800 mb-8 tracking-tight">{editingService ? 'Edit Treatment' : 'Add Services'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold text-sm"
                                    placeholder="e.g. Signature Haircut"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer font-bold text-sm"
                                    required
                                >
                                    <option value="">Select Domain</option>
                                    <option value="Hair Care">Hair Care</option>
                                    <option value="Haircut">Haircut</option>
                                    <option value="Styling">Styling</option>
                                    <option value="Coloring">Coloring</option>
                                    <option value="Skincare">Skincare</option>
                                    <option value="Threading">Threading</option>
                                    <option value="Waxing">Waxing</option>
                                    <option value="Makeup">Makeup</option>
                                    <option value="Facial">Facial</option>
                                    <option value="Massage">Massage</option>
                                    <option value="Nails">Nails</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <DollarSign size={14} /> Price (Rupee)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <Clock size={14} /> Time Duration(in min)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-navy-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-navy-800 transition shadow-lg shadow-navy-100 active:scale-95 border border-navy-800"
                            >
                                {editingService ? 'Execute Update' : 'Confirm Service'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
