-- First, let's check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add package_contents column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cameras' AND column_name = 'package_contents') THEN
        ALTER TABLE cameras ADD COLUMN package_contents JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add status column to serial_numbers if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'serial_numbers' AND column_name = 'status') THEN
        ALTER TABLE serial_numbers ADD COLUMN status TEXT DEFAULT 'active' NOT NULL;
        
        -- Add check constraint
        ALTER TABLE serial_numbers ADD CONSTRAINT serial_numbers_status_check 
        CHECK (status IN ('active', 'serviced', 'retired'));
        
        -- Create index
        CREATE INDEX idx_serial_numbers_status ON serial_numbers(status);
        
        -- Update existing records
        UPDATE serial_numbers SET status = 'active' WHERE status IS NULL;
    END IF;
END $$;

-- Create storage bucket for camera images (this will be ignored if bucket already exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('camera-images', 'camera-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for camera images
DO $$
BEGIN
    -- Policy for public read access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public camera images read access'
    ) THEN
        CREATE POLICY "Public camera images read access" ON storage.objects
        FOR SELECT USING (bucket_id = 'camera-images');
    END IF;
    
    -- Policy for authenticated upload
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated camera images upload'
    ) THEN
        CREATE POLICY "Authenticated camera images upload" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'camera-images');
    END IF;
    
    -- Policy for authenticated delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated camera images delete'
    ) THEN
        CREATE POLICY "Authenticated camera images delete" ON storage.objects
        FOR DELETE USING (bucket_id = 'camera-images');
    END IF;
END $$;
