---
title: "System Understanding — Start Here"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Welcome to Understanding Rental-Ops-Manager!

You do not need to know programming to understand this system.

This handbook walks you through how AKAD manages a rental—from creating Ana’s fictional karaoke booking to collecting payments, preparing equipment, completing the return review, and checking business reports. When a technical term first appears, the guide explains it in simple language.

By the end, you should be able to explain what the major parts do, why the business needs them, and how they work together.

## Meet Ana: the example you will follow

Ana is a fictional customer used throughout the lessons. She rents a karaoke package for an event.

- Package: **₱2,500**
- Add-on: **₱300**
- Discount: **₱100**
- Additional fee: **₱50**
- Agreed rental total: **₱2,750**
- First completed payment: **₱2,000**
- Remaining rental balance: **₱750**
- Separate refundable deposit: **₱500**
- Example equipment deduction: **₱100**
- Refundable deposit after deduction: **₱400**

These numbers stay the same across the handbook so you can concentrate on the process instead of learning a new example on every page.

## Choose Your Learning Path

### Path 1 — I’m not a developer

Follow the business story in order. Technical sections are clearly marked and optional.

1. [See the whole system in simple terms](System%20Overview.md)
2. [Learn how owners sign in safely](Workflows/Login%20and%20Authentication.md)
3. [Create and price Ana’s booking](Workflows/Booking%20and%20Pricing.md)
4. [Understand schedule and availability checks](Workflows/Availability%20and%20Conflicts.md)
5. [Follow payments, deposits, and balances](Workflows/Payments%20and%20Deposits.md)
6. [Prepare, release, and inspect equipment](Workflows/Equipment%20Release%20and%20Return.md)
7. [Complete the post-event review](Workflows/Post-event%20Completion.md)
8. [See what happens during an internet outage](Workflows/Offline%20Synchronization.md)
9. [Understand reports and audit history](Workflows/Reports.md)
10. [Learn what still needs deployment verification](Deployment%20and%20Limitations.md)

### Path 2 — I want to understand the technical side

Start with the [System Overview](System%20Overview.md), then follow the three main technical layers:

1. [Frontend: the screens people use](Frontend/Overview.md)
2. [Backend: the rules and processing behind the screens](Backend/Backend%20Overview.md)
3. [Database: the organized storage for business records](Database/Database%20Overview.md)
4. [API Reference: how the website and server communicate](Backend/API%20Reference.md)
5. [Backend File Inventory](Backend/File%20Inventory.md) and [Database Table Relationships](Database/Table%20Relationships.md)

### Path 3 — I need a specific answer

- **What happens when a booking is saved?** [Booking and Pricing](Workflows/Booking%20and%20Pricing.md)
- **Why does the system check availability?** [Availability and Conflicts](Workflows/Availability%20and%20Conflicts.md)
- **How does it know what Ana still owes?** [Payments and Deposits](Workflows/Payments%20and%20Deposits.md)
- **Why is equipment inspected?** [Equipment Release and Return](Workflows/Equipment%20Release%20and%20Return.md)
- **What if there is no internet?** [Offline Synchronization](Workflows/Offline%20Synchronization.md)
- **Where do report figures come from?** [Reports and Audit History](Workflows/Reports.md)
- **Where are records stored?** [Database Overview](Database/Database%20Overview.md)
- **What is unfinished or limited?** [Current Implementation Gaps](Current%20Implementation%20Gaps.md)
- **What does a technical term mean?** [Glossary](Glossary.md)

## Four simple ideas before you begin

- **Frontend:** the screens, buttons, and forms people see and use.
- **Backend:** the part behind the screens that checks information and applies business rules.
- **Database:** the organized digital filing cabinet where shared business records are stored.
- **API:** the agreed way the website asks the backend to read or save information.

You will see these ideas again with examples. You do not need to memorize them now.

## Accuracy and evidence

The handbook describes the source code at Git commit `3c4d86e36fd4a0fa92c883f304dd73671ffe9d55`, reviewed on 2026-10-17. Source inspection and local synthetic tests do not by themselves prove production readiness, real-device usability, formal accounting accuracy, or client acceptance. [Deployment and Limitations](Deployment%20and%20Limitations.md) explains those boundaries.

## Start the first lesson

**Next lesson:** [System Overview](System%20Overview.md)

**Why start there?** It gives you one simple picture of the people, screens, server, and records before you explore individual features.
