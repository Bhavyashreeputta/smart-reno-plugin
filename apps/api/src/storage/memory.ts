import { randomUUID } from "node:crypto";
import { Lead, Appointment, Artifact, AuditLog } from "@smart/shared";

export const db = {
  leads: new Map<string, Lead>(),
  appts: new Map<string, Appointment>(),
  artifacts: new Map<string, Artifact>(),
  audit: [] as AuditLog[]
};
export const addAudit = (type: string, payload: any) =>
  db.audit.push({ id: randomUUID(), type, ts: new Date().toISOString(), payload });
