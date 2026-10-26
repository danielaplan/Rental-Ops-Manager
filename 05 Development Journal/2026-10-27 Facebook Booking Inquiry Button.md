# Facebook booking inquiry button — 2026-10-27

User requested that How It Works reflect booking through Facebook messages and the website's informational purpose, with an admin-controlled Facebook destination.

Updated the four-step section copy and added a Message us on Facebook link opening in a new tab with noopener/noreferrer. renderContact uses existing Website Content contact_facebook, removes the destination and hides the button for empty, unsafe, or existing legacy placeholder values, and updates it after the normal public data refresh. Relabeled the existing Admin Website Content Facebook field with Messenger examples and instructions. No backend, schema, booking, or synchronization changes. Existing unrelated working-tree changes preserved.

Updated the frontend overview and project index for this public workflow and admin dependency. No new documentation links introduced.

Verification: 20 local synthetic tests passed in public-site-data and frontend-api-contract, including refreshed Messenger destination and empty/unsafe/legacy removal. Syntax and whitespace checks also passed. No live browser, Facebook navigation, physical-device, production, or client acceptance checks performed.
