# UNIVERSITY OF CALOOCAN CITY

Biglang Awa St. corner 11th Ave Catleya St Caloocan City

<<<<<<< HEAD
# COLLEGE OF LIBERAL ARTS AND SCIENCES

# COMPUTER STUDIES DEPARTMENT
=======
COLLEGE OF LIBERAL ARTS AND SCIENCES

COMPUTER STUDIES DEPARTMENT
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

CCS 111: System Analysis and Design

## 1. Project Title

Development and Implementation of Operations and Booking Management System for AKAD Sweet Party Rentals.

## 2. Executive Summary

### 2.1 Brief Overview of the Proposed System

<<<<<<< HEAD
The proposed system is an Operations and Booking Management System designed to digitalize end-to-end rental workflows and internal administrative processes for AKAD Sweet Party Rentals. The web-based platform provides owners and staff with dynamic scheduling tools across three service lines: JBL Karaoke, Sweet Corner Setup, and Balloon Decorations. Offline transaction recording and synchronization may also be included if validated by the client. The system centralizes operations by automating double-booking prevention, equipment checklists, deposit tracking, and financial report generation, with proposed offline support intended to maintain operational continuity during connectivity interruptions if validated by the client.

### 2.2 The Current Problem or Opportunity

While AKAD Sweet Party Rentals leverages phone numbers and Facebook and Messenger to acquire clients, its core back-office operations rely heavily on manual workflows. Coordinating transactions via group chats and manually updating Canva graphics to track bookings creates operational delays and increases the risk of double-booking. Additionally, managing refundable cleaning deposits and tracking item returns without a centralized system complicates daily operations. The proposed system resolves these challenges by consolidating multi-service scheduling, deposit tracking, and income reporting into a single, automated internal platform.

### 2.3 Summary of the Proposed Solution

The proposed solution involves deploying an internal, responsive web application tailored for AKAD Sweet Party Rentals' owners and staff to replace manual visual tracking with an automatically refreshed, consolidated calendar that unifies JBL Karaoke Rentals, Sweet Corner Setups, and Balloon Decorations into a single view. To streamline booking accuracy, the system enforces automated, rule-based conflict checks for the single available Karaoke unit while allowing authorized owners and staff to manage Sweet Corner and Balloon Decoration schedules. Capacity limits, required setup times, and overlapping-event rules for these services shall be finalized through client validation before implementation.

Financial workflows are streamlined through the recording of down payments, calculation of refundable cleaning and damage deposits, and logging of itemized deductions. If offline support is validated by the client, the application will queue supported local entries during connectivity interruptions and automatically synchronize them once the connection is restored. The system will also digitize equipment return checklists and generate booking and revenue reports to support operational decisions.

### 2.4 Expected Benefits

Implementing the system is designed to streamline administrative workflows by replacing manual calendar updates with an automated, consolidated booking view and accelerating transaction turnarounds. Server-side scheduling validation will minimize double-booking risks for single-inventory assets such as the JBL Karaoke set. If offline functionality is validated by the client, local storage and synchronization conflict review will support operational continuity during temporary connectivity interruptions. Standardized deposit tracking and documented return checklists will reduce deposit disputes and improve staff accountability. Furthermore, automated reporting provides real-time visibility into sales metrics and peak service demand to support data-driven business decisions.

### 2.5 Stakeholders

Primary stakeholders include the two owner-partners of AKAD Sweet Party Rentals who oversee business growth and financial reporting, alongside the dedicated staff member responsible for daily operations, booking entries, and equipment return inspections. Secondary stakeholders encompass rental clients who may benefit indirectly from faster responses and clearer transaction records because staff can retrieve booking and deposit information more efficiently, third-party delivery providers like Lalamove drivers who handle equipment logistics, the student development team responsible for system implementation, and the course professor providing academic supervision.
=======
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
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

## 3. Project Background / Introduction

### 3.1 Organizational context

