import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import intake from "./routes/intake.routes";
import artifacts from "./routes/artifacts.routes";
import webhooks from "./routes/webhooks.routes";
import auth from "./routes/auth.routes";
import { db } from "./storage/memory";
import { authRequired } from "./middleware/auth";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use("/webhooks/provider", bodyParser.raw({ type: "*/*" }));

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","x-sr-signature"],
  optionsSuccessStatus: 204
}));

app.use(cookieParser());
app.use(bodyParser.json());

app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.use("/auth", auth);
app.use("/webhooks/provider", webhooks);

app.use(authRequired);
app.use("/intake", intake);
app.use("/artifacts", artifacts);

app.get("/_debug/state", (_req, res) => res.json({
leads: [...db.leads.values()], appts: [...db.appts.values()], artifacts: [...db.artifacts.values()]
}));
app.get("/_debug/audit", (_req, res) => res.json(db.audit));


app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));