
-- Créer le bucket de stockage pour les pièces jointes des messages
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true);

-- Créer une politique pour permettre aux utilisateurs authentifiés d'uploader des pièces jointes
CREATE POLICY "Authenticated users can upload message attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'message-attachments' AND 
  auth.role() = 'authenticated'
);

-- Créer une politique pour permettre à tous de voir les pièces jointes publiques
CREATE POLICY "Anyone can view message attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'message-attachments');

-- Créer une politique pour permettre aux utilisateurs de supprimer leurs propres pièces jointes
CREATE POLICY "Users can delete their own message attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'message-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
