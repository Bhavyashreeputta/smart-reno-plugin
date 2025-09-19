export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
        ...opts
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}