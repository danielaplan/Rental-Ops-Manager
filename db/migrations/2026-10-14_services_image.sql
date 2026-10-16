-- ============================================================================
-- 2026-10-14 — SERVICES.image
--
-- Gives each service the card image the public site already renders
-- (js/app.js renderServices() reads `s.image`).
--
-- Only needed on a database created BEFORE this date: db/schema.sql uses
-- CREATE TABLE IF NOT EXISTS, which will not add a column to an existing
-- table. A fresh import of schema.sql already includes it.
--
--   C:\xampp\mysql\bin\mysql.exe -u root akad_rentals < db/migrations/2026-10-14_services_image.sql
--
-- Safe to run twice: MySQL 8 reports "Duplicate column name" the second
-- time, which you can ignore, or check first with
--   SHOW COLUMNS FROM SERVICES LIKE 'image';
-- ============================================================================

USE akad_rentals;

ALTER TABLE SERVICES ADD COLUMN image TEXT NULL AFTER status;
