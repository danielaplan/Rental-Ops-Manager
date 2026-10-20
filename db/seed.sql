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

INSERT INTO PACKAGES (package_id,service_id,package_name,price,description,inclusions,duration_minutes) VALUES
    (1,1,'Karaoke Setup — 12 Hours',999.00,'Twelve-hour karaoke setup rental.','1 Smart TV 32"\n1 karaoke set\n1 JBL Speaker 520\n2 JBL battery microphones',720),
    (2,1,'Karaoke Setup — 24 Hours',1499.00,'Twenty-four-hour karaoke setup rental.','1 Smart TV 32"\n1 karaoke set\n1 JBL Speaker 520\n2 JBL battery microphones',1440),
    (3,1,'Karaoke Projector Setup — 12 Hours',999.00,'Twelve-hour projector karaoke setup rental.','1 mini projector\n1 JBL speaker\n2 JBL battery microphones',720),
    (4,1,'Karaoke Projector Setup — 24 Hours',1499.00,'Twenty-four-hour projector karaoke setup rental.','1 mini projector\n1 JBL speaker\n2 JBL battery microphones',1440),
    (5,1,'JBL Speaker 520 Only — 12 Hours',699.00,'Twelve-hour speaker-only rental.','1 JBL Speaker 520',720),
    (6,1,'JBL Speaker 520 Only — 24 Hours',999.00,'Twenty-four-hour speaker-only rental.','1 JBL Speaker 520',1440);

INSERT INTO PACKAGES (package_id,service_id,package_name,price,description,inclusions,duration_minutes) VALUES
    (7,3,'Package A',2799.00,'Balloon decoration package. Additional transportation fee applies for far locations depending on the venue.',
     '1 panel with cloth\n1 grass carpet\n1 cake stand\n1 bending light\n1-2 styro characters\n1 HBD LED light\nFree name (1 name only)\n#1 LED light (if needed)\n2 colors of balloon\nFree use of sweet corner equipment (no chocolate fountain included)',0),
    (8,3,'Package K',3499.00,'Balloon decoration package. Additional transportation fee applies for far locations depending on the venue.',
     '1 panel with cloth\n1 pc grass\n1 pc cake stand\n1 pc bending light\n1-3 styro characters or baby standee character\n1 HBD LED light\nFree name (2 names only)\n#1 LED light (if needed)\n3 colors of balloons\n1 pc spotlight\n1 pc celebrant chair\n1 pc souvenir rack\nFree use of sweet corner equipment',0),
    (9,3,'Package D',3999.00,'Balloon decoration package. Additional transportation fee applies for far locations depending on the venue.',
     '2 panels with cloth or 1 big square panel\n1 pc grass\n2 pcs cake stand\n1 pc bending light\n3-6 pcs styro characters (depends on your theme)\n1 pc HBD LED light\nFree name\n#1 LED light (if needed)\n3-4 colors of balloon\n2 pc spotlight\n1 pc celebrant chair\n1 pc souvenir rack\nFree use of sweet corner equipment',0);

INSERT INTO PACKAGES (package_id,service_id,package_name,price,description,inclusions,duration_minutes) VALUES
    (10,2,'Sweet Corner Set A',250.00,'Rent-only Sweet Corner equipment set.','1 donut wall display\n1 round cake stand\n1 set of two-tier display stand\n1 set white-gold round stand\n3 white trays\n3 tongs\n1 board name',0),
    (11,2,'Sweet Corner Set K',350.00,'Rent-only Sweet Corner equipment set.','1 donut wall display\n1 round cake stand\n1 set of two-tier display stand\n1 set white-gold round stand\n1 set white-gold square stand\n2 large white trays\n2 medium white trays\n3 tongs\n1 board name',0),
    (12,2,'Sweet Corner Set D',500.00,'Rent-only Sweet Corner equipment set.','1 donut wall display\n1 round cake stand\n1 set of two-tier display stand\n1 set of three-tier display stand\n1 set white-gold round stand\n1 set white-gold square stand\n4 large white trays\n2 medium white trays\n1 small chocolate fountain\n5 tongs\n1 cup holder\n1 board name',0);

INSERT INTO ADDONS (addon_id,service_id,name,price,status) VALUES
    (1,1,'JBL Wireless Microphone',200.00,'Active'),
    (2,1,'Microphone Stand',100.00,'Active'),
    (3,2,'Chocolate Fountain Machine',150.00,'Active'),
    (4,2,'Donut Wall Display',50.00,'Active'),
    (5,2,'Two-Tier White Dessert Display Stand',30.00,'Active'),
    (6,2,'White Three-Tier Scroll Dessert Display Stand',30.00,'Active'),
    (7,2,'White & Gold Three-Tier Dessert Stand',30.00,'Active'),
    (8,2,'Round Rotating Cake Stand',40.00,'Active'),
    (9,2,'4 Rectangular Lace Serving Trays',30.00,'Active'),
    (10,2,'2 Square Lace Serving Trays',30.00,'Active');

INSERT INTO CHECKLIST_TEMPLATES (template_id,package_id,template_name,status) VALUES
    (1,7,'Package A equipment v1','Active'),
    (2,8,'Package K equipment v1','Active'),
    (3,9,'Package D equipment v1','Active'),
    (4,1,'Karaoke Setup 12 Hours v1','Active'),
    (5,2,'Karaoke Setup 24 Hours v1','Active'),
    (6,3,'Karaoke Projector Setup 12 Hours v1','Active'),
    (7,4,'Karaoke Projector Setup 24 Hours v1','Active'),
    (8,5,'JBL Speaker Only 12 Hours v1','Active'),
    (9,6,'JBL Speaker Only 24 Hours v1','Active'),
    (10,10,'Sweet Corner Set A v1','Active'),
    (11,11,'Sweet Corner Set K v1','Active'),
    (12,12,'Sweet Corner Set D v1','Active');

