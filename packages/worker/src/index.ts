import { Hono } from "hono";
import { cors } from "hono/cors";
import { admin } from "./routes/admin";
import { packets } from "./routes/packets";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

app.route("/api/admin", admin);
app.route("/api/packets", packets);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

export default app;
