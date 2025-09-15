import { Lead, Appointment, Artifact } from "@smart/shared";

export interface ProviderAdapter {
  createLead(lead: Lead): Promise<{ id: string }>;
  upsertAppointment(appt: Appointment): Promise<{ id: string; status: string }>;
  linkArtifact(artifact: Artifact): Promise<{ ref: string }>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  emitWebhook(event: { type: string; data: any }): Promise<void>;
}
