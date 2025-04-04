-- Function to update existing bookings with cancellation details
CREATE OR REPLACE FUNCTION update_existing_bookings_cancellation()
RETURNS void AS $$
DECLARE
  booking_rec RECORD;
BEGIN
  FOR booking_rec IN SELECT id FROM bookings LOOP
    PERFORM calculate_cancellation_details(booking_rec.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

