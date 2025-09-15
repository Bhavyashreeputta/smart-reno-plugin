import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [health, setHealth] = useState<unknown>(null);
  const [state, setState] = useState<unknown>(null);

  useEffect(() => {
    fetch(`${API}/healthz`).then(r => r.json()).then(setHealth);
    fetch(`${API}/_debug/state`).then(r => r.json()).then(setState);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-2xl font-bold mb-4">SmartReno — Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2">API Health</h2>
          <pre className="text-sm">{JSON.stringify(health, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2">Current State</h2>
          <pre className="text-sm max-h-80 overflow-auto">{JSON.stringify(state, null, 2)}</pre>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 mt-4">
        <h2 className="font-semibold mb-2">Quick Lead</h2>
        <button
          className="px-3 py-2 bg-black text-white rounded-lg"
          onClick={async () => {
            await fetch(`${API}/intake/leads`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "Jane Homeowner", email: "jane@example.com" })
            });
            await fetch(`${API}/_debug/state`).then(r => r.json()).then(setState);
            alert("Lead created");
          }}
        >
          Create Demo Lead
        </button>
      </div>
    </div>
  );
}