<<<<<<< HEAD
AKAD Sweet Party Rentals currently manages its party rental operations through decentralized channels, using phone number communications and platforms like Facebook and Messenger for customer inquiries while depending entirely on manual recordkeeping for daily management. As demand expands across its core offerings which are the JBL Karaoke rentals, Sweet Corner setups, and custom balloon decorations, the reliance on manual calendar scheduling, manual payment and transaction recordkeeping has introduced operational delays and heightened the risk of booking errors. The lack of a unified digital platform restricts timely visibility into booking and service availability and hinders overall workflow efficiency. Implementing a centralized, web-based Operations and Booking Management System will streamline key processes, replace scattered administrative tasks, and provide the infrastructure required to support scalable growth.
=======
AKAD Sweet Party Rentals currently manages its party rental operations through decentralized channels, using phone calls, Facebook, and Messenger for customer inquiries while depending entirely on manual recordkeeping for daily management. As demand expands across its core offerings which are the JBL Karaoke rentals, Sweet Corner setups, and custom balloon decoration, the reliance on manual calendar scheduling, manual payment and transaction recordkeeping has introduced operational delays and heightened the risk of booking errors. The lack of a unified digital platform restricts timely visibility into booking and service availability and hinders overall workflow efficiency. Implementing a centralized, web-based Operations and Booking Management System will streamline key processes, replace scattered administrative tasks, and provide the infrastructure required to support scalable growth.
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

### 3.2 Existing system (if any)

Current operations rely on manual coordination and informal visual tracking across three separate service lines (JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decorations). Incoming customer inquiries and transaction notes are communicated strictly through a phone number or Facebook Messenger group chat. Schedule management is maintained by manually updating and redesigning a graphic in Canva for every single booking change. Financial tracking including down payments, balance collections, and refundable cleaning/damage deposits is handled manually via digital wallet confirmations (GCash and Maribank) alongside informal physical checklists for equipment returns. The business operates without a centralized database, consolidated calendar, or automated scheduling infrastructure, leaving all administrative tracking dependent on manual entry across decentralized channels.

### 3.3 Business needs or problems identified

<<<<<<< HEAD
The organization requires an internal administrative system to eliminate labor-intensive Canva schedule updates and centralize multi-service booking visibility. To protect single-inventory assets such as the sole JBL Karaoke unit from double-booking, the system must enforce server-side scheduling rules. If offline support is validated, queued records shall undergo conflict review during database synchronization. Additionally, the platform must provide standardized booking entries supporting package presets, delivery fee logging, down payment tracking, itemized security deposit deduction logs, digitized equipment return checklists, and automated performance reports analyzing monthly revenues and high-demand rental trends.

### 3.4 Key drivers for change (technological, operational, customer demand, etc.)

Technological modernizations necessitate replacing labor-intensive Canva calendar graphics and unorganized Facebook Messenger logs with a dynamic, multi-user administrative system to eliminate manual editing delays. Operational efficiency requirements demand automated schedule verification to strictly prevent single-inventory double-bookings while streamlining daily booking, delivery, and payment workflows. Financial control initiatives require structured tracking of reservation down payments and itemized security deposit deductions to minimize billing disputes over uncleaned or damaged rentals. Business intelligence needs drive the transition toward automated data reporting for real-time visibility into monthly income streams, peak rental dates, and high-demand service trends. Reliability considerations support evaluating offline data persistence and automatic synchronization as proposed safeguards against temporary connectivity interruptions, subject to client validation. Operational control preferences reinforce maintaining an internal-only management tool, prioritizing internal administrative efficiency over the added risk and complexity of a public self-service booking portal.
=======
The organization requires an internal administrative system that eliminates repeated Canva schedule editing and centralizes booking visibility across its three service lines. The system must detect overlapping bookings for the same service while allowing different services to operate simultaneously. It must support owner-controlled preparation and travel allowances, package and promotional-package management, payment recording, itemized refundable-deposit deductions, reusable equipment-checklist templates, delivery details, persistent post-event notifications, manual service release, audit history, and automated operational and financial reports.

### 3.4 Key drivers for change (technological, operational, customer demand, etc.)

Technological modernization requires replacing repeated Canva calendar editing and unorganized Messenger transaction notes with a centralized, responsive owner-managed system. Operational needs require clear availability information, conflict detection, preparation and travel allowances, and a controlled process for owner-authorized overlaps. Financial-control needs require structured payment records, historical agreed-price snapshots, refundable deposits, and itemized deductions. Equipment-readiness needs require booking-specific checklists, post-event review, and manual service release. Reporting needs require a clear definition of monthly collected revenue and separate visibility into balances, deposits, deductions, upcoming bookings, cancellations, and scheduling overrides.
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

## 4. Problem Statement

