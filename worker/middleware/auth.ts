import { createMiddleware } from "hono/factory";
import type { Env } from "../types";

export const adminAuth = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const pin = authHeader.slice(7);
    if (pin !== c.env.ADMIN_PIN) {
      return c.json({ error: "Invalid PIN" }, 401);
    }

    await next();
  },
);
