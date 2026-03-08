-- Add student_pin column for PIN-based packet lookup
ALTER TABLE packets ADD COLUMN student_pin TEXT;
