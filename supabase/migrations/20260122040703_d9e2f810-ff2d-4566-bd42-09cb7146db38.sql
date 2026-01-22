-- Add stage3_unlocked column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN stage3_unlocked BOOLEAN DEFAULT false;