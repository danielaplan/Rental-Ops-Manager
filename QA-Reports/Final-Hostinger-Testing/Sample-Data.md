# Final Hostinger Testing — Sample Data

All names, contacts, venues, notes, and payment references below are fictional. Keep the `HST FINAL` prefix exactly so every test record can be found later.

## Preflight catalog

Before creating bookings, confirm these active records exist in the deployed system. If a production catalog uses different names or prices, write the actual value in [Report.md](Report.md) and use an equivalent active package; do not change a real package merely to match this document.

| Needed item | Expected example |
| --- | --- |
| Karaoke service | `JBL Karaoke Rental` |
| Karaoke package | `Karaoke Setup — 12 Hours`, ₱999 |
| Sweet Corner service/package | An active Sweet Corner package |
| Add-on | An active add-on linked to its own service |
| Equipment checklist | At least one package with generated checklist items |
| Gallery upload | One non-sensitive JPG, PNG, GIF, or WebP under 5 MB |

If any item is missing, record the scenario as BLOCKED. Do not create a temporary catalog item on a live client system without the owner’s approval.

## Test records

Use future dates far enough away from real bookings. Replace the dates only if the selected time would affect a real rental. Keep each same-service schedule separate except where a conflict is intentional.

| Label | Customer / contact                          | Date and time                       | Service/package              | Venue / amount                             | Used by       |
| ----- | ------------------------------------------- | ----------------------------------- | ---------------------------- | ------------------------------------------ | ------------- |
| A     | `HST FINAL Ana Normal` / `09990000001`      | 2027-11-03, 10:00 AM–10:00 PM       | Karaoke / 12 Hours           | `HST FINAL Venue A` / ₱999                 | F03, F05, F09 |
| B     | `HST FINAL Ben Reuse` / `09990000002`       | 2027-11-05, 1:00–3:00 PM            | Karaoke / 12 Hours           | `HST FINAL Venue B` / ₱999                 | F03           |
| C     | `HST FINAL Cara Conflict A` / `09990000003` | 2027-11-07, 2:00–4:00 PM            | Karaoke / 12 Hours           | `HST FINAL Venue C` / ₱999                 | F04           |
| D     | `HST FINAL Dan Conflict B` / `09990000004`  | 2027-11-07, 2:30–4:30 PM            | Same as C                    | `HST FINAL Venue D` / ₱999                 | F04           |
| E     | `HST FINAL Elle Payment` / `09990000005`    | 2027-11-09, 10:00 AM–10:00 PM       | Karaoke / 12 Hours           | `HST FINAL Venue E` / ₱999                 | F05           |
| F     | `HST FINAL Finn Deposit` / `09990000006`    | 2027-11-11, 10:00 AM–10:00 PM       | Karaoke / 12 Hours           | `HST FINAL Venue F` / ₱999                 | F06           |
| G     | `HST FINAL Gia Delivery` / `09990000007`    | 2027-11-13, 1:00–4:00 PM            | Active Sweet Corner package  | `HST FINAL Venue G` / actual package total | F07           |
| H     | `HST FINAL Hugo Cancel` / `09990000008`     | 2027-11-15, 10:00 AM–12:00 PM       | Karaoke / 12 Hours           | `HST FINAL Venue H` / ₱999                 | F08           |
| I     | `HST FINAL Iris Return` / `09990000009`     | Coordinator-approved past test date | Checklist-generating package | `HST FINAL Venue I` / actual package total | F09, F10      |
| J     | `HST FINAL Juno Offline` / `09990000010`    | 2027-11-19, 1:00–4:00 PM            | Active Sweet Corner package  | `HST FINAL Venue J` / actual package total | F12           |

## Exact money data

| Scenario | Payment/deposit data |
| --- | --- |
| F05 | E: Completed ₱400, then Completed ₱599. Attempt ₱1 after balance reaches ₱0. Use references `HST-F05-A` and `HST-F05-B`. |
| F06 | F: Completed rental payment ₱500; held deposit ₱300; deduction ₱100 with reason `HST FINAL test deduction`; refund the remaining ₱200 only. |
| F08 | H: Completed payment ₱200 with reference `HST-F08-PAID`; cancellation reason `HST FINAL — customer cancelled test booking`. |
| F10 | I: Use a partial completed rental payment. Record the visible remaining balance before return review, then settle exactly that remaining amount after the booking becomes Awaiting Payment. |
| F12 | J: Enter an intended ₱400 payment while offline, then record it online once after synchronization with reference `HST-F12-INTENT`. |

