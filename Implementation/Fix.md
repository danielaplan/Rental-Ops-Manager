# FR-10: Internal Blockouts — Implementation Plan for Codex

## Latest session decision ? 2026-09-28: FR-10 remains skipped

The user ended the session and explicitly instructed that FR-10 internal blockouts remain skipped. This supersedes the earlier request to implement them and the subsequent backend-only scope. Do not begin blockout implementation until the user explicitly reauthorizes it. The user's frontend boundary also remains in effect: do not change frontend code without new authorization.

No FR-10 database migration, schema addition, backend endpoint, synchronization handler, or frontend change was made during the blockout discussion. Inspection confirmed that pi/blockouts.php is absent and the schema/sync endpoint contain no blockouts implementation. The existing Implementation/Fix.md is a deferred draft with known corrections required; it is not an active execution instruction. Previously completed offline/payment/inspection work and its recorded evidence remain in place. No files were staged, committed, or pushed.

**Status: SKIPPED / DEFERRED ? draft below is retained for future review.**


## Summary
Implement FR-10: Staff can mark a service/date (or time range) as unavailable internally with a reason. Blocked periods are excluded from availability checks. Internal only — no public customer portal.

**Source:** `Documentation/AKAD_Requirements_Analysis_Documentation.md` Q17 — "Mark Service as Unavailable" (Could priority)

---

## Pre-Flight (per AKAD Project State Engine)

1. Read `Documentation/AKAD_Requirements_Analysis_Documentation.md` — FR-10 section
2. Read `Documentation/AKAD_System_Design.md` — Availability Management section
3. Read current `db/schema.sql` — confirm BLOCKOUTS table doesn't exist
4. Read `api/bookings.php` — checkSlot() logic (line 5)
5. Read `api/sync.php` — confirm queue handling pattern
6. Read `js/api.js` — confirm methods pattern
7. Read `js/sync.js` — confirm enqueue/flush + actions/methods objects

---

## Part 1: Database Schema

### Add BLOCKOUTS table to `db/schema.sql`

```sql
-- FR-10: Internal date/service blockouts
CREATE TABLE IF NOT EXISTS BLOCKOUTS (
    blockout_id    INT          NOT NULL AUTO_INCREMENT,
    service_id     INT          NULL,
    event_date     DATE         NOT NULL,
    start_time     TIME         NULL,
    end_time       TIME         NULL,
    reason         VARCHAR(255) NOT NULL,
    created_by     INT          NOT NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blockout_id),
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_blockouts_date ON BLOCKOUTS(event_date);
CREATE INDEX idx_blockouts_service ON BLOCKOUTS(service_id);
```

**Rules:**
- `service_id` NULL = blocks ALL services on that date
- `service_id` set = blocks only that service
- `start_time`/`end_time` NULL = blocks entire day
- `start_time`/`end_time` set = blocks specific time range
- `reason` is required (admin notes: maintenance, private event, etc.)
- NO `status` column — blockouts are active until deleted (cleaner than managing status)

### Add seed data to `db/seed.sql` (optional, for testing)

```sql
INSERT INTO BLOCKOUTS (service_id, event_date, start_time, end_time, reason, created_by) VALUES
(NULL, '2099-12-25', NULL, NULL, 'Christmas - Office Closed', 1),
(1, '2099-06-15', '14:00:00', '16:00:00', 'Maintenance', 1);
```

---

## Part 2: Backend — API Endpoint

### Create `api/blockouts.php`

Follow the exact same pattern as `api/settings.php` (uses `requireRole` directly):

