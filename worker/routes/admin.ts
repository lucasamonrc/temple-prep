import { Hono } from "hono";
import { adminAuth } from "../middleware/auth";
import type { Env } from "../types";

const admin = new Hono<{ Bindings: Env }>();

// Login - validate PIN (no middleware on this one)
admin.post("/login", async (c) => {
  const body = await c.req.json<{ pin: string }>();
  if (body.pin === c.env.ADMIN_PIN) {
    return c.json({ success: true });
  }
  return c.json({ error: "Invalid PIN" }, 401);
});

// All other admin routes require auth
admin.use("/*", adminAuth);

// List all packets
admin.get("/packets", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, student_name, created_at, updated_at FROM packets ORDER BY created_at DESC",
  ).all();
  return c.json({ packets: result.results });
});

// Create a new packet
admin.post("/packets", async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO packets (
      id, student_name, testimony, personal_note, congratulations_message,
      temple_name, temple_phone, temple_url,
      bishop_name, bishop_phone, bishop_email,
      exec_secretary_name, exec_secretary_phone, exec_secretary_email,
      ministering_brothers, ministering_sisters,
      instructor_name, instructor_phone, instructor_email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      body.student_name,
      body.testimony || null,
      body.personal_note || null,
      body.congratulations_message || null,
      body.temple_name || "San Antonio Texas Temple",
      body.temple_phone || "(210) 937-5100",
      body.temple_url ||
        "https://www.churchofjesuschrist.org/temples/details/san-antonio-texas-temple?lang=eng",
      body.bishop_name || null,
      body.bishop_phone || null,
      body.bishop_email || null,
      body.exec_secretary_name || null,
      body.exec_secretary_phone || null,
      body.exec_secretary_email || null,
      body.ministering_brothers ? JSON.stringify(body.ministering_brothers) : null,
      body.ministering_sisters ? JSON.stringify(body.ministering_sisters) : null,
      body.instructor_name || null,
      body.instructor_phone || null,
      body.instructor_email || null,
    )
    .run();

  // Seed default goals
  const goalTypes = ["bishop_interview", "stake_interview", "temple_appointment"];
  for (const goalType of goalTypes) {
    await c.env.DB.prepare(
      "INSERT INTO goals (packet_id, goal_type) VALUES (?, ?)",
    )
      .bind(id, goalType)
      .run();
  }

  // Seed default escort row
  await c.env.DB.prepare(
    "INSERT INTO escorts (packet_id) VALUES (?)",
  )
    .bind(id)
    .run();

  // Seed default reflection questions
  const questionKeys = ["ask_lord", "gratitude", "help_needed", "power_sought"];
  for (const key of questionKeys) {
    await c.env.DB.prepare(
      "INSERT INTO reflections (packet_id, question_key) VALUES (?, ?)",
    )
      .bind(id, key)
      .run();
  }

  // Seed default to-do items
  const defaultTodos = [
    { title: "Schedule recommend interview with Bishop", description: "Contact your ward's executive secretary to schedule", category: "interviews", sort_order: 1 },
    { title: "Complete recommend interview with Bishop", description: "Bring a prayerful heart and honest spirit", category: "interviews", sort_order: 2 },
    { title: "Schedule recommend interview with Stake President", description: "Contact the stake executive secretary", category: "interviews", sort_order: 3 },
    { title: "Complete recommend interview with Stake President", description: null, category: "interviews", sort_order: 4 },
    { title: "Schedule temple appointment", description: "Call the San Antonio Temple or visit the website. Mention it is your own endowment.", category: "scheduling", sort_order: 5 },
    { title: "Confirm temple arrival time and details", description: "Find out when to arrive, how long to plan, and what to bring", category: "scheduling", sort_order: 6 },
    { title: "Choose a temple escort", description: "An endowed member of the same sex you trust to accompany you", category: "escort", sort_order: 7 },
    { title: "Confirm escort availability for your temple date", description: null, category: "escort", sort_order: 8 },
    { title: "Purchase temple garments", description: "A few pairs (top + bottom). Consider trying one pair first for fit.", category: "clothing", sort_order: 9 },
    { title: "Purchase white temple clothing", description: "White slacks + white tie (men) or white dress (women)", category: "clothing", sort_order: 10 },
    { title: "Purchase ceremonial clothing", description: "Temple robes, apron, cap/veil, white sash", category: "clothing", sort_order: 11 },
    { title: "Make travel plans to San Antonio", description: "Transportation, lodging if needed, meals", category: "travel", sort_order: 12 },
    { title: "Plan Sunday-appropriate attire for travel", description: "Dress as you would for church meetings", category: "travel", sort_order: 13 },
    { title: "Prepare spiritually: fast and pray", description: "Consider fasting before your temple visit", category: "spiritual", sort_order: 14 },
    { title: "Prepare names for the temple prayer roll", description: "Names of people with special needs for united prayer", category: "spiritual", sort_order: 15 },
    { title: "Read/review the spiritual preparation resources", description: "General Authority talks and scriptures in this packet", category: "spiritual", sort_order: 16 },
  ];

  for (const todo of defaultTodos) {
    await c.env.DB.prepare(
      "INSERT INTO todos (packet_id, title, description, category, sort_order) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(id, todo.title, todo.description, todo.category, todo.sort_order)
      .run();
  }

  return c.json({ id }, 201);
});

// Get a single packet (admin view - full details)
admin.get("/packets/:id", async (c) => {
  const id = c.req.param("id");

  const packet = await c.env.DB.prepare("SELECT * FROM packets WHERE id = ?")
    .bind(id)
    .first();

  if (!packet) {
    return c.json({ error: "Packet not found" }, 404);
  }

  const [goals, escort, reflections, journal, todos] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM goals WHERE packet_id = ?").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM escorts WHERE packet_id = ?").bind(id).first(),
    c.env.DB.prepare("SELECT * FROM reflections WHERE packet_id = ?").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM journal_entries WHERE packet_id = ? ORDER BY entry_date DESC").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM todos WHERE packet_id = ? ORDER BY sort_order").bind(id).all(),
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

// Update a packet
admin.put("/packets/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const fields: string[] = [];
  const values: unknown[] = [];

  const allowedFields = [
    "student_name", "testimony", "personal_note", "congratulations_message",
    "temple_name", "temple_phone", "temple_url",
    "bishop_name", "bishop_phone", "bishop_email",
    "exec_secretary_name", "exec_secretary_phone", "exec_secretary_email",
    "ministering_brothers", "ministering_sisters",
    "instructor_name", "instructor_phone", "instructor_email",
  ];

  for (const field of allowedFields) {
    if (field in body) {
      fields.push(`${field} = ?`);
      const val = body[field];
      if ((field === "ministering_brothers" || field === "ministering_sisters") && typeof val === "object") {
        values.push(JSON.stringify(val));
      } else {
        values.push(val);
      }
    }
  }

  if (fields.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE packets SET ${fields.join(", ")} WHERE id = ?`,
  )
    .bind(...values)
    .run();

  return c.json({ success: true });
});

// Delete a packet
admin.delete("/packets/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM packets WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

export { admin };
