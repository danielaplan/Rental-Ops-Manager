-- Apply only after a verified backup and during an approved maintenance window.
-- Clean installations already receive this column from db/schema.sql.
ALTER TABLE SERVICES ADD COLUMN image VARCHAR(500) NULL AFTER description;
