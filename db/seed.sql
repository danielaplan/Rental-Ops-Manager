-- ============================================================================
-- AKAD Sweet Party Rental's
-- Seed data: SESSIONS table + demo users, services, packages, customers.
--
-- Run AFTER schema.sql. Safe to re-run (uses INSERT ... ON DUPLICATE KEY
-- UPDATE / INSERT IGNORE) so the demo dataset is idempotent.
--
-- Demo password for every user below: "demo123"
--   (SHA-256 of the bcrypt placeholder below is the real bcrypt hash of
--    "demo123"; regenerate with password_hash() if you change it.)
-- ============================================================================

USE akad_rentals;

-- ----------------------------------------------------------------------------
-- 10. SESSIONS
--     Active login sessions issued by api/auth.php. One row per logged-in
--     staff/owner device. Cleared on logout and on expiry.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS SESSIONS (
    session_id   INT          NOT NULL AUTO_INCREMENT,
    user_id      INT          NOT NULL,
    session_token VARCHAR(64)  NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME     NOT NULL,
    PRIMARY KEY (session_id),
    UNIQUE KEY uq_sessions_token (session_token),
    KEY idx_sessions_user (user_id),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Demo users. Password hash is bcrypt of "demo123".
-- ----------------------------------------------------------------------------
INSERT INTO USERS (user_id, full_name, role, contact_number, password_hash) VALUES
    (1, 'Maria Santos',  'owner', '0917-123-4567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    (2, 'Juan Dela Cruz', 'staff', '0918-222-3333', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    (3, 'Ana Cruz',       'staff', '0919-444-5555', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = VALUES(role),
                       contact_number = VALUES(contact_number), password_hash = VALUES(password_hash);

-- ----------------------------------------------------------------------------
-- Services + packages. One service, one package per booking (FR-05/FE-06).
-- ----------------------------------------------------------------------------
INSERT INTO SERVICES (service_id, service_name, description) VALUES
    (1, 'Karaoke Rental',   'Full karaoke setup with a huge song library, wireless mics, and a big screen.'),
    (2, 'Sweet Corner',     'A beautifully arranged dessert and candy table your guests will photograph before they taste it.'),
    (3, 'Balloon Decoration', 'Custom balloon garlands, arches, and backdrops styled around your event theme and colors.')
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name), description = VALUES(description);

INSERT INTO CATEGORIES (category_id,name,status) VALUES
    (1,'Entertainment','Active'),(2,'Food & Treats','Active'),(3,'Decorations','Active')
ON DUPLICATE KEY UPDATE name=VALUES(name),status=VALUES(status);

INSERT INTO ADDONS (addon_id,service_id,name,price,status) VALUES
    (1,1,'Extra Microphone',300,'Active'),(2,1,'Extra Speaker',500,'Active'),
    (3,1,'Additional Hour',500,'Active'),(4,3,'LED Lights',500,'Active'),
    (5,3,'Custom Signage',300,'Active'),(6,3,'Backdrop',1000,'Active')
ON DUPLICATE KEY UPDATE service_id=VALUES(service_id),name=VALUES(name),price=VALUES(price),status=VALUES(status);

INSERT INTO PACKAGES (package_id, service_id, package_name, price) VALUES
    (1, 1, 'Standard Karaoke (up to 4 hrs)',   2500.00),
    (2, 1, 'Extended Karaoke (up to 8 hrs)',   4500.00),
    (3, 2, 'Sweet Corner Mini (20 pax)',       3500.00),
    (4, 2, 'Sweet Corner Full (30 pax)',       5500.00),
    (5, 3, 'Balloon Arch Starter',             4000.00),
    (6, 3, 'Balloon Arch Premium',             7000.00)
ON DUPLICATE KEY UPDATE package_name = VALUES(package_name), price = VALUES(price);

-- ----------------------------------------------------------------------------
-- Customers. Mirrors the localStorage seed in js/storage.js.
-- ----------------------------------------------------------------------------
INSERT INTO CUSTOMERS (customer_id, full_name, contact_number, messenger_handle) VALUES
    (1, 'Juan Dela Cruz',  '0917-123-4567', '@juan@example.com'),
    (2, 'Maria Santos',    '0918-222-3333', NULL),
    (3, 'Ana Cruz',        '0919-444-5555', '@ana@example.com')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), contact_number = VALUES(contact_number),
                       messenger_handle = VALUES(messenger_handle);