```php
<?php
require_once __DIR__.'/config.php';
require_once __DIR__.'/auth.php';

$do = $_GET['do'] ?? 'all';

// GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($do === 'all') {
        // List blockouts, optionally filtered by date range
        $dateFrom = $_GET['date_from'] ?? null;
        $dateTo = $_GET['date_to'] ?? null;
        $serviceId = asInt($_GET['service_id'] ?? null);

        $sql = "SELECT blockout_id, service_id, event_date, start_time, end_time, reason, created_by, created_at 
                FROM BLOCKOUTS 
                WHERE 1=1";
        $args = [];

        if ($dateFrom) { $sql .= " AND event_date >= ?"; $args[] = $dateFrom; }
        if ($dateTo)   { $sql .= " AND event_date <= ?"; $args[] = $dateTo; }
        if ($serviceId) { $sql .= " AND service_id = ?"; $args[] = $serviceId; }

        $sql .= " ORDER BY event_date, start_time";
        $q = db()->prepare($sql);
        $q->execute($args);
        sendJson(['ok' => true, 'data' => $q->fetchAll()]);
    }
    if ($do === 'get') {
        $id = asInt($_GET['id'] ?? null, 1);
        $q = db()->prepare("SELECT * FROM BLOCKOUTS WHERE blockout_id = ?");
        $q->execute([$id]);
        $r = $q->fetch();
        if (!$r) sendJson(['ok' => false, 'error' => 'Record not found.', 'code' => 'not_found'], 404);
        sendJson(['ok' => true, 'data' => $r]);
    }
}

// POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireRole(['owner']); // owner only for writes

    $body = readJsonBody();

    if ($do === 'create') {
        // Validation
        $errors = [];
        if (empty($body['event_date']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $body['event_date'])) {
            $errors[] = 'Valid event_date (YYYY-MM-DD) is required.';
        }
        if (!empty($body['start_time']) && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $body['start_time'])) {
            $errors[] = 'start_time must be HH:MM format.';
        }
        if (!empty($body['end_time']) && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $body['end_time'])) {
            $errors[] = 'end_time must be HH:MM format.';
        }
        if (!empty($body['start_time']) && !empty($body['end_time']) && $body['start_time'] >= $body['end_time']) {
            $errors[] = 'start_time must be before end_time.';
        }
        if (empty($body['reason']) || strlen(trim($body['reason'])) === 0) {
            $errors[] = 'reason is required.';
        }
        // Validate service_id if provided
        if (!empty($body['service_id'])) {
            $svcId = asInt($body['service_id']);
            $svcCheck = db()->prepare("SELECT service_id FROM SERVICES WHERE service_id = ?");
            $svcCheck->execute([$svcId]);
            if (!$svcCheck->fetch()) {
                $errors[] = 'service_id does not exist.';
            }
        }
        if ($errors) sendJson(['ok' => false, 'error' => implode(' ', $errors), 'code' => 'validation'], 400);

        $vals = [
            'service_id' => !empty($body['service_id']) ? asInt($body['service_id']) : null,
            'event_date' => $body['event_date'],
            'start_time' => !empty($body['start_time']) ? $body['start_time'] : null,
            'end_time'   => !empty($body['end_time']) ? $body['end_time'] : null,
            'reason'     => trim($body['reason']),
            'created_by' => requireAuth()['user_id'],
        ];
        $cols = array_keys($vals);
        $sql = "INSERT INTO BLOCKOUTS (`" . implode('`,`', $cols) . "`) VALUES (" . implode(',', array_fill(0, count($cols), '?')) . ")";
        db()->prepare($sql)->execute(array_values($vals));
        $id = (int)db()->lastInsertId();
        $q = db()->prepare("SELECT * FROM BLOCKOUTS WHERE blockout_id = ?");
        $q->execute([$id]);
        sendJson(['ok' => true, 'data' => $q->fetch()], 201);
    }

    if ($do === 'update') {
        $id = asInt($_GET['id'] ?? null, 1);
        if (!$id) sendJson(['ok' => false, 'error' => 'ID is required.', 'code' => 'validation'], 400);

        $body = readJsonBody();
        $allowed = ['service_id', 'event_date', 'start_time', 'end_time', 'reason'];
        $vals = array_intersect_key($body, array_flip($allowed));
        if (!$vals) sendJson(['ok' => false, 'error' => 'No fields to update.', 'code' => 'validation'], 400);

        // Validate service_id if provided
        if (isset($vals['service_id']) && !empty($vals['service_id'])) {
            $svcId = asInt($vals['service_id']);
            $svcCheck = db()->prepare("SELECT service_id FROM SERVICES WHERE service_id = ?");
            $svcCheck->execute([$svcId]);
            if (!$svcCheck->fetch()) {
                sendJson(['ok' => false, 'error' => 'service_id does not exist.', 'code' => 'validation'], 400);
            }
        }

        $set = implode(',', array_map(fn($f) => "`$f` = ?", array_keys($vals)));
        $vals['blockout_id'] = $id;
        db()->prepare("UPDATE BLOCKOUTS SET $set WHERE blockout_id = ?")->execute(array_values($vals));
        $q = db()->prepare("SELECT * FROM BLOCKOUTS WHERE blockout_id = ?");
        $q->execute([$id]);
        $r = $q->fetch();
        if (!$r) sendJson(['ok' => false, 'error' => 'Record not found.', 'code' => 'not_found'], 404);
        sendJson(['ok' => true, 'data' => $r]);
    }

    if ($do === 'delete') {
        $id = asInt($_GET['id'] ?? null, 1);
        $q = db()->prepare("DELETE FROM BLOCKOUTS WHERE blockout_id = ?");
        $q->execute([$id]);
        if (!$q->rowCount()) sendJson(['ok' => false, 'error' => 'Record not found.', 'code' => 'not_found'], 404);
        sendJson(['ok' => true, 'data' => ['deleted' => true]]);
    }
}

sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
```

