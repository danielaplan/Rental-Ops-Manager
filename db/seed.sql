-- Clean development database only. Run after schema.sql; never seed operational data.
-- Both demonstration owners use password "password". Replace before deployment.
USE akad_rentals;

INSERT INTO USERS (user_id,full_name,role,username,account_status,is_primary_owner,contact_number,password_hash) VALUES
    (1,'Maria Santos','owner','maria','Active',1,'0917-123-4567','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    (2,'Juan Dela Cruz','owner','juan','Active',0,'0918-222-3333','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO SERVICES (service_id,service_name,description,default_preparation_minutes,default_travel_minutes) VALUES
    (1,'JBL Karaoke Rental','Karaoke equipment rental.',0,0),
    (2,'Sweet Corner Setup','Dessert and candy table setup.',0,0),
    (3,'Balloon Decoration','Balloon garlands, arches, and backdrops.',0,0);

<<<<<<< HEAD
-- ----------------------------------------------------------------------------
-- Services + packages. One service, one package per booking (FR-05/FE-06).
-- ----------------------------------------------------------------------------
INSERT INTO SERVICES (service_id, service_name, description, image) VALUES
    (1, 'Karaoke Rental',   'Full karaoke setup with a huge song library, wireless mics, and a big screen.', 'https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800&q=80'),
    (2, 'Sweet Corner',     'A beautifully arranged dessert and candy table your guests will photograph before they taste it.', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80'),
    (3, 'Balloon Decoration', 'Custom balloon garlands, arches, and backdrops styled around your event theme and colors.', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80')
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name), description = VALUES(description), image = VALUES(image);
=======
INSERT INTO PACKAGES (package_id,service_id,package_name,price,duration_minutes) VALUES
    (1,1,'Standard Karaoke (up to 4 hrs)',2500.00,240),
    (2,1,'Extended Karaoke (up to 8 hrs)',4500.00,480),
    (3,2,'Sweet Corner Mini (20 pax)',3500.00,0),
    (4,2,'Sweet Corner Full (30 pax)',5500.00,0),
    (5,3,'Balloon Arch Starter',4000.00,0),
    (6,3,'Balloon Arch Premium',7000.00,0);
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

INSERT INTO CATEGORIES (category_id,name,status) VALUES
    (1,'Entertainment','Active'),(2,'Food & Treats','Active'),(3,'Decorations','Active');

-- Customer, booking, and payment examples are omitted: enter transactions through
-- owner APIs so snapshots and audit records agree.
