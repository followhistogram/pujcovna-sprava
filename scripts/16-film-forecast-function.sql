CREATE OR REPLACE FUNCTION get_film_forecast()
RETURNS TABLE(name TEXT, total_quantity BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
      f.name,
      SUM(ri.quantity) as total_quantity
    FROM
      reservation_items ri
    JOIN
      reservations r ON ri.reservation_id = r.id
    JOIN
      films f ON ri.item_id = f.id
    WHERE
      ri.item_type = 'film' AND
      r.status IN ('confirmed', 'ready_for_dispatch')
    GROUP BY
      f.name
    ORDER BY
      total_quantity DESC;
END;
$$ LANGUAGE plpgsql;
