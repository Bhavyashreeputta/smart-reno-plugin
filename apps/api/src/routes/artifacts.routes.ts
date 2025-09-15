import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db, addAudit } from "../storage/memory";
import { Artifact } from "@smart/shared";
import { MockProviderAdapter } from "../adapters/mockProvider";
const r = Router(); const adapter = new MockProviderAdapter();

r.post("/link", async (req, res) => {
  const { leadId, type, name, url } = req.body ?? {};
  if (!leadId || !type || !name || !url) return res.status(400).json({ error: "leadId, type, name, url required" });
  if (!db.leads.get(leadId)) return res.status(404).json({ error: "lead not found" });
  const art: Artifact = { id: randomUUID(), leadId, type, name, url, createdAt: new Date().toISOString() };
  db.artifacts.set(art.id, art);
  addAudit("artifact.linked", { artifact: art });
  const resp = await adapter.linkArtifact(art); art.providerRef = resp.ref;
  addAudit("provider.artifact.linked", { artifactId: art.id, providerRef: resp.ref });
  res.json({ ok: true, artifact: art });
});
export default r;
