import { Router } from "express";
import { db, addAudit } from "../storage/memory";
import { MockProviderAdapter } from "../adapters/mockProvider";
const r = Router(); const adapter = new MockProviderAdapter();

r.post("/", (req, res) => {
  const signature = req.header("x-sr-signature") || "";
  const raw = req.body instanceof Buffer ? req.body.toString("utf8") : "";
  if (!adapter.verifyWebhookSignature(raw, signature)) {
    addAudit("webhook.invalid_signature", { signature });
    return res.status(401).json({ error: "invalid signature" });
  }
  const event = JSON.parse(raw);
  addAudit("webhook.received", event);
  if (event.type === "provider.appt.status") {
    const appt = [...db.appts.values()].find(a => a.id === event.data.apptId);
    if (appt) { appt.status = event.data.status; appt.updatedAt = new Date().toISOString();
      addAudit("appt.status.synced", { apptId: appt.id, status: appt.status }); }
  }
  res.json({ ok: true });
});
export default r;
