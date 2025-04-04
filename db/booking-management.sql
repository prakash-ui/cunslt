-- Add new fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_policy VARCHAR(50) DEFAULT 'standard';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES bookings(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes_client TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes_expert TEXT;

-- Create booking_history table to track changes
CREATE TABLE IF NOT EXISTS booking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'rescheduled', 'cancelled', 'completed', etc.
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  previous_date DATE,
  new_date DATE,
  previous_time_start TIME,
  new_time_start TIME,
  previous_time_end TIME,
  new_time_end TIME,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_role VARCHAR(20),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS booking_history_booking_id_idx ON booking_history(booking_id);

-- Create cancellation_policies table
CREATE TABLE IF NOT EXISTS cancellation_policies (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  hours_before_deadline INTEGER NOT NULL,
  refund_percentage INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default cancellation policies
INSERT INTO cancellation_policies (id, name, description, hours_before_deadline, refund_percentage)
VALUES
  ('flexible', 'Flexible', 'Free cancellation up to 4 hours before the consultation. After that, 50% of the consultation fee is charged.', 4, 50),
  ('standard', 'Standard', 'Free cancellation up to 24 hours before the consultation. After that, 70% of the consultation fee is charged.', 24, 30),
  ('strict', 'Strict', 'Free cancellation up to 48 hours before the consultation. After that, 100% of the consultation fee is charged.', 48, 0)
ON CONFLICT (id) DO NOTHING;

-- Function to calculate cancellation deadline and fee
CREATE OR REPLACE FUNCTION calculate_cancellation_details(p_booking_id UUID)
RETURNS void AS $$
DECLARE
  v_policy_id VARCHAR(50);
  v_hours_before INTEGER;
  v_refund_percentage INTEGER;
  v_consultation_date TIMESTAMP WITH TIME ZONE;
  v_amount DECIMAL(10,2);
BEGIN
  -- Get booking details
  SELECT 
    b.cancellation_policy,
    (b.date || ' ' || b.start_time)::TIMESTAMP WITH TIME ZONE,
    b.amount
  INTO 
    v_policy_id,
    v_consultation_date,
    v_amount
  FROM bookings b
  WHERE b.id = p_booking_id;
  
  -- Get policy details
  SELECT 
    hours_before_deadline,
    refund_percentage
  INTO 
    v_hours_before,
    v_refund_percentage
  FROM cancellation_policies
  WHERE id = v_policy_id;
  
  -- Calculate deadline and fee
  UPDATE bookings
  SET 
    cancellation_deadline = v_consultation_date - (v_hours_before || ' hours')::INTERVAL,
    cancellation_fee = (v_amount * (100 - v_refund_percentage)) / 100
  WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate cancellation details on booking creation/update
CREATE OR REPLACE FUNCTION booking_cancellation_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_cancellation_details(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_after_insert_update
AFTER INSERT OR UPDATE OF date, start_time, cancellation_policy, amount ON bookings
FOR EACH ROW
EXECUTE FUNCTION booking_cancellation_trigger();

-- Function to log booking history
CREATE OR REPLACE FUNCTION log_booking_history(
  p_booking_id UUID,
  p_action VARCHAR(50),
  p_previous_status VARCHAR(50),
  p_new_status VARCHAR(50),
  p_previous_date DATE,
  p_new_date DATE,
  p_previous_time_start TIME,
  p_new_time_start TIME,
  p_previous_time_end TIME,
  p_new_time_end TIME,
  p_performed_by UUID,
  p_performed_by_role VARCHAR(20),
  p_reason TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO booking_history (
    booking_id,
    action,
    previous_status,
    new_status,
    previous_date,
    new_date,
    previous_time_start,
    new_time_start,
    previous_time_end,
    new_time_end,
    performed_by,
    performed_by_role,
    reason
  ) VALUES (
    p_booking_id,
    p_action,
    p_previous_status,
    p_new_status,
    p_previous_date,
    p_new_date,
    p_previous_time_start,
    p_new_time_start,
    p_previous_time_end,
    p_new_time_end,
    p_performed_by,
    p_performed_by_role,
    p_reason
  );
END;
$$ LANGUAGE plpgsql;

