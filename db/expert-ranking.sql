-- Create a table to store expert rankings
CREATE TABLE IF NOT EXISTS expert_rankings (
  expert_id UUID PRIMARY KEY REFERENCES experts(id) ON DELETE CASCADE,
  overall_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  review_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  completion_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  response_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  booking_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  verification_bonus DECIMAL(5,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS expert_rankings_score_idx ON expert_rankings(overall_score DESC);

-- Function to calculate and update expert rankings
CREATE OR REPLACE FUNCTION calculate_expert_ranking(p_expert_id UUID)
RETURNS void AS $$
DECLARE
  v_review_score DECIMAL(5,2) := 0;
  v_completion_score DECIMAL(5,2) := 0;
  v_response_score DECIMAL(5,2) := 0;
  v_booking_score DECIMAL(5,2) := 0;
  v_verification_bonus DECIMAL(5,2) := 0;
  v_overall_score DECIMAL(5,2) := 0;
  
  v_review_count INTEGER := 0;
  v_avg_rating DECIMAL(5,2) := 0;
  v_total_bookings INTEGER := 0;
  v_completed_bookings INTEGER := 0;
  v_cancelled_bookings INTEGER := 0;
  v_avg_response_time DECIMAL(10,2) := 0;
  v_is_verified BOOLEAN := FALSE;
  v_booking_recency DECIMAL(5,2) := 0;
BEGIN
  -- Get expert verification status
  SELECT is_verified INTO v_is_verified
  FROM experts
  WHERE id = p_expert_id;
  
  -- Calculate review score (50% of total)
  SELECT 
    COUNT(*),
    COALESCE(AVG(rating), 0)
  INTO 
    v_review_count,
    v_avg_rating
  FROM reviews
  WHERE expert_id = p_expert_id AND is_public = true;
  
  -- Review score combines rating and number of reviews
  IF v_review_count > 0 THEN
    -- Base score from average rating (0-5 scale)
    v_review_score := v_avg_rating;
    
    -- Bonus for number of reviews (logarithmic scale to prevent large numbers from dominating)
    -- Max bonus of 1.0 at around 100 reviews
    v_review_score := v_review_score + LEAST(LN(v_review_count) / LN(100), 1.0);
    
    -- Normalize to 0-5 scale
    v_review_score := LEAST(v_review_score, 5.0);
  END IF;
  
  -- Calculate completion score (20% of total)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled' AND cancelled_by = 'expert')
  INTO 
    v_total_bookings,
    v_completed_bookings,
    v_cancelled_bookings
  FROM bookings
  WHERE expert_id = p_expert_id AND created_at > NOW() - INTERVAL '6 months';
  
  IF v_total_bookings > 0 THEN
    -- Completion rate (0-1)
    v_completion_score := (v_completed_bookings::DECIMAL / v_total_bookings) * 5.0;
    
    -- Penalty for cancellations
    IF v_cancelled_bookings > 0 THEN
      v_completion_score := v_completion_score - (v_cancelled_bookings::DECIMAL / v_total_bookings) * 2.5;
    END IF;
    
    -- Ensure score is between 0-5
    v_completion_score := GREATEST(LEAST(v_completion_score, 5.0), 0.0);
  ELSE
    -- Default score for new experts with no bookings
    v_completion_score := 2.5;
  END IF;
  
  -- Calculate response score (15% of total)
  SELECT 
    COALESCE(AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60), 0)
  INTO 
    v_avg_response_time
  FROM conversations
  JOIN conversation_participants ON conversations.id = conversation_participants.conversation_id
  WHERE conversation_participants.user_id = (SELECT user_id FROM experts WHERE id = p_expert_id)
  AND first_response_at IS NOT NULL
  AND created_at > NOW() - INTERVAL '3 months';
  
  IF v_avg_response_time > 0 THEN
    -- Convert response time to score (faster is better)
    -- 5.0 for < 5 min, 0 for > 24 hours
    v_response_score := 5.0 - LEAST(v_avg_response_time / (24 * 60) * 5.0, 5.0);
  ELSE
    -- Default score for new experts
    v_response_score := 2.5;
  END IF;
  
  -- Calculate booking score (10% of total)
  -- Recent bookings increase score
  SELECT 
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 month') * 2.0 +
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '3 months' AND created_at <= NOW() - INTERVAL '1 month')
  INTO v_booking_recency
  FROM bookings
  WHERE expert_id = p_expert_id AND status IN ('completed', 'confirmed');
  
  -- Cap at 5.0
  v_booking_score := LEAST(v_booking_recency, 5.0);
  
  -- Verification bonus (5% of total)
  IF v_is_verified THEN
    v_verification_bonus := 5.0;
  ELSE
    v_verification_bonus := 0.0;
  END IF;
  
  -- Calculate overall score (weighted average)
  v_overall_score := 
    (v_review_score * 0.50) +
    (v_completion_score * 0.20) +
    (v_response_score * 0.15) +
    (v_booking_score * 0.10) +
    (v_verification_bonus * 0.05);
  
  -- Insert or update the ranking
  INSERT INTO expert_rankings (
    expert_id,
    overall_score,
    review_score,
    completion_score,
    response_score,
    booking_score,
    verification_bonus,
    last_updated
  ) VALUES (
    p_expert_id,
    v_overall_score,
    v_review_score,
    v_completion_score,
    v_response_score,
    v_booking_score,
    v_verification_bonus,
    NOW()
  )
  ON CONFLICT (expert_id) DO UPDATE SET
    overall_score = v_overall_score,
    review_score = v_review_score,
    completion_score = v_completion_score,
    response_score = v_response_score,
    booking_score = v_booking_score,
    verification_bonus = v_verification_bonus,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update all expert rankings
CREATE OR REPLACE FUNCTION update_all_expert_rankings()
RETURNS void AS $$
DECLARE
  expert_rec RECORD;
BEGIN
  FOR expert_rec IN SELECT id FROM experts LOOP
    PERFORM calculate_expert_ranking(expert_rec.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

