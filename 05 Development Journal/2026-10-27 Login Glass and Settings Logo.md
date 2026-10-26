# Login glass styling and Settings logo — 2026-10-27

Requested: device logo upload in Settings and glassmorphism login with a matching live background.

Settings already had the shared authenticated uploader. Clarified the logo label/help, initialized the control before async settings loading so refresh failures do not suppress it, and refreshed its preview after saved settings populate. Existing upload API, validation, save, and synchronization behavior retained.

Updated admin/login.html presentation and login-scoped css/admin.css rules: frosted panel, AKAD identity, animated green/gold glow background, responsive spacing, focus visibility, pause checkbox, and prefers-reduced-motion support. Existing login inline JavaScript and form identifiers/credentials/autocomplete are preserved. No backend or schema changes.

Verification: 23 local synthetic tests passed in frontend-async-workflows and frontend-api-direct, including login endpoint failure handling and authenticated multipart upload. Local browser at 127.0.0.1:8000 showed the redesigned login and working checked pause control. Screenshot saved outside the repository as a preview. No credentials submitted, operational uploads, mobile/physical-device, production, or client acceptance checks. Syntax and whitespace checks passed. Updated Frontend Overview; existing index dependencies and commands remain accurate, so no further index update needed. No new documentation links introduced.
