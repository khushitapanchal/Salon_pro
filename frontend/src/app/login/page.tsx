'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { User, ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {

            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data && response.data.access_token) {
                await login(response.data.access_token);
            } else {
                setError("Invalid server response.");
            }

        } catch (err: any) {

            console.error("Login error:", err);

            setError(
                err?.response?.data?.detail ||
                err?.message ||
                "Login failed. Please check your credentials."
            );

        } finally {
            setIsLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10">

                <div className="flex items-center gap-3 mb-8">
                    <ShieldCheck size={26} className="text-purple-600" />
                    <span className="font-bold text-xl">Salon CMS</span>
                </div>

                <h2 className="text-3xl font-bold mb-6">Login</h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-semibold">Email</label>

                        <div className="relative mt-2">
                            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@salon.com"
                                className="w-full pl-10 pr-4 py-3 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Password</label>

                        <div className="relative mt-2">
                            <Lock size={18} className="absolute left-3 top-3 text-gray-400" />

                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 border rounded-lg"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Login
                                <LogIn size={18} />
                            </>
                        )}
                    </button>

                </form>

            </div>

        </div>
    );
}