**Follow existing patterns:**
- `require_once __DIR__.'/config.php'` and `auth.php`
- `asInt()` for ID params, `requireAuth()` for auth, `sendJson()` for responses
- Owner-only writes (per `requireRole(['owner'])`)
- `db()` helper from config.php
- **No `authWrite()`** — use `requireRole(['owner'])` directly (from auth.php)

---

## Part 3: Update `api/bookings.php` — checkSlot()

### Add blockout check inside checkSlot() function

Current `checkSlot()` (bookings.php line 5):
```php
function checkSlot($date,$start,$end,$id,$status,$serviceId=null){
    if(!in_array(strtolower($status),['confirmed','reserved','preparing','released'],true)||$serviceId!==1)return;
    $s=db()->prepare("SELECT booking_id FROM bookings WHERE event_date=? AND service_id=1 AND LOWER(status) IN ('confirmed','reserved','preparing','released') AND booking_id<>? AND start_time<? AND end_time>? LIMIT 1");
    $s->execute([$date,$id,$end,$start]);
    if($s->fetch())sendJson(['ok'=>false,'error'=>'Time slot already booked.','code'=>'conflict'],409);
}
```

**Add blockout check AFTER the karaoke overlap check, inside the same function:**

```php
function checkSlot($date,$start,$end,$id,$status,$serviceId=null){
    if(!in_array(strtolower($status),['confirmed','reserved','preparing','released'],true)||$serviceId!==1)return;
    $s=db()->prepare("SELECT booking_id FROM bookings WHERE event_date=? AND service_id=1 AND LOWER(status) IN ('confirmed','reserved','preparing','released') AND booking_id<>? AND start_time<? AND end_time>? LIMIT 1");
    $s->execute([$date,$id,$end,$start]);
    if($s->fetch())sendJson(['ok'=>false,'error'=>'Time slot already booked.','code'=>'conflict'],409);

    // FR-10: Check blockouts for ALL services
    $boQ = db()->prepare("SELECT blockout_id, reason, start_time, end_time FROM BLOCKOUTS WHERE event_date = ? AND (service_id IS NULL OR service_id = ?)");
    $boQ->execute([$date, $serviceId]);
    $blockouts = $boQ->fetchAll();
    foreach ($blockouts as $bo) {
        if (empty($bo['start_time']) && empty($bo['end_time'])) {
            sendJson(['ok'=>false,'error'=>'Date is blocked: '.$bo['reason'].'.','code'=>'conflict'],409);
        } elseif (!empty($bo['start_time']) && !empty($bo['end_time'])) {
            if ($start < $bo['end_time'] && $end > $bo['start_time']) {
                sendJson(['ok'=>false,'error'=>'Time slot conflicts with blocked period: '.$bo['reason'].'.','code'=>'conflict'],409);
            }
        }
    }
}
```

**Important:** 
- Blockouts are checked INSIDE checkSlot() — same place as karaoke overlap check
- No sync variables ($client, etc.) — this is a clean validation function
- Blockouts apply to ALL services (service_id NULL) or specific service
- This check runs on booking create/update, enforcing FR-10 server-side

---

## Part 4: Frontend Wiring (`js/api.js`)

### Add blockout methods using `fetch()` directly (not `request()` — it's private in sync.js)

```javascript
/* ============ BLOCKOUTS ============ */
getBlockouts(dateFrom, dateTo) {
    const token = session()?.session_token;
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetch('../api/blockouts.php?do=all&' + params.toString(), {
        headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    }).then(r => r.json()).then(r => r.data || []);
},
getBlockout(id) {
    const token = session()?.session_token;
    return fetch('../api/blockouts.php?do=get&id=' + encodeURIComponent(id), {
        headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    }).then(r => r.json()).then(r => r.data);
},
createBlockout(data) {
    const token = session()?.session_token;
    return fetch('../api/blockouts.php?do=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify(data)
    }).then(r => r.json()).then(r => r.data);
},
updateBlockout(id, data) {
    const token = session()?.session_token;
    return fetch('../api/blockouts.php?do=update&id=' + encodeURIComponent(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify(data)
    }).then(r => r.json()).then(r => r.data);
},
deleteBlockout(id) {
    const token = session()?.session_token;
    return fetch('../api/blockouts.php?do=delete&id=' + encodeURIComponent(id), {
        method: 'POST',
        headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    }).then(r => r.json()).then(r => r.data);
}
```

**Follow existing patterns:**
- Use `session()?.session_token` for auth (same as sync.js)
- Use `fetch()` directly (same pattern as sync.js line 85)
- Return `r.data` (same shape as other API responses)

---

## Part 5: Sync Queue Support (`js/sync.js`)

### Add blockouts to the `actions` object

