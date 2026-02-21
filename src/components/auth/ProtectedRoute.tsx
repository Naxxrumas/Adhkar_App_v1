import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
