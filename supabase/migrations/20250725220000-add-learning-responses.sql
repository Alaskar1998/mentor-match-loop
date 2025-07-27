-- Create learning_responses table for responses to learning requests
CREATE TABLE public.learning_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_request_id UUID NOT NULL REFERENCES public.learning_requests(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(learning_request_id, responder_id)
);

-- Enable RLS on learning_responses table
ALTER TABLE public.learning_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_responses
CREATE POLICY "Users can view responses to their own learning requests" 
ON public.learning_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.learning_requests 
    WHERE learning_requests.id = learning_responses.learning_request_id 
    AND learning_requests.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view responses they created" 
ON public.learning_responses 
FOR SELECT 
USING (auth.uid() = responder_id);

CREATE POLICY "Users can create responses to learning requests" 
ON public.learning_responses 
FOR INSERT 
WITH CHECK (auth.uid() = responder_id);

CREATE POLICY "Request owners can update response status" 
ON public.learning_responses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.learning_requests 
    WHERE learning_requests.id = learning_responses.learning_request_id 
    AND learning_requests.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_learning_responses_request_id ON public.learning_responses(learning_request_id);
CREATE INDEX idx_learning_responses_responder_id ON public.learning_responses(responder_id);
CREATE INDEX idx_learning_responses_status ON public.learning_responses(status);
CREATE INDEX idx_learning_responses_created_at ON public.learning_responses(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_learning_responses_updated_at
BEFORE UPDATE ON public.learning_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 