
CREATE TABLE public.stage_notifications_seen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage_number INT NOT NULL,
  seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, stage_number)
);

ALTER TABLE public.stage_notifications_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own seen notifications"
ON public.stage_notifications_seen FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seen notifications"
ON public.stage_notifications_seen FOR INSERT
WITH CHECK (auth.uid() = user_id);
