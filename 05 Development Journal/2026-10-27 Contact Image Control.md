# Dedicated contact section image control — 2026-10-27

The user asked where to change the public contact image and requested an admin option if missing. Source inspection found only a title-matched Gallery selection (balloon/celebration), then the bundled default.

Added a Contact Section Image URL/upload field in Admin Website Content with preview through the existing shared uploader. Load/save uses contact_image in the existing Website Content JSON. Public renderGallery prefers a safe configured contact image before the existing Gallery/default fallback. Clearing the field restores the fallback. No PHP, schema, booking, authentication, or synchronization implementation changes. Preserved previous working-tree changes.

Updated Frontend Overview and Project Index to document the admin control and data dependency; no new documentation links added.

Verification: 26 synthetic/local frontend tests passed across public-site-data, frontend-api-contract, and frontend-api-direct. New regression covers the configured image winning over Gallery, empty/unsafe input falling back, and restoration of the bundled default without a matching Gallery entry. Syntax and whitespace checks passed. No browser upload, operational write, physical-device, production, or client acceptance checks performed.
