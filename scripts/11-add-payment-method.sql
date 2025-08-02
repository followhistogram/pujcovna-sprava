-- Add payment_method column to reservations table if it doesn't exist
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add constraint for payment_method values
DO $$
BEGIN
    -- Drop the old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reservations' AND constraint_name = 'reservations_payment_method_check'
    ) THEN
        ALTER TABLE reservations DROP CONSTRAINT reservations_payment_method_check;
    END IF;

    -- Add the new constraint
    ALTER TABLE reservations 
    ADD CONSTRAINT reservations_payment_method_check 
    CHECK (payment_method IN ('card', 'bank_transfer', 'cash') OR payment_method IS NULL);
END;
$$;
