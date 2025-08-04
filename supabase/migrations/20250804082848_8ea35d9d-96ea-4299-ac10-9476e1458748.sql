-- Add foreign key constraints to trip_invitations table
ALTER TABLE public.trip_invitations 
ADD CONSTRAINT fk_trip_invitations_trip_id 
FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;

ALTER TABLE public.trip_invitations 
ADD CONSTRAINT fk_trip_invitations_inviter_id 
FOREIGN KEY (inviter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;