-- Check if type column exists and add it if not
DO $$
BEGIN
  -- Add type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.trips ADD COLUMN type TEXT DEFAULT 'individual';
  END IF;
END $$;

-- Set existing group trips to 'group' type based on is_group_trip
UPDATE public.trips 
SET type = 'group' 
WHERE is_group_trip = true AND type != 'group';