-- Drop the old trigger and function if they exist
DROP TRIGGER IF EXISTS set_short_id_on_reservations ON public.reservations;
DROP FUNCTION IF EXISTS public.generate_short_id();

-- Create a new function to generate a 6-digit numeric short_id
CREATE OR REPLACE FUNCTION public.generate_numeric_short_id()
RETURNS TRIGGER AS $$
DECLARE
  new_short_id TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    -- Generate a random 6-digit number
    new_short_id := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    -- Check if it already exists
    PERFORM 1 FROM public.reservations WHERE short_id = new_short_id;
    IF NOT FOUND THEN
      is_unique := TRUE;
    END IF;
  END LOOP;
  NEW.short_id := new_short_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before insert
CREATE TRIGGER set_numeric_short_id_on_reservations
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.generate_numeric_short_id();

-- Note: You might need to backfill existing reservations with a numeric short_id
-- Example backfill (run this manually if needed):
-- UPDATE reservations
-- SET short_id = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
-- WHERE short_id IS NULL OR short_id ~ '[^0-9]';
