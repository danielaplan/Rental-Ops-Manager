---
title: "Payments and Deposits"
date: 2026-10-19
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Payments and Deposits

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## Part A — Understanding the Feature

This first part uses everyday language. You can continue to the next lesson without studying the technical section.

### What is this feature?

Rental payments reduce the booking balance. A refundable deposit is separate money held against damage, loss, or cleaning and may have itemized deductions before refund.

### Why does the system need it?

Mixing these amounts would make revenue and customer balances misleading.

### Follow Ana’s fictional rental

Ana owes ₱2,750. Her first Completed rental payment is ₱2,000, leaving ₱750 outstanding. A separate ₱500 deposit with a ₱100 damaged-cable deduction has a ₱400 refundable balance.

### Step-by-step workflow

1. Record a rental payment with type, method, status, date, optional reference, and owner.
2. The booking view uses the server-confirmed sum of Completed payments. Queued creates and corrections are shown separately as Pending Sync and do not change the accepted total.
3. Correct a payment from its history with an audit reason; direct and offline saves use the same server rule and do not create a money transfer.
4. Record one positive held deposit amount. After that write is accepted or queued, the booking screen locks the amount instead of presenting it as editable. A legacy zero record may be corrected only while it is still Held and has no deductions or refund history.
5. Add itemized deductions, each with affected item, reason, and amount.
6. Mark a positive remaining refund as Refunded when the real-world refund has been handled.

### What Happens Behind the Scenes?

Money is converted to integer cents in both the browser and server before totals or remaining balances are compared. Values with more than two decimal places are rejected before they can enter the offline queue and are checked again during server replay. Payment state is derived: Unpaid, Partially Paid, or Fully Paid. Deposit refundable amount is amount held minus the sum of deductions. A transaction locks the relevant booking/deposit before changes.

While disconnected, a new payment or correction remains a proposal in the outbox. Refreshing cached data does not add it to or subtract it from `amount_paid`. After the server accepts the operation, the normal refresh supplies the new confirmed total.

If replay rejects a payment or deposit amount, the sync panel keeps that Pending Sync draft available. The owner can enter a corrected positive amount with no more than two decimal places and retry the same queued operation. Keeping its original client operation ID, together with the server receipt check, prevents a corrected retry or a lost acknowledgement from creating the same payment twice.

### Visual explanation

```mermaid
flowchart LR
  B[Agreed total] --> P[Completed rental payments]
  P --> O[Outstanding balance]
  D[Deposit held] --> X[Itemized deductions]
  X --> F[Refundable amount]
```

The two lines stay separate on purpose: rental payments reduce the rental balance, while deductions reduce only the refundable deposit.

### Important things to remember

- Only Completed payment rows count toward collected revenue or the booking balance.
- Pending Sync payments and corrections remain visible but never alter accepted revenue, outstanding balances, or payment status prematurely.
- Methods are GCash or MariBank. Statuses are Pending, Completed, or Failed.
- A deduction cannot exceed the remaining held amount.
- A new deposit must be greater than zero. This is not a fixed business minimum: any positive negotiated amount is allowed. Legitimate held money cannot be overwritten after recording.
- Deposits and deductions do not count as rental revenue.
- The application records money events; it does not contact GCash, MariBank, a bank, or a refund gateway.
- A Completed payment cannot exceed the remaining booking balance. Record the exact remaining amount instead; a separate credit/refund workflow would require a new approved policy.
- Payment, deposit, and deduction amounts allow at most two decimal places. Exact-cent remaining payments are accepted without floating-point rounding.
- A rejected monetary operation can be corrected from the sync panel without clearing valid neighboring work from the outbox.

### Remember This

Ana pays ₱2,000 toward her ₱2,750 rental, leaving ₱750. Her separate ₱500 deposit has a ₱100 deduction, leaving ₱400 refundable.

## Part B — Technical Explanation

This section names the files, routes, tables, and validation rules. Beginner readers may skip it and continue to the next lesson.

### Technical details

`payments.php` and `payment_service.php`; `deposits.php` and `deposit_service.php`. Tables: `PAYMENTS`, `DEPOSITS`, `DEPOSIT_DEDUCTIONS`, `AUDIT_LOGS`.

### Technical references

[Post-event Completion](Post-event%20Completion.md) · [PAYMENTS](../Database/Tables/PAYMENTS.md) · [DEPOSITS](../Database/Tables/DEPOSITS.md)


## Continue Your Learning

**You’ve learned:** how rental payments, remaining balances, refundable deposits, deductions, and refunds stay separate.

**Previous lesson:** [Availability and Conflicts](Availability%20and%20Conflicts.md)

**Next lesson:** [Equipment Release and Return](Equipment%20Release%20and%20Return.md)

**Why read this next?** Once the financial records are clear, follow how the business prepares and tracks the equipment included in Ana’s package.

**Return to your learning dashboard:** [Start Here](../Start%20Here.md)
