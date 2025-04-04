-- Add full-text search capabilities to experts table
ALTER TABLE experts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_expert_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.skills::text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.education::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.experience::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.languages::text, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.certifications::text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector on insert or update
DROP TRIGGER IF EXISTS update_expert_search_vector_trigger ON experts;
CREATE TRIGGER update_expert_search_vector_trigger
BEFORE INSERT OR UPDATE ON experts
FOR EACH ROW
EXECUTE FUNCTION update_expert_search_vector();

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS experts_search_vector_idx ON experts USING GIN(search_vector);

-- Update existing experts
UPDATE experts SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(bio, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(skills::text, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(education::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(experience::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(languages::text, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(certifications::text, '')), 'B');

-- Create table for search history
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON search_history(user_id);

-- Create table for saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS saved_searches_user_id_idx ON saved_searches(user_id);

-- Create table for expert categories (for better filtering)
CREATE TABLE IF NOT EXISTS expert_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES expert_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for expert-category relationships
CREATE TABLE IF NOT EXISTS expert_category_mappings (
  expert_id UUID REFERENCES experts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expert_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (expert_id, category_id)
);

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS expert_category_mappings_expert_id_idx ON expert_category_mappings(expert_id);
CREATE INDEX IF NOT EXISTS expert_category_mappings_category_id_idx ON expert_category_mappings(category_id);

-- Insert some default categories
INSERT INTO expert_categories (id, name, description) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Business', 'Business consulting and strategy'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Finance', 'Financial advice and planning'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Technology', 'Technology consulting and development'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Marketing', 'Marketing strategy and implementation'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Legal', 'Legal advice and services')
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories
INSERT INTO expert_categories (name, description, parent_id) VALUES
  ('Business Strategy', 'Strategic planning and execution', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('Entrepreneurship', 'Starting and growing businesses', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('Operations', 'Business operations and management', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  
  ('Investment', 'Investment advice and portfolio management', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  ('Personal Finance', 'Personal financial planning and management', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  ('Corporate Finance', 'Corporate financial strategy and management', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  
  ('Software Development', 'Software design and development', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
  ('Data Science', 'Data analysis and machine learning', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
  ('Cybersecurity', 'Information security and protection', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
  
  ('Digital Marketing', 'Online marketing strategies', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
  ('Content Marketing', 'Content creation and strategy', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
  ('Social Media', 'Social media marketing and management', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
  
  ('Business Law', 'Legal advice for businesses', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),
  ('Intellectual Property', 'Patents, trademarks, and copyright', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),
  ('Contract Law', 'Contract drafting and review', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15')
ON CONFLICT (name) DO NOTHING;

-- Create function to get similar experts based on categories and skills
CREATE OR REPLACE FUNCTION get_similar_experts(p_expert_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH expert_categories AS (
    SELECT category_id FROM expert_category_mappings WHERE expert_id = p_expert_id
  ),
  expert_skills AS (
    SELECT unnest(skills) AS skill FROM experts WHERE id = p_expert_id
  )
  SELECT 
    e.id,
    (
      -- Category match weight (0.6)
      (SELECT COUNT(*) FROM expert_category_mappings ecm 
       WHERE ecm.expert_id = e.id AND ecm.category_id IN (SELECT category_id FROM expert_categories)) * 0.6 +
      -- Skill match weight (0.4)
      (SELECT COUNT(*) FROM unnest(e.skills) s 
       WHERE s IN (SELECT skill FROM expert_skills)) * 0.4
    ) AS similarity
  FROM experts e
  WHERE e.id != p_expert_id
  AND e.status = 'approved'
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to get expert recommendations for a user based on their search history and bookings
CREATE OR REPLACE FUNCTION get_expert_recommendations(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_searches AS (
    -- Get search terms from user's search history
    SELECT query FROM search_history
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 10
  ),
  user_booked_categories AS (
    -- Get categories from experts the user has booked
    SELECT DISTINCT ecm.category_id
    FROM bookings b
    JOIN expert_category_mappings ecm ON b.expert_id = ecm.expert_id
    WHERE b.user_id = p_user_id
  ),
  user_booked_experts AS (
    -- Get experts the user has already booked
    SELECT DISTINCT expert_id FROM bookings WHERE user_id = p_user_id
  )
  SELECT 
    e.id,
    (
      -- Search relevance (0.4)
      COALESCE((
        SELECT MAX(ts_rank(e.search_vector, to_tsquery('english', regexp_replace(query, '\s+', ' & ', 'g'))))
        FROM user_searches
        WHERE query IS NOT NULL AND query != ''
      ), 0) * 0.4 +
      -- Category match (0.4)
      COALESCE((
        SELECT COUNT(*) FROM expert_category_mappings ecm 
        WHERE ecm.expert_id = e.id AND ecm.category_id IN (SELECT category_id FROM user_booked_categories)
      ), 0) * 0.4 +
      -- Rating weight (0.2)
      COALESCE(e.average_rating, 0) * 0.04 -- Scale 0-5 to 0-0.2
    ) AS relevance_score
  FROM experts e
  WHERE e.status = 'approved'
  AND e.id NOT IN (SELECT expert_id FROM user_booked_experts)
  ORDER BY relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

