
-- Add new columns to the event_waitlist table
ALTER TABLE public.event_waitlist 
ADD COLUMN pseudonym TEXT,
ADD COLUMN gender TEXT,
ADD COLUMN telegram_username TEXT,
ADD COLUMN city TEXT;

-- Update the full_name column to be nullable since we're replacing it with pseudonym
-- (keeping it for backward compatibility but making pseudonym the primary field)
