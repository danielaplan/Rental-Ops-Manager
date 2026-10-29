<?php
/** CLI only. Dry run is the default; see Implementation/Backend-Migration.md. */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

const MIGRATION_KEY = '20261029_add_checklist_notes';
$options = getopt('', ['apply', 'backup-verified', 'maintenance']);
$apply = isset($options['apply']);
if ($apply && (!isset($options['backup-verified']) || !isset($options['maintenance']))) {
    fwrite(STDERR, "Apply requires --backup-verified and --maintenance. See the deployment procedure.\n");
    exit(1);
}
try {
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

    // Check if notes column already exists
    $columns = array_column($p->query('SHOW COLUMNS FROM `booking_checklist_items`')->fetchAll(), 'Field');
    $hasNotes = in_array('notes', $columns, true);

    $report = [
        'migration' => MIGRATION_KEY,
        'mode' => $apply ? 'apply' : 'dry-run',
        'table' => 'booking_checklist_items',
        'column' => 'notes',
        'already_exists' => $hasNotes,
    ];

    if (!$apply) {
        echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
        exit(0);
    }

    if (!$hasNotes) {
        $p->exec('ALTER TABLE `booking_checklist_items` ADD COLUMN `notes` TEXT NULL AFTER `checked_at`');
        $report['added'] = true;
    } else {
        $report['added'] = false;
    }

    $p->prepare('INSERT INTO schema_migrations(migration_key,summary) VALUES(?,?)')
        ->execute([MIGRATION_KEY, json_encode($report, JSON_THROW_ON_ERROR)]);

    echo json_encode($report + ['applied' => true], JSON_PRETTY_PRINT) . "\n";
} catch (Throwable $e) {
    fwrite(STDERR, 'Migration stopped: ' . $e->getMessage() . "\n");
    exit(1);
}