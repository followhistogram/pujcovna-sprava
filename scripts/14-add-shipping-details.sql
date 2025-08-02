-- Add columns to store Zaslat.cz shipment details
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS shipment_id INTEGER,
ADD COLUMN IF NOT EXISTS shipment_tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipment_label_url TEXT;