Add to `actions` object (around line 123-130):
```javascript
createBlockout:['blockouts','create'],
updateBlockout:['blockouts','update'],
deleteBlockout:['blockouts','delete'],
```

### Add blockouts to the `fields` mapping (around line 9)
```javascript
blockouts:'blockout_id',
```

### Add normalization for blockouts (in the `normalize` function, around line 39)
```javascript
if(entity==='blockouts'){
    out.blockout_id='BLK-'+String(serverId).padStart(3,'0');
}
```

### Add blockouts to the `methods` mapping (around line 158)
```javascript
getBlockouts:'blockouts',
```

### Add blockouts to `refreshSharedData` (around line 249)
```javascript
API.refreshSharedData=()=>owner()?Promise.all(['services','packages','addons','rentalItems','bookings','payments','blockouts'].map(entity=>read(entity))):Promise.resolve([]);
```

### Add blockouts to `$tables` in `api/sync.php` (around line 6)

Add to the `$tables` array:
```php
'blockouts'=>['blockouts','blockout_id',['service_id','event_date','start_time','end_time','reason','created_by']],
```

This enables sync.php to queue blockout operations (create/update/delete) for offline sync.

---

## Part 6: Calendar Integration

### Admin calendar needs controls for blockouts:
1. **Create blockout**: Select date range, choose service (or "all services"), enter reason, click "Block"
2. **Edit blockout**: Click existing blockout, modify reason/time, click "Save"
3. **Remove blockout**: Click existing blockout, click "Delete"
4. **Visual**: Show blocked periods as different color/style from bookings (e.g., hatched red overlay)
5. **Booking creation**: If user tries to book a blocked slot, checkSlot() returns 409 with error message

---

## Verification Checklist

### Static Checks
- [ ] `php -l api/blockouts.php` — syntax OK
- [ ] `node --check js/api.js` — syntax OK
- [ ] `node --check js/sync.js` — syntax OK
- [ ] SQL syntax check on BLOCKOUTS table
- [ ] Column/value counts match INSERT lists to CREATE TABLE schemas

### Runtime Checks (XAMPP)
- [ ] GET `api/blockouts.php?do=all` returns empty array
- [ ] POST `api/blockouts.php?do=create` creates record with reason
- [ ] GET `api/blockouts.php?do=get&id=1` returns record
- [ ] POST `api/blockouts.php?do=update&id=1` updates record
- [ ] POST `api/blockouts.php?do=delete&id=1` deletes record
- [ ] POST `api/bookings.php?do=create` with date matching blockout → 409 conflict
- [ ] POST `api/bookings.php?do=create` with date NOT matching blockout → 201 created
- [ ] POST `api/bookings.php?do=create` with service_id matching service-specific blockout → 409
- [ ] POST `api/bookings.php?do=create` with service_id NOT matching blockout → 201
- [ ] POST `api/bookings.php?do=create` with NULL service_id (all-services blockout) → 409
- [ ] Bearer token auth required for all endpoints
- [ ] Non-owner role rejected on write endpoints
- [ ] Validation: invalid date format → 400
- [ ] Validation: start_time >= end_time → 400
- [ ] Validation: missing reason → 400
- [ ] Validation: invalid service_id → 400

### Offline Sync Checks
- [ ] Create blockout offline → queued with `pending_sync=true`
- [ ] Go online → flushSyncQueue() sends to server
- [ ] Conflict detection works for blockouts

---

## Important Notes

1. **FR-10 is a "Could" priority** — per plan decision, only implement if explicitly confirmed needed
2. **Don't override official documentation** — `/Documentation/` folder is source of truth
3. **Follow existing patterns exactly** — naming, structure, error handling
4. **Server-side business rules** — blockouts enforced in PHP, not client-side
5. **No public customer portal** — blockouts are internal only
6. **NO `authWrite()`** — use `requireRole(['owner'])` (see auth.php for the function)
7. **NO `status` column** — blockouts are active until deleted (simpler)
8. **NO sync variables in bookings.php** — checkSlot() is separate from sync

---

## Files to Modify/Create

| Action | File |
|--------|------|
| MODIFY | `db/schema.sql` — add BLOCKOUTS table |
| MODIFY | `db/seed.sql` — optional test data |
| CREATE | `api/blockouts.php` — CRUD endpoint |
| MODIFY | `api/bookings.php` — add blockout check in checkSlot() |
| MODIFY | `js/api.js` — add getBlockouts, createBlockout, updateBlockout, deleteBlockout |
| MODIFY | `js/sync.js` — add blockouts to sync queue + normalization |
| MODIFY | `api/sync.php` — add blockouts to $tables array |

---

*Plan generated 2026-09-28. Follow the AKAD Project State Engine workflow: read official docs first, audit against changes file, verify approval file, implement.*
