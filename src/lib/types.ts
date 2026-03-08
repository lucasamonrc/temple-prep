export interface Packet {
  id: string;
  student_name: string;
  created_at: string;
  updated_at: string;
  testimony: string | null;
  personal_note: string | null;
  congratulations_message: string | null;
  temple_name: string;
  temple_phone: string | null;
  temple_url: string | null;
  bishop_name: string | null;
  bishop_phone: string | null;
  bishop_email: string | null;
  exec_secretary_name: string | null;
  exec_secretary_phone: string | null;
  exec_secretary_email: string | null;
  ministering_brothers: string | null;
  ministering_sisters: string | null;
  instructor_name: string | null;
  instructor_phone: string | null;
  instructor_email: string | null;
  student_pin: string | null;
  goals: Goal[];
  escort: Escort | null;
  reflections: Reflection[];
  journal: JournalEntry[];
  todos: Todo[];
}

export interface Goal {
  id: number;
  packet_id: string;
  goal_type: "bishop_interview" | "stake_interview" | "temple_appointment";
  scheduled_date: string | null;
  completed: number;
  notes: string | null;
}

export interface Escort {
  packet_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  relationship: string | null;
}

export interface Reflection {
  id: number;
  packet_id: string;
  question_key: string;
  response: string | null;
  updated_at: string;
}

export interface JournalEntry {
  id: number;
  packet_id: string;
  entry_date: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: number;
  packet_id: string;
  title: string;
  description: string | null;
  category: string | null;
  sort_order: number;
  completed: number;
  completed_at: string | null;
}

export interface MinisteringContact {
  name: string;
  phone: string;
  email?: string;
}
