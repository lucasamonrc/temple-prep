import { Hono } from "hono";
import type { Env } from "../types";

const packets = new Hono<{ Bindings: Env }>();

// Get full packet data (public - student view)
packets.get("/:uuid", async (c) => {
  const uuid = c.req.param("uuid");

  const packet = await c.env.DB.prepare("SELECT * FROM packets WHERE id = ?")
    .bind(uuid)
    .first();

  if (!packet) {
    return c.json({ error: "Packet not found" }, 404);
  }

  const [goals, escort, reflections, journal, todos] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM goals WHERE packet_id = ?").bind(uuid).all(),
    c.env.DB.prepare("SELECT * FROM escorts WHERE packet_id = ?").bind(uuid).first(),
    c.env.DB.prepare("SELECT * FROM reflections WHERE packet_id = ?").bind(uuid).all(),
    c.env.DB.prepare("SELECT * FROM journal_entries WHERE packet_id = ? ORDER BY entry_date DESC").bind(uuid).all(),
    c.env.DB.prepare("SELECT * FROM todos WHERE packet_id = ? ORDER BY sort_order").bind(uuid).all(),
  ]);

  return c.json({
    ...packet,
    goals: goals.results,
    escort,
    reflections: reflections.results,
    journal: journal.results,
    todos: todos.results,
  });
});

// Update a goal
packets.put("/:uuid/goals/:goalType", async (c) => {
  const uuid = c.req.param("uuid");
  const goalType = c.req.param("goalType");
  const body = await c.req.json<{
    scheduled_date?: string;
    completed?: boolean;
    notes?: string;
  }>();

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.scheduled_date !== undefined) {
    fields.push("scheduled_date = ?");
    values.push(body.scheduled_date);
  }
  if (body.completed !== undefined) {
    fields.push("completed = ?");
    values.push(body.completed ? 1 : 0);
  }
  if (body.notes !== undefined) {
    fields.push("notes = ?");
    values.push(body.notes);
  }

  if (fields.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  values.push(uuid, goalType);

  await c.env.DB.prepare(
    `UPDATE goals SET ${fields.join(", ")} WHERE packet_id = ? AND goal_type = ?`,
  )
    .bind(...values)
    .run();

  return c.json({ success: true });
});

// Update escort info
packets.put("/:uuid/escort", async (c) => {
  const uuid = c.req.param("uuid");
  const body = await c.req.json<{
    name?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  }>();

  await c.env.DB.prepare(
    `UPDATE escorts SET name = ?, phone = ?, email = ?, relationship = ? WHERE packet_id = ?`,
  )
    .bind(
      body.name || null,
      body.phone || null,
      body.email || null,
      body.relationship || null,
      uuid,
    )
    .run();

  return c.json({ success: true });
});

// Upsert reflection response
packets.put("/:uuid/reflections/:key", async (c) => {
  const uuid = c.req.param("uuid");
  const key = c.req.param("key");
  const body = await c.req.json<{ response: string }>();

  await c.env.DB.prepare(
    `UPDATE reflections SET response = ?, updated_at = datetime('now') WHERE packet_id = ? AND question_key = ?`,
  )
    .bind(body.response, uuid, key)
    .run();

  return c.json({ success: true });
});

// Create journal entry
packets.post("/:uuid/journal", async (c) => {
  const uuid = c.req.param("uuid");
  const body = await c.req.json<{ entry_date?: string; content: string }>();

  const result = await c.env.DB.prepare(
    `INSERT INTO journal_entries (packet_id, entry_date, content) VALUES (?, ?, ?)`,
  )
    .bind(uuid, body.entry_date || new Date().toISOString().split("T")[0], body.content)
    .run();

  return c.json({ id: result.meta.last_row_id }, 201);
});

// Update journal entry
packets.put("/:uuid/journal/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ entry_date?: string; content?: string }>();

  const fields: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];

  if (body.entry_date !== undefined) {
    fields.push("entry_date = ?");
    values.push(body.entry_date);
  }
  if (body.content !== undefined) {
    fields.push("content = ?");
    values.push(body.content);
  }

  values.push(id);

  await c.env.DB.prepare(
    `UPDATE journal_entries SET ${fields.join(", ")} WHERE id = ?`,
  )
    .bind(...values)
    .run();

  return c.json({ success: true });
});

// Delete journal entry
packets.delete("/:uuid/journal/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM journal_entries WHERE id = ?")
    .bind(id)
    .run();
  return c.json({ success: true });
});

// Toggle todo completion
packets.put("/:uuid/todos/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ completed: boolean }>();

  await c.env.DB.prepare(
    `UPDATE todos SET completed = ?, completed_at = ? WHERE id = ?`,
  )
    .bind(
      body.completed ? 1 : 0,
      body.completed ? new Date().toISOString() : null,
      id,
    )
    .run();

  return c.json({ success: true });
});

export { packets };
