-- Fix the relationship between reservations and payment_transactions
-- Drop existing foreign key constraint if it exists
ALTER TABLE IF EXISTS payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_reservation_id_fkey;

-- Ensure the payment_transactions table exists with correct structure
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID NOT NULL,
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

-- Add the foreign key constraint properly
ALTER TABLE payment_transactions 
ADD CONSTRAINT payment_transactions_reservation_id_fkey 
FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reservation_id ON payment_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(transaction_type);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Allow all operations on payment_transactions" ON payment_transactions;
CREATE POLICY "Allow all operations on payment_transactions" ON payment_transactions
    FOR ALL USING (true) WITH CHECK (true);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
