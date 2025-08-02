-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS serial_numbers CASCADE;
DROP TABLE IF EXISTS pricing_tiers CASCADE;
DROP TABLE IF EXISTS rentals CASCADE;
DROP TABLE IF EXISTS cameras CASCADE;
DROP TABLE IF EXISTS films CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table first (no dependencies)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL UNIQUE
);

-- Create films table (no dependencies)
CREATE TABLE films (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., "Polaroid", "Instax Mini", "Instax Square", "Instax Wide"
    stock INT DEFAULT 0 NOT NULL,
    low_stock_threshold INT DEFAULT 10 NOT NULL
);

-- Create cameras table (depends on categories and films)
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'active')),
    stock INT DEFAULT 0 NOT NULL,
    deposit INT DEFAULT 0 NOT NULL,
    description TEXT,
    short_description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    film_id UUID REFERENCES films(id) ON DELETE SET NULL
);

-- Create pricing_tiers table (depends on cameras)
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE NOT NULL,
    days_label TEXT NOT NULL, -- e.g., "1", "2", "5+"
    price_per_day INT NOT NULL
);

-- Create serial_numbers table (depends on cameras)
CREATE TABLE serial_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE NOT NULL,
    serial_number TEXT NOT NULL
);

-- Create rentals table (depends on cameras)
CREATE TABLE rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    customer_name TEXT NOT NULL,
    camera_id UUID REFERENCES cameras(id) ON DELETE SET NULL,
    rental_start TIMESTAMPTZ NOT NULL,
    rental_end TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'confirmed' NOT NULL CHECK (status IN ('received', 'confirmed', 'ready_for_dispatch', 'active', 'returned', 'completed', 'canceled')),
    deposit INT NOT NULL,
    deposit_status TEXT DEFAULT 'received' NOT NULL CHECK (deposit_status IN ('received', 'returned')),
    delivery_method TEXT CHECK (delivery_method IN ('personal', 'courier')),
    total_price INT NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (adjust as needed for your security requirements)
CREATE POLICY "Public categories access" ON categories FOR ALL USING (true);
CREATE POLICY "Public films access" ON films FOR ALL USING (true);
CREATE POLICY "Public cameras access" ON cameras FOR ALL USING (true);
CREATE POLICY "Public pricing_tiers access" ON pricing_tiers FOR ALL USING (true);
CREATE POLICY "Public serial_numbers access" ON serial_numbers FOR ALL USING (true);
CREATE POLICY "Public rentals access" ON rentals FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_cameras_category_id ON cameras(category_id);
CREATE INDEX idx_cameras_film_id ON cameras(film_id);
CREATE INDEX idx_cameras_status ON cameras(status);
CREATE INDEX idx_pricing_tiers_camera_id ON pricing_tiers(camera_id);
CREATE INDEX idx_serial_numbers_camera_id ON serial_numbers(camera_id);
CREATE INDEX idx_rentals_camera_id ON rentals(camera_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_rental_start ON rentals(rental_start);
CREATE INDEX idx_rentals_rental_end ON rentals(rental_end);
