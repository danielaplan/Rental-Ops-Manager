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

INSERT INTO PACKAGES (package_id,service_id,package_name,price,duration_minutes) VALUES
    (1,1,'Standard Karaoke (up to 4 hrs)',2500.00,240),
    (2,1,'Extended Karaoke (up to 8 hrs)',4500.00,480),
    (3,2,'Sweet Corner Mini (20 pax)',3500.00,0),
    (4,2,'Sweet Corner Full (30 pax)',5500.00,0),
    (5,3,'Balloon Arch Starter',4000.00,0),
    (6,3,'Balloon Arch Premium',7000.00,0);

INSERT INTO PACKAGES (package_id,service_id,package_name,price,description,inclusions,duration_minutes) VALUES
    (7,3,'Package A',2799.00,'Balloon decoration package. Additional transportation fee applies for far locations depending on the venue.',
     '1 panel with cloth\n1 grass carpet\n1 cake stand\n1 bending light\n1-2 styro characters\n1 HBD LED light\nFree name (1 name only)\n#1 LED light (if needed)\n2 colors of balloon\nFree use of sweet corner equipment (no chocolate fountain included)',0),
    (8,3,'Package K',3499.00,'Balloon decoration package. Additional transportation fee applies for far locations depending on the venue.',
     '1 panel with cloth\n1 pc grass\n1 pc cake stand\n1 pc bending light\n1-3 styro characters or baby standee character\n1 HBD LED light\nFree name (2 names only)\n#1 LED light (if needed)\n3 colors of balloons\n1 pc spotlight\n1 pc celebrant chair\n1 pc souvenir rack\nFree use of sweet corner equipment',0),
    (9,3,'Package D',3999.00,'Balloon decoration package. Additional transportation fee applies for far locations depending on the venue.',
     '2 panels with cloth or 1 big square panel\n1 pc grass\n2 pcs cake stand\n1 pc bending light\n3-6 pcs styro characters (depends on your theme)\n1 pc HBD LED light\nFree name\n#1 LED light (if needed)\n3-4 colors of balloon\n2 pc spotlight\n1 pc celebrant chair\n1 pc souvenir rack\nFree use of sweet corner equipment',0);

INSERT INTO CHECKLIST_TEMPLATES (template_id,package_id,template_name,status) VALUES
    (1,7,'Package A equipment v1','Active'),
    (2,8,'Package K equipment v1','Active'),
    (3,9,'Package D equipment v1','Active');

INSERT INTO CHECKLIST_TEMPLATE_ITEMS (template_id,item_name,expected_quantity) VALUES
    (1,'Panel with cloth',1),(1,'Grass carpet',1),(1,'Cake stand',1),(1,'Bending light',1),(1,'HBD LED light',1),
    (2,'Panel with cloth',1),(2,'Grass',1),(2,'Cake stand',1),(2,'Bending light',1),(2,'HBD LED light',1),(2,'Spotlight',1),(2,'Celebrant chair',1),(2,'Souvenir rack',1),
    (3,'Grass',1),(3,'Cake stand',2),(3,'Bending light',1),(3,'HBD LED light',1),(3,'Spotlight',2),(3,'Celebrant chair',1),(3,'Souvenir rack',1);

INSERT INTO CATEGORIES (category_id,name,status) VALUES
    (1,'Entertainment','Active'),(2,'Food & Treats','Active'),(3,'Decorations','Active');

-- Customer, booking, and payment examples are omitted: enter transactions through
-- owner APIs so snapshots and audit records agree.
