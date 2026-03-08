import { Hono } from "hono";
import { eq, desc, sql } from "drizzle-orm";
import { adminAuth } from "../middleware/auth";
import { packets, goals, escorts, reflections, journalEntries, todos } from "../db/schema";
import type { AppBindings } from "../types";

const admin = new Hono<AppBindings>();

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
  const db = c.get("db");
  const result = await db
    .select({
      id: packets.id,
      student_name: packets.student_name,
      student_pin: packets.student_pin,
      created_at: packets.created_at,
      updated_at: packets.updated_at,
    })
    .from(packets)
    .orderBy(desc(packets.created_at));
  return c.json({ packets: result });
});

// Create a new packet
admin.post("/packets", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const id = crypto.randomUUID();

  // Insert packet
  await db.insert(packets).values({
    id,
    student_name: body.student_name,
    testimony: body.testimony || null,
    personal_note: body.personal_note || null,
    congratulations_message: body.congratulations_message || null,
    temple_name: body.temple_name || "San Antonio Texas Temple",
    temple_phone: body.temple_phone || "(210) 937-5100",
    temple_url:
      body.temple_url ||
      "https://www.churchofjesuschrist.org/temples/details/san-antonio-texas-temple?lang=eng",
    bishop_name: body.bishop_name || null,
    bishop_phone: body.bishop_phone || null,
    bishop_email: body.bishop_email || null,
    exec_secretary_name: body.exec_secretary_name || null,
    exec_secretary_phone: body.exec_secretary_phone || null,
    exec_secretary_email: body.exec_secretary_email || null,
    ministering_brothers: body.ministering_brothers
      ? JSON.stringify(body.ministering_brothers)
      : null,
    ministering_sisters: body.ministering_sisters
      ? JSON.stringify(body.ministering_sisters)
      : null,
    instructor_name: body.instructor_name || null,
    instructor_phone: body.instructor_phone || null,
    instructor_email: body.instructor_email || null,
    student_pin: body.student_pin || null,
  });

  // Seed default goals (batch insert)
  const goalTypes = ["bishop_interview", "stake_interview", "temple_appointment"] as const;
  await db.insert(goals).values(
    goalTypes.map((goal_type) => ({ packet_id: id, goal_type })),
  );

  // Seed default escort row
  await db.insert(escorts).values({ packet_id: id });

  // Seed default reflection questions (batch insert)
  const questionKeys = ["ask_lord", "gratitude", "help_needed", "power_sought"];
  await db.insert(reflections).values(
    questionKeys.map((question_key) => ({ packet_id: id, question_key })),
  );

  // Seed default to-do items (batch insert)
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
  await db.insert(todos).values(
    defaultTodos.map((todo) => ({ packet_id: id, ...todo })),
  );

  return c.json({ id }, 201);
});

// Get a single packet (admin view - full details)
admin.get("/packets/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const [packet] = await db.select().from(packets).where(eq(packets.id, id));

  if (!packet) {
    return c.json({ error: "Packet not found" }, 404);
  }

  const [packetGoals, escort, packetReflections, journal, packetTodos] = await Promise.all([
    db.select().from(goals).where(eq(goals.packet_id, id)),
    db.select().from(escorts).where(eq(escorts.packet_id, id)).then((rows) => rows[0] ?? null),
    db.select().from(reflections).where(eq(reflections.packet_id, id)),
    db.select().from(journalEntries).where(eq(journalEntries.packet_id, id)).orderBy(desc(journalEntries.entry_date)),
    db.select().from(todos).where(eq(todos.packet_id, id)).orderBy(todos.sort_order),
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

// Update a packet
admin.put("/packets/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const body = await c.req.json();

  const allowedFields = [
    "student_name", "testimony", "personal_note", "congratulations_message",
    "temple_name", "temple_phone", "temple_url",
    "bishop_name", "bishop_phone", "bishop_email",
    "exec_secretary_name", "exec_secretary_phone", "exec_secretary_email",
    "ministering_brothers", "ministering_sisters",
    "instructor_name", "instructor_phone", "instructor_email",
    "student_pin",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      const val = body[field];
      if ((field === "ministering_brothers" || field === "ministering_sisters") && typeof val === "object") {
        updates[field] = JSON.stringify(val);
      } else {
        updates[field] = val;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  updates.updated_at = sql`datetime('now')`;

  await db.update(packets).set(updates).where(eq(packets.id, id));

  return c.json({ success: true });
});

// Delete a packet
admin.delete("/packets/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  await db.delete(packets).where(eq(packets.id, id));
  return c.json({ success: true });
});

export { admin };
