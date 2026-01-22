-- Add learning_path field to profiles table for personalized development tracks
ALTER TABLE public.profiles 
ADD COLUMN learning_path TEXT DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.profiles.learning_path IS 'Trilha de desenvolvimento personalizada criada pelo mentor para o mentorado';