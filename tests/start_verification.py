"""Start two PHP servers against an isolated synthetic MySQL database."""
from pathlib import Path
import subprocess, os, json, time
ROOT=Path(__file__).resolve().parents[1]
MYSQL=Path("C:/xampp/mysql/bin/mysql.exe")
PHP=Path("C:/xampp/php/php.exe")
DB="akad_verify_20260928"
def sql(text):
    r=subprocess.run([str(MYSQL),"-u","root","--default-character-set=utf8mb4"],input=text,text=True,capture_output=True)
    if r.returncode:raise RuntimeError(r.stderr)
sql("CREATE DATABASE IF NOT EXISTS "+DB+" CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
schema=(ROOT/"db/schema.sql").read_text(encoding="utf-8").replace("akad_rentals",DB)
seed=(ROOT/"db/seed.sql").read_text(encoding="utf-8").replace("akad_rentals",DB)
sql(schema);sql(seed)
password=subprocess.check_output([str(PHP),"-r","echo password_hash('OfflineTest!2026', PASSWORD_DEFAULT);"],text=True)
sql("USE "+DB+"; UPDATE users SET contact_number='TEST-OWNER',password_hash='"+password+"' WHERE user_id=1; INSERT IGNORE INTO rental_items(rental_item_id,service_id,name,quantity,required,tracking,status,\u0060condition\u0060) VALUES(1,1,'Test speaker',2,1,'quantity','Available','Good');")
env={**os.environ,"AKAD_DB_NAME":DB}
pids=[]
for port in [8017,8018]:
    log=open(ROOT/"tests"/("php-"+str(port)+".log"),"w")
    proc=subprocess.Popen([str(PHP),"-S","127.0.0.1:"+str(port),"-t",str(ROOT)],env=env,stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW)
    pids.append(proc.pid)
state={"database":DB,"ports":[8017,8018],"pids":pids}
(ROOT/"tests/verification-state.json").write_text(json.dumps(state,indent=2))
time.sleep(1)
print(json.dumps(state))
