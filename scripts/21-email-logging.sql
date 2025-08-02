-- Create a table to log all outgoing emails
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    template_name TEXT,
    recipient TEXT NOT NULL,
    subject TEXT,
    status TEXT NOT NULL, -- 'sent' or 'failed'
    error_message TEXT,
    provider_message_id TEXT -- Optional: ID from the email provider (e.g., Nodemailer)
);

-- Add an index for faster lookups by reservation_id
CREATE INDEX idx_email_logs_reservation_id ON email_logs(reservation_id);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust for admin roles in production)
-- Admins should be able to see all logs
CREATE POLICY "Allow full access to email logs" ON email_logs FOR ALL USING (true);
