
-- Create ads table for user advertisements
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  location TEXT,
  images TEXT[], -- Array of image URLs
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table for user communications
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_stats table for analytics
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_ads INTEGER NOT NULL DEFAULT 0,
  active_ads INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0,
  unread_messages INTEGER NOT NULL DEFAULT 0,
  profile_views INTEGER NOT NULL DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ads table
CREATE POLICY "Users can view all ads" ON public.ads FOR SELECT USING (true);
CREATE POLICY "Users can insert their own ads" ON public.ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ads" ON public.ads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ads" ON public.ads FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages table
CREATE POLICY "Users can view their own messages" ON public.messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can insert messages" ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update messages they received" ON public.messages 
  FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for user_stats table
CREATE POLICY "Users can view their own stats" ON public.user_stats 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON public.user_stats 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON public.user_stats 
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user stats when a user profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create stats for new users
CREATE TRIGGER on_user_stats_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_stats();

-- Function to update user stats when ads change
CREATE OR REPLACE FUNCTION public.update_user_ad_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_stats 
    SET total_ads = total_ads + 1,
        active_ads = CASE WHEN NEW.status = 'active' THEN active_ads + 1 ELSE active_ads END,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.user_stats 
    SET active_ads = (
      SELECT COUNT(*) FROM public.ads 
      WHERE user_id = NEW.user_id AND status = 'active'
    ),
    updated_at = now()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_stats 
    SET total_ads = total_ads - 1,
        active_ads = CASE WHEN OLD.status = 'active' THEN active_ads - 1 ELSE active_ads END,
        updated_at = now()
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for ad stats updates
CREATE TRIGGER on_ad_stats_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ads
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_ad_stats();

-- Function to update message stats
CREATE OR REPLACE FUNCTION public.update_user_message_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update sender stats
    UPDATE public.user_stats 
    SET total_messages = total_messages + 1,
        updated_at = now()
    WHERE user_id = NEW.sender_id;
    
    -- Update recipient stats
    UPDATE public.user_stats 
    SET unread_messages = unread_messages + 1,
        updated_at = now()
    WHERE user_id = NEW.recipient_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If message is marked as read, decrease unread count
    IF OLD.is_read = false AND NEW.is_read = true THEN
      UPDATE public.user_stats 
      SET unread_messages = unread_messages - 1,
          updated_at = now()
      WHERE user_id = NEW.recipient_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for message stats updates
CREATE TRIGGER on_message_stats_change
  AFTER INSERT OR UPDATE ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_message_stats();
