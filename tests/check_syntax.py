from pathlib import Path
import subprocess,re
failures=[]
for p in Path("api").glob("*.php"):
    r=subprocess.run(["C:/xampp/php/php.exe","-l",str(p)],capture_output=True,text=True)
    if r.returncode:failures.append((str(p),r.stdout+r.stderr))
for p in [*Path("js").glob("*.js"),Path("sw.js"),Path("tests/offline-sync.test.cjs")]:
    if not p.exists():continue
    r=subprocess.run(["node","--check",str(p)],capture_output=True,text=True)
    if r.returncode:failures.append((str(p),r.stderr))
for p in Path("admin").glob("*.html"):
    for attrs,script in re.findall(r"<script([^>]*)>([\s\S]*?)</script>",p.read_text(encoding="utf-8")):
        if "src=" in attrs or not script.strip():continue
        r=subprocess.run(["node","-e","new Function(require('node:fs').readFileSync(0,'utf8'));"],input=script,capture_output=True,text=True)
        if r.returncode:failures.append((str(p)+" inline",r.stderr))
for path,error in failures:print(path+"\n"+error)
if failures:raise SystemExit(1)
print("PHP, JavaScript, service worker, and all admin inline scripts passed syntax checks.")
