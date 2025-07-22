-- Create email_events table for email monitoring
CREATE TABLE public.email_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'complained')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert email events (needed for webhook integrations)
CREATE POLICY "Anyone can insert email events" 
ON public.email_events 
FOR INSERT 
WITH CHECK (true);

-- Only moderators can view email events
CREATE POLICY "Moderators can view email events" 
ON public.email_events 
FOR SELECT 
USING (user_has_moderation_rights(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_email_events_event_type ON public.email_events(event_type);
CREATE INDEX idx_email_events_created_at ON public.email_events(created_at);
CREATE INDEX idx_email_events_recipient ON public.email_events(recipient);