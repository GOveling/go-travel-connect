-- Clean up duplicate foreign keys for trip_invitations table
-- Keep only the original foreign keys and drop the duplicates

-- Drop duplicate foreign key constraints
ALTER TABLE public.trip_invitations 
DROP CONSTRAINT IF EXISTS fk_trip_invitations_trip_id;

ALTER TABLE public.trip_invitations 
DROP CONSTRAINT IF EXISTS fk_trip_invitations_inviter_id;

-- Verify that the original foreign keys remain intact
-- trip_invitations_trip_id_fkey should exist
-- trip_invitations_inviter_id_fkey should exist