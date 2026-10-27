---
title: "Public Website Visual Refresh"
date: 2026-10-26
tags:
  - akad
  - frontend
  - public-site
status: implemented
---

# Public Website Visual Refresh

## What changed

The customer-facing landing page was restyled to follow the supplied editorial reference: a full-image hero with overlaid content, compact navigation, centered approach section, image-led service cards, a featured setup, a small statistics strip, a dark process section, a refined gallery, and a stronger contact/footer composition.

The hero was subsequently refined into a full-bleed event photograph with a contrast-safe gradient overlay, direct text and action overlays, and the headline “Turn your celebration into a moment everyone remembers.” The public service-worker cache key was advanced and the new site photographs were added to the app shell so the updated UI replaces older cached styling on server reload.

The navigation was then moved into the hero as a transparent overlay with compact white-and-gold links, contact icons, and a dark responsive mobile menu. Hero sizing, spacing, and the content-status message were tightened so the navigation, message, headline, and actions remain visually separated instead of overlapping.

The navbar is now structurally nested inside the hero so both form one bounded viewport section. The cached-content warning was changed from a full-width strip into a small translucent top-right notice, with separate narrow-screen spacing to keep it clear of the brand and hero copy.

The non-critical cached-content warning was later removed from the rendered page while the existing refresh and offline-cache behavior remained intact. The contact feature panel was rebuilt as a true two-column grid instead of placing its image absolutely behind the copy, and gallery tiles now use a controlled portrait ratio so unusually tall source images cannot stretch the page or collide with nearby content.

The final visual-polish pass added restrained depth through card shadows, rounded surfaces, glass-blurred navigation and mobile menus, translucent approach/process panels, improved button elevation, and subtle radial lighting in major sections. Hover motion is limited and a reduced-motion media query preserves accessibility preferences.

Navbar dimensions were normalized after the visual pass: the brand, menu labels, and contact icons now share a consistent vertical center and control height, while the desktop and collapsed mobile bars use separate compact height and padding values.

In-page navigation was unified across navbar links, hero actions, footer links, and modal actions. Because the navbar is an absolute hero overlay rather than a sticky bar, target sections now align directly with the top of the viewport instead of retaining an unnecessary navbar-height gap; collapsed-menu and modal transitions receive short delays before scrolling.

The navigation was subsequently changed to a compact fixed glass bar, and anchor calculations were updated to subtract its live rendered height. Service cards gained a dedicated media wrapper with a soft image-to-card fade and restrained hover zoom, while the View Details action now uses smaller sentence-case typography and no heavy button shadow.

The fixed navbar was moved outside the hero element after later sections with their own stacking contexts could paint above it. It remains visually overlaid on the hero, but now belongs to the page root stacking context and stays visible above every section throughout scrolling.

The backend-fed Our Work gallery was converted into a custom panoramic carousel without changing its data source. Its active center image is wider and shorter while the adjacent images remain taller, creating the requested panorama silhouette; layered shadows, perspective, previous/next controls, responsive sizing, live-region semantics, and a position indicator complete the frontend treatment.

The panorama now advances automatically in a circular loop, pauses on hover, and includes an explicit pause/resume control. Hovering a visible slide increases its scale and switches the photograph to contained full-image display rather than cropping it; autoplay is disabled when the visitor requests reduced motion.

Following a clearer visual reference, the gallery interaction was revised from stepped slides to a seamless right-to-left marquee. The duplicated visual track wraps continuously without arrows; hovering pauses movement, eases the selected card into the viewport center, enlarges it, and shows the complete uncropped photograph. Duplicate items are hidden from assistive technology and reduced-motion preferences still disable automatic travel.

Carousel hover was narrowed from the surrounding gallery area to each image card itself. Forced recentering was removed because moving a left-side card away from the pointer could prematurely resume the loop; an explicit paused-state guard now prevents a queued animation frame from restarting motion, and the hover scale was softened for a steadier transition.

The Our Work section was compacted to fit beneath the fixed navigation in a single viewport when reached through an anchor link. Its vertical padding, heading scale, heading gap, carousel viewport, and card dimensions now use viewport-aware clamps; the navigation background was also reduced to a translucent black while retaining blur and text contrast.

The page background rhythm now alternates after the hero: warm-white sections use layered radial lighting, while Services, How It Works, and Contact use the charcoal radial treatment established by the process section. Component-level contrast rules keep service cards, contact details, and the light contact panel readable within their new section backgrounds.

A deployable `images/defaults/` bundle now contains the supplied Sweet Corner hero and local fallbacks for service, featured, contact, and gallery imagery. The hero continues to honor the admin Website Content image URL, while service/featured/contact visuals prefer matching admin Gallery entries before falling back locally; the gallery itself remains fully managed through the existing admin Gallery screen. Legacy Unsplash seeds were replaced locally and the new bundle was added to the offline app shell without changing PHP or database behavior.

The alternating section order was reversed at the user's request: About now starts with the charcoal radial treatment immediately after the hero, Services returns to a warm-white radial canvas, and the remaining navigation sections continue with the established dark/light rhythm. About-card borders, icons, headings, and body copy received dark-surface contrast rules.

On desktop, Services now uses the available viewport beneath the fixed navigation as a vertically centered composition. Section padding and heading gaps are viewport-aware, while service media and body areas are moderately compacted so all three complete cards remain visible without making them feel undersized; narrower layouts keep the existing natural stacked flow.

About now fills the viewport beneath the sticky navigation on larger screens, with its approach grid upgraded to a higher-contrast glass surface using blur, saturation, a highlight edge, and a deeper floating shadow. Appropriate service and contact cards received complementary light-glass surfaces, and the centered desktop Services composition was shifted slightly upward so its heading begins closer to the navigation while preserving complete card visibility.

