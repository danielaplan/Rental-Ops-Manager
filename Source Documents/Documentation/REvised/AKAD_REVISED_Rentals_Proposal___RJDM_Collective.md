# UNIVERSITY OF CALOOCAN CITY

Biglang Awa St. corner 11th Ave Catleya St Caloocan City

COLLEGE OF LIBERAL ARTS AND SCIENCES

COMPUTER STUDIES DEPARTMENT

CCS 111: System Analysis and Design

## 1. Project Title

Development and Implementation of Operations and Booking Management System for AKAD Sweet Party Rentals.

## 2. Executive Summary

### 2.1 Brief Overview of the Proposed System

The proposed Operations and Booking Management System is an internal, responsive web application designed primarily for the owner-partners of AKAD Sweet Party Rentals. It will centralize customer, package, booking, availability, payment, refundable deposit, equipment checklist, delivery, notification, and reporting records for JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decoration. The system will detect scheduling conflicts for the same service using the event schedule and owner-controlled preparation and travel allowances. Different services may operate simultaneously. The owner may adjust or cancel a booking or deliberately approve an overlap after reviewing the conflict and recording a reason. Offline transaction recording and automatic synchronization are deferred pending a separate client assessment.

### 2.2 The Current Problem or Opportunity

While AKAD Sweet Party Rentals uses phone calls, Facebook, and Messenger to communicate with clients, its core back-office operations rely heavily on manual workflows. Coordinating transactions via group chats and manually updating Canva graphics to track bookings creates operational delays and increases the risk of double-booking. Additionally, managing refundable cleaning deposits and tracking item returns without a centralized system complicates daily operations. The proposed system resolves these challenges by consolidating multi-service scheduling, deposit tracking, and collected-revenue reporting into a single, automated internal platform.

### 2.3 Summary of the Proposed Solution

The proposed solution is an internal, responsive web application designed primarily for authenticated owner use. It will replace manual visual tracking with a consolidated calendar covering JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decoration. Each service may accept one booking at a time, while different services may operate simultaneously. The system will evaluate availability using the event start and end time, preparation allowance, travel allowance, confirmed bookings, and owner-defined availability blocks.

The system will record multiple booking payments, optional GCash or MariBank reference numbers, refundable deposits, and multiple itemized deductions for uncleaned, missing, or damaged items. Owners will have full control over regular and promotional packages, including their inclusions, prices, durations, deposit requirements, and availability. Confirmed bookings will retain the package name, package price, and agreed total recorded at the time of booking.

When a booking reaches its scheduled blocked end time, it will move to Awaiting Completion status. The service will remain unavailable, and the system will display a prominent, persistent notification until the owner completes the post-event review and manually releases the service. Completed and cancelled bookings will remain in the historical records.

### 2.4 Expected Benefits

Implementing the system will reduce repeated Canva editing, improve access to customer and transaction records, and expose scheduling conflicts before confirmation. Owner-controlled preparation and travel allowances will produce more realistic availability information. Historical price snapshots, itemized deposit deductions, equipment-return checklists, and audit records will improve financial and operational accountability. Persistent post-event notifications will prevent a service from being shown as available before the owner verifies its return and readiness. Reports will provide visibility into monthly collected revenue, outstanding balances, deposits held, upcoming bookings, cancellations, and approved scheduling overlaps.

### 2.5 Stakeholders

Primary stakeholders include the two owner-partners of AKAD Sweet Party Rentals, who will serve as the initial authorized system users and will manage bookings, packages, availability, payments, deposits, post-event reviews, and reports. The business also has one staff member who remains an operational stakeholder; however, staff system access is excluded from the initial release unless the client later validates the required responsibilities and permissions. Secondary stakeholders include rental customers, delivery providers such as Lalamove drivers, the RJDM Collective student development team, and the course professor providing academic supervision.

## 3. Project Background / Introduction

### 3.1 Organizational context

