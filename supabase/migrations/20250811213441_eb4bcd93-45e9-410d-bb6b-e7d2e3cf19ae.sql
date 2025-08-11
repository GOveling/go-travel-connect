-- Add hierarchical address support to saved_places
-- All columns are nullable to avoid breaking existing inserts
ALTER TABLE public.saved_places
  ADD COLUMN IF NOT EXISTS formatted_address text,
  ADD COLUMN IF NOT EXISTS address_json jsonb,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS street text,
  ADD COLUMN IF NOT EXISTS street_number text,
  ADD COLUMN IF NOT EXISTS place_source text,
  ADD COLUMN IF NOT EXISTS place_reference text;

-- Optional: simple index to help basic lookups by country/city
CREATE INDEX IF NOT EXISTS idx_saved_places_country ON public.saved_places (country);
CREATE INDEX IF NOT EXISTS idx_saved_places_city ON public.saved_places (city);

-- No RLS changes required (existing policies already cover saved_places)
