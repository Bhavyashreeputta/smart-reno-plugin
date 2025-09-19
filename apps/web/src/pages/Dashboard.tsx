/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import type { StateSnapshot, Lead, Appointment, Artifact } from "../lib/types";
import { Users as UsersIcon, CalendarDays, Paperclip, Plus, Clock } from "lucide-react";

const fmtDT = (iso: string) =>
  new Date(iso).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });

type AuditItem = { id?: string; type?: string; ts?: string; [k: string]: unknown };

export default function Dashboard() {
  const [state, setState] = useState<StateSnapshot | null>(null);
  const [audit, setAudit] = useState<AuditItem[]>([]);

  const load = async () => {
    const s = await api("/_debug/state");
    setState(s);
    try {
      const a = await api("/_debug/audit");
      setAudit(a.slice(-10).reverse());
    } catch {
      setAudit([]);
    }
  };
  useEffect(() => { load(); }, []); 

  const leads: Lead[] = state?.leads ?? [];
  const appts: Appointment[] = state?.appts ?? [];
  const artifacts: Artifact[] = state?.artifacts ?? [];

  const leadsById = useMemo(() => {
    const m = new Map<string, Lead>();
    leads.forEach(l => m.set(l.id, l));
    return m;
  }, [leads]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...appts]
      .filter(a => new Date(a.endsAt).getTime() >= now)
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
      .slice(0, 4);
  }, [appts]);

  const createDemoLead = async () => {
    await api("/intake/leads", { method: "POST", body: JSON.stringify({ name: "Jane Homeowner", email: "jane@example.com" }) });
    await load();
  };
  const createDemoAppt = async () => {
    const leadId = leads[0]?.id; if (!leadId) return;
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await api("/intake/appointments", { method: "POST", body: JSON.stringify({ leadId, startsAt: start.toISOString(), endsAt: end.toISOString(), notes: "Estimator visit" }) });
    await load();
  };
  const linkDemoArtifact = async () => {
    const leadId = leads[0]?.id; if (!leadId) return;
    await api("/artifacts/link", { method: "POST", body: JSON.stringify({ leadId, type: "photo", name: "kitchen-before.jpg", url: "https://files.smartreno.local/tmp/demo.jpg?sig=expiring" }) });
    await load();
  };

  const StatTile = ({ icon, label, count }: { icon: React.ReactNode; label: string; count: number | string }) => (
    <Card className="h-full">
      <CardBody>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white grid place-items-center">{icon}</div>
          <div>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="text-3xl font-semibold leading-tight">{count}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const StatusPill = ({ status }: { status: Appointment["status"] }) => {
    const cls = status === "completed" ? "bg-emerald-600"
              : status === "cancelled" ? "bg-rose-600"
              : "bg-slate-900";
    return <span className={`inline-flex px-2 py-1 text-xs rounded-md text-white ${cls}`}>{status}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile icon={<UsersIcon size={18} />} label="Leads" count={leads.length} />
        <StatTile icon={<CalendarDays size={18} />} label="Appointments" count={appts.length} />
        <StatTile icon={<Paperclip size={18} />} label="Artifacts" count={artifacts.length} />
      </div>

      <Card>
        <CardHeader>Actions</CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            <Button onClick={createDemoLead} className="px-4">
              <Plus size={16} className="mr-2" /> Create Demo Lead
            </Button>
            <Button onClick={createDemoAppt} className="px-4" variant="secondary">
              <CalendarDays size={16} className="mr-2" /> Create Appointment
            </Button>
            <Button onClick={linkDemoArtifact} className="px-4" variant="secondary">
              <Paperclip size={16} className="mr-2" /> Link Artifact
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>Upcoming appointments</CardHeader>
          <CardBody>
            {upcoming.length === 0 ? (
              <div className="text-sm text-slate-500">No upcoming appointments.</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {upcoming.map(a => {
                  const lead = leadsById.get(a.leadId);
                  return (
                    <li key={a.id} className="py-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-slate-100 grid place-items-center">
                        <Clock size={15} className="text-slate-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{lead?.name ?? "—"}</div>
                        <div className="text-sm text-slate-500 truncate">
                          {fmtDT(a.startsAt)} &nbsp;–&nbsp; {fmtDT(a.endsAt)} {a.notes ? `• ${a.notes}` : ""}
                        </div>
                      </div>
                      <StatusPill status={a.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Recent activity</CardHeader>
          <CardBody>
            {audit.length === 0 ? (
              <div className="text-sm text-slate-500">No recent events.</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {audit.slice(0, 8).map((e, i) => (
                  <li key={e.id ?? i} className="py-3 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-slate-400 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{e.type?.replace(/_/g, " ") ?? "event"}</div>
                      <div className="text-sm text-slate-500 truncate">{e.ts ? fmtDT(e.ts) : ""}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
