---
title: "Source Snapshot"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Source Snapshot

**Navigate:** [Start Here](Start%20Here.md) · [Reading order](Start%20Here.md#recommended-reading-order) · [Backend files](Backend/File%20Inventory.md) · [Database tables](Database/Database%20Overview.md) · [Glossary](Glossary.md)

## What this page is for

This page is a developer reference identifying the exact PHP and SQL files reviewed for the guide. A **fingerprint**, or hash, is a calculated identifier for a file’s contents. If its contents change, the fingerprint changes.

These fingerprints support comparison between the reviewed source baseline and later file changes. They identify checked-in files, not the contents of a live database.

## Technical details

This section records exact file behavior, field names and implementation details.

Baseline on 2026-09-29. All 26 PHP files and both SQL scripts are covered.

| Source | SHA-256 |
|---|---|
| `api/addons.php` | `aa5bbddc4bc4bf8f81f30bc79a864c1b2329d0b78ba65f39549c8e28cfe8f3b8` |
| `api/auth.php` | `0d01fb0d71490d665d8875882b6f58afc6b4a7160ae84569f2afb0f794702739` |
| `api/booking_pricing.php` | `942efe50d8d4728d0b30969c84476059b8c2e9e104798ce2c4d3030d22f0ce90` |
| `api/bookingItems.php` | `5f180801785bd8f8f7ed3bbf52c352e4783ceaeb7d880e29bb843cd7fddfe503` |
| `api/bookings.php` | `682d0228037b671db3cea87e15f271054177c135186526948926fa8466aa7c0d` |
| `api/categories.php` | `31a85eb5cb426ec8bc7a0019b665a27bad0f4f964f5401e47ba1eca943d15474` |
| `api/config.php` | `a60bf319215ed55f3d04ad2a353d02032783de5f885bf58bac16c3bcd7ded609` |
| `api/crud.php` | `9553e39a9455f62286e369f9e320335bc5ae9f6d10094b9fc172ec06786d60b1` |
| `api/customers.php` | `78e005e8f89e8b68ec25f5e1eeba0d11411d1c3e1a9a2497b8ed9e7a503b4ab9` |
| `api/delivery.php` | `9c85991aca7304d3991d830c4c472dba2ae9d95fb5a2acc1a59a28c0e3ba3694` |
| `api/deposit_service.php` | `24521d3ac1b81ded0911509c7162d3ef03623fae20288fc1db1ea1e5b3f821e1` |
| `api/deposits.php` | `d3727772e1ce33fef1c454595b4735107a3a03e0e4a959f9e967e2ab8e617524` |
| `api/equipment.php` | `49b18842046271f81dc203b62a970f69d0ec2def3bd867ebd901dfaf040d4de3` |
| `api/equipment_service.php` | `9c1082adb717983ad205456e09724ed70b26d4753c6e733d950a28660a4ef80e` |
| `api/gallery.php` | `ae01c73456c0eaa6b0e2db79a500c812db798776f408318b9e290977efb06e72` |
| `api/itemHistory.php` | `c4ad06fa8e6e782ffac72758d2802a292986c2bc4fae1761f898c3cc877683a4` |
| `api/itemReleases.php` | `59b9d5bc03adc067b1afedf9a6a4ea9338c0bd549decbcc02ff450adf14fa2a6` |
| `api/packages.php` | `2f241c81a94104b393331775a61b0d3446b02828d793cb1c1d37404acdbb533e` |
| `api/payments.php` | `261d4fc9ca3a0ad018441fa537aa18eb058339d728d94e56505161de3357fe67` |
| `api/rentalItems.php` | `0b7b697c29143286b7bd4338c8f5178d46eff4327b811fc3bb07e5063f2a254f` |
| `api/reports.php` | `40a87ce1631b7ad104b7a7166807f9e6f80d8c9e9c461655126d3838e3854317` |
| `api/services.php` | `f0e087c01fefd96af1d0fc034397172d29b37e4d3ab2afbd10aba422ba49fa11` |
| `api/settings.php` | `ba533fdbaece74a38caac0750faa8436858433ebb6af1f736f6f5c4718159966` |
| `api/sync.php` | `ad08172f16573b81c8ea86ae45a8ed79909bf6de62db6202040ccf0c2195932e` |
| `api/sync_state.php` | `364d05a89eb03d03a9b830543854c68245d649721831c57530bcc78d5f4a2008` |
| `api/websiteContent.php` | `38619461d8a9b549333445367113cf21d998f604435670eb9db481ed9a71f5f7` |
| `db/schema.sql` | `aac12d00377b3ea7015c5484bc5db4d702c311b7b8679ed1491bac16abb1a5ed` |
| `db/seed.sql` | `6ba803d2b3f4df6af2dfc226c77e095ad1a35bfcec22a18c30fef0a09688f94c` |

The `db/seed.sql` fingerprint was refreshed on 2026-09-30 after correcting the documented demo password and rerun warning. Other source fingerprints remain from the original guide review.

## Continue reading

[Back to Start Here](Start%20Here.md)
