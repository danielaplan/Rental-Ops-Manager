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
    PRIMARY KEY (service_id)
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
    status          ENUM('pending','confirmed','completed','cancelled')
                    NOT NULL DEFAULT 'pending',
    sync_status     ENUM('synced','pending_sync')
                    NOT NULL DEFAULT 'pending_sync',
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
    booking_id        INT           NOT NULL,
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
    item_name      VARCHAR(100) NOT NULL,
    condition_out  VARCHAR(255),
    condition_in   VARCHAR(255),
    return_status  ENUM('pending','inspected','damaged','missing')
                    NOT NULL DEFAULT 'pending',
    checked_by     INT,
    PRIMARY KEY (checklist_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (checked_by) REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. DELIVERY
--    Tracks delivery method (self-pickup, Lalamove, owner-delivered) and
--    fee responsibility.
--    Relationship: BOOKINGS -> DELIVERY (1-to-M)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS DELIVERY (
    delivery_id         INT           NOT NULL AUTO_INCREMENT,
    booking_id          INT           NOT NULL,
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
