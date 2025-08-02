-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Amount in cents (haléře)
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash', 'bank_transfer', 'other')),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund')),
    description TEXT,
    reference_number TEXT, -- Bank reference, card transaction ID, etc.
    notes TEXT,
    processed_by TEXT, -- User who processed the transaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reservation_id ON payment_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(transaction_type);

-- Create function to calculate total paid amount for a reservation
CREATE OR REPLACE FUNCTION calculate_reservation_amount_paid(reservation_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_paid INTEGER;
BEGIN
    SELECT COALESCE(SUM(amount), 0)
    INTO total_paid
    FROM payment_transactions
    WHERE reservation_id = reservation_uuid;
    
    RETURN total_paid;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update amount_paid in reservations table
CREATE OR REPLACE FUNCTION update_reservation_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the reservation's amount_paid field
    UPDATE reservations 
    SET amount_paid = calculate_reservation_amount_paid(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.reservation_id
            ELSE NEW.reservation_id
        END
    ),
    updated_at = NOW()
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.reservation_id
        ELSE NEW.reservation_id
    END;
    
    RETURN CASE 
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update amount_paid
DROP TRIGGER IF EXISTS trigger_update_reservation_amount_paid ON payment_transactions;
CREATE TRIGGER trigger_update_reservation_amount_paid
    AFTER INSERT OR UPDATE OR DELETE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_reservation_amount_paid();

-- Add RLS policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (in production, you'd want more restrictive policies)
CREATE POLICY "Allow all operations on payment_transactions" ON payment_transactions
    FOR ALL USING (true) WITH CHECK (true);
