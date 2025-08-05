-- Configurar realtime para trip_invitations
ALTER TABLE public.trip_invitations REPLICA IDENTITY FULL;

-- Agregar la tabla a la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_invitations;

-- Verificar que la tabla esté correctamente configurada para realtime
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'trip_invitations';