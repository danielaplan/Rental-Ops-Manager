# SAD 101 · Systems Analysis and Design

# System Design — Tech Stack, Database Schema & Architecture

**Client:** AKAD Sweet Party Rental's

*Companion document to `AKAD_Requirements_Analysis_Documentation.docx`. Translates the finalized requirements (FR/NFR) into a concrete technical design.*

**Prepared by:** RJDM Collective — Aplan, Manansala, Cruz, Estapia

---

## 1. Proposed Technology Stack

The stack was chosen to satisfy FR-02 (live consolidated calendar) and NFR-01 (offline-first entry with auto-sync) with minimal custom infrastructure, while keeping the database relational (SQL) as required.

| Layer | Technology | Role in the System |
|---|---|---|
| **Frontend** | HTML, CSS, JavaScript, Bootstrap, jQuery | Provides the responsive user interface for staff/owners, including booking forms, calendar views, equipment checklists, dashboards, and reports. Bootstrap supports responsive layout and interface components, while jQuery simplifies DOM manipulation, AJAX requests, and interactive features. |
| **Backend** | PHP | Handles server-side processing and system business rules, including booking management, karaoke double-booking prevention, deposit and deduction calculations, authentication, reporting, and offline synchronization requests. |
| **Database** | MySQL | Stores relational system data including users, customers, services, packages, bookings, payments, deposits, equipment checklists, and delivery information. |
| **Offline Storage** | Browser localStorage / IndexedDB | Temporarily queues bookings and checklist entries created while offline, until connectivity returns (NFR-01). |

> **Note:** PHP and MySQL were selected because they provide a widely supported, relational, and practical web development environment suitable for the project requirements. AJAX requests using jQuery will allow the frontend to communicate asynchronously with the PHP backend without requiring full page reloads. Bootstrap will support responsive access across desktop, laptop, and smartphone devices. Browser-based **localStorage** and **IndexedDB** will be used to support temporary offline data storage and synchronization.

---

## 2. Database Schema — Entity Summary

Nine entities support the 15 requirements documented in the Requirements Analysis. Full attribute-level detail is shown in the Entity Relationship Diagram (Section 3).

| Entity | Key Fields | Purpose |
|---|---|---|
| **USERS** | user_id (PK), full_name, role, contact_number, password_hash | Owners and staff who log in and manage bookings. |
| **CUSTOMERS** | customer_id (PK), full_name, contact_number, messenger_handle | People renting AKAD's services. |
| **SERVICES** | service_id (PK), service_name, description | The 3 core offerings: Karaoke, Sweet Corner, Balloon Decoration. |
| **PACKAGES** | package_id (PK), service_id (FK), package_name, price | Fixed packages under each service (e.g., Sweet Corner menus, 12-hr karaoke). |
| **BOOKINGS** | booking_id (PK), customer_id (FK), service_id (FK), package_id (FK), created_by (FK), event_date, start_time, end_time, event_location, status, sync_status | Central record of every rental transaction; links all other entities. |
| **PAYMENTS** | payment_id (PK), booking_id (FK), amount, payment_method, payment_status, payment_date | Down payments and balance payments (GCash/MariBank). |
| **DEPOSITS** | deposit_id (PK), booking_id (FK), amount_held, deduction_amount, deduction_reason, refund_status | Refundable deposits, with deduction tracking for uncleaned/damaged items. |
| **EQUIPMENT_CHECKLIST** | checklist_id (PK), booking_id (FK), item_name, condition_out, condition_in, return_status, checked_by (FK) | Digital version of AKAD's existing paper equipment checklist. |
| **DELIVERY** | delivery_id (PK), booking_id (FK), delivery_method, delivery_fee, fee_shouldered_by | Tracks delivery method (self-pickup, Lalamove, owner-delivered) and fee responsibility. |

---

## 3. Entity Relationship Diagram (ERD)

BOOKINGS is the central entity, linking a customer, the service/package selected, the staff member who created it, and its associated payments, deposit, equipment checklist, and delivery details.

![AKAD Booking Management System — Entity Relationship Diagram](images/AKAD_ERD.png)

The ERD lays out nine tables. **BOOKINGS** sits at the center and carries four foreign keys that tie the whole schema together: `customer_id` → CUSTOMERS, `service_id` → SERVICES, `package_id` → PACKAGES, and `created_by` → USERS (the staff member who logged the booking).

