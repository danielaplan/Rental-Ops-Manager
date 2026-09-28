"""Control only the test servers recorded by start_verification.py."""
from pathlib import Path
import json, os, subprocess, sys
root=Path(__file__).resolve().parents[1]
path=root/'tests/verification-state.json'
state=json.loads(path.read_text())
action,port=sys.argv[1],int(sys.argv[2]);index=state['ports'].index(port)
if action=='stop':
    subprocess.run(['taskkill','/PID',str(state['pids'][index]),'/F'],check=True)
elif action=='start':
    log=open(root/'tests'/f'php-{port}.log','a')
    p=subprocess.Popen(['C:/xampp/php/php.exe','-S',f'127.0.0.1:{port}','-t',str(root)],env={**os.environ,'AKAD_DB_NAME':state['database']},stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW)
    state['pids'][index]=p.pid;path.write_text(json.dumps(state,indent=2));print(p.pid)
else:raise ValueError(action)