### 4.1 General Problem Statement

Reliance on informal group chat coordination, manual graphic editing for schedule tracking, and unstandardized deposit monitoring creates labor-intensive workflows, operational delays during schedule updates, and risks of financial and item tracking inaccuracies.

<<<<<<< HEAD
### 4.2  Specific Problem Statement

Booking updates require manual adjustments to a graphic template in Canva, creating a slow and inefficient schedule maintenance process.

Transaction logs and reservation notes are dispersed across an unorganized Facebook Messenger group chat, making record retrieval and tracking difficult.

Managing schedule availability across three distinct service lines (JBL Karaoke, Sweet Corner, and Balloon Decor) without a unified calendar increases the risk of scheduling confusion.

High dependence on manual verification for the single available JBL Karaoke set creates an ongoing risk of accidental double-bookings.

Tracking down payments, reservation fees, and payment statuses via GCash and Maribank rely on manual checks without structured digital records.

Equipment and cleaning deposits specifically for Sweet Corner setup items lack formal digital ledger tracking for damage or cleaning fee deductions.

Reliance on paper or informal equipment checklists makes asset auditing upon item return inconsistent and prone to missing items.

Delivery arrangements and fee responsibilities (whether self-pickup, Lalamove, or owner-delivered) are recorded informally, causing operational ambiguity.

The absence of an automated reporting mechanism prevents owners from easily analyzing monthly income trends and identifying top-booked services.

Although internet access is currently available, temporary connectivity interruptions could disrupt booking and equipment-status recording. Offline transaction recording and automatic synchronization are proposed as reliability enhancements subject to client validation.
=======
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
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

## 5. Objectives of the project

### 5.1 General Objectives

<<<<<<< HEAD
The project aims to develop and implement an Operations and Booking Management System for AKAD Sweet Party Rentals to centralize and improve the management of rental bookings, scheduling, payments, deposits, equipment returns, delivery arrangements, and operational reporting. The system is intended to address the inefficiencies and risks associated with AKAD’s current manual processes by providing an integrated internal platform with automated scheduling validation, digital recordkeeping, and reporting capabilities. Offline data synchronization may also be included if validated by the client.

### 5.2 Specific Objectives

Centralize booking and scheduling activities across AKAD Sweet Party Rentals’ three service lines: JBL Karaoke Set, Sweet Corner Setup, and Balloon Decorations.

Reduce scheduling conflicts and double-booking risks, particularly for the single available JBL Karaoke Set.

Improve the accuracy and accessibility of transaction records, including customer information, bookings, payments, and deposits.

Standardize the monitoring of rental equipment, including the documentation of item conditions and applicable deposit deductions.

Streamline delivery coordination by providing organized records of delivery arrangements and fee responsibilities.

Provide timely operational and financial information through automated reports on income, upcoming bookings, and frequently booked services or packages.

If validated by the client, support operational continuity during connectivity interruptions through offline transaction recording and automatic data synchronization.

Provide a responsive and controlled internal platform that supports the daily administrative activities of AKAD’s owners and staff.
=======
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
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

## 6. Scope of the Project

### 6.1 In-Scope

The proposed Operations and Booking Management System for AKAD Sweet Party Rentals will focus on the internal management of the company’s rental operations. The system will cover the following functions and features:

<<<<<<< HEAD
User and Administrative Access - Authorized access for AKAD’s two owner-partners and staff members responsible for booking management and daily operations.

Customer Management - Recording and management of customer information, including names and contact details.

Booking Management - Recording and management of booking details, including event dates, times, locations, selected services, packages, payment status, and booking status.

Multi-service Calendar - A consolidated calendar covering the three service lines: JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decorations.

Package Management – The system shall support the creation, updating, selection, activation, and deactivation of packages associated with JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decorations. Each service may have zero or more packages. Authorized owners and staff may change a package’s status according to operational needs. Package availability, inclusions, prices, and durations remain subject to client validation.

Payment Tracking - Recording of down payments or reservation fees and monitoring of payment status.

Deposit Management - Optional recording of refundable equipment or cleaning deposits when required by the selected service or package, including itemized deductions for uncleaned, missing, or damaged items.

Equipment Return Checklist - Optional assignment of a digital equipment checklist when required by the selected service or package, including documentation of each item’s condition upon release and return.

