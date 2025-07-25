-- Create learning_requests table
CREATE TABLE public.learning_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT NOT NULL,
  country TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('urgent', 'soon', 'flexible')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responses_count INTEGER NOT NULL DEFAULT 0
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id, skill)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  skill TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewee_id, chat_id)
);

-- Enable RLS on all tables
ALTER TABLE public.learning_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_requests
CREATE POLICY "Users can view all learning requests" 
ON public.learning_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own learning requests" 
ON public.learning_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning requests" 
ON public.learning_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning requests" 
ON public.learning_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for chats
CREATE POLICY "Users can view their own chats" 
ON public.chats 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats they participate in" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update chats they participate in" 
ON public.chats 
FOR UPDATE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chats" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = chat_messages.chat_id 
    AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their chats" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = chat_messages.chat_id 
    AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
  )
);

-- RLS Policies for invitations
CREATE POLICY "Users can view invitations they sent or received" 
ON public.invitations 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create invitations they send" 
ON public.invitations 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update invitations sent to them" 
ON public.invitations 
FOR UPDATE 
USING (auth.uid() = recipient_id);

-- RLS Policies for reviews
CREATE POLICY "Users can view all reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews they write" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update reviews they wrote" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_id);

-- Create indexes for better performance
CREATE INDEX idx_learning_requests_user_id ON public.learning_requests(user_id);
CREATE INDEX idx_learning_requests_created_at ON public.learning_requests(created_at DESC);
CREATE INDEX idx_chats_users ON public.chats(user1_id, user2_id);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_invitations_recipient ON public.invitations(recipient_id);
CREATE INDEX idx_invitations_sender ON public.invitations(sender_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_learning_requests_updated_at
BEFORE UPDATE ON public.learning_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();