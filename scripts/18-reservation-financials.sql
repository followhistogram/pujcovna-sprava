-- Add new columns for better financial tracking
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS rental_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_total INTEGER DEFAULT 0;

-- Update existing reservations to calculate totals
UPDATE reservations 
SET 
  rental_total = COALESCE((
    SELECT SUM(unit_price * quantity) 
    FROM reservation_items 
    WHERE reservation_id = reservations.id 
    AND item_type = 'camera'
  ), 0),
  sales_total = COALESCE((
    SELECT SUM(unit_price * quantity) 
    FROM reservation_items 
    WHERE reservation_id = reservations.id 
    AND item_type IN ('film', 'accessory')
  ), 0),
  deposit_total = COALESCE((
    SELECT SUM(deposit * quantity) 
    FROM reservation_items 
    WHERE reservation_id = reservations.id
  ), 0);

-- Create function to automatically update sales_total when reservation items change
CREATE OR REPLACE FUNCTION update_reservation_sales_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sales_total for the affected reservation
  UPDATE reservations 
  SET sales_total = (
    SELECT COALESCE(SUM(ri.unit_price * ri.quantity), 0)
    FROM reservation_items ri 
    WHERE ri.reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
    AND ri.item_type IN ('film', 'accessory')
  )
  WHERE id = COALESCE(NEW.reservation_id, OLD.reservation_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update sales_total
DROP TRIGGER IF EXISTS update_sales_total_on_item_change ON reservation_items;
CREATE TRIGGER update_sales_total_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON reservation_items
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_sales_total();

-- Create function to automatically update amount_paid when payment transactions change
CREATE OR REPLACE FUNCTION update_reservation_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the amount_paid for the affected reservation
  UPDATE reservations 
  SET amount_paid = COALESCE((
    SELECT SUM(amount) 
    FROM payment_transactions 
    WHERE reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
  ), 0)
  WHERE id = COALESCE(NEW.reservation_id, OLD.reservation_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS payment_transaction_update_trigger ON payment_transactions;

-- Create trigger for INSERT, UPDATE, DELETE on payment_transactions
CREATE TRIGGER payment_transaction_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_amount_paid();

-- Create function to automatically update totals when reservation items change
CREATE OR REPLACE FUNCTION update_reservation_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the totals for the affected reservation
  UPDATE reservations 
  SET 
    rental_total = COALESCE((
      SELECT SUM(unit_price * quantity) 
      FROM reservation_items 
      WHERE reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
      AND item_type = 'camera'
    ), 0),
    sales_total = COALESCE((
      SELECT SUM(unit_price * quantity) 
      FROM reservation_items 
      WHERE reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
      AND item_type IN ('film', 'accessory')
    ), 0),
    deposit_total = COALESCE((
      SELECT SUM(deposit * quantity) 
      FROM reservation_items 
      WHERE reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
    ), 0),
    total_price = COALESCE((
      SELECT SUM(unit_price * quantity) + SUM(deposit * quantity)
      FROM reservation_items 
      WHERE reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
    ), 0)
  WHERE id = COALESCE(NEW.reservation_id, OLD.reservation_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS reservation_items_update_trigger ON reservation_items;

-- Create trigger for INSERT, UPDATE, DELETE on reservation_items
CREATE TRIGGER reservation_items_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reservation_items
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_totals();
