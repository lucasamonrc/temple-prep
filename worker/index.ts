import { Hono } from "hono";
import { admin } from "./routes/admin";
import { packets } from "./routes/packets";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.route("/api/admin", admin);
app.route("/api/packets", packets);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

export default app;
