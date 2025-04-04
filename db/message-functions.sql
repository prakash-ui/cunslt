-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update last_read_at for the user in this conversation
  UPDATE conversation_participants
  SET last_read_at = NOW()
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
  
  -- Mark all messages as read that were sent by others
  UPDATE messages
  SET is_read = TRUE
  WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get conversations for a user with additional details
CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS SETOF json AS $$
DECLARE
  conversation_record RECORD;
  result json;
BEGIN
  FOR conversation_record IN
    SELECT c.id, c.title, c.created_at, c.updated_at, c.booking_id
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE cp.user_id = user_id
    ORDER BY c.updated_at DESC
  LOOP
    -- Get participants
    SELECT json_agg(
      json_build_object(
        'user_id', cp.user_id,
        'profiles', (
          SELECT json_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'avatar_url', p.avatar_url
          )
          FROM profiles p
          WHERE p.id = cp.user_id
        )
      )
    ) INTO result
    FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_record.id;
    
    -- Get latest message
    WITH latest_message AS (
      SELECT 
        content,
        created_at,
        sender_id
      FROM messages
      WHERE conversation_id = conversation_record.id
      ORDER BY created_at DESC
      LIMIT 1
    )
    SELECT 
      CASE WHEN COUNT(*) > 0 THEN
        json_build_object(
          'content', m.content,
          'created_at', m.created_at,
          'sender_id', m.sender_id
        )
      ELSE NULL
      END INTO result
    FROM latest_message m;
    
    -- Count unread messages
    SELECT COUNT(*) INTO result
    FROM messages
    WHERE 
      conversation_id = conversation_record.id AND
      sender_id != user_id AND
      is_read = FALSE;
    
    -- Combine all data
    RETURN NEXT json_build_object(
      'id', conversation_record.id,
      'title', conversation_record.title,
      'created_at', conversation_record.created_at,
      'updated_at', conversation_record.updated_at,
      'booking_id', conversation_record.booking_id,
      'participants', result,
      'latestMessage', result,
      'unreadCount', result
    );
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

