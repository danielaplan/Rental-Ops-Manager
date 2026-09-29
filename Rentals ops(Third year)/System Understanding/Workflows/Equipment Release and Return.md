---
title: "Equipment Release and Return"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Equipment Release and Return

There are four related stores with different jobs:

| Table | Job |
|---|---|
| RENTAL_ITEMS | Reusable per-service catalog |
| BOOKING_ITEMS | Assigned item snapshot, expected/released/returned quantities |
| EQUIPMENT_CHECKLIST | Saved outgoing/incoming condition and inspection outcome |
| ITEM_RELEASES / ITEM_HISTORY | Explicit release metadata and equipment events |

## Assignment and release

bookingItems.generate deletes previous assigned rows for a booking and copies the selected services' catalog items. It copies names, quantities and required flags, not a live reservation of catalog stock. Updating release quantities/check flags and writing ITEM_RELEASES are explicit operations. A release record alone does not change status or inventory automatically.

## Saving a complete return inspection

Send every assigned catalog-linked item once, including returned quantity, condition and notes. For example, an expected quantity of two may return zero with condition Missing; zero remains a valid stored quantity.

The service checks the booking and expected items, locks matching BOOKING_ITEMS, rejects duplicate/unknown item IDs, excessive quantities, invalid conditions and incomplete inspections. In one transaction it updates BOOKING_ITEMS and upserts EQUIPMENT_CHECKLIST. checked_by comes from the authenticated inspector.

Condition choices are Good, Minor Damage, Damaged, Missing. Short quantity or Missing yields return_status=missing; a Damage condition yields damaged; otherwise inspected. Notes are at most 2,000 bytes.

## Completing the return

finalizeReturn reloads the saved inspections, revalidates the full checklist and rejects any short/Missing return. Fully returned damaged equipment can complete. It then sets BOOKINGS.status=completed. It does not automatically calculate a damage deduction, refund a deposit, settle balance, restore catalog stock or append history.

This guard belongs to finalizeReturn. A direct booking update can set completed without it, so teaching material must not claim every completion path enforces inspection. Nullable/unlinked manual rows and duplicate assignments can also prevent full inspection.

See [[System Understanding/Backend/Files/bookingItems.php|bookingItems.php]], [[System Understanding/Backend/Files/equipment_service.php|equipment_service.php]] and [[System Understanding/Current Implementation Gaps]].

## Source files

- [api/bookingItems.php](<../../../api/bookingItems.php>)
- [api/equipment_service.php](<../../../api/equipment_service.php>)
- [api/equipment.php](<../../../api/equipment.php>)
- [api/itemReleases.php](<../../../api/itemReleases.php>)
- [api/itemHistory.php](<../../../api/itemHistory.php>)

Return to [[System Understanding/Start Here|Start Here]].
