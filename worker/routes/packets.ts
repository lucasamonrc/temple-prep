import { Hono } from "hono";
import { eq, and, desc, sql } from "drizzle-orm";
import { packets, goals, escorts, reflections, journalEntries, todos } from "../db/schema";
import type { AppBindings } from "../types";

const packetsRouter = new Hono<AppBindings>();

// Lookup packet by first name + last name + student PIN
packetsRouter.post("/lookup", async (c) => {
  const db = c.get("db");
  const body = await c.req.json<{
    first_name: string;
    last_name: string;
    pin: string;
  }>();

  const fullName = `${body.first_name.trim()} ${body.last_name.trim()}`;

  const [packet] = await db
    .select({ id: packets.id })
    .from(packets)
    .where(
      and(
        sql`lower(${packets.student_name}) = lower(${fullName})`,
        eq(packets.student_pin, body.pin),
      ),
    );

  if (!packet) {
    return c.json({ error: "No packet found. Please check your name and PIN." }, 404);
  }

  return c.json({ uuid: packet.id });
});

// Get full packet data (public - student view)
packetsRouter.get("/:uuid", async (c) => {
  const db = c.get("db");
  const uuid = c.req.param("uuid");

  const [packet] = await db.select().from(packets).where(eq(packets.id, uuid));

  if (!packet) {
    return c.json({ error: "Packet not found" }, 404);
  }

  const [packetGoals, escort, packetReflections, journal, packetTodos] = await Promise.all([
    db.select().from(goals).where(eq(goals.packet_id, uuid)),
    db.select().from(escorts).where(eq(escorts.packet_id, uuid)).then((rows) => rows[0] ?? null),
    db.select().from(reflections).where(eq(reflections.packet_id, uuid)),
    db.select().from(journalEntries).where(eq(journalEntries.packet_id, uuid)).orderBy(desc(journalEntries.entry_date)),
    db.select().from(todos).where(eq(todos.packet_id, uuid)).orderBy(todos.sort_order),
  ]);

  return c.json({
    ...packet,
    goals: packetGoals,
    escort,
    reflections: packetReflections,
    journal,
    todos: packetTodos,
  });
});

// Update a goal
packetsRouter.put("/:uuid/goals/:goalType", async (c) => {
  const db = c.get("db");
  const uuid = c.req.param("uuid");
  const goalType = c.req.param("goalType");
  const body = await c.req.json<{
    scheduled_date?: string;
    completed?: boolean;
    notes?: string;
  }>();

  const updates: Record<string, unknown> = {};

  if (body.scheduled_date !== undefined) {
    updates.scheduled_date = body.scheduled_date;
  }
  if (body.completed !== undefined) {
    updates.completed = body.completed ? 1 : 0;
  }
  if (body.notes !== undefined) {
    updates.notes = body.notes;
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  await db
    .update(goals)
    .set(updates)
    .where(and(eq(goals.packet_id, uuid), eq(goals.goal_type, goalType)));

  return c.json({ success: true });
});

// Update escort info
packetsRouter.put("/:uuid/escort", async (c) => {
  const db = c.get("db");
  const uuid = c.req.param("uuid");
  const body = await c.req.json<{
    name?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  }>();

  await db
    .update(escorts)
    .set({
      name: body.name || null,
      phone: body.phone || null,
      email: body.email || null,
      relationship: body.relationship || null,
    })
    .where(eq(escorts.packet_id, uuid));

  return c.json({ success: true });
});

// Upsert reflection response
packetsRouter.put("/:uuid/reflections/:key", async (c) => {
  const db = c.get("db");
  const uuid = c.req.param("uuid");
  const key = c.req.param("key");
  const body = await c.req.json<{ response: string }>();

  await db
    .update(reflections)
    .set({
      response: body.response,
      updated_at: sql`datetime('now')`,
    })
    .where(and(eq(reflections.packet_id, uuid), eq(reflections.question_key, key)));

  return c.json({ success: true });
});

// Create journal entry
packetsRouter.post("/:uuid/journal", async (c) => {
  const db = c.get("db");
  const uuid = c.req.param("uuid");
  const body = await c.req.json<{ entry_date?: string; content: string }>();

  const result = await db
    .insert(journalEntries)
    .values({
      packet_id: uuid,
      entry_date: body.entry_date || new Date().toISOString().split("T")[0],
      content: body.content,
    })
    .returning({ id: journalEntries.id });

  return c.json({ id: result[0].id }, 201);
});

// Update journal entry
packetsRouter.put("/:uuid/journal/:id", async (c) => {
  const db = c.get("db");
  const id = Number(c.req.param("id"));
  const body = await c.req.json<{ entry_date?: string; content?: string }>();

  const updates: Record<string, unknown> = {
    updated_at: sql`datetime('now')`,
  };

  if (body.entry_date !== undefined) {
    updates.entry_date = body.entry_date;
  }
  if (body.content !== undefined) {
    updates.content = body.content;
  }

  await db.update(journalEntries).set(updates).where(eq(journalEntries.id, id));

  return c.json({ success: true });
});

// Delete journal entry
packetsRouter.delete("/:uuid/journal/:id", async (c) => {
  const db = c.get("db");
  const id = Number(c.req.param("id"));
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
  return c.json({ success: true });
});

// Toggle todo completion
packetsRouter.put("/:uuid/todos/:id", async (c) => {
  const db = c.get("db");
  const id = Number(c.req.param("id"));
  const body = await c.req.json<{ completed: boolean }>();

  await db
    .update(todos)
    .set({
      completed: body.completed ? 1 : 0,
      completed_at: body.completed ? new Date().toISOString() : null,
    })
    .where(eq(todos.id, id));

  return c.json({ success: true });
});

export { packetsRouter as packets };
