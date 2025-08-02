-- Create inventory logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('film', 'accessory')),
    item_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'stock_change', 'price_change')),
    field_changed TEXT,
    old_value TEXT,
    new_value TEXT,
    change_amount INT, -- For stock changes: positive = increase, negative = decrease
    user_id TEXT, -- For future auth implementation
    notes TEXT
);

-- Enable RLS
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Public inventory_logs access" ON inventory_logs FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_logs_item_type_id ON inventory_logs(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_change_type ON inventory_logs(change_type);

-- Function to clean old logs (older than 1 year)
CREATE OR REPLACE FUNCTION clean_old_inventory_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM inventory_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean old logs (this would need to be set up in production)
-- For now, we'll call this manually or via cron
