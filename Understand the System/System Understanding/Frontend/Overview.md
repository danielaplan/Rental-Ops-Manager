---
title: "Frontend Overview"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Frontend Overview

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## What the frontend is for

The frontend is the owner’s browser interface: 18 admin HTML screens, 14 JavaScript files, and shared CSS. Screens collect input and show results; `js/api.js` is the main contract layer that converts UI IDs/fields, attaches the bearer token, sends requests, normalizes responses, and offers offline fallback for supported writes.

The public `index.html` is the separate customer-facing brochure. It uses the same read-only website content, active services, gallery, and contact data, while its editorial landing-page layout lives in the public HTML, `css/style.css`, and `css/responsive.css`. Deployable fallback photography lives in `images/defaults/`: the admin Website Content hero and contact image paths override their default images, and matching admin Gallery entries supply fallback service, featured, contact, and carousel imagery without requiring external starter URLs.

## Main owner journey

Login → dashboard/calendar → customer and booking → payment/deposit/delivery → equipment return and post-event review → reports/audit/settings. Catalog screens maintain services, packages, add-ons, rental items, categories, gallery, and editable content.

## Offline behavior

`offline.js`, `storage.js`, `sync.js`, and `sync-ui.js` retain supported operations, replay them, surface stale/conflict records, and let the owner review a retry. Server acceptance remains authoritative.

## Accessibility and responsive evidence

Existing focused browser checks include keyboard disclosure and a 390×844 layout in a synthetic walkthrough. That is bounded evidence, not complete physical-device, assistive-technology, or production acceptance.

## Related documentation

[Frontend File Inventory](File%20Inventory.md) · [Frontend Current Status](Current%20Status.md) · [API Reference](../Backend/API%20Reference.md)


## Continue Your Learning

**You’ve learned:** how the visible screens collect input, show results, and keep supported work during an outage.

**Previous topic:** [System Overview](../System%20Overview.md)

**Next topic:** [Backend Overview](../Backend/Backend%20Overview.md)

**Why read this next?** The frontend sends requests somewhere; the backend lesson explains how those requests are checked and processed.

**Return to your learning dashboard:** [Start Here](../Start%20Here.md)

## Website images

Ana can edit an existing service in **Services**, upload an image, and save it to show that image on the public service card and details. For a new service, save and finish syncing it before adding its image. **Website Content** offers logo and hero image uploads; **Settings** also offers a logo upload. Gallery already supports device uploads. All use the existing authenticated upload endpoint (JPG, PNG, GIF, WebP; up to 5 MB) and require a connection for the upload itself. Save the form and complete synchronization, then reload the public website to see the change.

Service images are presentation metadata in Website Content's `service_images`, keyed by permanent frontend service IDs; they do not change the services schema or service API. Website Content saves preserve this metadata. The public navbar/footer display the configured logo, with the letter mark as the empty-logo fallback. Settings logo saves also update the Website Content logo.

## Facebook booking inquiries

The public website provides information; booking conversations take place through Facebook messages. Ana can open **Website Content → Contact Section → Facebook booking / Messenger link**, paste the business Facebook page or Messenger URL, save, and finish synchronization. The **How It Works** section explains this process and shows a **Message us on Facebook** button using the existing `contact_facebook` value. Reload the public website after saving. An empty, unsafe, or legacy placeholder URL hides the button. The link opens in a new tab; it does not submit or create a booking.

## Owner sign-in presentation

The owner login follows the public site’s charcoal, cream, and bronze palette and DM Sans/Manrope typography, with a transparent floating glass card over the bundled public hero photograph and slowly animated warm light. **Pause background motion** stops the animation, and the browser's reduced-motion preference disables it automatically. The animation needs no remote images, video, or new JavaScript dependency. Matching Google Fonts are optional; local fonts provide fallback. Browsers without backdrop blur use a darker card fallback. Existing credential submission and server session verification are unchanged.

In Settings, **Business logo — URL or upload** provides the existing device uploader before settings-data loading. After choosing a valid image and waiting for upload, save Settings and finish synchronization to publish the logo. The saved logo preview refreshes after settings load.

## Contact section image

Ana can open **Website Content → Contact Section → Contact Section Image — URL or upload** to change the image beside the public contact details. Paste an HTTP(S) URL/site path or choose a device image, wait for upload, then save Website Content and finish synchronization. Reload the public website to see the image. Clear the URL and save to restore the matching Gallery image (title containing balloon or celebration), or the bundled default if none matches. This uses the existing Website Content JSON `contact_image` and authenticated image uploader; no schema change is required.
