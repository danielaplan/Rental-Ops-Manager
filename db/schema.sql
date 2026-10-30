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
    role           ENUM('owner','staff') NOT NULL DEFAULT 'owner',
    username VARCHAR(100) NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'Active',
    is_primary_owner TINYINT(1) NOT NULL DEFAULT 0,
    failed_login_count INT UNSIGNED NOT NULL DEFAULT 0,
    locked_until DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    contact_number VARCHAR(20),
    password_hash  VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_username (username)
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
    image        VARCHAR(500) NULL,
    default_preparation_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    default_travel_minutes INT UNSIGNED NOT NULL DEFAULT 0,
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
    description TEXT,
    inclusions TEXT,
    duration_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    requires_deposit TINYINT(1) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_promotional TINYINT(1) NOT NULL DEFAULT 0,
    promotion_start_date DATE NULL,
    promotion_end_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    package_id      INT          NULL,
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
    booking_reference VARCHAR(50) NULL,
    event_start_datetime DATETIME NULL,
    event_end_datetime DATETIME NULL,
    preparation_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    travel_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    blocked_start_datetime DATETIME NULL,
    blocked_end_datetime DATETIME NULL,
    theme_notes TEXT,
    package_name_snapshot VARCHAR(100) NULL,
    package_price_snapshot DECIMAL(10,2) NULL,
    agreed_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cancellation_reason TEXT,
    awaiting_completion_at DATETIME NULL,
    completed_at DATETIME NULL,
    released_by INT NULL,
    review_notes TEXT,
    created_at DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (booking_id),
    UNIQUE KEY uq_bookings_reference (booking_reference),
    KEY idx_bookings_blocked (service_id, status, blocked_start_datetime, blocked_end_datetime),
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
    payment_status   VARCHAR(20) NOT NULL DEFAULT 'Pending',
    payment_date     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes            TEXT,
    payment_type VARCHAR(30) NULL,
    payment_reference VARCHAR(150) NULL,
    recorded_by INT NULL,
    recorded_at DATETIME NULL,
    provenance VARCHAR(30) NOT NULL DEFAULT 'owner',
    PRIMARY KEY (payment_id),
    KEY idx_payments_date (payment_status, payment_date),
    FOREIGN KEY (recorded_by) REFERENCES USERS(user_id) ON DELETE RESTRICT,
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
    refund_status     VARCHAR(20) NOT NULL DEFAULT 'Held',
    refund_date DATETIME NULL,
    recorded_by INT NULL,
    provenance VARCHAR(30) NOT NULL DEFAULT 'owner',
    created_at DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    UNIQUE KEY uq_booking_item (booking_id, rental_item_id),
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
    fee_shouldered_by   VARCHAR(30) NOT NULL DEFAULT 'Customer',
    delivery_notes TEXT,
    created_at DATETIME NULL,
    PRIMARY KEY (delivery_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Revised operational tables. Legacy columns above remain for transition compatibility.
-- ============================================================================
CREATE TABLE IF NOT EXISTS SESSIONS (
    session_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    UNIQUE KEY uq_sessions_token (session_token),
    KEY idx_sessions_user (user_id),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS AVAILABILITY_BLOCKS (
    block_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    service_id INT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    reason TEXT NOT NULL,
    created_by INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_blocks_interval (service_id, status, start_datetime, end_datetime),
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS BOOKING_CONFLICT_OVERRIDES (
    override_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    conflicting_booking_id INT NOT NULL,
    approved_by INT NOT NULL,
    reason TEXT NOT NULL,
    approved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_override_booking (booking_id, conflicting_booking_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE RESTRICT,
    FOREIGN KEY (conflicting_booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES USERS(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DEPOSIT_DEDUCTIONS (
    deduction_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    deposit_id INT NOT NULL,
    affected_item VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    recorded_by INT NULL,
    recorded_at DATETIME NULL,
    provenance VARCHAR(30) NOT NULL DEFAULT 'owner',
    legacy_deposit_id INT NULL,
    UNIQUE KEY uq_deduction_legacy (legacy_deposit_id),
    FOREIGN KEY (deposit_id) REFERENCES DEPOSITS(deposit_id) ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by) REFERENCES USERS(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CHECKLIST_TEMPLATES (
    template_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    template_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    FOREIGN KEY (package_id) REFERENCES PACKAGES(package_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CHECKLIST_TEMPLATE_ITEMS (
    template_item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    expected_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (template_id) REFERENCES CHECKLIST_TEMPLATES(template_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS BOOKING_CHECKLIST_ITEMS (
    checklist_item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    template_item_id INT NULL,
    rental_item_id INT NULL,
    item_name_snapshot VARCHAR(100) NOT NULL,
    expected_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    quantity_released INT UNSIGNED NULL DEFAULT 0,
    quantity_returned INT UNSIGNED NOT NULL DEFAULT 0,
    condition_out VARCHAR(255) NULL,
    condition_in VARCHAR(255) NULL,
    return_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    checked_by INT NULL,
    checked_at DATETIME NULL,
    legacy_checklist_id INT NULL,
    UNIQUE KEY uq_checklist_legacy (legacy_checklist_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE RESTRICT,
    FOREIGN KEY (template_item_id) REFERENCES CHECKLIST_TEMPLATE_ITEMS(template_item_id) ON DELETE RESTRICT,
    FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE RESTRICT,
    FOREIGN KEY (checked_by) REFERENCES USERS(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS NOTIFICATIONS (
    notification_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    requires_action TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    UNIQUE KEY uq_notification_recipient (user_id, booking_id, notification_type),
    KEY idx_notifications_unresolved (user_id, resolved_at, created_at),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS AUDIT_LOGS (
    audit_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(80) NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    description TEXT NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NULL,
    origin VARCHAR(20) NOT NULL DEFAULT 'owner',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_audit_record (record_type, record_id, created_at, audit_id),
    KEY idx_audit_actor (user_id, created_at),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MIGRATION_ARCHIVE (
    archive_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    migration_key VARCHAR(80) NOT NULL,
    source_table VARCHAR(64) NOT NULL,
    source_id VARCHAR(100) NOT NULL,
    target_table VARCHAR(64) NULL,
    target_id VARCHAR(100) NULL,
    source_record JSON NOT NULL,
    resolution JSON NULL,
    imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_archive_source (migration_key, source_table, source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS SCHEMA_MIGRATIONS (
    migration_key VARCHAR(80) NOT NULL PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    summary JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
