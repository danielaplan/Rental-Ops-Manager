"""Illustrative local load checks. These are not owner-approved production thresholds."""
from pathlib import Path
import subprocess,json,time,statistics,concurrent.futures,urllib.request
DB="akad_verify_20260928";ROOT=Path(__file__).resolve().parents[1]
def sql(text):
 r=subprocess.run(["C:/xampp/mysql/bin/mysql.exe","-u","root",DB],input=text,text=True,capture_output=True)
 if r.returncode:raise RuntimeError(r.stderr)
 return r.stdout
existing=int(sql("SELECT COUNT(*) FROM bookings WHERE customer_type LIKE 'Synthetic load %';").strip().splitlines()[-1])
values=[]
for i in range(existing,10000):
 values.append("(1,2,3,1,'2098-01-"+str(i%28+1).zfill(2)+"','10:00','12:00','Synthetic load "+str(i)+"','completed','[2]',3500,1750,'Partial')")
for start in range(0,len(values),500):
 sql("INSERT INTO bookings(customer_id,service_id,package_id,created_by,event_date,start_time,end_time,customer_type,status,service_ids,total,amount_paid,payment_status) VALUES"+",".join(values[start:start+500])+";")
login=urllib.request.Request('http://127.0.0.1:8017/api/auth.php',data=json.dumps({'contact_number':'TEST-OWNER','password':'OfflineTest!2026'}).encode(),headers={'Content-Type':'application/json'})
with urllib.request.urlopen(login) as response:token=json.load(response)['data']['session_token']
def read(path):
 start=time.perf_counter()
 with urllib.request.urlopen(urllib.request.Request("http://127.0.0.1:8017/api/"+path,headers={"Authorization":"Bearer "+token}),timeout=30) as r:data=r.read();status=r.status
 parsed=json.loads(data);assert status==200 and parsed["ok"]
 return {"ms":round((time.perf_counter()-start)*1000,2),"bytes":len(data)}
output={"date":time.strftime("%Y-%m-%dT%H:%M:%S"),"database":DB,"syntheticBookings":10000,"parallelReaders":3,"server":"Windows PHP built-in server, local MariaDB; not production hosting","measurements":{}}
for endpoint in ["bookings.php?do=all","reports.php?do=dashboard","reports.php?do=report&start=2098-01-01&end=2098-01-31"]:
 runs=[]
 for _ in range(5):
  with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:runs.extend(pool.map(lambda _:read(endpoint),range(3)))
 times=sorted(r["ms"] for r in runs);output["measurements"][endpoint]={"requests":len(runs),"medianMs":round(statistics.median(times),2),"p95Ms":times[int(.95*(len(times)-1))],"maxMs":max(times),"responseBytes":runs[0]["bytes"],"illustrativeUnder2Seconds":max(times)<2000}
(ROOT/"tests/performance-results.json").write_text(json.dumps(output,indent=2))
print(json.dumps(output,indent=2))