AKAD Sweet Party Rentals currently manages its party rental operations through decentralized channels, using phone calls, Facebook, and Messenger for customer inquiries while depending entirely on manual recordkeeping for daily management. As demand expands across its core offerings which are the JBL Karaoke rentals, Sweet Corner setups, and custom balloon decoration, the reliance on manual calendar scheduling, manual payment and transaction recordkeeping has introduced operational delays and heightened the risk of booking errors. The lack of a unified digital platform restricts timely visibility into booking and service availability and hinders overall workflow efficiency. Implementing a centralized, web-based Operations and Booking Management System will streamline key processes, replace scattered administrative tasks, and provide the infrastructure required to support scalable growth.

### 3.2 Existing system (if any)

Current operations rely on manual coordination and informal visual tracking across three separate service lines (JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decorations). Incoming customer inquiries and transaction notes are communicated strictly through a phone number or Facebook Messenger group chat. Schedule management is maintained by manually updating and redesigning a graphic in Canva for every single booking change. Financial tracking including down payments, balance collections, and refundable cleaning/damage deposits is handled manually via digital wallet confirmations (GCash and Maribank) alongside informal physical checklists for equipment returns. The business operates without a centralized database, consolidated calendar, or automated scheduling infrastructure, leaving all administrative tracking dependent on manual entry across decentralized channels.

### 3.3 Business needs or problems identified

The organization requires an internal administrative system that eliminates repeated Canva schedule editing and centralizes booking visibility across its three service lines. The system must detect overlapping bookings for the same service while allowing different services to operate simultaneously. It must support owner-controlled preparation and travel allowances, package and promotional-package management, payment recording, itemized refundable-deposit deductions, reusable equipment-checklist templates, delivery details, persistent post-event notifications, manual service release, audit history, and automated operational and financial reports.

### 3.4 Key drivers for change (technological, operational, customer demand, etc.)

Technological modernization requires replacing repeated Canva calendar editing and unorganized Messenger transaction notes with a centralized, responsive owner-managed system. Operational needs require clear availability information, conflict detection, preparation and travel allowances, and a controlled process for owner-authorized overlaps. Financial-control needs require structured payment records, historical agreed-price snapshots, refundable deposits, and itemized deductions. Equipment-readiness needs require booking-specific checklists, post-event review, and manual service release. Reporting needs require a clear definition of monthly collected revenue and separate visibility into balances, deposits, deductions, upcoming bookings, cancellations, and scheduling overrides.

## 4. Problem Statement

### 4.1 General Problem Statement

Reliance on informal group chat coordination, manual graphic editing for schedule tracking, and unstandardized deposit monitoring creates labor-intensive workflows, operational delays during schedule updates, and risks of financial and item tracking inaccuracies.

### 4.2 Specific Problem Statement

- Booking updates require manual adjustments to a graphic template in Canva, creating a slow and inefficient schedule maintenance process.

- Transaction logs and reservation notes are dispersed across an unorganized Facebook Messenger group chat, making record retrieval and tracking difficult.

- Managing schedule availability across three distinct service lines (JBL Karaoke, Sweet Corner setup, and Balloon Decoration) without a unified calendar increases the risk of scheduling confusion.

- Manual verification of schedules across the three service lines creates a risk of accidental overlapping bookings for the same service and does not account consistently for preparation and travel time.

- Tracking down payments, reservation fees, and payment statuses via GCash and Maribank relies on manual checks without structured digital records.

- Equipment and cleaning deposits specifically for Sweet Corner setup items lack formal digital ledger tracking for damage or cleaning fee deductions.

- Reliance on paper or informal equipment checklists makes asset auditing upon item return inconsistent and prone to missing items.

- Delivery arrangements and fee responsibilities (whether self-pickup, Lalamove, or owner-delivered) are recorded informally, causing operational ambiguity.

- The absence of an automated reporting mechanism prevents owners from analyzing monthly collected revenue, outstanding balances, deposits held, upcoming bookings, cancellations, and frequently booked services or packages.

