---
title: "Payments and Deposits"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Payments and Deposits

**Navigate:** [Start Here](../Start%20Here.md) · [Reading order](../Start%20Here.md#recommended-reading-order) · [Backend files](../Backend/File%20Inventory.md) · [Database tables](../Database/Database%20Overview.md) · [Glossary](../Glossary.md)

## The purpose

Rental payments pay for the service. A refundable deposit is held separately for equipment/cleaning and may have a deduction. Mixing these figures would make the remaining rental balance misleading.

## Follow Ana’s money

| Item | Example amount | What it means |
|---|---|---|
| Rental total | ₱2,750 | Service price |
| Rental payment | ₱250 | Paid toward that price |
| Rental balance | ₱2,500 | Rental total minus payments so far |
| Deposit held | ₱350 | Separate refundable money |
| Cleaning deduction | ₱50 | Explained charge against deposit |
| Calculated refund | ₱300 | Held deposit minus deduction |

1. Staff record the payment; the backend saves it and updates the booking’s paid amount/status.
2. Staff separately record the negotiated deposit.
3. A positive deduction needs a reason and cannot exceed the held amount.
4. The backend calculates the refundable amount.

Amounts are negotiated; there is no fixed ₱1,000 minimum. These features record money. They do not collect money through a gateway or send a bank refund. A full/partial refund label is a calculation category.

## Key points

“A payment reduces the rental balance. A deposit stays separate and has its own deduction and refund calculation.” The current system keeps one combined deposit deduction/reason rather than itemized charges.

See [PAYMENTS](../Database/Tables/PAYMENTS.md), [DEPOSITS](../Database/Tables/DEPOSITS.md) and [deposit_service.php](../Backend/Files/deposit_service.php.md).

## Technical details

This section records exact file behavior, field names and implementation details.

Rental payments and refundable deposits are separate records because they represent different money.

| Record | Meaning | Stored result |
|---|---|---|
| PAYMENTS | Down payment or balance collected for the rental | Payment rows; aggregate paid/status on BOOKINGS |
| DEPOSITS | Held equipment/cleaning amount with possible deduction | Held amount, aggregate deduction/reason, refund category |

Amounts are negotiated between owner and client. There is no fixed amount or mandatory 1,000 minimum. PHP records money; it does not call GCash/MariBank gateways or send refunds.

### Rental payment

For rental total 2,800, a recorded payment of 250 creates a paid PAYMENTS row, increments BOOKINGS.amount_paid to 250 and changes aggregate status to Partial. Outstanding balance is 2,550. Once paid reaches/exceeds total the aggregate becomes Fully Paid. A single payment row's paid enum is different from the whole booking's status.

The insert and summary increment occur in the same transaction. Sync receipts protect acknowledged replay; direct payment POST does not have that protection. Neither path currently rejects negative numeric payment amounts explicitly.

### Refundable deposit

For held 350 and deduction 50 with reason Cleaning, PHP saves one DEPOSITS row and returns refund_amount=300.00, refund_status=partial. A positive deduction requires a reason and cannot exceed the held amount. Held/deduction values must be non-negative.

The upsert replaces the booking's current deposit summary because booking_id is UNIQUE. The system stores one aggregate deduction/reason; it does not yet have an itemized deduction ledger. A full/partial refund_status is a calculated category, not confirmation that money was transferred.

See [payments.php](../Backend/Files/payments.php.md), [deposit_service.php](../Backend/Files/deposit_service.php.md), [PAYMENTS](../Database/Tables/PAYMENTS.md) and [DEPOSITS](../Database/Tables/DEPOSITS.md).

## Source files

- [api/payments.php](<../../../api/payments.php>)
- [api/deposit_service.php](<../../../api/deposit_service.php>)
- [api/sync.php](<../../../api/sync.php>)
- [Documentation/AKAD_Requirements_Analysis_Documentation.md](<../../../Documentation/AKAD_Requirements_Analysis_Documentation.md>)

## Continue reading

[Previous: Booking and Pricing](Booking%20and%20Pricing.md) · [Next: Equipment Release and Return](Equipment%20Release%20and%20Return.md) · [Back to Start Here](../Start%20Here.md)
