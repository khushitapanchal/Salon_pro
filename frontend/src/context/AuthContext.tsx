'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch current logged-in user
    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        const token = localStorage.getItem('token');

        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }

    }, []);

    // LOGIN FUNCTION
    const login = async (token: string) => {

        try {

            // Save token
            localStorage.setItem('token', token);

            // Fetch user info
            const response = await api.get('/auth/me');

            setUser(response.data);

            // Redirect based on role
            if (response.data?.role?.toLowerCase() === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('/calendar');
            }

        } catch (error) {

            console.error("Login validation failed:", error);

            localStorage.removeItem('token');
            setUser(null);

            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};