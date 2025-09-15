import { randomUUID } from "node:crypto";
import { Lead, Appointment, Artifact } from "@smart/shared";
import { ProviderAdapter } from "./provider";
import { hmacSha256 } from "../utils/sign";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "dev_secret";
const WEBHOOK_URL = "http://localhost:3000/webhooks/provider";

export class MockProviderAdapter implements ProviderAdapter {
  async createLead(_lead: Lead) { return { id: "prov_lead_" + randomUUID() }; }
  async upsertAppointment(appt: Appointment) { return { id: "prov_appt_" + randomUUID(), status: appt.status }; }
  async linkArtifact(_artifact: Artifact) { return { ref: "prov_art_" + randomUUID() }; }
  verifyWebhookSignature(rawBody: string, signature: string) {
    return hmacSha256(WEBHOOK_SECRET, rawBody) === signature;
  }
  async emitWebhook(event: { type: string; data: any }) {
    const body = JSON.stringify(event);
    const sig = hmacSha256(WEBHOOK_SECRET, body);
    await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json", "x-sr-signature": sig }, body });
  }
}
