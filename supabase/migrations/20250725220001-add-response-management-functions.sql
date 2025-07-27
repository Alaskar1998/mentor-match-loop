-- Add database functions for managing learning responses

-- Function to decline a learning response
CREATE OR REPLACE FUNCTION decline_learning_response(response_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the response status to declined
  UPDATE public.learning_responses 
  SET 
    status = 'declined',
    updated_at = now()
  WHERE id = response_id;
  
  -- Return true if a row was updated, false otherwise
  RETURN FOUND;
END;
$$;

-- Function to accept a learning response
CREATE OR REPLACE FUNCTION accept_learning_response(response_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the response status to accepted
  UPDATE public.learning_responses 
  SET 
    status = 'accepted',
    updated_at = now()
  WHERE id = response_id;
  
  -- Return true if a row was updated, false otherwise
  RETURN FOUND;
END;
$$;

-- Function to get pending responses for a user
CREATE OR REPLACE FUNCTION get_user_pending_responses(user_id UUID)
RETURNS TABLE (
  id UUID,
  learning_request_id UUID,
  responder_id UUID,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  skill TEXT,
  responder_name TEXT,
  responder_avatar TEXT,
  responder_rating NUMERIC,
  responder_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.id,
    lr.learning_request_id,
    lr.responder_id,
    lr.message,
    lr.status,
    lr.created_at,
    lr.updated_at,
    lreq.skill,
    p.display_name,
    p.avatar_url,
    COALESCE(p.rating, 0) as rating,
    COALESCE(p.is_verified, false) as is_verified
  FROM public.learning_responses lr
  INNER JOIN public.learning_requests lreq ON lr.learning_request_id = lreq.id
  INNER JOIN public.profiles p ON lr.responder_id = p.id
  WHERE lreq.user_id = get_user_pending_responses.user_id
    AND lr.status = 'pending'
  ORDER BY lr.created_at DESC;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION decline_learning_response(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_learning_response(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_pending_responses(UUID) TO authenticated; 