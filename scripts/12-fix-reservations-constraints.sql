-- Make sure the reservations table has proper defaults and constraints
-- Update the default status to 'new' instead of 'draft'
ALTER TABLE reservations ALTER COLUMN status SET DEFAULT 'new';

-- Ensure amount_paid has a default value
ALTER TABLE reservations ALTER COLUMN amount_paid SET DEFAULT 0;

-- Make sure customer_address can be null or empty
-- (This should already be the case, but let's be explicit)
ALTER TABLE reservations ALTER COLUMN customer_address DROP NOT NULL;

-- Update any existing 'draft' status to 'new'
UPDATE reservations SET status = 'new' WHERE status = 'draft';

-- Make sure the constraint allows all the correct statuses
DO $$
BEGIN
    -- Drop the old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reservations' AND constraint_name = 'reservations_status_check'
    ) THEN
        ALTER TABLE reservations DROP CONSTRAINT reservations_status_check;
    END IF;

    -- Add the updated constraint
    ALTER TABLE reservations 
    ADD CONSTRAINT reservations_status_check 
    CHECK (status IN ('new', 'confirmed', 'ready_for_dispatch', 'active', 'returned', 'completed', 'canceled'));
END;
$$;
