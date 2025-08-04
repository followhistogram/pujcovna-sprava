-- Insert initial categories
INSERT INTO categories (name) VALUES
('Polaroidy'),
('Instaxy'),
('Analogové fotoaparáty'),
('Tiskárny')
ON CONFLICT (name) DO NOTHING;

-- Insert initial films
INSERT INTO films (name, type, stock, low_stock_threshold) VALUES
('Polaroid Color i-Type Film', 'Polaroid', 45, 20),
('Instax Mini Film', 'Instax Mini', 15, 30),
('Instax Square Film', 'Instax Square', 25, 15),
('Instax Wide Film', 'Instax Wide', 32, 15),
('Polaroid B&W i-Type Film', 'Polaroid', 20, 10)
ON CONFLICT (name) DO NOTHING;

-- Insert cameras with proper references
DO $$
DECLARE
    instax_cat_id UUID;
    polaroid_cat_id UUID;
    analog_cat_id UUID;
    wide_film_id UUID;
    itype_film_id UUID;
    mini_film_id UUID;
    square_film_id UUID;
    instax_wide_cam_id UUID;
    polaroid_now_cam_id UUID;
    instax_mini_cam_id UUID;
    canon_ae1_cam_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO instax_cat_id FROM categories WHERE name = 'Instaxy';
    SELECT id INTO polaroid_cat_id FROM categories WHERE name = 'Polaroidy';
    SELECT id INTO analog_cat_id FROM categories WHERE name = 'Analogové fotoaparáty';
    
    -- Get film IDs
    SELECT id INTO wide_film_id FROM films WHERE name = 'Instax Wide Film';
    SELECT id INTO itype_film_id FROM films WHERE name = 'Polaroid Color i-Type Film';
    SELECT id INTO mini_film_id FROM films WHERE name = 'Instax Mini Film';
    SELECT id INTO square_film_id FROM films WHERE name = 'Instax Square Film';

    -- Insert cameras
    INSERT INTO cameras (name, category_id, status, stock, deposit, description, short_description, film_id, images) VALUES
    ('Instax Wide 300', instax_cat_id, 'active', 3, 1500, 
     'Fujifilm Instax Wide 300 využívá velký formát instantních filmů o rozměrech 86 x 108 mm a lze s ním tedy vytvářet snímky o velikosti kreditní karty 62 mm x 99 mm. Široký filmový formát se více podobá formátu klasických fotografií než-li snímkům z instantních fotoaparátů.',
     'Nejnovější Instax na největší formát filmu. Vhodný na párty a oslavy.',
     wide_film_id, 
     '["/placeholder.svg?height=400&width=400&text=Instax+Wide+300"]'::jsonb)
    RETURNING id INTO instax_wide_cam_id;

    INSERT INTO cameras (name, category_id, status, stock, deposit, description, short_description, film_id, images) VALUES
    ('Polaroid Now+', polaroid_cat_id, 'active', 5, 2000,
     'Propojte foťák s aplikací v telefonu a odemkněte další kreativní nástroje. Automaticky zaostřuje dílem objektu na vzdálenost 0,55 m a nastavením chromatické vzdálenosti z rozsahu při celé snímky. Disponuje vestavěným bleskem s automatickým nastavením a režimem Fill-in Flash.',
     'Kreativní parťák s připojením k mobilní aplikaci.',
     itype_film_id,
     '["/placeholder.svg?height=400&width=400&text=Polaroid+Now+Plus"]'::jsonb)
    RETURNING id INTO polaroid_now_cam_id;

    INSERT INTO cameras (name, category_id, status, stock, deposit, description, short_description, film_id, images) VALUES
    ('Instax Mini 12', instax_cat_id, 'active', 8, 1200,
     'Nejnovější Instax na nejpopulárnější formát filmu. Vše se nastavuje automaticky, nemusíte se tak o nic starat.',
     'Nejnovější Instax na nejpopulárnější formát filmu.',
     mini_film_id,
     '["/placeholder.svg?height=400&width=400&text=Instax+Mini+12"]'::jsonb)
    RETURNING id INTO instax_mini_cam_id;

    INSERT INTO cameras (name, category_id, status, stock, deposit, description, short_description, film_id) VALUES
    ('Canon AE-1', analog_cat_id, 'draft', 1, 3000,
     'Legendární 35mm zrcadlovka, která definovala generaci fotografů. Manuální ostření, poloautomatický režim.',
     'Klasika pro milovníky analogové fotografie.',
     NULL)
    RETURNING id INTO canon_ae1_cam_id;

    -- Insert sample cameras
    INSERT INTO cameras (name, brand, model, serial_number, purchase_date, purchase_price, daily_rate, status, condition, description) VALUES
    ('Polaroid SX-70 Alpha 1', 'Polaroid', 'SX-70', 'PX70001', '2023-01-15', 15000.00, 500.00, 'available', 'excellent', 'Klasický skládací Polaroid v perfektním stavu'),
    ('Instax Mini 11 Charcoal Gray', 'Fujifilm', 'Instax Mini 11', 'IM11001', '2023-02-20', 2500.00, 200.00, 'available', 'excellent', 'Moderní instantní fotoaparát s automatickým nastavením'),
    ('Polaroid Now i-Type Black', 'Polaroid', 'Now', 'PN001', '2023-03-10', 4500.00, 300.00, 'available', 'good', 'Nejnovější Polaroid s autofokusem'),
    ('Instax Wide 300', 'Fujifilm', 'Instax Wide 300', 'IW300001', '2023-04-05', 3200.00, 250.00, 'available', 'excellent', 'Širokoúhlý instantní fotoaparát'),
    ('Polaroid SX-70 Sonar OneStep', 'Polaroid', 'SX-70 Sonar', 'PXS001', '2023-05-12', 18000.00, 600.00, 'maintenance', 'good', 'Vintage Polaroid s autofokusem');

    -- Insert pricing tiers for cameras
    IF instax_wide_cam_id IS NOT NULL THEN
        INSERT INTO pricing_tiers (camera_id, days_label, price_per_day) VALUES
        (instax_wide_cam_id, '1', 350),
        (instax_wide_cam_id, '2', 175),
        (instax_wide_cam_id, '3', 150),
        (instax_wide_cam_id, '4', 130),
        (instax_wide_cam_id, '5+', 110);
    END IF;

    IF polaroid_now_cam_id IS NOT NULL THEN
        INSERT INTO pricing_tiers (camera_id, days_label, price_per_day) VALUES
        (polaroid_now_cam_id, '1', 400),
        (polaroid_now_cam_id, '2', 250),
        (polaroid_now_cam_id, '3', 220),
        (polaroid_now_cam_id, '4+', 200);
    END IF;

    IF instax_mini_cam_id IS NOT NULL THEN
        INSERT INTO pricing_tiers (camera_id, days_label, price_per_day) VALUES
        (instax_mini_cam_id, '1', 300),
        (instax_mini_cam_id, '2', 200),
        (instax_mini_cam_id, '3+', 180);
    END IF;

    -- Insert serial numbers
    IF instax_wide_cam_id IS NOT NULL THEN
        INSERT INTO serial_numbers (camera_id, serial_number) VALUES
        (instax_wide_cam_id, 'IW300-001'),
        (instax_wide_cam_id, 'IW300-002'),
        (instax_wide_cam_id, 'IW300-003');
    END IF;

    IF polaroid_now_cam_id IS NOT NULL THEN
        INSERT INTO serial_numbers (camera_id, serial_number) VALUES
        (polaroid_now_cam_id, 'PNP-01'),
        (polaroid_now_cam_id, 'PNP-02'),
        (polaroid_now_cam_id, 'PNP-03'),
        (polaroid_now_cam_id, 'PNP-04'),
        (polaroid_now_cam_id, 'PNP-05');
    END IF;

    IF instax_mini_cam_id IS NOT NULL THEN
        INSERT INTO serial_numbers (camera_id, serial_number) VALUES
        (instax_mini_cam_id, 'IM12-001'),
        (instax_mini_cam_id, 'IM12-002'),
        (instax_mini_cam_id, 'IM12-003'),
        (instax_mini_cam_id, 'IM12-004'),
        (instax_mini_cam_id, 'IM12-005'),
        (instax_mini_cam_id, 'IM12-006'),
        (instax_mini_cam_id, 'IM12-007'),
        (instax_mini_cam_id, 'IM12-008');
    END IF;

    -- Insert sample rentals
    IF polaroid_now_cam_id IS NOT NULL THEN
        INSERT INTO rentals (customer_name, camera_id, rental_start, rental_end, status, deposit, deposit_status, delivery_method, total_price) VALUES
        ('Jan Novák', polaroid_now_cam_id, '2025-08-02 10:00:00+02', '2025-08-05 18:00:00+02', 'ready_for_dispatch', 2000, 'received', 'courier', 750),
        ('Tomáš Marek', polaroid_now_cam_id, '2025-07-30 09:00:00+02', '2025-08-03 17:00:00+02', 'returned', 2000, 'returned', 'personal', 750);
    END IF;

    IF instax_wide_cam_id IS NOT NULL THEN
        INSERT INTO rentals (customer_name, camera_id, rental_start, rental_end, status, deposit, deposit_status, delivery_method, total_price) VALUES
        ('Eva Dvořáková', instax_wide_cam_id, '2025-08-03 14:00:00+02', '2025-08-04 16:00:00+02', 'confirmed', 1500, 'received', 'personal', 350),
        ('Petr Svoboda', instax_wide_cam_id, '2025-07-28 12:00:00+02', '2025-08-01 15:00:00+02', 'active', 1500, 'received', 'courier', 525);
    END IF;

    IF instax_mini_cam_id IS NOT NULL THEN
        INSERT INTO rentals (customer_name, camera_id, rental_start, rental_end, status, deposit, deposit_status, delivery_method, total_price) VALUES
        ('Lucie Černá', instax_mini_cam_id, '2025-08-05 11:00:00+02', '2025-08-10 19:00:00+02', 'confirmed', 1200, 'received', 'personal', 900);
    END IF;

    -- Insert sample customers
    INSERT INTO customers (first_name, last_name, email, phone, address, city, postal_code) VALUES
    ('Jan', 'Novák', 'jan.novak@email.cz', '+420 123 456 789', 'Václavské náměstí 1', 'Praha', '110 00'),
    ('Marie', 'Svobodová', 'marie.svobodova@email.cz', '+420 987 654 321', 'Náměstí Míru 5', 'Brno', '602 00'),
    ('Petr', 'Dvořák', 'petr.dvorak@email.cz', '+420 555 123 456', 'Hlavní třída 10', 'Ostrava', '702 00'),
    ('Anna', 'Nováková', 'anna.novakova@email.cz', '+420 777 888 999', 'Wenceslas Square 15', 'Praha', '110 00');

    -- Insert sample reservations
    INSERT INTO reservations (customer_id, camera_id, rental_start_date, rental_end_date, total_price, deposit, status, notes) VALUES
    ((SELECT id FROM customers WHERE email = 'jan.novak@email.cz'), 
     (SELECT id FROM cameras WHERE serial_number = 'PX70001'), 
     '2024-02-01', '2024-02-03', 1000.00, 2000.00, 'completed', 'Svatební focení'),
    ((SELECT id FROM customers WHERE email = 'marie.svobodova@email.cz'), 
     (SELECT id FROM cameras WHERE serial_number = 'IM11001'), 
     '2024-02-15', '2024-02-17', 400.00, 500.00, 'confirmed', 'Rodinná oslava'),
    ((SELECT id FROM customers WHERE email = 'petr.dvorak@email.cz'), 
     (SELECT id FROM cameras WHERE serial_number = 'PN001'), 
     '2024-03-01', '2024-03-05', 1200.00, 1000.00, 'active', 'Firemní akce');

END $$;
