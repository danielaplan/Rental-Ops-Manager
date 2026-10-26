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

Six real AKAD photographs supplied through the owner-provided Google Drive folder were copied into `images/site/` with stable descriptive filenames. The public hero and three service cards use those local images, and the featured/contact sections use two more. Existing website-content, service, gallery, contact, modal, offline-cache, and API behavior remains connected.

No admin HTML, PHP API, database schema, database record, authentication, booking, payment, synchronization, or other business logic was changed.

## Verification performed

- Source inspection of `index.html`, `css/style.css`, `css/responsive.css`, `js/app.js`, and the public-site test harness.
- `node --test tests/public-site-data.test.cjs tests/frontend-api-contract.test.cjs`: 18 tests passed.
- Desktop browser preview through the local XAMPP Apache site confirmed the new navigation, hero, local images, service cards, featured section, process section, contact section, and footer render in the customer page.
- This is local synthetic/browser evidence, not physical-device, production, or client-acceptance evidence.

## Documentation impact

The Frontend Overview now identifies the public brochure's presentation boundary and the `images/site/` asset location. `PROJECT_INDEX.md` did not need a routing change because the public-site entry points remain `index.html`, `js/app.js`, and the existing CSS files.
