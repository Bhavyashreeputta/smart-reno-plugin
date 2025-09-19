import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import type { StateSnapshot, Lead } from "../lib/types";

export default function Leads() {
    const [state, setState] = useState<StateSnapshot | null>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const load = async () => {
        const data = await api("/_debug/state");
        setState(data);
    };
    useEffect(() => { load(); }, []);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        await api("/intake/leads", {
            method: "POST",
            body: JSON.stringify({ name, email }),
        });
        setName(""); setEmail(""); await load();
    };

    const leads: Lead[] = state?.leads ?? [];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>New lead</CardHeader>
                <CardBody>
                    <form
                        onSubmit={create}
                        className="grid gap-3 md:grid-cols-[1fr,1fr,auto]"
                    >
                        <Input
                            placeholder="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <Input
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                        />
                        <Button type="submit" className="justify-self-start md:px-6">
                            Create
                        </Button>
                    </form>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>Leads</CardHeader>
                <CardBody>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="min-w-full table-fixed text-sm">
                            <colgroup>{["w-[26%]", "w-[30%]", ""].map((cls, i) => (<col key={i} className={cls || undefined} />))}</colgroup>

                            <thead className="bg-slate-50">
                                <tr className="text-left">
                                    <th className="px-4 py-2 font-semibold">Name</th>
                                    <th className="px-4 py-2 font-semibold">Email</th>
                                    <th className="px-4 py-2 font-semibold">ID</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200">
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                                            No leads yet
                                        </td>
                                    </tr>
                                )}

                                {leads.map(l => (
                                    <tr key={l.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2">{l.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap truncate">
                                            {l.email}
                                        </td>
                                        <td className="px-4 py-2 font-mono text-xs text-slate-500 truncate">
                                            {l.id}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}