"""Check the synthetic records entered through the browser outage workflow."""
import json, urllib.request
from pathlib import Path
base='http://127.0.0.1:8017/api/'
def get(path):
    with urllib.request.urlopen(base+path) as response:return json.load(response)['data']
rows=[r for r in get('bookings.php?do=all') if r.get('contact')=='TEST-BROWSER-OFFLINE']
assert len(rows)==1, 'Offline browser workflow must create exactly one booking'
row=rows[0];bid=row['booking_id']
assert float(row['amount_paid'])==250
deposit=get(f'deposits.php?do=get&booking_id={bid}')
assert float(deposit['amount_held'])==350 and float(deposit['refund_amount'])==300
items=get(f'bookingItems.php?do=forBooking&booking_id={bid}')
assert len(items)==1 and float(items[0]['returned_qty'])==0
assert items[0]['condition']=='Missing' and items[0]['notes']=='No speakers returned during synthetic check'
assert row['status']!='completed'
result={'bookingId':bid,'duplicateCount':len(rows),'downPayment':250,'depositHeld':350,'deduction':50,'refund':300,'returnedQuantity':0,'condition':'Missing','inspectionNotesPreserved':True,'notCompleted':True,'passed':True}
Path('tests/browser-outage-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
