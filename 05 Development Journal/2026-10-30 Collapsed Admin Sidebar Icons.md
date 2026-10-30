---
title: "Collapsed Admin Sidebar Icons"
date: 2026-10-30
tags:
  - development-journal
  - admin-ui
  - responsive-design
status: implemented-local-verification
---

# Collapsed Admin Sidebar Icons

## Finding

The 76-pixel collapsed admin rail rendered navigation icons inside 28-pixel circles and relied on a negative left margin while the invisible label still participated in flex layout. The icons looked undersized and were not naturally centered within the available container.

## Change

- Increased the collapsed brand mark from 38 x 38 to 46 x 46 pixels.
- Gave each collapsed navigation link a centered 60-pixel-wide, 50-pixel-high target within the rail.
- Increased each navigation icon badge to 40 x 40 pixels and the icon glyph to 1.22rem.
- Removed the negative-margin alignment workaround and removed hidden labels from collapsed flex layout.
- Added clearer hover, focus, and active icon treatments.
- Restored the ordinary horizontal icon-and-label layout inside the mobile sidebar drawer.
- Kept the brand, icons, and labels in one continuous flex layout and animated their size, spacing, and maximum width with the sidebar, removing the visible jump during collapse.
- Disabled the sidebar transitions when the operating system requests reduced motion.

## Verification

- The focused frontend workflow suite passed 19/19, including a new collapsed-sidebar layout contract.
- The broader frontend regression suite passed 55/55.
- PHP, JavaScript, service-worker, test-script, and inline-admin syntax checks passed.
- `git diff --check` passed.

This was source and synthetic contract verification. A physical-device or production browser review was not performed.
