import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import type { StateSnapshot, Lead, Appointment } from "../lib/types";

const fmtDT = (iso: string) =>
    new Date(iso).toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

export default function Appointments() {
    const [state, setState] = useState<StateSnapshot | null>(null);
    const [leadId, setLeadId] = useState<string>("");
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    const load = async () => {
        const s = await api("/_debug/state");
        setState(s);
        if (!leadId && s.leads?.length) setLeadId(s.leads[0].id);
    };
    useEffect(() => { load(); }, []); // eslint-disable-line

    const leadsById = useMemo(() => {
        const map = new Map<string, Lead>();
        (state?.leads ?? []).forEach(l => map.set(l.id, l));
        return map;
    }, [state]);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        await api("/intake/appointments", {
            method: "POST",
            body: JSON.stringify({
                leadId,
                startsAt: new Date(start).toISOString(),
                endsAt: new Date(end).toISOString(),
                notes,
            }),
        });
        setNotes("");
        await load();
    };

    const appts: Appointment[] = state?.appts ?? [];
    const leads: Lead[] = state?.leads ?? [];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>New appointment</CardHeader>
                <CardBody>
                    <form
                        onSubmit={create}
                        className="grid gap-3 md:grid-cols-[minmax(12rem,1fr),minmax(12rem,1fr),minmax(12rem,1fr),1fr,auto]"
                    >
                        <select
                            className="rounded-2xl border border-slate-300 px-3 py-2 text-sm cursor-pointer bg-white"
                            value={leadId}
                            onChange={e => setLeadId(e.target.value)}
                        >
                            {leads.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                        <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
                        <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
                        <Input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
                        <Button type="submit" className="justify-self-start md:px-6">Create</Button>
                    </form>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>Appointments</CardHeader>
                <CardBody>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="min-w-full table-fixed text-sm">
                            <colgroup>{["w-[22%]", "w-[18%]", "w-[18%]", "", "w-[120px]"].map((cls, i) => (<col key={i} className={cls || undefined} />))}</colgroup>


                            <thead className="bg-slate-50">
                                <tr className="text-left">
                                    <th className="px-4 py-2 font-semibold">Lead</th>
                                    <th className="px-4 py-2 font-semibold">Starts</th>
                                    <th className="px-4 py-2 font-semibold">Ends</th>
                                    <th className="px-4 py-2 font-semibold">Notes</th>
                                    <th className="px-4 py-2 font-semibold">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200">
                                {appts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            No appointments yet
                                        </td>
                                    </tr>
                                )}

                                {appts.map(a => {
                                    const leadName = leadsById.get(a.leadId)?.name ?? "—";
                                    const badge =
                                        a.status === "completed"
                                            ? "bg-emerald-600"
                                            : a.status === "cancelled"
                                                ? "bg-rose-600"
                                                : "bg-slate-900";
                                    return (
                                        <tr key={a.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2">{leadName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{fmtDT(a.startsAt)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{fmtDT(a.endsAt)}</td>
                                            <td className="px-4 py-2 truncate max-w-[420px]">{a.notes || "—"}</td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-md text-white ${badge}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
