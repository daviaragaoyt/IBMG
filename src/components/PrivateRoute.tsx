import React from 'react'; // <--- Adicione isso
import { Navigate } from 'react-router-dom';

// Troque JSX.Element por React.ReactNode
export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {

    const savedUser = localStorage.getItem('ekklesia_staff_user');

    let user = null;
    if (savedUser) {
        try {
            user = JSON.parse(savedUser);
        } catch (e) {
            user = null;
        }
    }

    if (!user || user.role !== 'STAFF') {
        return <Navigate to="/ekklesia/admin" replace />;
    }

    return children;
};