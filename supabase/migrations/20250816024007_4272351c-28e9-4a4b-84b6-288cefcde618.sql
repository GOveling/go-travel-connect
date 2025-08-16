-- Remove the dates column from trips table since start_date and end_date provide the same information
ALTER TABLE public.trips DROP COLUMN dates;