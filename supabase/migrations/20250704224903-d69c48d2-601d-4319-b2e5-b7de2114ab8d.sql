
-- Add phone number field to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT UNIQUE;

-- Add index for phone number lookups
CREATE INDEX idx_profiles_phone ON public.profiles(phone);

-- Add comment to clarify the phone field usage
COMMENT ON COLUMN public.profiles.phone IS 'User phone number for login authentication (optional, unique)';
