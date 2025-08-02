-- Create a table to store SMTP configuration
CREATE TABLE smtp_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    host TEXT,
    port INT,
    secure BOOLEAN DEFAULT true,
    username TEXT,
    password TEXT, -- In a production environment, this should be encrypted or stored in a secret manager.
    from_email TEXT,
    from_name TEXT
);

-- This constraint ensures that only one row of settings can exist.
-- It's a PostgreSQL trick using a constant value in an index.
CREATE UNIQUE INDEX single_smtp_settings_constraint_idx ON smtp_settings ((true));

-- Enable Row Level Security
ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

-- Create policies. In a real application, you should restrict this to admin roles.
CREATE POLICY "Allow full access to SMTP settings" ON smtp_settings FOR ALL USING (true);
