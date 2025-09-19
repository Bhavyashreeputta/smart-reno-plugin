import { NavLink } from "react-router-dom";
import { Layers, CalendarDays, Image as ImageIcon, FileText, Home, LogOut } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";
import { useAuth } from "../auth/AuthContext";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                clsx(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                    "cursor-pointer hover:bg-slate-100",
                    isActive && "bg-slate-900 text-white hover:bg-slate-900"
                )
            }
        >
            {children}
        </NavLink>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-[100] bg-white border-b border-slate-200 shadow-sm">
                <div className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xl font-bold"><Layers size={20} /> SmartReno</div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-600">{user?.email}</span>
                        <Button variant="outline" onClick={logout}><LogOut size={16} /> Logout</Button>
                    </div>
                </div>
            </header>

            <div className="flex-1">
                <div className="mx-auto max-w-7xl grid grid-cols-12 gap-4 px-4 pt-8 pb-8">
                    <aside className="col-span-12 md:col-span-3 lg:col-span-2">
                        <nav className="flex flex-col gap-1">
                            <NavItem to="/"><Home size={16} /> Dashboard</NavItem>
                            <NavItem to="/leads"><FileText size={16} /> Leads</NavItem>
                            <NavItem to="/appointments"><CalendarDays size={16} /> Appointments</NavItem>
                            <NavItem to="/artifacts"><ImageIcon size={16} /> Artifacts</NavItem>
                            <NavItem to="/audit"><FileText size={16} /> Audit</NavItem>
                        </nav>
                    </aside>

                    <main className="col-span-12 md:col-span-9 lg:col-span-10 min-h-[calc(100vh-8rem)]">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
