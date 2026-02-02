-- Add hidden_from_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN hidden_from_admin boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.hidden_from_admin IS 'When true, hides the mentee from admin panel view (does not delete user)';