- The existing process does not provide a formal post-event review that keeps a service unavailable until the owner verifies equipment return, applicable deductions, outstanding payments, and service readiness.

## 5. Objectives of the project

### 5.1 General Objectives

The project aims to develop and implement an Operations and Booking Management System for AKAD Sweet Party Rentals that centralizes customer, package, booking, scheduling, payment, refundable deposit, equipment checklist, delivery, post-event review, notification, audit, and reporting activities. The system will provide accurate availability information, detect same-service schedule conflicts, support documented owner decisions, and retain reliable historical transaction records.

### 5.2 Specific Objectives

- Centralize booking and scheduling activities across AKAD Sweet Party Rentals’ three service lines: JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decoration.

- Detect same-service scheduling conflicts using event, preparation, and travel intervals while allowing different services to operate simultaneously.

- Improve the accuracy and accessibility of transaction records, including customer information, bookings, payments, and deposits.

- Standardize the monitoring of rental equipment, including the documentation of item conditions and applicable deposit deductions.

- Streamline delivery coordination by providing organized records of delivery arrangements and fee responsibilities.

- Provide timely operational and financial information through reports on monthly collected revenue, outstanding balances, deposits, deductions, upcoming bookings, cancellations, approved overlaps, and frequently booked services or packages.

- Provide a responsive and controlled internal platform designed primarily for AKAD’s authenticated owner-partners.

- Give owners complete control over regular and promotional packages, preparation and travel allowances, availability blocks, booking cancellations, and documented scheduling overrides.

- Retain historical package names, agreed prices, payments, deductions, checklist results, booking statuses, and sensitive owner actions.

- Notify owners when post-event review is required and keep the affected service unavailable until the owner manually releases it.

## 6. Scope of the Project

### 6.1 In-Scope

The proposed Operations and Booking Management System for AKAD Sweet Party Rentals will focus on the internal management of the company’s rental operations. The system will cover the following functions and features:

- User and Administrative Access – Individual authenticated accounts for AKAD’s two owner-partners. One designated primary owner may administer the other owner account. Staff access is excluded from the initial release unless the client later validates the required responsibilities and permissions.

- Customer Management – Creation, updating, searching, and viewing of customer information, including names, contact details, Messenger handles, and booking histories.

- Booking Management – Creation, editing, cancellation, confirmation, completion, and historical retention of bookings containing the customer, service, optional package, event schedule, location, preparation allowance, travel allowance, agreed total, payment status, and booking status.

- Package Management – Owner-controlled creation, updating, activation, and deactivation of regular and promotional packages for any service. Packages may contain descriptions, inclusions, prices, durations, deposit requirements, promotion periods, and equipment-checklist templates. Inactive or expired packages will remain visible in historical bookings.

- Multi-service Calendar - A consolidated calendar covering the three service lines: JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decoration.

- Payment Tracking – Recording of multiple booking payments, including amount, payment type, method, status, payment date, optional GCash or MariBank reference number, and the owner who recorded the transaction.

- Deposit Management – Optional recording of refundable deposits and multiple itemized deductions for cleaning, missing items, or damage. Each deduction will identify the affected item or description, reason, amount, recording owner, and date. The system will calculate the remaining refundable amount.

- Equipment Checklist Management – Creation of reusable package checklist templates and booking-specific checklist records showing expected quantity, released quantity, returned quantity, condition upon release, condition upon return, and return status.

- Delivery Management - Recording of delivery arrangements, including self pickup, Lalamove, and owner-delivered services, as well as delivery fee responsibility.

- Availability Management – Availability checking based on confirmed bookings, event times, owner-controlled preparation and travel allowances, and service availability blocks. One ordinary booking may occupy a service at a time, while different services may operate simultaneously.

- Reporting – Generation of reports on monthly collected revenue, outstanding balances, deposits held, deposit deductions, upcoming bookings, completed bookings, cancellations, approved overlaps, and frequently booked services or packages. Refundable deposits will be excluded from collected revenue.

