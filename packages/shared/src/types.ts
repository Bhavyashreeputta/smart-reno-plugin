export type Lead = {
  id: string; name: string; email?: string; phone?: string; address?: string;
  providerId?: string; createdAt: string;
};

export type Appointment = {
  id: string; leadId: string; startsAt: string; endsAt: string; notes?: string;
  providerId?: string; status: "scheduled" | "rescheduled" | "cancelled" | "completed";
  updatedAt: string;
};

export type Artifact = {
  id: string; leadId: string; type: "photo" | "note" | "pdf"; name: string; url: string;
  providerRef?: string; createdAt: string;
};

export type AuditLog = { id: string; type: string; ts: string; payload: any; };
