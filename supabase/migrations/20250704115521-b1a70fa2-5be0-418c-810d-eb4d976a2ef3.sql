
-- First, let's add real-time functionality to the messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create a conversations table to group messages
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participants JSONB NOT NULL, -- Array of user IDs
  ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view conversations they're part of
CREATE POLICY "Users can view their conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid()::text = ANY(SELECT jsonb_array_elements_text(participants)));

-- Create policy for users to create conversations
CREATE POLICY "Users can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = ANY(SELECT jsonb_array_elements_text(participants)));

-- Create policy for users to update conversations they're part of
CREATE POLICY "Users can update their conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid()::text = ANY(SELECT jsonb_array_elements_text(participants)));

-- Add conversation_id to messages table
ALTER TABLE public.messages ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_conversations_participants ON public.conversations USING GIN (participants);
CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages (created_at DESC);

-- Create function to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Create trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();

-- Create message_attachments table for file uploads
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on message_attachments
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Create policy for message attachments (inherit from messages permissions)
CREATE POLICY "Users can view attachments for their messages" 
  ON public.message_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.messages 
      WHERE id = message_id 
      AND (sender_id = auth.uid() OR recipient_id = auth.uid())
    )
  );

-- Create policy for inserting attachments
CREATE POLICY "Users can create attachments for their messages" 
  ON public.message_attachments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages 
      WHERE id = message_id 
      AND sender_id = auth.uid()
    )
  );

-- Add real-time to conversations and attachments
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.message_attachments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;

-- Update existing messages to have conversation_id (for existing data migration)
-- This will create individual conversations for existing message threads
INSERT INTO public.conversations (participants, ad_id, last_message_at, created_at)
SELECT 
  jsonb_build_array(sender_id::text, recipient_id::text) as participants,
  ad_id,
  MAX(created_at) as last_message_at,
  MIN(created_at) as created_at
FROM public.messages 
WHERE conversation_id IS NULL
GROUP BY sender_id, recipient_id, ad_id;

-- Update messages with their conversation_id
UPDATE public.messages 
SET conversation_id = c.id
FROM public.conversations c
WHERE messages.conversation_id IS NULL
AND messages.sender_id::text = ANY(SELECT jsonb_array_elements_text(c.participants))
AND messages.recipient_id::text = ANY(SELECT jsonb_array_elements_text(c.participants))
AND (messages.ad_id = c.ad_id OR (messages.ad_id IS NULL AND c.ad_id IS NULL));
