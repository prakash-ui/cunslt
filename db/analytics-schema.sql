-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event VARCHAR(255) NOT NULL,
  properties JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON analytics_events(event);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events(user_id);