-- ----------------------------------------------------------------------------
-- Bookings. Mirrors the localStorage seed in js/storage.js (BK-2026-0001/0002/0003).
-- Dates are fixed (relative-to-today dates cannot live in a static seed file).
-- service_ids / addon_ids are stored as JSON, matching the extended schema.
-- ----------------------------------------------------------------------------
INSERT INTO BOOKINGS (booking_id, customer_id, service_id, package_id, created_by, event_date, start_time, end_time, event_location, status, sync_status, service_ids, addon_ids, discount, fees, subtotal, addons_total, total, amount_paid, payment_status, source, guests, event_type, special_requests, email, customer_type) VALUES
    (1, 1, 1, 1, 2, '2026-10-04', '14:00:00', '18:00:00', 'Quezon City',        'Confirmed', 'synced', '["SVC-001"]', '["ADD-001"]',    0, 0, 2500,  300, 2800, 1000, 'Partial',  'Website', 40, 'Birthday Party', 'Theme: Superheroes',     'juan@example.com',  'Guest / No Account'),
    (2, 2, 2, 3, 2, '2026-10-07', '11:00:00', '15:00:00', 'Caloocan City',     'Reserved',  'synced', '["SVC-002"]', '[]',             0, 0, 3500,    0, 3500, 3500, 'Fully Paid', 'Manual',  60, 'Christening',   NULL,                    '',                   'Guest / No Account'),
    (3, 3, 3, 5, 2, '2026-10-09', '17:00:00', '22:00:00', 'Malabon City',      'Pending',   'synced', '["SVC-003"]', '["ADD-006"]', 200, 0, 4000, 1000, 4800,    0, 'Unpaid',    'Website', 100,'Debut',         'Pastel pink and gold theme', 'ana@example.com', 'Registered')
ON DUPLICATE KEY UPDATE customer_id=VALUES(customer_id), service_id=VALUES(service_id), package_id=VALUES(package_id), created_by=VALUES(created_by), event_date=VALUES(event_date), start_time=VALUES(start_time), end_time=VALUES(end_time), event_location=VALUES(event_location), status=VALUES(status), sync_status=VALUES(sync_status), service_ids=VALUES(service_ids), addon_ids=VALUES(addon_ids), discount=VALUES(discount), fees=VALUES(fees), subtotal=VALUES(subtotal), addons_total=VALUES(addons_total), total=VALUES(total), amount_paid=VALUES(amount_paid), payment_status=VALUES(payment_status), source=VALUES(source), guests=VALUES(guests), event_type=VALUES(event_type), special_requests=VALUES(special_requests), email=VALUES(email), customer_type=VALUES(customer_type);

-- ----------------------------------------------------------------------------
-- Payments. The payment_method enum is gcash/maribank; the original demo
-- "Cash" payment is recorded as maribank (the closest valid method) so the
-- seed stays valid against the schema.
-- ----------------------------------------------------------------------------
INSERT INTO PAYMENTS (payment_id, booking_id, amount, payment_method, payment_status, payment_date, notes) VALUES
    (1, 1, 1000.00, 'gcash',    'paid', '2026-09-26 10:00:00', 'Downpayment'),
    (2, 2, 3500.00, 'maribank', 'paid', '2026-09-25 10:00:00', 'Paid in full')
ON DUPLICATE KEY UPDATE amount=VALUES(amount), payment_method=VALUES(payment_method), payment_status=VALUES(payment_status), payment_date=VALUES(payment_date), notes=VALUES(notes);
