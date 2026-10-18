<?php
/** CLI only. Dry run is the default; see Implementation/Backend-Migration.md. */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

const MIGRATION_KEY = '20261015_revised_backend';
$options = getopt('', ['apply', 'backup-verified', 'maintenance', 'resolutions:']);
$apply = isset($options['apply']);
if ($apply && (!isset($options['backup-verified']) || !isset($options['maintenance']))) {
    fwrite(STDERR, "Apply requires --backup-verified and --maintenance. See the deployment procedure.\n");
    exit(1);
}
try {
    $resolutions = isset($options['resolutions'])
        ? json_decode(file_get_contents($options['resolutions']), true, 512, JSON_THROW_ON_ERROR) : [];
    if (!is_array($resolutions)) throw new RuntimeException('Resolution document must be a JSON object.');
    $p = new PDO('mysql:host=' . (getenv('AKAD_DB_HOST') ?: 'localhost') . ';dbname=' .
        (getenv('AKAD_DB_NAME') ?: 'akad_rentals') . ';charset=utf8mb4', getenv('AKAD_DB_USER') ?: 'root',
        getenv('AKAD_DB_PASS') ?: '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    $p->exec("SET time_zone = '+08:00'");
    $tables = [];
    foreach ($p->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $table) $tables[strtolower($table)] = $table;
    if (isset($tables['schema_migrations'])) {
        $s = $p->prepare('SELECT summary FROM schema_migrations WHERE migration_key=?');
        $s->execute([MIGRATION_KEY]);
        if ($summary = $s->fetchColumn()) {
            echo json_encode(['already_applied' => true, 'summary' => json_decode($summary, true)], JSON_PRETTY_PRINT) . "\n";
            exit(0);
        }
    }
    $read = static function ($name) use ($p, $tables) {
        return isset($tables[$name]) ? $p->query('SELECT * FROM `' . $tables[$name] . '`')->fetchAll() : [];
    };
    $users = $read('users'); $bookings = $read('bookings'); $payments = $read('payments');
    $deposits = $read('deposits'); $packages = $read('packages');
    $equipment = $read('equipment_checklist'); $items = $read('booking_items');
    $issues = []; $mapped = ['users' => [], 'bookings' => [], 'payments' => [], 'deposits' => []];
    $issue = static function ($table, $id, $message) use (&$issues) {
        $issues[] = ['table' => $table, 'id' => $id, 'issue' => $message];
    };
    $money = static function ($value) {
        if (!preg_match('/^(-?)(\d+)(?:\.(\d{1,2}))?$/', (string)$value, $m)) throw new RuntimeException('Invalid monetary value.');
        return ($m[1] === '-' ? -1 : 1) * ((int)$m[2] * 100 + (int)str_pad($m[3] ?? '', 2, '0'));
    };
    $date = static function ($value) {
        if (!is_string($value)) return false;
        $d = DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $value, new DateTimeZone('Asia/Manila'));
        return $d && $d->format('Y-m-d H:i:s') === $value;
    };
    $hasEvidence = static fn($r) => isset($r['evidence']) && is_string($r['evidence']) && trim($r['evidence']) !== '';
    $ownerCount = 0; $primaryCount = 0; $names = [];
    foreach ($users as $u) {
        $id = $u['user_id']; $r = $resolutions['users'][$id] ?? [];
        $role = $r['role'] ?? $u['role'];
        $active = $r['account_status'] ?? $u['account_status'] ?? ($u['role'] === 'owner' ? 'Active' : 'Inactive');
        $username = $r['username'] ?? ($u['username'] ?? null);
        $primaryValue = $r['is_primary_owner'] ?? ($u['is_primary_owner'] ?? 0);
        if (!in_array($role, ['owner', 'staff'], true) || !in_array($active, ['Active', 'Inactive'], true) || !in_array($primaryValue, [0, 1, '0', '1'], true)) $issue('users', $id, 'Invalid role, account state, or primary-owner flag.');
        $primary = (int)$primaryValue;
        if ($role !== $u['role'] && !$hasEvidence($r)) $issue('users', $id, 'Role conversion requires evidence that the person is an owner.');
        foreach (['username', 'account_status', 'is_primary_owner'] as $field) {
            if (array_key_exists($field, $r) && (string)$r[$field] !== (string)($u[$field] ?? '') && !$hasEvidence($r)) $issue('users', $id, 'Account identity, access, and primary-owner changes require owner-supplied evidence.');
        }
        if ($active === 'Active') {
            $ownerCount++; $primaryCount += $primary;
            if ($role !== 'owner') $issue('users', $id, 'Only an explicitly resolved active owner may retain login access.');
            if (!is_string($username) || !preg_match('/^[A-Za-z0-9._-]{3,100}$/', $username)) $issue('users', $id, 'Supply a valid individual username.');
        }
        if ($primary && $active !== 'Active') $issue('users', $id, 'Primary owner must be active.');
        if ($username !== null) {
            $key = strtolower($username);
            if (isset($names[$key])) $issue('users', $id, 'Duplicate username.');
            $names[$key] = true;
        }
        $mapped['users'][$id] = ['role' => $role, 'username' => $username, 'account_status' => $active, 'is_primary_owner' => $primary];
    }
    if ($users && ($ownerCount !== 2 || $primaryCount !== 1)) $issue('users', null, 'Exactly two active existing owner identities and one primary owner are required. Resolve identities before cutover.');
    $packageMap = array_column($packages, null, 'package_id');
    $now = new DateTimeImmutable('now', new DateTimeZone('Asia/Manila'));
    foreach ($bookings as $b) {
        $id = $b['booking_id']; $r = $resolutions['bookings'][$id] ?? [];
        $status = $r['status'] ?? ucwords(strtolower(trim($b['status'])));
        if (!in_array($status, ['Pending', 'Confirmed', 'Awaiting Completion', 'Completed', 'Cancelled'], true)) $issue('bookings', $id, 'Resolve legacy status with evidence.');
        if (isset($r['status']) && !$hasEvidence($r)) $issue('bookings', $id, 'Status resolution requires evidence.');
        $services = json_decode($b['service_ids'] ?: '[]', true);
        if (!is_array($services)) { $issue('bookings', $id, 'Invalid service_ids JSON.'); $services = []; }
        $normalized = [];
        foreach ($services as $service) {
            if (!preg_match('/^(?:SVC-)?0*([1-9]\d*)$/i', (string)$service, $m)) { $issue('bookings', $id, 'Invalid legacy service identifier.'); continue; }
            $normalized[] = (int)$m[1];
        }
        if ($normalized && array_values(array_unique($normalized)) !== [(int)$b['service_id']]) $issue('bookings', $id, 'Multiple/inconsistent services require a reviewed source-to-target allocation before migration; automatic splitting is forbidden.');
        $start = $r['event_start_datetime'] ?? ($b['event_date'] . ' ' . $b['start_time']);
        $end = $r['event_end_datetime'] ?? ($b['event_date'] . ' ' . $b['end_time']);
        if (!$date($start) || !$date($end) || $start >= $end) $issue('bookings', $id, 'Resolve invalid/overnight dates explicitly in Asia/Manila time.');
        if ((isset($r['event_start_datetime']) || isset($r['event_end_datetime'])) && !$hasEvidence($r)) $issue('bookings', $id, 'Date resolution requires evidence.');
        if ($money($b['total']) < 0) $issue('bookings', $id, 'Negative agreed total.');
        $cancelReason = $r['cancellation_reason'] ?? ($b['cancellation_reason'] ?? null);
        if ($status === 'Cancelled' && !$cancelReason) $cancelReason = 'Legacy cancellation; historical reason unavailable';
        $pkg = $packageMap[$b['package_id']] ?? null;
        if ($pkg && (int)$pkg['service_id'] !== (int)$b['service_id']) $issue('bookings', $id, 'Package belongs to a different service.');
        // Historical package prices cannot be recovered from a mutable current catalogue.
        $mapped['bookings'][$id] = ['status' => $status, 'booking_reference' => 'BK-LEGACY-' . $id,
            'event_start_datetime' => $start, 'event_end_datetime' => $end,
            'blocked_start_datetime' => $start, 'blocked_end_datetime' => $end,
            'preparation_minutes' => 0, 'travel_minutes' => 0, 'theme_notes' => $b['special_requests'],
            'package_name_snapshot' => $r['package_name_snapshot'] ?? null,
            'package_price_snapshot' => $r['package_price_snapshot'] ?? null,
            'agreed_total' => $b['total'], 'cancellation_reason' => $cancelReason];
        if ($pkg && (!isset($r['package_name_snapshot']) || !is_string($r['package_name_snapshot']) || trim($r['package_name_snapshot']) === '' || !isset($r['package_price_snapshot']) || !$hasEvidence($r))) $issue('bookings', $id, 'Supply evidence-backed historical package name/price snapshots; current package data must not masquerade as historical data.');
        if (isset($r['package_price_snapshot']) && $money($r['package_price_snapshot']) < 0) $issue('bookings', $id, 'Historical package price cannot be negative.');
    }
    $paid = [];
    foreach ($payments as $row) {
        $id = $row['payment_id']; $r = $resolutions['payments'][$id] ?? [];
        $status = $r['payment_status'] ?? (strtolower($row['payment_status']) === 'paid' ? 'Completed' : null);
        $type = $r['payment_type'] ?? null;
        if (!in_array($status, ['Pending', 'Completed', 'Failed'], true)) $issue('payments', $id, 'Resolve payment state from actual collection evidence.');
        if (!in_array($type, ['Down payment', 'Balance'], true) || !$hasEvidence($r)) $issue('payments', $id, 'Payment type and supporting evidence are required.');
        if ($money($row['amount']) <= 0) $issue('payments', $id, 'Payment amount must be positive.');
        if (!in_array(strtolower($row['payment_method']), ['gcash', 'maribank'], true)) $issue('payments', $id, 'Unsupported payment method.');
        $actor = array_key_exists('recorded_by', $r) ? $r['recorded_by'] : ($row['recorded_by'] ?? null);
        $recordedAt = array_key_exists('recorded_at', $r) ? $r['recorded_at'] : ($row['recorded_at'] ?? null);
        if ($actor !== null && !isset($mapped['users'][$actor])) $issue('payments', $id, 'Recording actor must reference a preserved historical identity.');
        if ($recordedAt !== null && !$date($recordedAt)) $issue('payments', $id, 'Invalid evidenced recording time.');
        $mapped['payments'][$id] = ['payment_status' => $status, 'payment_type' => $type,
            'recorded_by' => $actor, 'recorded_at' => $recordedAt, 'provenance' => $actor === null ? 'legacy-unknown' : 'legacy-evidenced'];
        if ($status === 'Completed') $paid[$row['booking_id']] = ($paid[$row['booking_id']] ?? 0) + $money($row['amount']);
    }
    foreach ($bookings as $b) if (($paid[$b['booking_id']] ?? 0) !== $money($b['amount_paid'])) $issue('bookings', $b['booking_id'], 'Completed payment sum disagrees with legacy amount_paid; reconcile source evidence without balancing payments.');
    foreach ($deposits as $row) {
        $id = $row['deposit_id']; $r = $resolutions['deposits'][$id] ?? [];
        $held = $money($row['amount_held']); $deduction = $money($row['deduction_amount']);
        if ($held < 0 || $deduction < 0 || $deduction > $held) $issue('deposits', $id, 'Invalid held/deduction amounts.');
        $status = $r['refund_status'] ?? null; $refundDate = $r['refund_date'] ?? null;
        if (!in_array($status, ['Held', 'Refunded'], true) || !$hasEvidence($r)) $issue('deposits', $id, 'Resolve actual refund state using evidence; legacy state is only a derived label.');
        if ($status === 'Refunded' && !$date($refundDate)) $issue('deposits', $id, 'Refunded deposits require the evidenced refund date.');
        if ($status === 'Held' && $refundDate !== null) $issue('deposits', $id, 'Held deposits cannot carry a refund date.');
        $actor = array_key_exists('recorded_by', $r) ? $r['recorded_by'] : ($row['recorded_by'] ?? null);
        if ($actor !== null && !isset($mapped['users'][$actor])) $issue('deposits', $id, 'Recording actor must reference a preserved historical identity.');
        $mapped['deposits'][$id] = ['refund_status' => $status, 'refund_date' => $refundDate, 'recorded_by' => $actor,
            'provenance' => $actor === null ? 'legacy-unknown' : 'legacy-evidenced'];
    }
    foreach ($items as $row) {
        $match = array_values(array_filter($equipment, static fn($e) => $e['booking_id'] == $row['booking_id'] && $e['rental_item_id'] == $row['rental_item_id']));
        if (count($match) !== 1 || (int)$match[0]['expected_qty'] !== (int)$row['expected_qty'] || (int)$match[0]['returned_qty'] !== (int)$row['returned_qty']) $issue('booking_items', $row['booking_item_id'], 'Reconcile booking-item/checklist quantities before migration. Original release history remains archived.');
        if (!isset($row['released_qty']) || (int)$row['expected_qty'] < 0 || (int)$row['returned_qty'] < 0 || (int)$row['released_qty'] < (int)$row['returned_qty'] || (int)$row['released_qty'] > (int)$row['expected_qty']) $issue('booking_items', $row['booking_item_id'], 'Evidenced quantities must satisfy 0 <= returned <= released <= expected before migration.');
    }
    foreach ($equipment as $row) {
        $match = array_values(array_filter($items, static fn($item) => $item['booking_id'] == $row['booking_id'] && $item['rental_item_id'] == $row['rental_item_id']));
        if (count($match) !== 1) $issue('equipment_checklist', $row['checklist_id'], 'Supply a uniquely matched booking-item release quantity from source evidence before migration; unknown release quantities cannot be guessed.');
        if ((int)$row['expected_qty'] < 0 || (int)$row['returned_qty'] < 0 || (int)$row['returned_qty'] > (int)$row['expected_qty']) $issue('equipment_checklist', $row['checklist_id'], 'Evidenced checklist quantities must satisfy 0 <= returned <= expected before migration.');
    }
    $report = ['migration' => MIGRATION_KEY, 'mode' => $apply ? 'apply' : 'dry-run',
        'counts' => ['users' => count($users), 'bookings' => count($bookings), 'payments' => count($payments), 'deposits' => count($deposits)],
        'exceptions' => $issues];
    if ($issues || !$apply) { echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"; exit($issues ? 2 : 0); }

    // Capture original rows before additive DDL supplies defaults absent from the source.
    $source = [];
    foreach ($tables as $lower => $actual) {
        if (in_array($lower, ['migration_archive', 'schema_migrations', 'sessions'], true)) continue;
        $keys = $p->query('SHOW KEYS FROM `' . $actual . "` WHERE Key_name='PRIMARY'")->fetchAll();
        if (!$keys) throw new RuntimeException('Cannot archive a source table without a primary key: ' . $actual);
        foreach ($p->query('SELECT * FROM `' . $actual . '`')->fetchAll() as $row) {
            $id = implode(':', array_map(static fn($k) => $row[$k['Column_name']], $keys));
            $source[] = [$lower, $id, $row];
        }
    }
    // DDL implicitly commits in MySQL. These additive operations are resumable; data conversion follows in one transaction.
    $schema = file_get_contents(__DIR__ . '/../schema.sql');
    preg_match_all('/CREATE TABLE IF NOT EXISTS (\w+)\s*\((.*?)\) ENGINE=InnoDB[^;]*;/s', $schema, $creates, PREG_SET_ORDER);
    foreach ($creates as $create) {
        $table = $create[1];
        if (!isset($tables[strtolower($table)])) { $p->exec($create[0]); continue; }
        $columns = array_column($p->query('SHOW COLUMNS FROM `' . $table . '`')->fetchAll(), 'Field');
        // Split definitions only at commas outside parentheses/quoted SQL strings.
        $definitions = []; $part = ''; $depth = 0; $quoted = false;
        foreach (str_split($create[2]) as $char) {
            if ($char === "'") $quoted = !$quoted;
            if (!$quoted && $char === '(') $depth++;
            if (!$quoted && $char === ')') $depth--;
            if (!$quoted && $depth === 0 && $char === ',') { $definitions[] = trim($part); $part = ''; } else $part .= $char;
        }
        $definitions[] = trim($part);
        $indexes = array_column($p->query('SHOW INDEX FROM `' . $table . '`')->fetchAll(), 'Key_name');
        $foreignKeys = [];
        foreach ($definitions as $definition) {
            if (preg_match('/^`?(\w+)`?\s+(INT|BIGINT|VARCHAR|TEXT|DATETIME|DATE|TIME|TINYINT|DECIMAL|ENUM|JSON)\b/i', $definition, $m)) {
                if (!in_array($m[1], $columns, true)) $p->exec('ALTER TABLE `' . $table . '` ADD COLUMN ' . $definition);
            } elseif (preg_match('/^(?:UNIQUE )?KEY (\w+) /', $definition, $m) && !in_array($m[1], $indexes, true)) {
                $p->exec('ALTER TABLE `' . $table . '` ADD ' . $definition);
            } elseif (preg_match('/^FOREIGN KEY\s*\(`?(\w+)`?\)\s*REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)(.*)$/i', $definition, $m)) {
                $foreignKeys[] = [$m[1], $m[2], $m[3], trim($m[4])];
            }
        }
        foreach ($foreignKeys as [$column, $referencedTable, $referencedColumn, $actions]) {
            $q = $p->prepare('SELECT 1 FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=? AND REFERENCED_TABLE_NAME=? AND REFERENCED_COLUMN_NAME=? LIMIT 1');
            $q->execute([$table, $column, $referencedTable, $referencedColumn]);
            if (!$q->fetchColumn()) {
                $constraint = 'fk_' . strtolower($table) . '_' . strtolower($column);
                $p->exec('ALTER TABLE `' . $table . '` ADD CONSTRAINT `' . $constraint . '` FOREIGN KEY (`' . $column . '`) REFERENCES `' . $referencedTable . '` (`' . $referencedColumn . '`) ' . $actions);
            }
        }
    }
    $p->exec('ALTER TABLE BOOKINGS MODIFY package_id INT NULL');
    $p->exec("ALTER TABLE PAYMENTS MODIFY payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending'");
    $p->exec("ALTER TABLE DEPOSITS MODIFY refund_status VARCHAR(20) NOT NULL DEFAULT 'Held'");
    $p->exec("ALTER TABLE DELIVERY MODIFY fee_shouldered_by VARCHAR(30) NOT NULL DEFAULT 'Customer'");
    $p->beginTransaction();
    $archive = $p->prepare('INSERT INTO migration_archive(migration_key,source_table,source_id,target_table,target_id,source_record,resolution) VALUES(?,?,?,?,?,?,?)');
    foreach ($source as [$lower, $id, $row]) {
        $targetTable = $lower === 'equipment_checklist' ? 'booking_checklist_items' : $lower;
        $targetId = $lower === 'equipment_checklist' ? null : $id;
        $archive->execute([MIGRATION_KEY, $lower, $id, $targetTable, $targetId, json_encode($row, JSON_THROW_ON_ERROR),
            json_encode($resolutions[$lower][$id] ?? null, JSON_THROW_ON_ERROR)]);
    }
    $ids = ['users' => 'user_id', 'bookings' => 'booking_id', 'payments' => 'payment_id', 'deposits' => 'deposit_id'];
    foreach ($mapped as $table => $rows) foreach ($rows as $id => $values) {
        $sets = implode(',', array_map(static fn($key) => '`' . $key . '`=?', array_keys($values)));
        $p->prepare('UPDATE `' . $table . '` SET ' . $sets . ' WHERE ' . $ids[$table] . '=?')->execute([...array_values($values), $id]);
    }
    foreach ($deposits as $row) if ($money($row['deduction_amount']) > 0) {
        $p->prepare('INSERT INTO deposit_deductions(deposit_id,affected_item,reason,amount,provenance,legacy_deposit_id) VALUES(?,?,?,?,?,?)')->execute([
            $row['deposit_id'], 'Legacy aggregate deduction; item detail unavailable', $row['deduction_reason'] ?: 'Historical reason unavailable',
            $row['deduction_amount'], 'legacy-unknown', $row['deposit_id']]);
    }
    foreach ($equipment as $row) {
        $released = null;
        foreach ($items as $item) if ($item['booking_id'] == $row['booking_id'] && $item['rental_item_id'] == $row['rental_item_id']) $released = $item['released_qty'];
        $p->prepare('INSERT INTO booking_checklist_items(booking_id,rental_item_id,item_name_snapshot,expected_quantity,quantity_released,quantity_returned,condition_out,condition_in,return_status,checked_by,legacy_checklist_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)')->execute([
            $row['booking_id'], $row['rental_item_id'], $row['item_name'], $row['expected_qty'], $released, $row['returned_qty'],
            $row['condition_out'], $row['condition_in'], $row['return_status'], $row['checked_by'], $row['checklist_id']]);
    }
    $p->prepare('UPDATE migration_archive a JOIN booking_checklist_items b ON b.legacy_checklist_id=CAST(a.source_id AS UNSIGNED) SET a.target_id=b.checklist_item_id WHERE a.migration_key=? AND a.source_table=\'equipment_checklist\'')
        ->execute([MIGRATION_KEY]);
    $q = $p->prepare('SELECT COUNT(*) FROM migration_archive WHERE migration_key=? AND source_table=\'equipment_checklist\' AND target_id IS NULL');
    $q->execute([MIGRATION_KEY]);
    if ((int)$q->fetchColumn() !== 0) throw new RuntimeException('Some legacy checklist rows have no source-to-target mapping.');
    $p->exec("UPDATE delivery SET fee_shouldered_by=CASE LOWER(fee_shouldered_by) WHEN 'renter' THEN 'Customer' WHEN 'owner' THEN 'Owner' ELSE fee_shouldered_by END");
    $audit = $p->prepare("INSERT INTO audit_logs(action,record_type,record_id,description,new_status,origin) VALUES('booking_status_changed','booking',?,?,?,'migration')");
    foreach ($mapped['bookings'] as $id => $row) {
        $audit->execute([$id, 'Imported current status baseline; prior status history and historical transition time unavailable.', $row['status']]);
        if ($row['status'] === 'Confirmed' && $row['blocked_end_datetime'] <= $now->format('Y-m-d H:i:s')) {
            $p->prepare("UPDATE bookings SET status='Awaiting Completion',awaiting_completion_at=? WHERE booking_id=?")->execute([$now->format('Y-m-d H:i:s'), $id]);
            $p->prepare("INSERT INTO audit_logs(action,record_type,record_id,description,old_status,new_status,origin) VALUES('booking_status_changed','booking',?,'Due unreleased legacy booking reconciled at migration','Confirmed','Awaiting Completion','system')")->execute([$id]);
            $row['status'] = 'Awaiting Completion';
        }
        if ($row['status'] === 'Awaiting Completion') $p->prepare("INSERT INTO notifications(user_id,booking_id,notification_type,message) SELECT user_id,?,'awaiting_completion','Post-event review and manual release required.' FROM users WHERE role='owner' AND account_status='Active'")->execute([$id]);
    }
    $p->exec('DELETE FROM sessions');
    $p->prepare('INSERT INTO schema_migrations(migration_key,summary) VALUES(?,?)')->execute([MIGRATION_KEY, json_encode($report, JSON_THROW_ON_ERROR)]);
    $p->commit();
    echo json_encode($report + ['applied' => true], JSON_PRETTY_PRINT) . "\n";
} catch (Throwable $e) {
    if (isset($p) && $p->inTransaction()) $p->rollBack();
    fwrite(STDERR, 'Migration stopped: ' . $e->getMessage() . "\n");
    exit(1);
}
