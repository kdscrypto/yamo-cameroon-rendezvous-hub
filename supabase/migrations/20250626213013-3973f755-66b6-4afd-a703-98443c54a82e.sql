
-- Créer le bucket de stockage pour les images des annonces
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true);

-- Créer une politique pour permettre aux utilisateurs authentifiés d'uploader des images
CREATE POLICY "Authenticated users can upload ad images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ad-images' AND 
  auth.role() = 'authenticated'
);

-- Créer une politique pour permettre à tous de voir les images publiques
CREATE POLICY "Anyone can view ad images" ON storage.objects
FOR SELECT USING (bucket_id = 'ad-images');

-- Créer une politique pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete their own ad images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ad-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
