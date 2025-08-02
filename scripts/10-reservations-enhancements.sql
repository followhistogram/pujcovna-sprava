-- Create a settings table for application-wide configurations
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT
);

-- Insert the reservation buffer setting, do nothing if it already exists
INSERT INTO app_settings (key, value, description)
VALUES ('reservation_buffer_days', '2', 'Počet dní před a po rezervaci, kdy je vybavení blokováno.')
ON CONFLICT (key) DO NOTHING;

-- Add new columns for notes to the reservations table
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Update the status CHECK constraint for the reservations table
DO $$
BEGIN
    -- Drop the old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reservations' AND constraint_name = 'reservations_status_check'
    ) THEN
        ALTER TABLE reservations DROP CONSTRAINT reservations_status_check;
    END IF;

    -- Update old 'draft' status to 'new'
    UPDATE reservations SET status = 'new' WHERE status = 'draft';

    -- Add the new constraint
    ALTER TABLE reservations 
    ADD CONSTRAINT reservations_status_check 
    CHECK (status IN ('new', 'confirmed', 'ready_for_dispatch', 'active', 'returned', 'completed', 'canceled'));
END;
$$;

-- Update the delivery_method CHECK constraint
DO $$
BEGIN
    -- Drop the old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reservations' AND constraint_name = 'reservations_delivery_method_check'
    ) THEN
        ALTER TABLE reservations DROP CONSTRAINT reservations_delivery_method_check;
    END IF;

    -- Update old values
    UPDATE reservations SET delivery_method = 'pickup' WHERE delivery_method = 'personal';
    UPDATE reservations SET delivery_method = 'delivery' WHERE delivery_method = 'courier';

    -- Add the new constraint
    ALTER TABLE reservations 
    ADD CONSTRAINT reservations_delivery_method_check 
    CHECK (delivery_method IN ('pickup', 'delivery'));
END;
$$;


-- Modify the pricing_tiers table to use min_days instead of days_label
DO $$
DECLARE
    tier RECORD;
    min_days_val INT;
BEGIN
    -- Add the new column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pricing_tiers' AND column_name = 'min_days'
    ) THEN
        ALTER TABLE pricing_tiers ADD COLUMN min_days INT;

        -- Migrate data from days_label to min_days
        FOR tier IN SELECT id, days_label FROM pricing_tiers LOOP
            -- Extract the first number from the label
            min_days_val := (SELECT regexp_matches(tier.days_label, '\d+'))[1]::INT;
            UPDATE pricing_tiers SET min_days = min_days_val WHERE id = tier.id;
        END LOOP;

        -- Make the new column NOT NULL
        ALTER TABLE pricing_tiers ALTER COLUMN min_days SET NOT NULL;
        
        -- Drop the old column
        ALTER TABLE pricing_tiers DROP COLUMN days_label;
    END IF;
END;
$$;
