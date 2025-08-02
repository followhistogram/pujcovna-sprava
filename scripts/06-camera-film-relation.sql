-- Drop the old foreign key constraint and column from the cameras table if it exists
-- This makes the script runnable even if the column was already removed.
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cameras' AND column_name='film_id') THEN
      ALTER TABLE cameras DROP COLUMN film_id;
   END IF;
END
$$;

-- Create the join table for the many-to-many relationship
CREATE TABLE IF NOT EXISTS camera_compatible_films (
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (camera_id, film_id)
);

-- Add comments for clarity
COMMENT ON TABLE camera_compatible_films IS 'Join table to link cameras with their compatible films.';

-- Enable Row Level Security
ALTER TABLE camera_compatible_films ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public camera_compatible_films access" ON camera_compatible_films FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_camera_compatible_films_camera_id ON camera_compatible_films(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_compatible_films_film_id ON camera_compatible_films(film_id);
