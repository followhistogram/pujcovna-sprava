-- Add columns for tracking URLs for outbound and return shipments
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS shipping_outbound_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_return_url TEXT;

-- Add comments for clarity
COMMENT ON COLUMN reservations.shipping_outbound_url IS 'URL pro sledování zásilky TAM (k zákazníkovi)';
COMMENT ON COLUMN reservations.shipping_return_url IS 'URL pro sledování zásilky ZPĚT (od zákazníka)';
