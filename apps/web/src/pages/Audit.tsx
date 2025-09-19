import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardBody} from "../components/ui/Card";
import Button from "../components/ui/Button";

type AuditLog = { id: string; type: string; ts: string; payload: unknown };

export default function Audit() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const load = async () => setItems(await api("/_debug/audit"));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Audit</h1>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      <Card>
        <CardBody>
          <div className="space-y-2 text-sm">
            {items.slice().reverse().map(e => (
              <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-slate-700">
                  {e.type}
                  <span className="text-slate-400"> — {new Date(e.ts).toLocaleString()}</span>
                </div>
                <pre className="text-xs overflow-auto">{JSON.stringify(e.payload, null, 2)}</pre>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
