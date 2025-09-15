import { createHmac } from "node:crypto";
export const hmacSha256 = (secret: string, payload: string) =>
  createHmac("sha256", secret).update(payload).digest("hex");
