
-- Eliminar las políticas existentes que no funcionan
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Crear políticas más simples y funcionales
CREATE POLICY "Anyone can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can update avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can delete avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');
