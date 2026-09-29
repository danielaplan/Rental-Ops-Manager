---
title: "Request Lifecycle"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Request Lifecycle

For a direct write such as `POST /api/bookings.php?do=create`:

1. The PHP endpoint includes `config.php`, which sets JSON/CORS headers. OPTIONS is answered before business processing.
2. The endpoint selects its route using HTTP method and `do`.
3. A protected branch calls `requireAuth()` or `requireRole()`. PHP looks up the bearer token in SESSIONS and joins USERS; a local browser flag is not sufficient authorization.
4. `readJsonBody()` decodes the payload. Endpoint/helper checks apply; foreign keys constrain referenced records.
5. `db()` opens a MySQL PDO connection lazily. Prepared statements bind values separately from SQL.
6. A multi-step workflow may start a transaction and lock rows with `FOR UPDATE`. Changes become durable when committed. Sync wraps each individual operation, not its entire batch.
7. `sendJson()` emits a status and envelope, then exits.

```json
{"ok": true, "data": {"booking_id": 42}}
```

```json
{"ok": false, "error": "Time slot already booked.", "code": "conflict"}
```

| Status | Typical meaning |
|---|---|
| 200 | Successful read/update; a sync batch still needs per-operation inspection |
| 201 | Created record on routes that use it |
| 400 | Invalid input |
| 401 / 403 | Missing/invalid session or forbidden role |
| 404 | Record not found on routes that check it |
| 405 | Unsupported route/method |
| 409 | Direct karaoke overlap |
| 500 | Handled server/database failure |

There is no central handler guaranteeing that every exception becomes that JSON shape. Some CRUD/FK SQL errors are uncaught. Not all branch dispatchers strictly enforce method on reads. See [[System Understanding/Backend/Files/crud.php|crud.php]] and [[System Understanding/Current Implementation Gaps]].

## Source files

- [api/config.php](<../../../api/config.php>)
- [api/auth.php](<../../../api/auth.php>)
- [api/bookings.php](<../../../api/bookings.php>)
- [api/sync.php](<../../../api/sync.php>)

Return to [[System Understanding/Start Here|Start Here]].
