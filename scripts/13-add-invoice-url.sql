-- Add columns to store Fakturoid invoice details
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS invoice_id INTEGER,
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Add a unique constraint to invoice_id to prevent duplicate invoices for the same reservation
-- This will fail if the constraint already exists, which is fine.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reservations_invoice_id_key'
    ) THEN
        ALTER TABLE reservations ADD CONSTRAINT reservations_invoice_id_key UNIQUE (invoice_id);
    END IF;
END;
$$;
