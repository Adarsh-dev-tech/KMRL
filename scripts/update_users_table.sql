-- Update users table to use employee_id as primary identifier
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20) UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100);

-- Create index for faster employee_id lookups
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- Update existing records (if any) with sample employee IDs
-- This is just for existing test data - remove in production
UPDATE users SET employee_id = 'EMP' || id::text WHERE employee_id IS NULL;
