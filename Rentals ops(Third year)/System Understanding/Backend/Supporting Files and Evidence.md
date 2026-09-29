---
title: "Supporting Files and Evidence"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Supporting Files and Evidence

These files are relevant to backend/database understanding even though they are outside api/. They are not a complete frontend guide.

| File or group | Role |
|---|---|
| db/schema.sql | 18 table declarations and indexes |
| db/seed.sql | SESSIONS declaration and demo records |
| Documentation/AKAD_Requirements_Analysis_Documentation.md | Controlling requirements, acceptance criteria and updated decisions |
| Documentation/AKAD_System_Design.md | Official layer/entity/relationship design |
| Documentation/AKAD_REVISED_Rentals_Proposal___RJDM_Collective.md | Project/business scope |
| Documentation/AKAD_ERD.png, AKAD_Architecture.png, AKAD_UseCase.png | Official visual aids; code extensions are described in this guide |
| Implementation/Offline-Sync-Verification-2026-09-28.md | Existing implementation and bounded runtime evidence |
| tests/offline-sync.test.cjs | Live integration harness: authenticated sync, replay, conflicts, dependencies and inspections |
| tests/start_verification.py | Creates a separate fixture database and two PHP test processes; changes test data |
| tests/control_verification_server.py | Controls the recorded test processes |
| tests/performance.py | Synthetic API load measurements |
| tests/check_syntax.py | PHP/JavaScript/inline-script syntax verification |
| tests/check_browser_results.py, browser-verification.html | Browser fixture/result verification |
| tests/*results.json | Previously recorded integration, outage, layout and performance results |
| tests/verification-state.json, php-8017.log, php-8018.log | Recorded local test process metadata/logs; not deployment configuration |
| js/api.js | Local API facade definitions; its opening comment is historical and does not describe all runtime adapters |
| js/sync.js | Server request adapter, operation envelopes, local/server ID mapping and retries |
| js/storage.js | Device draft/snapshot persistence; not the central MySQL schema |
| js/config.js | Browser-side constants, distinct from api/config.php server connection settings |
| js/offline.js, sw.js | Cached-page readiness and service worker; API calls require the network |
| js/sync-ui.js | Displays pending/failed/conflicting operations; full interface documentation deferred |
| scripts/vendor_offline_assets.py | Prepares vendor assets for the cached shell |

## What has been verified previously

The 2026-09-28 implementation report records 14 live integration checks, an actual browser backend-outage workflow and a synthetic 10,000-booking load. It limits conclusions to its local fixture/environment. Human usability, physical phone and production-load acceptance remain separate. Full booking payloads and unbounded replay state are documented scaling limits.

## Verification for this guide

This documentation task checks file/table/column coverage, source links, Obsidian links and repository whitespace. It does not provision databases, rerun fixtures or change application behavior. Use the linked report for existing test procedures and isolation notes before running its scripts.

Validation on 2026-09-29 passed: 65 notes, all 26 PHP files, all 19 tables and 127 declared columns, and all 20 foreign-key relationships. All 507 wikilinks and 114 source links resolved. Markdown table column counts, code-fence closure and note properties were checked. Visual rendering inside Obsidian was not inspected.

## Source files

- [db/schema.sql](<../../../db/schema.sql>)
- [db/seed.sql](<../../../db/seed.sql>)
- [Implementation/Offline-Sync-Verification-2026-09-28.md](<../../../Implementation/Offline-Sync-Verification-2026-09-28.md>)
- [tests/offline-sync.test.cjs](<../../../tests/offline-sync.test.cjs>)
- [tests/start_verification.py](<../../../tests/start_verification.py>)
- [tests/check_syntax.py](<../../../tests/check_syntax.py>)
- [tests/performance.py](<../../../tests/performance.py>)
- [js/sync.js](<../../../js/sync.js>)
- [js/api.js](<../../../js/api.js>)
- [js/storage.js](<../../../js/storage.js>)
- [sw.js](<../../../sw.js>)

Return to [[System Understanding/Start Here|Start Here]].
