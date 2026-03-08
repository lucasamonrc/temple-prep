import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const packets = sqliteTable("packets", {
  id: text("id").primaryKey(),
  student_name: text("student_name").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`),
  updated_at: text("updated_at").default(sql`(datetime('now'))`),

  testimony: text("testimony"),
  personal_note: text("personal_note"),
  congratulations_message: text("congratulations_message"),

  temple_name: text("temple_name").default("San Antonio Texas Temple"),
  temple_phone: text("temple_phone").default("(210) 937-5100"),
  temple_url: text("temple_url").default(
    "https://www.churchofjesuschrist.org/temples/details/san-antonio-texas-temple?lang=eng",
  ),

  bishop_name: text("bishop_name"),
  bishop_phone: text("bishop_phone"),
  bishop_email: text("bishop_email"),
  exec_secretary_name: text("exec_secretary_name"),
  exec_secretary_phone: text("exec_secretary_phone"),
  exec_secretary_email: text("exec_secretary_email"),
  ministering_brothers: text("ministering_brothers"),
  ministering_sisters: text("ministering_sisters"),
  instructor_name: text("instructor_name"),
  instructor_phone: text("instructor_phone"),
  instructor_email: text("instructor_email"),
  student_pin: text("student_pin"),
});

export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packet_id: text("packet_id")
    .notNull()
    .references(() => packets.id, { onDelete: "cascade" }),
  goal_type: text("goal_type").notNull(),
  scheduled_date: text("scheduled_date"),
  completed: integer("completed").default(0),
  notes: text("notes"),
});

export const escorts = sqliteTable("escorts", {
  packet_id: text("packet_id")
    .primaryKey()
    .references(() => packets.id, { onDelete: "cascade" }),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  relationship: text("relationship"),
});

export const reflections = sqliteTable("reflections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packet_id: text("packet_id")
    .notNull()
    .references(() => packets.id, { onDelete: "cascade" }),
  question_key: text("question_key").notNull(),
  response: text("response"),
  updated_at: text("updated_at").default(sql`(datetime('now'))`),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packet_id: text("packet_id")
    .notNull()
    .references(() => packets.id, { onDelete: "cascade" }),
  entry_date: text("entry_date").default(sql`(date('now'))`),
  content: text("content"),
  created_at: text("created_at").default(sql`(datetime('now'))`),
  updated_at: text("updated_at").default(sql`(datetime('now'))`),
});

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packet_id: text("packet_id")
    .notNull()
    .references(() => packets.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  sort_order: integer("sort_order").default(0),
  completed: integer("completed").default(0),
  completed_at: text("completed_at"),
});
