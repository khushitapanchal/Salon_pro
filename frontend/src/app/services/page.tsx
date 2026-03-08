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
    const [loading, setLoading] = useState(true);

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

                await api.post('/services/', formData);

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

        } catch (error) {

            console.error('Failed to save service:', error);

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

            <div className="flex justify-between items-end mb-10">

                <div>
                    <h1 className="text-3xl font-bold">Services</h1>
                    <p className="text-gray-400 text-sm mt-2">
                        Manage all salon services
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

                            setShowModal(true);

                        }}
                        className="bg-purple-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Service
                    </button>

                )}

            </div>

            {loading ? (

                <p>Loading services...</p>

            ) : (

                <div className="space-y-10">

                    {categories.length === 0 && (
                        <p className="text-gray-400">
                            No services available
                        </p>
                    )}

                    {categories.map(category => (

                        <div key={category}>

                            <h2 className="text-xl font-semibold mb-4">
                                {category}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                {groupedServices[category].map(service => (

                                    <div
                                        key={service.id}
                                        className="border p-6 rounded-xl"
                                    >

                                        <div className="flex justify-between mb-4">

                                            <Scissors />

                                            <span className="font-bold">
                                                ₹{service.price}
                                            </span>

                                        </div>

                                        <h3 className="font-semibold text-lg">
                                            {service.name}
                                        </h3>

                                        <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                            <Clock size={14} />
                                            {service.duration} mins
                                        </div>

                                        {isAdmin && (

                                            <div className="flex gap-2 mt-4">

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
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(service.id)
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>

                                        )}

                                    </div>

                                ))}

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {showModal && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-white p-8 rounded-xl w-full max-w-md">

                        <button
                            onClick={() => setShowModal(false)}
                            className="float-right"
                        >
                            <X />
                        </button>

                        <h2 className="text-xl font-bold mb-6">
                            {editingService ? 'Edit Service' : 'Add Service'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <input
                                type="text"
                                placeholder="Service Name"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value
                                    })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <input
                                type="text"
                                placeholder="Category"
                                required
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category: e.target.value
                                    })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <input
                                type="number"
                                placeholder="Price"
                                required
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price: Number(e.target.value)
                                    })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <input
                                type="number"
                                placeholder="Duration (minutes)"
                                required
                                value={formData.duration}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        duration: Number(e.target.value)
                                    })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <button
                                type="submit"
                                className="w-full bg-black text-white py-2 rounded"
                            >
                                {editingService ? 'Update' : 'Create'}
                            </button>

                        </form>

                    </div>

                </div>

            )}

        </DashboardLayout>

    );
}