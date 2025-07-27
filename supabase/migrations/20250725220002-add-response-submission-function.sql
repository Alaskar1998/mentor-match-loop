-- Add database function for submitting learning responses

-- Function to submit a learning response
CREATE OR REPLACE FUNCTION submit_learning_response(
  p_learning_request_id UUID,
  p_responder_id UUID,
  p_message TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  response_id UUID,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response_id UUID;
  v_request_exists BOOLEAN;
BEGIN
  -- Check if the learning request exists
  SELECT EXISTS(
    SELECT 1 FROM public.learning_requests 
    WHERE id = p_learning_request_id
  ) INTO v_request_exists;
  
  IF NOT v_request_exists THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Learning request not found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user already responded to this request
  IF EXISTS(
    SELECT 1 FROM public.learning_responses 
    WHERE learning_request_id = p_learning_request_id 
    AND responder_id = p_responder_id
  ) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'You have already responded to this request'::TEXT;
    RETURN;
  END IF;
  
  -- Insert the response
  INSERT INTO public.learning_responses (
    learning_request_id,
    responder_id,
    message,
    status
  ) VALUES (
    p_learning_request_id,
    p_responder_id,
    p_message,
    'pending'
  ) RETURNING id INTO v_response_id;
  
  -- Update the responses count on the learning request
  UPDATE public.learning_requests 
  SET responses_count = responses_count + 1
  WHERE id = p_learning_request_id;
  
  RETURN QUERY SELECT true, v_response_id, NULL::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::UUID, SQLERRM::TEXT;
END;
$$;

-- Function to get responses for a user's learning requests
CREATE OR REPLACE FUNCTION get_user_learning_responses(p_user_id UUID)
RETURNS TABLE (
  response_id UUID,
  learning_request_id UUID,
  responder_id UUID,
  responder_name TEXT,
  responder_avatar TEXT,
  responder_rating NUMERIC,
  responder_verified BOOLEAN,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  skill TEXT,
  request_description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.id as response_id,
    lr.learning_request_id,
    lr.responder_id,
    COALESCE(p.display_name, 'Anonymous User') as responder_name,
    p.avatar_url as responder_avatar,
    COALESCE(p.rating, 0) as responder_rating,
    COALESCE(p.is_verified, false) as responder_verified,
    lr.message,
    lr.status,
    lr.created_at,
    lreq.skill,
    lreq.description as request_description
  FROM public.learning_responses lr
  INNER JOIN public.learning_requests lreq ON lr.learning_request_id = lreq.id
  INNER JOIN public.profiles p ON lr.responder_id = p.id
  WHERE lreq.user_id = p_user_id
    AND lr.status = 'pending'
  ORDER BY lr.created_at DESC;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION submit_learning_response(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_learning_responses(UUID) TO authenticated; 