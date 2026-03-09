'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, X, Scissors, Clock, DollarSign, Sparkles, LayoutGrid, Layers } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useAuth();
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: 0,
        duration: 30
    });

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
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
                await api.post('/services', formData);
            }
            setShowModal(false);
            setEditingService(null);
            setFormData({
                name: '',
                category: '',
                price: 0,
                duration: 30
            });
            fetchServices();
        } catch (err: any) {
            console.error('Failed to save service:', err);
            const detail = err.response?.data?.detail;
            setError(Array.isArray(detail) ? detail[0]?.msg : (detail || 'Failed to save service. Please check your inputs.'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) return;
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await api.delete(`/services/${id}`);
            fetchServices();
        } catch (error) {
            console.error('Failed to delete service:', error);
        }
    };

    const categories = Array.from(new Set(services.map(s => s.category)));

    const groupedServices = categories.reduce((acc, cat) => {
        acc[cat] = services.filter(s => s.category === cat);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <DashboardLayout>
            <div className="relative">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full w-fit mb-2 border border-purple-200 shadow-sm">
                            <Sparkles size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Service Catalog</span>
                        </div>
                        <h1 className="font-display text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                            Elite <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-navy-900 leading-none">Treatments</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] bg-white/50 backdrop-blur-sm w-fit px-4 py-2 rounded-lg border border-slate-100">
                            Orchestrating premium Salon Experiences
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => {
                                setEditingService(null);
                                setFormData({
                                    name: '',
                                    category: '',
                                    price: 0,
                                    duration: 30
                                });
                                setError('');
                                setShowModal(true);
                            }}
                            className="bg-navy-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-navy-800 transition-all shadow-premium font-black uppercase tracking-widest text-[10px] active:scale-95 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <Plus size={18} className="text-purple-400" />
                            <span>Register New Service</span>
                        </button>
                    )}
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-in-fade">
                        <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Initializing Registry...</p>
                    </div>
                ) : (
                    <div className="space-y-20 relative z-10 pb-20">
                        {categories.length === 0 ? (
                            <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-slate-100 shadow-soft">
                                <LayoutGrid size={48} className="mx-auto text-slate-200 mb-6" />
                                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No services registered in the database</p>
                            </div>
                        ) : (
                            categories.map(category => (
                                <div key={category} className="animate-in-fade">
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-slate-100">
                                            <Layers size={20} className="text-purple-600" />
                                        </div>
                                        <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
                                            {category}
                                        </h2>
                                        <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent opacity-50"></div>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            {groupedServices[category].length} Services
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {groupedServices[category].map(service => (
                                            <div
                                                key={service.id}
                                                className="glass p-8 rounded-[2.5rem] card-hover group transition-premium"
                                            >
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="bg-navy-900 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                        <Scissors size={24} className="text-purple-400" />
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">Premium Rate</div>
                                                        <span className="text-3xl font-display font-black text-navy-900 tracking-tighter">
                                                            ₹{service.price}
                                                        </span>
                                                    </div>
                                                </div>

                                                <h3 className="font-display text-xl font-black text-slate-800 mb-3 group-hover:text-navy-900 transition-colors">
                                                    {service.name}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-2 mb-8">
                                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                                                        <Clock size={14} className="text-purple-500" />
                                                        {service.duration} Min
                                                    </div>
                                                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-3 py-2 rounded-xl group-hover:border-slate-200 transition-colors">
                                                        ID: #{service.id}
                                                    </div>
                                                </div>

                                                {isAdmin && (
                                                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                        <button
                                                            onClick={() => {
                                                                setEditingService(service);
                                                                setFormData({
                                                                    name: service.name,
                                                                    category: service.category,
                                                                    price: service.price,
                                                                    duration: service.duration
                                                                });
                                                                setError('');
                                                                setShowModal(true);
                                                            }}
                                                            className="p-3 text-slate-400 hover:text-purple-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-purple-100 shadow-sm"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(service.id)}
                                                            className="p-3 text-slate-400 hover:text-rose-500 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-rose-100 shadow-sm"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Background Decorations */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
                    <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-purple-200 blur-[120px] rounded-full animate-float"></div>
                    <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-navy-100 blur-[150px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
                </div>
            </div>

            {/* Modal - Modern Redesign */}
            {showModal && (
                <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] max-w-xl w-full p-12 relative animate-in zoom-in-95 duration-500 border border-white shadow-2xl shadow-navy-900/20 overflow-hidden">
                        {/* Modal Shine */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-navy-900"></div>
                        
                        <button 
                            onClick={() => setShowModal(false)} 
                            className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 hover:bg-slate-50 p-3 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-10">
                            <h2 className="font-display text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                Treatment <span className="text-purple-600">Protocol</span>
                            </h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                {editingService ? 'Modify existing registry entry' : 'Define new luxury service attributes'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-rose-100">{error}</div>}
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-purple-600 transition-colors">Service Nomenclature</label>
                                    <div className="relative">
                                        <Scissors className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-all" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all font-bold text-sm tracking-tight placeholder:text-slate-200"
                                            placeholder="e.g. Diamond Facial"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-purple-600 transition-colors">Operational Domain</label>
                                    <div className="relative">
                                        <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-all" size={18} />
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all font-bold text-sm tracking-tight appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Domain</option>
                                            <option value="Hair Care">Hair Care</option>
                                            <option value="Haircut">Haircut</option>
                                            <option value="Skincare">Skincare</option>
                                            <option value="Makeup">Makeup</option>
                                            <option value="Facial">Facial</option>
                                            <option value="Nails">Nails</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-purple-600 transition-colors">Premium Rate (₹)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-all" size={18} />
                                            <input
                                                type="number"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all font-bold text-sm tracking-tight"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-purple-600 transition-colors">Duration (MIN)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-all" size={18} />
                                            <input
                                                type="number"
                                                required
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                                className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all font-bold text-sm tracking-tight"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-navy-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] border border-navy-800 flex items-center justify-center gap-3 group"
                            >
                                <span>{editingService ? 'Execute Modification' : 'Register Service'}</span>
                                <Sparkles size={16} className="text-purple-400 group-hover:rotate-12 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}