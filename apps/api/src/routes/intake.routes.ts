import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db, addAudit } from "../storage/memory";
import { Lead, Appointment } from "@smart/shared";
import { MockProviderAdapter } from "../adapters/mockProvider";

const r = Router();
const adapter = new MockProviderAdapter();

r.post("/leads", (req, res) => {
  const { name, email, phone, address } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name required" });
  const lead: Lead = { id: randomUUID(), name, email, phone, address, createdAt: new Date().toISOString() };
  db.leads.set(lead.id, lead);
  addAudit("lead.created", { lead });
  adapter.createLead(lead).then(({ id }) => {
    const stored = db.leads.get(lead.id); if (stored) stored.providerId = id;
    addAudit("provider.lead.created", { leadId: lead.id, providerId: id });
  });
  res.json({ ok: true, lead });
});

r.post("/appointments", async (req, res) => {
  const { leadId, startsAt, endsAt, notes, status } = req.body ?? {};
  if (!leadId || !startsAt || !endsAt) return res.status(400).json({ error: "leadId, startsAt, endsAt required" });
  if (!db.leads.get(leadId)) return res.status(404).json({ error: "lead not found" });
  const appt: Appointment = { id: randomUUID(), leadId, startsAt, endsAt, notes, status: status || "scheduled", updatedAt: new Date().toISOString() };
  db.appts.set(appt.id, appt);
  addAudit("appt.upserted", { appt });
  const resp = await adapter.upsertAppointment(appt);
  appt.providerId = resp.id;
  addAudit("provider.appt.upserted", { apptId: appt.id, providerId: resp.id });
  await adapter.emitWebhook({ type: "provider.appt.status", data: { apptId: appt.id, status: appt.status } });
  res.json({ ok: true, appointment: appt });
});

export default r;
