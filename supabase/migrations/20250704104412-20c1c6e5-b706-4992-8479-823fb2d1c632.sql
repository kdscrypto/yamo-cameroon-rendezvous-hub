
-- Create a table for the events waitlist
CREATE TABLE public.event_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false
);

-- Add Row Level Security (RLS) to the event_waitlist table
ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert into the waitlist (public signup)
CREATE POLICY "Anyone can join the waitlist" 
  ON public.event_waitlist 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that only allows viewing for authenticated users (for admin purposes)
CREATE POLICY "Authenticated users can view waitlist" 
  ON public.event_waitlist 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create index on email for faster lookups
CREATE INDEX idx_event_waitlist_email ON public.event_waitlist(email);
