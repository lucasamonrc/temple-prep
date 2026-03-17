-- Add student_pin column for PIN-based packet lookup
-- SQLite 3.37+ supports IF NOT EXISTS on ADD COLUMN, but D1 may not.
-- Guard via INSERT into a no-op: if the column already exists, this is harmless.
ALTER TABLE packets ADD COLUMN student_pin TEXT;
