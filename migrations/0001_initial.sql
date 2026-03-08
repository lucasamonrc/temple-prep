-- Temple Preparation Packet App - Initial Schema

CREATE TABLE IF NOT EXISTS packets (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  testimony TEXT,
  personal_note TEXT,
  congratulations_message TEXT,

  temple_name TEXT DEFAULT 'San Antonio Texas Temple',
  temple_phone TEXT DEFAULT '(210) 937-5100',
  temple_url TEXT DEFAULT 'https://www.churchofjesuschrist.org/temples/details/san-antonio-texas-temple?lang=eng',

  bishop_name TEXT,
  bishop_phone TEXT,
  bishop_email TEXT,
  exec_secretary_name TEXT,
  exec_secretary_phone TEXT,
  exec_secretary_email TEXT,
  ministering_brothers TEXT,
  ministering_sisters TEXT,
  instructor_name TEXT,
  instructor_phone TEXT,
  instructor_email TEXT
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  scheduled_date TEXT,
  completed INTEGER DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS escorts (
  packet_id TEXT PRIMARY KEY REFERENCES packets(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  email TEXT,
  relationship TEXT
);

CREATE TABLE IF NOT EXISTS reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  response TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(packet_id, question_key)
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,
  entry_date TEXT DEFAULT (date('now')),
  content TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  completed_at TEXT
);
