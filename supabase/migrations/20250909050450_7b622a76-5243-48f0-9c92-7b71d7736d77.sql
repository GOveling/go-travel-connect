-- Add reminder_note field to saved_places table
ALTER TABLE public.saved_places 
ADD COLUMN reminder_note text;

-- Add a check constraint to limit the note to 200 characters
ALTER TABLE public.saved_places 
ADD CONSTRAINT saved_places_reminder_note_length_check 
CHECK (char_length(reminder_note) <= 200);