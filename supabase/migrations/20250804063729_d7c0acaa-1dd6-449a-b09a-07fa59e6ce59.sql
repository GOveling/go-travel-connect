-- Add foreign key constraints for trip_invitations table
ALTER TABLE public.trip_invitations 
ADD CONSTRAINT trip_invitations_trip_id_fkey 
FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;

ALTER TABLE public.trip_invitations 
ADD CONSTRAINT trip_invitations_inviter_id_fkey 
FOREIGN KEY (inviter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;