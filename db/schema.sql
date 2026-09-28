-- ============================================================================
-- AKAD Sweet Party Rental's
-- Operations and Booking Management System
-- MySQL Database Schema
--
-- Source: Official documentation in Documentation/AKAD_System_Design.md
--         Documentation/AKAD_Requirements_Analysis_Documentation.md
--         Documentation/AKAD_REVISED_Rentals_Proposal___RJDM_Collective.md
--
-- Nine entities per the ERD (Documentation/AKAD_ERD.png):
--   USERS, CUSTOMERS, SERVICES, PACKAGES, BOOKINGS,
--   PAYMENTS, DEPOSITS, EQUIPMENT_CHECKLIST, DELIVERY
-- ============================================================================

CREATE DATABASE IF NOT EXISTS akad_rentals CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE akad_rentals;

-- ----------------------------------------------------------------------------
-- 1. USERS
--    Owners and staff who log in and manage bookings.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS USERS (
    user_id        INT          NOT NULL AUTO_INCREMENT,
    full_name      VARCHAR(100) NOT NULL,
    role           ENUM('owner','staff') NOT NULL DEFAULT 'staff',
    contact_number VARCHAR(20),
    password_hash  VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. CUSTOMERS
--    People renting AKAD's services.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS CUSTOMERS (
    customer_id     INT          NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(100) NOT NULL,
    contact_number  VARCHAR(20),
    messenger_handle VARCHAR(100),
    PRIMARY KEY (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. SERVICES
--    The 3 core offerings: Karaoke, Sweet Corner, Balloon Decoration.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS SERVICES (
    service_id   INT          NOT NULL AUTO_INCREMENT,
    service_name VARCHAR(50)  NOT NULL,
    description  TEXT,
    status       VARCHAR(20) NOT NULL DEFAULT 'Active',
    PRIMARY KEY (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CATEGORIES (
    category_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ADDONS (
    addon_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS RENTAL_ITEMS (
    rental_item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    item_code VARCHAR(50),
    required TINYINT(1) NOT NULL DEFAULT 0,
    tracking VARCHAR(30) NOT NULL DEFAULT 'quantity',
    status VARCHAR(40) NOT NULL DEFAULT 'Available',
    `condition` VARCHAR(100) NOT NULL DEFAULT 'Good',
    notes TEXT,
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS GALLERY (
    image_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    image TEXT NOT NULL,
    featured TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS WEBSITE_CONTENT (
    content_id INT NOT NULL PRIMARY KEY DEFAULT 1,
    content JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS APP_SETTINGS (
    settings_id INT NOT NULL PRIMARY KEY DEFAULT 1,
    settings JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. PACKAGES
--    Fixed packages under each service (e.g., Sweet Corner menus, 12-hr karaoke).
--    Relationship: SERVICES -> PACKAGES (1-to-M)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PACKAGES (
    package_id   INT           NOT NULL AUTO_INCREMENT,
    service_id   INT           NOT NULL,
    package_name VARCHAR(100)  NOT NULL,
    price        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (package_id),
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. BOOKINGS
--    Central record of every rental transaction.
--    Links: customer_id -> CUSTOMERS, service_id -> SERVICES,
--           package_id -> PACKAGES, created_by -> USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS BOOKINGS (
    booking_id      INT          NOT NULL AUTO_INCREMENT,
    customer_id     INT          NOT NULL,
    service_id      INT          NOT NULL,
    package_id      INT          NOT NULL,
    created_by      INT          NOT NULL,
    event_date      DATE         NOT NULL,
    start_time      TIME         NOT NULL,
    end_time        TIME         NOT NULL,
    event_location  VARCHAR(255),
    status          VARCHAR(30) NOT NULL DEFAULT 'pending',
    sync_status     ENUM('synced','pending_sync')
                    NOT NULL DEFAULT 'pending_sync',
    service_ids JSON NULL,
    addon_ids JSON NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    fees DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    addons_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid',
    source VARCHAR(50),
    guests INT,
    event_type VARCHAR(100),
    special_requests TEXT,
    email VARCHAR(255),
    customer_type VARCHAR(100),
    PRIMARY KEY (booking_id),
    FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (package_id) REFERENCES PACKAGES(package_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. PAYMENTS
--    Down payments and balance payments (GCash / MariBank).
--    Relationship: BOOKINGS -> PAYMENTS (1-to-M)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PAYMENTS (
    payment_id       INT           NOT NULL AUTO_INCREMENT,
    booking_id       INT           NOT NULL,
    amount           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method   ENUM('gcash','maribank') NOT NULL,
    payment_status   ENUM('paid','unpaid','partial')
                    NOT NULL DEFAULT 'unpaid',
    payment_date     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes            TEXT,
    PRIMARY KEY (payment_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. DEPOSITS
--    Refundable equipment/cleaning deposits, with deduction tracking
--    for uncleaned or damaged rental items.
--    Relationship: BOOKINGS -> DEPOSITS (1-to-M)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS DEPOSITS (
    deposit_id        INT           NOT NULL AUTO_INCREMENT,
    booking_id        INT           NOT NULL UNIQUE,
    amount_held       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deduction_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deduction_reason  TEXT,
    refund_status     ENUM('pending','partial','full','none')
                    NOT NULL DEFAULT 'pending',
    PRIMARY KEY (deposit_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. EQUIPMENT_CHECKLIST
--    Digital version of AKAD's existing paper equipment checklist.
--    Relationship: BOOKINGS -> EQUIPMENT_CHECKLIST (1-to-M)
--                checked_by -> USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS EQUIPMENT_CHECKLIST (
    checklist_id   INT          NOT NULL AUTO_INCREMENT,
    booking_id     INT          NOT NULL,
    rental_item_id INT,
    item_name      VARCHAR(100) NOT NULL,
    condition_out  VARCHAR(255),
    condition_in   VARCHAR(255),
    expected_qty   INT NOT NULL DEFAULT 0,
    returned_qty   INT NOT NULL DEFAULT 0,
    inspection_notes TEXT,
    return_status  ENUM('pending','inspected','damaged','missing')
                    NOT NULL DEFAULT 'pending',
    checked_by     INT,
    PRIMARY KEY (checklist_id),
    UNIQUE KEY uq_equipment_booking_item (booking_id, rental_item_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (checked_by) REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS BOOKING_ITEMS (
    booking_item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    rental_item_id INT,
    service_id INT,
    name VARCHAR(100) NOT NULL,
    expected_qty INT NOT NULL DEFAULT 0,
    released_qty INT NOT NULL DEFAULT 0,
    returned_qty INT NOT NULL DEFAULT 0,
    required TINYINT(1) NOT NULL DEFAULT 0,
    checked_released TINYINT(1) NOT NULL DEFAULT 0,
    `condition` VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ITEM_RELEASES (
    release_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    released_by VARCHAR(100),
    notes TEXT,
    released_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ITEM_HISTORY (
    history_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    rental_item_id INT,
    booking_id INT,
    action VARCHAR(40) NOT NULL,
    qty INT NOT NULL DEFAULT 0,
    `condition` VARCHAR(100),
    event_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. DELIVERY
--    Tracks delivery method (self-pickup, Lalamove, owner-delivered) and
--    fee responsibility.
--    Relationship: BOOKINGS -> DELIVERY (1-to-M)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS DELIVERY (
    delivery_id         INT           NOT NULL AUTO_INCREMENT,
    booking_id          INT           NOT NULL UNIQUE,
    delivery_method     ENUM('self_pickup','lalamove','owner_delivered')
                    NOT NULL DEFAULT 'self_pickup',
    delivery_fee        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fee_shouldered_by   ENUM('renter','owner')
                    NOT NULL DEFAULT 'renter',
    PRIMARY KEY (delivery_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Indexes (for reporting performance — FR-07)
-- ============================================================================

-- Speeding up the reporting queries
CREATE INDEX idx_bookings_event_date ON BOOKINGS(event_date);
CREATE INDEX idx_bookings_status ON BOOKINGS(status);
CREATE INDEX idx_bookings_service ON BOOKINGS(service_id);
CREATE INDEX idx_payments_booking ON PAYMENTS(booking_id);
CREATE INDEX idx_deposits_booking ON DEPOSITS(booking_id);
CREATE INDEX idx_equipment_booking ON EQUIPMENT_CHECKLIST(booking_id);
CREATE INDEX idx_delivery_booking ON DELIVERY(booking_id);