INSERT INTO CHECKLIST_TEMPLATE_ITEMS (template_id,item_name,expected_quantity) VALUES
    (1,'Panel with cloth',1),(1,'Grass carpet',1),(1,'Cake stand',1),(1,'Bending light',1),(1,'HBD LED light',1),
    (2,'Panel with cloth',1),(2,'Grass',1),(2,'Cake stand',1),(2,'Bending light',1),(2,'HBD LED light',1),(2,'Spotlight',1),(2,'Celebrant chair',1),(2,'Souvenir rack',1),
    (3,'Grass',1),(3,'Cake stand',2),(3,'Bending light',1),(3,'HBD LED light',1),(3,'Spotlight',2),(3,'Celebrant chair',1),(3,'Souvenir rack',1),
    (4,'Smart TV 32"',1),(4,'Karaoke set',1),(4,'JBL Speaker 520',1),(4,'JBL battery microphone',2),
    (5,'Smart TV 32"',1),(5,'Karaoke set',1),(5,'JBL Speaker 520',1),(5,'JBL battery microphone',2),
    (6,'Mini projector',1),(6,'JBL speaker',1),(6,'JBL battery microphone',2),
    (7,'Mini projector',1),(7,'JBL speaker',1),(7,'JBL battery microphone',2),
    (8,'JBL Speaker 520',1),(9,'JBL Speaker 520',1),
    (10,'Donut wall display',1),(10,'Round cake stand',1),(10,'Two-tier display stand set',1),(10,'White-gold round stand set',1),(10,'White tray',3),(10,'Tongs',3),(10,'Board name',1),
    (11,'Donut wall display',1),(11,'Round cake stand',1),(11,'Two-tier display stand set',1),(11,'White-gold round stand set',1),(11,'White-gold square stand set',1),(11,'Large white tray',2),(11,'Medium white tray',2),(11,'Tongs',3),(11,'Board name',1),
    (12,'Donut wall display',1),(12,'Round cake stand',1),(12,'Two-tier display stand set',1),(12,'Three-tier display stand set',1),(12,'White-gold round stand set',1),(12,'White-gold square stand set',1),(12,'Large white tray',4),(12,'Medium white tray',2),(12,'Small chocolate fountain',1),(12,'Tongs',5),(12,'Cup holder',1),(12,'Board name',1);

INSERT INTO CATEGORIES (category_id,name,status) VALUES
    (1,'Entertainment','Active'),(2,'Food & Treats','Active'),(3,'Decorations','Active');

INSERT INTO RENTAL_ITEMS (rental_item_id,service_id,name,quantity,item_code,required,tracking,status,notes) VALUES
    (1,1,'JBL speaker',4,'KAR-SPK',1,'quantity','Available','Synthetic demo inventory'),
    (2,1,'Wireless microphone',6,'KAR-MIC',1,'quantity','Available','Synthetic demo inventory'),
    (3,1,'Audio mixer',2,'KAR-MIX',1,'individual','Available','Synthetic demo inventory'),
    (4,2,'Buffet table',4,'SWT-TBL',1,'quantity','Available','Synthetic demo inventory'),
    (5,2,'Cake stand',8,'SWT-CAKE',1,'quantity','Available','Synthetic demo inventory'),
    (6,2,'Serving tray',20,'SWT-TRAY',1,'quantity','Available','Synthetic demo inventory'),
    (7,2,'Chocolate fountain',2,'SWT-CHOCO',0,'individual','Available','Synthetic demo inventory'),
    (8,3,'Backdrop panel',6,'BAL-PANEL',1,'quantity','Available','Synthetic demo inventory'),
    (9,3,'Grass carpet',4,'BAL-GRASS',1,'quantity','Available','Synthetic demo inventory'),
    (10,3,'Bending light',6,'BAL-LIGHT',1,'quantity','Available','Synthetic demo inventory'),
    (11,3,'HBD LED light',4,'BAL-HBD',1,'individual','Available','Synthetic demo inventory'),
    (12,3,'Spotlight',8,'BAL-SPOT',0,'quantity','Available','Synthetic demo inventory'),
    (13,3,'Celebrant chair',3,'BAL-CHAIR',0,'individual','Available','Synthetic demo inventory'),
    (14,3,'Souvenir rack',3,'BAL-RACK',0,'individual','Available','Synthetic demo inventory'),
    (15,3,'LED number light',10,'BAL-NUM',0,'quantity','Available','Synthetic demo inventory');

INSERT INTO GALLERY (image_id,title,image,featured) VALUES
    (1,'Balloon Package A','/uploads/gallery/package-a.png',1),
    (2,'Balloon Package K','/uploads/gallery/package-k.png',1),
    (3,'Balloon Package D','/uploads/gallery/package-d.png',1),
    (4,'Sweet Corner Set A','/uploads/gallery/sweet-set-a.png',1),
    (5,'Sweet Corner Set K','/uploads/gallery/sweet-set-k.png',1),
    (6,'Sweet Corner Set D','/uploads/gallery/sweet-set-d.png',1),
    (7,'Sweet Corner Additional Rentals','/uploads/gallery/sweet-addons.png',0),
    (8,'October Promo Reference','/uploads/gallery/october-promo.png',0),
    (9,'Karaoke Packages','/uploads/gallery/karaoke-packages.png',1);

-- Customer, booking, and payment examples are omitted: enter transactions through
-- owner APIs so snapshots and audit records agree.
