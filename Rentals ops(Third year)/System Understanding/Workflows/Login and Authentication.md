---
title: "Login and Authentication"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Login and Authentication

An owner or staff member sends a contact number and password to auth.php. PHP retrieves the account, calls password_verify(), creates a random bearer token, and inserts it into SESSIONS with an expiry. The returned user omits the password hash.

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as auth.php
    participant D as MySQL
    B->>A: POST contact_number and password
    A->>D: Find USERS account
    D-->>A: Account and password_hash
    A->>A: Verify password; generate token
    A->>D: Insert SESSIONS row
    A-->>B: Token, user, expires_in
    B->>A: Protected request with Bearer token
    A->>D: Join valid SESSIONS and USERS; extend expiry
    A-->>B: Authorized result or 401/403
```

`requireAuth()` accepts either role; `requireRole(['owner'])` limits catalog/configuration and some manual equipment operations. Expiry is sliding: each authenticated call extends by 24 hours. The helper's returned session row contains user identity and the previous expiry, but not the token itself.

Logout should send `{ "session_token": "<token>" }` in its JSON body, because the header-only fallback does not obtain a token field from currentSession(). Expiration rejects a token without deleting its row.

An offline local session enables already-authorized cached entry but does not bypass server validation when reconnecting. First-time offline login is not supported. See [[System Understanding/Backend/Files/auth.php|auth.php]], [[System Understanding/Database/Tables/SESSIONS|SESSIONS]] and [[System Understanding/Current Implementation Gaps]].

## Source files

- [api/auth.php](<../../../api/auth.php>)
- [js/sync.js](<../../../js/sync.js>)
- [Implementation/Offline-Sync-Verification-2026-09-28.md](<../../../Implementation/Offline-Sync-Verification-2026-09-28.md>)

Return to [[System Understanding/Start Here|Start Here]].
