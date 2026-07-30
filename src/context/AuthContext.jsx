import { createContext, useContext, useState, useCallback } from "react";
import { isConnected as checkConnected } from "@/api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [authOpen, setAuthOpen] = useState(false);
    const [connected, setConnected] = useState(checkConnected());

    const openAuthModal  = useCallback(() => setAuthOpen(true),  []);
    const closeAuthModal = useCallback(() => setAuthOpen(false), []);

    const refreshConnected = useCallback(() => {
        setConnected(checkConnected());
    }, []);

    return (
        <AuthContext.Provider value={{ authOpen, openAuthModal, closeAuthModal, connected, refreshConnected }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}