import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-6">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}