Reading the relationships as drawn:

- **SERVICES → PACKAGES** (1-to-M): one service (Karaoke, Sweet Corner, or Balloon Decoration) can have many fixed packages under it.
- **SERVICES → BOOKINGS** (1-to-M) and **PACKAGES → BOOKINGS** (1-to-M): each booking picks one service and one package.
- **USERS → BOOKINGS** (1-to-M): one staff/owner account can create many bookings.
- **CUSTOMERS → BOOKINGS** (1-to-M): one customer can have many bookings over time.
- **BOOKINGS → PAYMENTS** (1-to-M): a booking can have multiple payment records (e.g., down payment, then balance).
- **BOOKINGS → DEPOSITS** (1-to-M): a booking can have deposit records with deduction tracking.
- **BOOKINGS → EQUIPMENT_CHECKLIST** (1-to-M): a booking can have multiple checklist line items, each independently checked off by a user (`checked_by` → USERS).
- **BOOKINGS → DELIVERY** (1-to-M): a booking can have delivery record(s) specifying method and fee responsibility.

Every child table (PAYMENTS, DEPOSITS, EQUIPMENT_CHECKLIST, DELIVERY) only needs `booking_id` to trace back to the customer, service, package, and staff member — because BOOKINGS already holds those links. This is what lets FR-07 (automated reporting) pull income, most-booked service, and upcoming-booking figures with a single join path through BOOKINGS, rather than juggling separate lookups per feature.

---

## 4. System Architecture

The system architecture separates the client-side web interface, the PHP backend, and the MySQL relational database. The client interface will be developed using HTML, CSS, JavaScript, Bootstrap, and jQuery. PHP will process requests, enforce business rules, and communicate with the MySQL database. Browser-based localStorage or IndexedDB will provide temporary offline storage for selected transactions.

![AKAD Booking Management System — Architecture](images/AKAD_Architecture.png)

The diagram lays out three tiers plus an offline path:

- **Client Device (Browser)** — runs the HTML/CSS/JavaScript UI with Bootstrap and jQuery, and holds an offline booking queue in Local Storage / IndexedDB.
- **PHP Backend** — the middle tier, responsible for booking-conflict checks (FR-03), deposit/deduction logic (FR-06), authentication and reporting, and sync validation (NFR-01).
- **MySQL** — the relational store for Bookings, Payments, Deposits, Services, Packages, Customers, Users, Equipment, and Delivery data.

**Request/response flow (online):** the browser sends AJAX/HTTP requests to the PHP backend, which issues SQL queries to MySQL; MySQL returns query results to PHP, and PHP sends back JSON responses to the browser. A separate dashed arrow at the top ("Connected devices retrieve updated booking data") represents the periodic AJAX refresh/sync — this is how every connected staff/owner device sees the same live calendar without a manual page reload, per FR-02. The note box on the right spells this out: other AKAD staff/owner devices pick up updated booking data on page refresh, during sync, or via these background AJAX requests.

**Offline flow (bottom-left box, connected to the Client Device by a dashed red arrow):**
1. **No connection →** the entry is saved locally in the browser and labeled "Pending Sync."
2. **Connection restored →** the queued items are sent up to the PHP backend, which then validates them, checks for booking conflicts, and commits valid records to MySQL — fulfilling NFR-01's offline-entry-with-auto-sync requirement.

- **When online**, the browser sends requests using jQuery AJAX to PHP scripts. PHP validates the required business rules before storing or updating records in the MySQL database.
- Calendar and booking information will be retrieved asynchronously from the MySQL database through PHP and AJAX. Periodic AJAX requests will automatically check for updated booking information so connected users can receive current calendar data without manually reloading the entire page.
- **When offline**, supported transactions will be temporarily stored in localStorage or IndexedDB and labeled "Pending Sync."
- **Once internet connectivity is restored**, queued transactions will be sent through AJAX to the PHP backend. PHP will validate the queued data, check for booking conflicts, and then save valid records to the MySQL database.

---

## 5. Open Items Before Development

- Confirm authentication approach (username/email and password vs. simple PIN login) based on owner/staff comfort with technology. Authentication credentials and authorized user information will be managed through the PHP backend and MySQL database.
