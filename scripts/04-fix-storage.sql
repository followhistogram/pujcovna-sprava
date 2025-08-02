-- Ensure the storage bucket exists and has correct policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('camera-images', 'camera-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public camera images read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated camera images upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated camera images delete" ON storage.objects;
DROP POLICY IF EXISTS "Public camera images access" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Public camera images access" ON storage.objects
FOR ALL USING (bucket_id = 'camera-images');

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
