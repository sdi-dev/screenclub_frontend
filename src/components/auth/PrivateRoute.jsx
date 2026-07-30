// src/components/auth/PrivateRoute.jsx
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext.jsx";

function PrivateRoute({ children }) {
    const { connected, openAuthModal } = useAuth();

    useEffect(() => {
        if (!connected) openAuthModal();
    }, [connected, openAuthModal]);

    if (!connected) return <Navigate to="/" replace />;

    return children;
}

export default PrivateRoute;