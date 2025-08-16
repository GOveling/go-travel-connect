-- Create storage bucket for country images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('country-images', 'country-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Create RLS policies for country images bucket
CREATE POLICY "Country images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'country-images');

CREATE POLICY "Authenticated users can upload country images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'country-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update country images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'country-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete country images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'country-images' AND auth.role() = 'authenticated');