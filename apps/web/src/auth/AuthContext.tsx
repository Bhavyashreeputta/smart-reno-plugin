/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

type User = { id: string; email: string; name?: string } | null;

type Ctx = {
    user: User;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const r = await api("/auth/me"); setUser(r.user); }
            catch { setUser(null); }
            finally { setLoading(false); }
        })();
    }, []);

    const login = async (email: string, password: string) => {
        await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
        const r = await api("/auth/me"); setUser(r.user);
    };
    const register = async (email: string, password: string, name?: string) => {
        await api("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) });
    };
    const logout = async () => { await api("/auth/logout", { method: "POST" }); setUser(null); };

    return <AuthCtx.Provider value={{ user, loading, login, logout, register }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    const v = useContext(AuthCtx);
    if (!v) throw new Error("useAuth must be used within AuthProvider");
    return v;
}