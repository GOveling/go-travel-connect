
-- Add personal information columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN birth_date DATE,
ADD COLUMN age INTEGER,
ADD COLUMN address TEXT,
ADD COLUMN country TEXT,
ADD COLUMN city_state TEXT,
ADD COLUMN mobile_phone TEXT,
ADD COLUMN country_code TEXT,
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say'));

-- Create function to calculate age from birth date
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  IF birth_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically update age when birth_date changes
CREATE OR REPLACE FUNCTION update_age_on_birth_date_change()
RETURNS TRIGGER AS $$
BEGIN
  NEW.age = calculate_age(NEW.birth_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_age ON public.profiles;
CREATE TRIGGER trigger_update_age
  BEFORE INSERT OR UPDATE OF birth_date ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_age_on_birth_date_change();
