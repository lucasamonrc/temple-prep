import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { Database } from "./db";
import type * as schema from "./db/schema";

export interface Env {
  DB: D1Database;
  ADMIN_PIN: string;
}

export interface AppBindings {
  Bindings: Env;
  Variables: {
    db: Database;
  };
}

// Select types (reading from DB)
export type Packet = InferSelectModel<typeof schema.packets>;
export type Goal = InferSelectModel<typeof schema.goals>;
export type Escort = InferSelectModel<typeof schema.escorts>;
export type Reflection = InferSelectModel<typeof schema.reflections>;
export type JournalEntry = InferSelectModel<typeof schema.journalEntries>;
export type Todo = InferSelectModel<typeof schema.todos>;

// Insert types (writing to DB)
export type NewPacket = InferInsertModel<typeof schema.packets>;
export type NewGoal = InferInsertModel<typeof schema.goals>;
export type NewReflection = InferInsertModel<typeof schema.reflections>;
export type NewTodo = InferInsertModel<typeof schema.todos>;
