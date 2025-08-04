-- Ajouter la colonne subject à la table email_tracking
ALTER TABLE public.email_tracking 
ADD COLUMN subject TEXT;

-- Ajouter une colonne pour l'ID de l'email externe (comme Resend ID)
ALTER TABLE public.email_tracking 
ADD COLUMN external_id TEXT;