-- Create a function to create the video_rooms table
CREATE OR REPLACE FUNCTION create_video_rooms_table()
RETURNS void AS $$
BEGIN
  -- Create video_rooms table if it doesn't exist
  CREATE TABLE IF NOT EXISTS video_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    room_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(booking_id)
  );
END;
$$ LANGUAGE plpgsql;