The redundant email and phone icons were removed from the shared navigation markup, which removes them from both desktop and mobile presentations. The five remaining text links received slightly wider, balanced desktop spacing while the existing collapsed-menu spacing remains compact.

Contact now fills the viewport beneath the fixed navigation and vertically centers its row, placing the left contact copy and right image panel on the same visual midpoint when reached through the navbar. Mobile disables the forced viewport height and retains a natural stacked document flow.

The public hero renderer was reconnected to the existing admin Website Content fields. Saved `hero_title`, `hero_description`, `hero_button_text`, and `hero_image` values now render after both cached startup and server refresh, with the current designed copy and packaged photograph used only as empty-state fallbacks.

Admin image previews now provide explicit cancellation controls. Shared Website Content, Settings, and Service upload fields can restore the previous image reference before the form is saved, while the Gallery modal can clear a selected local file and return to its existing URL preview. These are presentation-only controls and do not change upload endpoints, persistence, or other backend behavior.

The admin Services form now exposes the existing category relationship through a required selector populated from Categories, retains an inactive category while editing an assigned service, and displays resolved category names in the service list. Category service counts and in-use deletion checks now compare normalized string IDs so prefixed local IDs and refreshed IDs behave consistently. No PHP, schema, or server validation logic was changed.

Editing a category now includes a read-only list of every assigned service, its current status, and the total assignment count. The list is assembled from the existing frontend category and service collections and is hidden when creating a new category; no backend behavior was added or changed.

Service and category admin tables now paint from the restored local cache immediately and refresh in the background, so new assignments and active-service counts appear without waiting for a network round trip. The former service Delete action is presented accurately as Archive because the existing server intentionally retains services as Inactive for booking history; archived/inactive services are hidden by default and remain accessible through a Show inactive services switch. No backend deletion or history-retention rule was changed.

Service category assignments are now mirrored into the existing Website Content presentation metadata, keyed by service identity and resolved across pending-to-server ID aliases. Category counts, category edit details, service rows, and service edit forms use that resolver, so assignments survive server refresh, archive, and reactivation even though the backend service table has no category column. Counts continue to paint from cache immediately while synchronization runs in the background.

New services can now be saved with an uploaded image in one submission. The former temporary-ID rejection was removed, service-image metadata now resolves pending service IDs through the existing synchronization aliases in both admin editing and the public site, and the modal guidance reflects the one-step flow. Upload endpoints and backend service persistence remain unchanged.

The admin interface now shares the public site's charcoal, bronze, cream, warm-white, and warm-gray palette through CSS design-token changes only. Matching focus rings, table hovers, selected checklist surfaces, card shadows, and warning accents replace the former green treatment while semantic success and error colors remain intact. Layout, controls, data, and backend behavior were not changed.

The admin navigation now appears as an inset floating panel with rounded corners, a subtle bronze radial highlight, layered shadow, compact rounded navigation items, and a more dimensional active state. Desktop content spacing accounts for the floating gap, while tablet and mobile retain the existing drawer interaction in a similarly inset panel with a softly blurred backdrop. This change is CSS-only and does not affect navigation logic or backend behavior.

On desktop, the floating sidebar now rests in a compact icon-and-logo state and smoothly expands to the complete menu on hover or keyboard focus. The configured business logo is used when available, navigation labels and section headings reveal progressively, and the oversized logout treatment was replaced with a compact bottom-aligned navigation control. Mobile keeps the full labels visible inside its existing drawer.

The public site now applies the admin's clearer cream, warm-white, bronze, and charcoal palette to the About, Process, and Contact sections. Former near-black section canvases were replaced with alternating light radial surfaces, and their glass cards, icons, headings, body copy, and contact details were rebalanced for dark-on-light contrast. The hero, navigation, and footer retain dark framing so the existing composition and hierarchy remain recognizable.

The light-only treatment was subsequently adjusted to preserve the requested alternating section rhythm. About, Process, and Contact now use softened warm charcoal-brown surfaces rather than near-black, with brighter cream text, bronze accents, and more transparent glass cards between the existing light sections.

Appearance settings now apply to both the public website and the admin interface: public primary/accent variables and admin primary/accent controls share the saved values, preview live on the Settings page, and react to cross-tab storage updates. The current bronze (`#8a633f`) and warm-gold (`#d1a170`) palette is the explicit default for fresh caches and a Restore default colors control can select it before saving. Existing hero, content, service-image, gallery, and contact render paths were audited without backend or schema changes.

Six real AKAD photographs supplied through the owner-provided Google Drive folder were copied into `images/site/` with stable descriptive filenames. The public hero and three service cards use those local images, and the featured/contact sections use two more. Existing website-content, service, gallery, contact, modal, offline-cache, and API behavior remains connected.

No admin HTML, PHP API, database schema, database record, authentication, booking, payment, synchronization, or other business logic was changed.

## Verification performed

- Source inspection of `index.html`, `css/style.css`, `css/responsive.css`, `js/app.js`, and the public-site test harness.
- `node --test tests/public-site-data.test.cjs tests/frontend-api-contract.test.cjs`: 18 tests passed.
- Desktop browser preview through the local XAMPP Apache site confirmed the new navigation, hero, local images, service cards, featured section, process section, contact section, and footer render in the customer page.
- This is local synthetic/browser evidence, not physical-device, production, or client-acceptance evidence.

## Documentation impact

The Frontend Overview now identifies the public brochure's presentation boundary and the `images/site/` asset location. `PROJECT_INDEX.md` did not need a routing change because the public-site entry points remain `index.html`, `js/app.js`, and the existing CSS files.
