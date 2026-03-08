import { Hono } from "hono";
import { createDb } from "./db";
import { admin } from "./routes/admin";
import { packets } from "./routes/packets";
import type { AppBindings } from "./types";

const app = new Hono<AppBindings>();

// Inject Drizzle instance into context for all routes
app.use("*", async (c, next) => {
  c.set("db", createDb(c.env.DB));
  await next();
});

app.route("/api/admin", admin);
app.route("/api/packets", packets);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

export default app;
