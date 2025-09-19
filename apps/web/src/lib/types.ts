export interface Lead {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  providerId: string;
}
export interface Appointment {
  id: string;
  leadId: string;
  startsAt: string;
  endsAt: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
  updatedAt: string;
  providerId: string;
}
export interface Artifact {
  id: string;
  leadId: string;
  type: "photo" | "note" | "pdf";
  name: string;
  url: string;
  createdAt: string;
  providerRef: string;
}
export interface StateSnapshot {
  leads: Lead[];
  appts: Appointment[];
  artifacts: Artifact[];
}
