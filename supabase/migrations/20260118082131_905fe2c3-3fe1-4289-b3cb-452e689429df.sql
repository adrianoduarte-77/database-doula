-- Create table for saved cover letters
CREATE TABLE public.saved_cover_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cover_letter_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_cover_letters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cover letters" 
ON public.saved_cover_letters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cover letters" 
ON public.saved_cover_letters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters" 
ON public.saved_cover_letters 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters" 
ON public.saved_cover_letters 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_saved_cover_letters_updated_at
BEFORE UPDATE ON public.saved_cover_letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();