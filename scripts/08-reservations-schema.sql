-- Drop existing tables and constraints if they exist to avoid conflicts
ALTER TABLE IF EXISTS rentals DROP CONSTRAINT IF EXISTS rentals_camera_id_fkey;
DROP TABLE IF EXISTS rentals CASCADE;
DROP TABLE IF EXISTS reservation_items CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Function to generate a short, unique, non-sequential ID
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TEXT AS $$
DECLARE
    -- Example format: R-2408-AB12
    year_part TEXT;
    random_part TEXT;
    chars TEXT[] := '{A,B,C,D,E,F,G,H,I,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,1,2,3,4,5,6,7,8,9}';
    result TEXT;
    i INT;
BEGIN
    year_part := to_char(CURRENT_DATE, 'YYMM');
    
    LOOP
        random_part := '';
        FOR i IN 1..4 LOOP
            random_part := random_part || chars[1 + floor(random() * array_length(chars, 1))];
        END LOOP;
        
        result := 'R' || year_part || '-' || random_part;
        
        -- Ensure uniqueness
        IF NOT EXISTS (SELECT 1 FROM reservations WHERE short_id = result) THEN
            RETURN result;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create reservations table
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id TEXT UNIQUE NOT NULL DEFAULT generate_short_id(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Customer details
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address JSONB, -- { street, city, zip, country }
    
    -- Rental period
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'pending_payment', 'confirmed', 'ready_for_dispatch', 'active', 'returned', 'completed', 'canceled')),
    
    -- Financials
    subtotal INT NOT NULL DEFAULT 0,
    deposit_total INT NOT NULL DEFAULT 0,
    total_price INT NOT NULL DEFAULT 0,
    amount_paid INT NOT NULL DEFAULT 0,
    
    -- Other details
    delivery_method TEXT CHECK (delivery_method IN ('personal', 'courier')),
    internal_notes TEXT
);

-- Create reservation_items table
CREATE TABLE reservation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    item_id UUID NOT NULL, -- Refers to cameras.id, films.id, or accessories.id
    item_type TEXT NOT NULL CHECK (item_type IN ('camera', 'film', 'accessory')),
    name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price INT NOT NULL DEFAULT 0,
    deposit INT NOT NULL DEFAULT 0
);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    amount INT NOT NULL,
    method TEXT, -- e.g., 'card', 'cash', 'bank_transfer'
    notes TEXT
);

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public reservations access" ON reservations FOR ALL USING (true);
CREATE POLICY "Public reservation_items access" ON reservation_items FOR ALL USING (true);
CREATE POLICY "Public payments access" ON payments FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_customer_email ON reservations(customer_email);
CREATE INDEX idx_reservation_items_reservation_id ON reservation_items(reservation_id);
CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
