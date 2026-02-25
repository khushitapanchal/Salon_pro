'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Plus, Check, X, Clock, Calendar as CalendarIcon, User as UserIcon, Edit2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Staff {
    id: number;
    name: string;
    services?: Service[];
}

interface Appointment {
    id: number;
    customer_id: number;
    staff_id?: number;
    staff?: Staff;
    date: string;
    time: string;
    status: string;
    total_amount: number;
    services: Service[];
}

interface Customer {
    id: number;
    name: string;
}

interface Service {
    id: number;
    name: string;
    category: string;
    price: number;
    duration: number;
}

export default function AppointmentsPage() {
    const { user: currentUser } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [date, setDate] = useState<Date | null>(new Date());

    const [formData, setFormData] = useState({
        customer_id: 0,
        staff_id: 0,
        time: '12:00',
        status: 'pending'
    });

    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        phone: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            const appRes = await api.get('/appointments/').catch(() => ({ data: [] }));
            const custRes = await api.get('/customers/').catch(() => ({ data: [] }));
            const servRes = await api.get('/services/').catch(() => ({ data: [] }));
            const usersRes = await api.get('/users/').catch(() => ({ data: [] }));

            setAppointments(appRes.data);
            setCustomers(custRes.data);
            setServices(servRes.data);
            setStaffList(usersRes.data);

            console.log('Fetched data:', {
                apps: appRes.data.length,
                custs: custRes.data.length,
                servs: servRes.data.length,
                staff: usersRes.data.length
            });
        } catch (error) {
            console.error('Unexpected error in fetchData', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedServices.length === 0) return alert('Select at least one service');

        try {
            let customerId = formData.customer_id;

            if (isNewCustomer && !editingAppointment) {
                // Sanitize customer data
                const sanitizedData: any = { ...newCustomerData };
                if (!sanitizedData.notes) delete sanitizedData.notes;

                const custRes = await api.post('/customers/', sanitizedData);
                customerId = custRes.data.id;
            }

            if (!customerId) return alert('Please select a customer or add a new one');

            const year = date?.getFullYear();
            const month = String(date?.getMonth()! + 1).padStart(2, '0');
            const day = String(date?.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const data = {
                customer_id: customerId,
                staff_id: formData.staff_id || null,
                date: dateStr,
                time: formData.time,
                status: formData.status,
                payment_status: 'unpaid',
                service_ids: selectedServices,
                total_amount: 0
            };

            if (editingAppointment) {
                await api.put(`/appointments/${editingAppointment.id}`, data);
            } else {
                await api.post('/appointments/', data);
            }
            setShowModal(false);
            setEditingAppointment(null);
            setSelectedServices([]);
            setIsNewCustomer(false);
            fetchData();
        } catch (error: any) {
            console.error('Failed to book appointment', error);
            const msg = error.response?.data?.detail || 'Error booking appointment. Please try again.';
            alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    const handleEdit = (app: Appointment) => {
        setEditingAppointment(app);
        setFormData({
            customer_id: app.customer_id,
            staff_id: app.staff_id || 0,
            time: app.time,
            status: app.status
        });
        setDate(new Date(app.date));
        setSelectedServices(app.services.map(s => s.id));
        setIsNewCustomer(false);
        setShowModal(true);
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.put(`/appointments/${id}/status?status=${status}`);
            fetchData();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const servicesByCategory = services.reduce((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
                <button
                    onClick={() => {
                        setEditingAppointment(null);
                        setFormData({
                            customer_id: 0,
                            staff_id: 0,
                            time: '12:00',
                            status: 'pending'
                        });
                        setDate(new Date());
                        setSelectedServices([]);
                        setIsNewCustomer(false);
                        setNewCustomerData({ name: '', phone: '', notes: '' });
                        setShowModal(true);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition shadow-lg shadow-purple-100 active:scale-95"
                >
                    <Plus size={20} />
                    Book Appointment
                </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-soft overflow-hidden animate-in-fade relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-navy-500/5 blur-[100px] pointer-events-none rounded-full" />
                <table className="w-full text-left relative z-10">
                    <thead className="bg-gradient-to-r from-purple-600 to-navy-900">
                        <tr>
                            <th className="px-8 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Customer Name</th>
                            <th className="px-8 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Lead Specialist</th>
                            <th className="px-8 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Booking Date & Time</th>
                            <th className="px-8 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Services</th>
                            <th className="px-8 py-8 text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Status</th>
                            <th className="px-8 py-8 text-right text-[13px] font-extrabold text-white uppercase tracking-widest font-display border-b border-navy-900/50">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {appointments.map((app) => {
                            const customer = customers.find(c => c.id === app.customer_id);
                            return (
                                <tr key={app.id} className="hover:bg-purple-50/30 transition group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-white transition-colors">
                                                <UserIcon className="text-slate-500" size={16} />
                                            </div>
                                            <div className="font-bold text-slate-800 tracking-tight">{customer?.name || 'Unknown'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {app.staff ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center text-[10px] text-purple-600 font-black">
                                                    {app.staff.name[0]}
                                                </div>
                                                <span className="font-medium">{app.staff.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                            <CalendarIcon size={14} className="text-purple-500" />
                                            {app.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            <Clock size={12} className="text-slate-400" />
                                            {app.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {app.services.map((s: Service) => (
                                                <span key={s.id} className="bg-white text-navy-800 text-[10px] px-2.5 py-1 rounded-lg border border-slate-100 font-black uppercase tracking-tight shadow-sm">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${app.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            app.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 transition-all">
                                            {currentUser?.role === 'admin' ? (
                                                <>
                                                    {app.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(app.id, 'completed')} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-xl border border-transparent hover:border-emerald-100 shadow-sm transition-all">
                                                                <Check size={18} />
                                                            </button>
                                                            <button onClick={() => handleStatusUpdate(app.id, 'cancelled')} className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl border border-transparent hover:border-rose-100 shadow-sm transition-all">
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button onClick={() => handleEdit(app)} className="text-purple-600 hover:bg-purple-50 p-2 rounded-xl border border-transparent hover:border-purple-100 shadow-sm transition-all">
                                                        <Edit2 size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">View Only</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500 border border-purple-100">

                        <div className="flex justify-between items-center p-8 border-b border-slate-50">
                            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
                                {editingAppointment ? 'Edit Session' : 'New Appointment'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingAppointment(null); }}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1 p-8">
                            <form onSubmit={handleSubmit} id="appointment-form" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {!editingAppointment && (
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsNewCustomer(false)}
                                                    className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isNewCustomer ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500'}`}
                                                >
                                                    Existing Client
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsNewCustomer(true)}
                                                    className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isNewCustomer ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500'}`}
                                                >
                                                    New Client
                                                </button>
                                            </div>

                                            {isNewCustomer ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                                                        <input
                                                            type="text" required
                                                            value={newCustomerData.name}
                                                            onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                                                            placeholder="Client Name"
                                                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-medium"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone No</label>
                                                        <input
                                                            type="text" required
                                                            value={newCustomerData.phone}
                                                            onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                                                            placeholder="+91 00000 00000"
                                                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-medium"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Customer</label>
                                                    <select
                                                        required={!isNewCustomer}
                                                        value={formData.customer_id || ''}
                                                        onChange={(e) => setFormData({ ...formData, customer_id: e.target.value ? Number(e.target.value) : 0 })}
                                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer font-bold"
                                                    >
                                                        <option value="">Scan directory...</option>
                                                        {customers.map(c => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {editingAppointment && (
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Name</label>
                                            <div className="w-full px-5 py-3.5 bg-navy-50/50 border border-slate-200 rounded-xl font-black text-navy-900">
                                                {customers.find(c => c.id === formData.customer_id)?.name}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Staff Specialist</label>
                                        <select
                                            value={formData.staff_id || ''}
                                            onChange={(e) => setFormData({ ...formData, staff_id: e.target.value ? Number(e.target.value) : 0 })}
                                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer font-bold"
                                        >
                                            <option value="">Select Talent...</option>
                                            {staffList.map(staff => (
                                                <option key={staff.id} value={staff.id}>{staff.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Appointment Date</label>
                                            <DatePicker
                                                selected={date}
                                                onChange={(d: Date | null) => setDate(d)}
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold"
                                                dateFormat="yyyy-MM-dd"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Slot</label>
                                            <input
                                                type="time"
                                                required
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    {editingAppointment && (
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Booking Velocity</label>
                                            <select
                                                required
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer font-bold uppercase tracking-widest text-xs"
                                            >
                                                <option value="pending">PENDING</option>
                                                <option value="completed">COMPLETED</option>
                                                <option value="cancelled">CANCELLED</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mb-4">Select Services</label>
                                    <div className="grid grid-cols-1 gap-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {Object.entries(servicesByCategory).map(([category, catServices]) => (
                                            <div key={category} className="space-y-4">
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-3">
                                                    <span>{category}</span>
                                                    <span className="flex-1 h-px bg-slate-50"></span>
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {catServices.map((service) => (
                                                        <label
                                                            key={service.id}
                                                            className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all ${selectedServices.includes(service.id)
                                                                ? 'border-purple-600 bg-purple-50/30 ring-4 ring-purple-500/5'
                                                                : 'border-slate-100 hover:border-purple-100 bg-white shadow-sm'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative flex items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 transition-all checked:border-purple-600 checked:bg-purple-600"
                                                                        checked={selectedServices.includes(service.id)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) setSelectedServices([...selectedServices, service.id]);
                                                                            else setSelectedServices(selectedServices.filter(id => id !== service.id));
                                                                        }}
                                                                    />
                                                                    <Check className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                                                </div>
                                                                <div>
                                                                    <p className={`text-[11px] font-black uppercase tracking-tight ${selectedServices.includes(service.id) ? 'text-purple-600' : 'text-slate-800'}`}>{service.name}</p>
                                                                </div>
                                                            </div>
                                                            <span className={`text-xs font-black ${selectedServices.includes(service.id) ? 'text-purple-600' : 'text-navy-900'}`}>₹{service.price}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-3 shadow-inner">
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); setEditingAppointment(null); }}
                                className="px-8 py-4 bg-white text-slate-500 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="appointment-form"
                                className="px-10 py-4 bg-navy-900 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-navy-800 shadow-lg shadow-navy-200 transition-all active:scale-95"
                            >
                                {editingAppointment ? 'Save Updates' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