Delivery Management - Recording of delivery arrangements, including self pick-up, Lalamove, and owner delivered services, as well as delivery fee responsibility.

Availability Management - Management of unavailable dates or services by authorized staff for operational purposes.

Reporting - Generation of reports on monthly income, upcoming bookings, and frequently booked services or packages.

Offline Data Management and Synchronization - Proposed recording of selected transactions during connectivity interruptions, with automatic synchronization once internet access is restored. This feature remains subject to client validation.

Responsive Access - Accessibility through desktop, laptop, and smartphone devices.

Centralized Database - Organized storage of information related to users, customers, services, packages, bookings, payments, deposits, equipment checklists, delivery details, and availability blocks.
=======
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
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

### 6.2 Out-of-Scope

The following are outside the scope of the proposed Operations and Booking Management System for AKAD Sweet Party Rentals:

<<<<<<< HEAD
Public Customer-Facing Booking Portal - The project will not include a public self-service reservation portal. Booking management will remain an internal administrative function handled by AKAD’s owners and staff.

Unconfirmed Additional Service Lines - The project will initially cover only the three confirmed service lines: JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decorations. Other possible services, such as the camping rentals mentioned during the interview, will not be included unless they are confirmed and validated by the business owner.

Functions not included in the approved requirements - Features or processes that are not identified in the project's validated requirements will not be included in the current implementation.

Client Validation and Open Items - The proposed scope and system requirements are subject to confirmation and validation by the business owner before final requirements and development. Open items include confirming the Karaoke package, package durations, available inventory quantities, booking start and end times, whether a 12-hour Karaoke booking blocks the entire day or only a specific time interval, whether offline transaction recording and automatic synchronization are required, and the applicable delivery coverage, minimum booking amount, distance charges, and location-rejection rules. These details must be confirmed before the final scheduling, package management, delivery, and synchronization rules are established. Any unconfirmed items will be excluded from the current implementation.

## 7. Resources Required

Human resources (developers, testers, analysts)

The project will be developed by the four-member student development team, RJDM Collective, composed of Daniel Aplan, Rochelle Cruz, Joaquin Estapia, and Martha Faith Manansala. The proponents will assume responsibilities related to system analysis, requirements documentation, system design, development, database implementation, testing, and documentation.

The owners and staff of AKAD Sweet Party Rentals will serve as the primary stakeholders and end users of the proposed platform. They will provide business process information, validate system requirements, participate in system testing, and provide feedback regarding the suitability of the proposed solution for their actual operations.

The assigned course professor/adviser will provide academic supervision, guidance, evaluation, and approval throughout the development of the project.

### 7.2  Software tools (IDE, database, testing tools)

The proposed system will utilize a web-based technology stack designed to support responsive access and, if validated by the client, offline functionality. HTML, CSS, and JavaScript will serve as the core frontend technologies. Bootstrap will be used to develop responsive layouts and user-interface components, while jQuery will support DOM manipulation, interactive features, and asynchronous AJAX communication with the server.

PHP will be used for backend development, server-side processing, database communication, and implementation of business rules such as schedule validation, booking conflict prevention, payment and deposit processing, authentication, and report generation.

MySQL will serve as the centralized relational database management system for storing information involving users, customers, services, packages, bookings, payments, deposits, equipment checklists, delivery records, and availability blocks.

If offline functionality is validated by the client, browser-based storage such as localStorage or IndexedDB will temporarily queue supported transactions during connectivity interruptions. Once connectivity is restored, AJAX requests will transmit queued records to the PHP backend for validation and synchronization with the MySQL database.

An Integrated Development Environment (IDE), a local PHP/MySQL development environment, and standard web browsers will be used for coding, debugging, database development, and system testing.

### 7.3  Hardware (servers, workstations)

The project will require desktop computers and laptops for system analysis, software development, database management, testing, and documentation. Smartphones will also be utilized to evaluate the responsive design and accessibility of the proposed platform on mobile devices. An internet connection is required for system development, authentication, access to the centralized database, and synchronization of offline transactions. If validated by the client, the proposed offline functionality will allow selected operations to continue during temporary connectivity interruptions.

Proposed by:							Approved by:

# PROF. JEROME T. ALVEZ
=======
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
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7

Professor, System Analysis and Design

Aplan, Daniel S.

Cruz, Rochelle M.

Estapia, Joaquin C.

Manansala, Martha Faith A.
