-- Create table to store user's base CV for reuse
CREATE TABLE public.user_base_cv (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cv_analysis TEXT NOT NULL,
  original_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_base_cv ENABLE ROW LEVEL SECURITY;

-- Users can view their own base CV
CREATE POLICY "Users can view their own base CV"
ON public.user_base_cv
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own base CV
CREATE POLICY "Users can insert their own base CV"
ON public.user_base_cv
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own base CV
CREATE POLICY "Users can update their own base CV"
ON public.user_base_cv
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own base CV
CREATE POLICY "Users can delete their own base CV"
ON public.user_base_cv
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_base_cv_updated_at
BEFORE UPDATE ON public.user_base_cv
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();