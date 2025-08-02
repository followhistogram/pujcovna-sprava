-- Update films table with new columns
ALTER TABLE films
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS shots_per_pack INT,
ADD COLUMN IF NOT EXISTS price INT,
ADD COLUMN IF NOT EXISTS purchase_price INT,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Create accessories table
CREATE TABLE IF NOT EXISTS accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    stock INT DEFAULT 0 NOT NULL,
    price INT,
    purchase_price INT,
    images JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS and create policies for accessories
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public accessories access" ON accessories FOR ALL USING (true);

-- Create storage bucket for inventory images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inventory-images', 'inventory-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create policies for inventory images bucket
DROP POLICY IF EXISTS "Public inventory images access" ON storage.objects;
CREATE POLICY "Public inventory images access" ON storage.objects
FOR ALL USING (bucket_id = 'inventory-images');
