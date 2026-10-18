import csv, hashlib
from collections import Counter
from pathlib import Path

source = Path('C:/Users/acer/Desktop/akad-rentals-migration-resolution-worksheet.csv')
original = source.read_bytes()
rows = list(csv.DictReader(original.decode('utf-8-sig').splitlines()))
assert len(rows) == 51
assert Counter(r['source_table'] for r in rows) == {'users': 2, 'bookings': 15, 'payments': 4, 'booking_items': 30}
assert all(r['review_status'] == 'Pending' for r in rows)
assert all(not r[field] for r in rows for field in ['business_decision_or_corrected_value', 'evidence_reference', 'reviewer_notes'])

def evidence(row):
    if row['source_table'] == 'users':
        if row['source_id']:
            return 'Owner-confirmed identity linked to user 1 and approved individual username (U1)'
        return 'Identity/account roster naming the two existing active owners and exactly one primary owner (U2)'
    if row['source_table'] == 'payments':
        return 'Original payment receipt/transaction and linked booking agreement establishing payment type (P)'
    if row['source_table'] == 'booking_items':
        return 'Matched booking-item, original checklist, dispatch/release and return records with approved quantities (Q)'
    if 'status' in row['issue']:
        return 'Dated booking confirmation/cancellation or completed return/review evidence supporting status (B1)'
    return 'Original accepted quotation/contract or dated package offer establishing historical package name and price (B2)'

lines = ['# Evidence checklist for the 51 migration findings', '',
    'Prepared 2026-10-15 from the existing worksheet only. No database was accessed. Every resolution and evidence-reference cell below is deliberately blank. All findings remain Pending.', '',
    f'Source: `{source}`. SHA-256: `{hashlib.sha256(original).hexdigest()}`. Worksheet row numbers include the header. Finding labels E01–E51 are checklist labels, not database IDs.', '',
    '## What to provide', '',
    '- U1: A signed/recorded owner confirmation linking source user 1 to the real individual and proposed unique username. Do not send passwords.',
    '- U2: A roster linking the two real owners to their existing source user IDs, account status, and the chosen primary owner. The worksheet has a blank source ID for this global finding; no second ID is assumed.',
    '- P: For each payment ID, provide the receipt/transaction reference, date, amount, linked booking and agreement showing whether it was a Down payment or Balance. Amount or current balance alone does not establish historical payment type. Other discrepancies, if discovered, remain separate open findings.',
    '- B1: For booking 2, provide records supporting its actual lifecycle state. Equipment dispatch alone does not establish completed post-event review.',
    '- B2: For each booking 1–14, provide the package name and package price agreed at the time, with a dated accepted quote/contract/message or historical offer tied to that booking. Current catalog values must not replace missing historical snapshots. Distinguish package price from negotiated booking total.',
    '- Q: For each booking-item ID 4–33, provide the original row and matching checklist, booking/service/item identifiers, expected quantity, actual released quantity, actual returned quantity, conditions and any discrepancy explanation. The worksheet contains neither booking associations nor competing quantities; these must come from owner-supplied records. A genuine zero needs evidence; blank is not zero.', '',
    '## Review order and resolution rules', '',
    'Start with E01–E02 and E18–E21 (accounts and payments). Review E03–E17 next (bookings); then E22–E51 (quantities) after booking associations are known. Source collection may happen concurrently.', '',
    'Each evidence reference must identify an actual supplied record and its page, transaction, message date or row. Record the owner reviewer and review date in the existing worksheet notes. Redact unrelated personal/bank details while retaining the fields needed for reconciliation.', '',
    'JSON supports user fields, booking status/snapshots and payment type with evidence. Quantity/allocation findings need separately reviewed conversion work; an unsupported JSON key or changing Pending to Resolved does not fix data. Do not create balancing payments, choose a convenient quantity, or invent event times/actors. Missing or contradictory evidence stays Pending.', '',
    '## Row-by-row checklist', '',
    '| Finding / CSV row | Source record | Original finding | Required source evidence | Approved value | Evidence reference | Status |',
    '| --- | --- | --- | --- | --- | --- | --- |']
for index, row in enumerate(rows, 1):
    record = row['source_table'] + ':' + (row['source_id'] or '(global; source ID blank)')
    lines.append(f"| E{index:02d} / {index+1} | {record} | {row['issue']} | {evidence(row)} | | | Pending |")
lines += ['', '## Completion gate', '',
    'Coverage: 51/51 worksheet rows represented exactly once. Resolved: 0. Pending: 51. The source worksheet is unchanged. No source evidence or resolution values were manufactured.', '',
    'After evidence review, validate supported conversions in the authorized isolated workflow. Operational access/preflight and migration application require separate explicit authorization. This checklist is not a migration input file or approval to execute one.', '']
target = Path('C:/Users/acer/Desktop/akad-rentals-evidence-checklist-2026-10-15.md')
with target.open('x', encoding='utf-8') as output:
    output.write('\n'.join(lines))
assert source.read_bytes() == original
assert sum(line.startswith('| E') for line in lines) == 51
print(f'Created {target}; 51 rows, 0 resolved; worksheet unchanged; SHA256 {hashlib.sha256(original).hexdigest()}')
