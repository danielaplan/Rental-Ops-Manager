---
title: "Source Snapshot"
date: 2026-10-17
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

Baseline on 2026-10-17. All 34 PHP files and 2 SQL scripts are covered.

| Source | SHA-256 |
|---|---|
| `./api/addons.php` | `b36e80e739742b1743bfdfdd89d00fe9fe33eceb84886a82e0213fa96f1226f2` |
| `./api/auth.php` | `dfcb78783b48355092d7ff720e3054f5543c28929bf937f9deeff4906cbbf1c6` |
| `./api/booking_pricing.php` | `bee4ed53698851b383984c889d523b95e6013ba680ab1717ea95210d03fa085e` |
| `./api/bookingItems.php` | `67c534053b4de9d1a7531a3c131d843b7646ba584b942519abde268b9f5615e9` |
| `./api/bookings.php` | `975cd42d9a7f86427bc166e4c689733627fa0caba862be2de0f9d2691e5da662` |
| `./api/categories.php` | `c4fa14f34fe98d09de1f00562f8b954f1498aef5e5e924b05bebf24617c2a3a5` |
| `./api/config.php` | `ad9f3550166f69ed79a7882ab3173fe51d51f147226a68d0d4167e3d88ac65ee` |
| `./api/crud.php` | `f866ed2ad5941d9422f412d42b17292bbebee8b22bde8b3de36f07a1f2aef8e1` |
| `./api/customers.php` | `8ce5f8603c3e960c89b85a8d9e128de304c28813ad2eda898c0748c843023a87` |
| `./api/delivery.php` | `849a0a6c46459e2cf658edfaa34e1c6c61e2079e7e65182833faa6b00269a807` |
| `./api/deposit_service.php` | `1b9efd9167c3a489b68c11179a879421a325ff6e1904bd592d2a2792a697ee4d` |
| `./api/deposits.php` | `e9a03fc9465fca214cab3ad7ce838a22f837090cbc82717d10980a1079a32314` |
| `./api/equipment.php` | `984c8072c1bce064a958265cbb4e894690890ed774419a467d13f8a1fbef6670` |
| `./api/equipment_service.php` | `9fd620927623bb30ace19d16a05b4f936244dca0f60c1e0a7ac8900f8e211793` |
| `./api/gallery.php` | `bf83ca4ae06d2f2e434589009dc02f07ac53ad29b1fde5f352e1a5c342c999db` |
| `./api/itemHistory.php` | `b221c49af290c16fb965432328019bd1cd5fae644523ddf63754d39c3a49e4c0` |
| `./api/itemReleases.php` | `f31124f3d7816262f11290a1643b07f49da06ed91de7b66b235a87e47a9f2727` |
| `./api/packages.php` | `72e4bf4016883d4d132b288e59440a2692bea21b54d0516bd75dfbc517a5e5be` |
| `./api/payments.php` | `5a22982385719092d81262558ac425e7de6621d4ead6f215ebf95eb06e5175e6` |
| `./api/rentalItems.php` | `5d026013e5e5fb9d3eeefbdf4b5aa862fdfa8d01331c5305c1da0ffb4a3a3b4b` |
| `./api/reports.php` | `a05228d3f5bd8c9603fa1e1af912b6e7906b33a80031c12b0845a2510676a0db` |
| `./api/services.php` | `f756f701ab9ce1b8999716048b962a9488d6079cb8c205a772814face32f1637` |
| `./api/settings.php` | `d87c9ef9f09cd845f1b6e49277ce2275c5dd7bb35515bc96d5f6bdaed3bdddfd` |
| `./api/sync.php` | `7dcf0405ae404e5db89555fa6e7f076e0dd63e238ff09c95d7b95136652b2694` |
| `./api/sync_state.php` | `cf13bf729014224f76a4e9ba9ed598ebacea4ac0d9b007af9f8e57abecc2f6a2` |
| `./api/websiteContent.php` | `38619461d8a9b549333445367113cf21d998f604435670eb9db481ed9a71f5f7` |
| `./api/audit.php` | `e4575f3a88c2deca259fea6f7a957afad39c3283edd37f10ad2652c9ae1873ca` |
| `./api/availability_service.php` | `45da223d973ca6aedfa23975352e601ba6dd5fd8589be92d97ea7b7722691ffb` |
| `./api/availabilityBlocks.php` | `2a855590f6a5a277e33f0ee0b300e560fa6238c7476a509291d374f8461c1557` |
| `./api/booking_items_service.php` | `705cbab8a3cf32d7f2ce965208269c65055f4499920bf414dacdb4d2ffa9a0cf` |
| `./api/booking_service.php` | `3f04f3730451032071887b5e312c57b23444194461789ed554324dd2fd66a176` |
| `./api/catalog_definitions.php` | `240155aac37cfd7520053a7a8a69127dfffdbe3dc53e2027bffdd6e1ecc72f7f` |
| `./api/checklist_service.php` | `454495cd809f76cc30a262390e42a79015a0b01cf2d048e0a4aede619d28ec48` |
| `./api/checklistTemplates.php` | `748e5eed3d6568f041961c8e45ae4b374be5023a6ef13b97e196f7a6e05aade4` |
| `./api/domain.php` | `34d2ecad5ad8480adde770985812de67eec60e31cf08e9a33ce8dc1f34df2182` |
| `./api/gallery-upload.php` | `8adf6e4ce021329dd8a42a406649ec927514521ebb6de4e82796f6fc6ddcbf5d` |
| `./api/notifications.php` | `59622b2e9e46c129a2eeca6720229c09e353ff5a3e76da5db21b48ae25f9bd96` |
| `./api/owners.php` | `6d054870e5e9e8f4ad003ae2e165ea94ab6a2c6f64214923d7e91dbbe074169c` |
| `./api/payment_service.php` | `e8475c8235dcac5fbcd0b85c709f56924a298333a9b8c52ec0d073088f116816` |
| `./api/supporting_service.php` | `5c89c6814484b58ca5be77c8040cf74b541d08c29f58de311d9e6e574749f838` |
| `./db/migrations/20261015_revised_backend.php` | `15234f813b228320f94dc0e66f9732f3c2a87e3556863db138f870d0076ae4a8` |
| `./scripts/reconcile_bookings.php` | `e3fa0405dd0de79bab78210cf0301f8d64c7106ed687c2e75c83a1cc4aca375e` |
| `./db/schema.sql` | `201506aa4e34bcaf0248c243fa5619761b7aa4b7573c21002bcd418e62241f79` |
| `./db/seed.sql` | `08e5f9554b978de28eb28d723aa32e1c2e526ffa129b435c4bb0d9b04b5add25` |

## Technical details

This section records exact file behavior, field names and implementation details.

This is a manually written explanation supported by a source inventory. It must be reviewed when backend/database behavior changes.

1. Compare changed PHP/SQL files against the source snapshot below.
2. Update affected file notes, table column dictionaries, route reference and workflows together.
3. Recheck direct and sync paths: they have separate dispatch/validation code.
4. Keep requirements/design differences explicit. Do not remove a gap just because one path was fixed.
5. Check all source links and Obsidian links; maintain relative Markdown links to the actual note files to avoid ambiguous filenames.
6. Record new verification evidence separately from previously recorded tests. Frontend documentation should be added later under its own folder when authorized/ready.

### Source snapshot

SHA-256 fingerprints are recorded in this table for every PHP file and SQL script reviewed. They identify this guide's source baseline, not a live database state. A changed fingerprint signals a review is needed.

Properties date/status/tags follow the vault's existing convention. Notes use relative Markdown links with encoded spaces, concise labels and Mermaid diagrams; no additional Obsidian plugin or skill is required.

## Continue reading

[Back to Start Here](Start%20Here.md)