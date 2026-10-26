# Login public-theme refinement — 2026-10-27

User requested closer alignment with the public website and a visibly transparent floating login card. Refined only login markup and scoped CSS: charcoal/cream/bronze colors, matching DM Sans/Manrope with existing local fallback, the bundled public hero photo, editorial introduction, translucent blurred card with fine highlight border and layered shadows, dark inputs, public-style button, responsive single-card layout, reduced-motion and manual pause retained. No credential handlers, auth APIs, schema, or admin business behavior changed.

A local browser check exposed stale cached admin CSS; added a login stylesheet version query so the revised styles load immediately. Also increased login field-selector specificity to protect light text from shared admin rules. Updated Frontend Overview; no code locations, API dependencies, or commands changed, so no additional index revision required. Existing documentation links unchanged.

Verification: 18 synthetic frontend-async-workflows tests passed, including login endpoint failure handling. Local browser inspection verified the desktop layout and transparent card; screenshot saved outside repository. Syntax and whitespace checks passed. No credentials submitted, database writes, production, physical-device, or client acceptance verification.