- Conflict Override Management – When a same-service conflict is detected, the system will display the affected booking, client, schedule, and service. The owner may change the schedule, cancel a booking, or authorize an overlap by entering a reason. Every approved overlap will remain visibly marked and recorded in the audit history.

- Post-Event Review and Manual Release – When the blocked end time is reached, the booking will move to Awaiting Completion and the service will remain unavailable. A persistent notification will remain visible until the owner completes the review and manually releases the service.

- Audit History – Recording of sensitive actions involving booking cancellation, schedule overrides, package-price changes, payment changes, deductions, refunds, post-event completion, service release, and owner-account administration.

- Responsive Access - Accessibility through desktop, laptop, and smartphone devices.

- Centralized Database – Organized storage of owner accounts, customers, services, packages, bookings, availability blocks, payments, refundable deposits, itemized deductions, checklist templates, booking checklists, delivery records, notifications, and audit history.

### 6.2 Out-of-Scope

The following are outside the scope of the proposed Operations and Booking Management System for AKAD Sweet Party Rentals:

- Public Customer-Facing Booking Portal - The project will not include a public self-service reservation portal. Booking management will remain an internal administrative function handled by AKAD’s authenticated owner-partners.

- Offline Recording and Automatic Synchronization – Offline transaction queues, automatic synchronization, and synchronization-conflict handling are deferred pending a separate client assessment.

- Unconfirmed Additional Service Lines - The project will initially cover only the three confirmed service lines: JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decoration. Other possible services, such as the camping rentals mentioned during the interview, will not be included unless they are confirmed and validated by the business owner.

- Functions not included in the approved requirements - Features or processes that are not identified in the project's validated requirements will not be included in the current implementation.

- Client Validation and Open Items – Before development is finalized, the owner-partners should validate owner-only system access, package control across all services, default preparation and travel allowances, deliberate overlap-approval procedures, deposit requirements, delivery rules, and the post-event manual-release workflow. Karaoke and other service bookings will use specific time intervals rather than automatically blocking an entire day. Offline synchronization remains deferred for separate assessment.

## 7. Resources Required

### Human Resources

The project will be developed by the four-member student development team, RJDM Collective, composed of Daniel Aplan, Rochelle Cruz, Joaquin Estapia, and Martha Faith Manansala. The proponents will assume responsibilities related to system analysis, requirements documentation, system design, development, database implementation, testing, and documentation.

The two owner-partners of AKAD Sweet Party Rentals will serve as the initial end users and primary business validators. The existing staff member remains an operational stakeholder but will not receive system access in the initial release unless the client later confirms the required permissions. The owners will validate requirements, participate in testing, and evaluate the system’s suitability for actual operations.

The assigned course professor/adviser will provide academic supervision, guidance, evaluation, and approval throughout the development of the project.

### 7.2 Software tools (IDE, database, testing tools)

The proposed system will use a responsive web-based technology stack. HTML, CSS, JavaScript, Bootstrap, and jQuery will support the owner interface, booking forms, consolidated calendar, conflict warnings, notifications, and reports. PHP will implement authentication, business rules, server-side schedule validation, payment and deposit calculations, post-event processing, audit logging, and report generation. MySQL will provide centralized relational storage.

An Integrated Development Environment (IDE), a local PHP/MySQL development environment, and standard web browsers will be used for coding, debugging, database development, and system testing.

### 7.3 Hardware (servers, workstations)

The project will require desktop computers and laptops for system analysis, software development, database management, testing, and documentation. Smartphones will be used to evaluate responsive design and owner access on mobile devices. An internet connection is required for authentication, system access, and communication with the centralized database.

Proposed by: Approved by:

PROF. JEROME T. ALVEZ

Professor, System Analysis and Design

Aplan, Daniel S.

Cruz, Rochelle M.

Estapia, Joaquin C.

Manansala, Martha Faith A.
