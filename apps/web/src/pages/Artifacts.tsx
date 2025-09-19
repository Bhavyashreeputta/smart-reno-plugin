import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import Button from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import type { StateSnapshot, Lead, Artifact } from "../lib/types";

function sniffTypeFromMime(mime: string): Artifact["type"] {
    if (mime?.startsWith("image/")) return "photo";
    if (mime === "application/pdf") return "pdf";
    return "note";
}

function fileNameFromUrl(u: string): string {
    try {
        const url = new URL(u, window.location.origin);
        const last = url.pathname.split("/").pop() ?? "";
        return decodeURIComponent(last);
    } catch {
        return "";
    }
}

export default function Artifacts() {
    const [state, setState] = useState<StateSnapshot | null>(null);

    const [leadId, setLeadId] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [dataUrl, setDataUrl] = useState<string>(""); // prototype-only
    const [type, setType] = useState<Artifact["type"]>("photo");

    const load = async () => {
        const s = await api("/_debug/state");
        setState(s);
        if (!leadId && s.leads?.length) setLeadId(s.leads[0].id);
    };
    useEffect(() => { load(); }, []); // eslint-disable-line

    const leadsById = useMemo(() => {
        const m = new Map<string, Lead>();
        (state?.leads ?? []).forEach((l) => m.set(l.id, l));
        return m;
    }, [state]);

    // Pick file → infer type + read as data URL (prototype)
    const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
        setDataUrl("");
        if (f) {
            setType(sniffTypeFromMime(f.type));
            const reader = new FileReader();
            reader.onload = () => setDataUrl(String(reader.result || ""));
            reader.readAsDataURL(f);
        }
    };

    const upload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !dataUrl) return alert("Pick a file first");

        // Name = file.name (as requested)
        await api("/artifacts/link", {
            method: "POST",
            body: JSON.stringify({
                leadId,
                type,
                name: file.name,
                url: dataUrl, // prototype: embed; swap to real upload endpoint later
            }),
        });

        setFile(null);
        setDataUrl("");
        await load();
    };

    const artifacts: Artifact[] = state?.artifacts ?? [];
    const leads: Lead[] = state?.leads ?? [];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>Upload artifact (prototype)</CardHeader>
                <CardBody>
                    <form
                        onSubmit={upload}
                        className="grid gap-3 md:grid-cols-[minmax(12rem,1fr),minmax(10rem,1fr),1fr,auto]"
                    >
                        <select
                            className="rounded-2xl border border-slate-300 px-3 py-2 text-sm cursor-pointer bg-white"
                            value={leadId}
                            onChange={(e) => setLeadId(e.target.value)}
                        >
                            {leads.map((l) => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>

                        <select
                            className="rounded-2xl border border-slate-300 px-3 py-2 text-sm cursor-pointer bg-white"
                            value={type}
                            onChange={(e) => setType(e.target.value as Artifact["type"])}
                        >
                            <option value="photo">photo</option>
                            <option value="pdf">pdf</option>
                            <option value="note">note</option>
                        </select>

                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="rounded-2xl border border-slate-300 px-3 py-2 text-sm cursor-pointer bg-white"
                            onChange={onPickFile}
                        />

                        <Button type="submit" className="justify-self-start md:px-6">
                            Upload
                        </Button>
                    </form>

                    {file && (
                        <div className="mt-2 text-xs text-slate-500">
                            {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card>
                <CardHeader>Artifacts</CardHeader>
                <CardBody>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="min-w-full table-fixed text-sm">
                            <colgroup>{["w-[22%]", "w-[10%]", "w-[28%]", ""].map((cls, i) => (<col key={i} className={cls || undefined} />))}</colgroup>

                            <thead className="bg-slate-50">
                                <tr className="text-left">
                                    <th className="px-4 py-2 font-semibold">Lead</th>
                                    <th className="px-4 py-2 font-semibold">Type</th>
                                    <th className="px-4 py-2 font-semibold">Name</th>
                                    <th className="px-4 py-2 font-semibold">Preview / URL</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200">
                                {artifacts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                            No artifacts yet
                                        </td>
                                    </tr>
                                )}

                                {artifacts.map((a) => {
                                    const displayName = a.name || fileNameFromUrl(a.url) || "artifact";
                                    return (
                                        <tr key={a.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2">{leadsById.get(a.leadId)?.name ?? "—"}</td>
                                            <td className="px-4 py-2">{a.type}</td>
                                            <td className="px-4 py-2 truncate">{displayName}</td>
                                            <td className="px-4 py-2">
                                                {a.type === "photo" && a.url.startsWith("data:image") ? (
                                                    <img
                                                        src={a.url}
                                                        alt={displayName}
                                                        className="h-12 w-12 rounded object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <a
                                                        className="underline text-slate-600 break-all"
                                                        href={a.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {a.url}
                                                    </a>
                                                )}
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
