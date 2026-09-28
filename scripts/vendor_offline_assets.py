"""Copy the app's existing pinned browser libraries locally and build its offline shell."""
from pathlib import Path
from urllib.request import urlopen, Request
import hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
VENDOR=ROOT/"vendor"
ASSETS={
 "https://code.jquery.com/jquery-3.7.1.min.js":"jquery-3.7.1.min.js",
 "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css":"bootstrap-5.3.3.min.css",
 "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js":"bootstrap-5.3.3.bundle.min.js",
 "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css":"bootstrap-icons.css",
 "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff2":"fonts/bootstrap-icons.woff2",
 "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff":"fonts/bootstrap-icons.woff",
 "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js":"chart-4.4.4.umd.min.js",
 "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/LICENSE":"licenses/bootstrap.txt",
 "https://cdn.jsdelivr.net/npm/jquery@3.7.1/LICENSE.txt":"licenses/jquery.txt",
 "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/LICENSE":"licenses/bootstrap-icons.txt",
 "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/LICENSE.md":"licenses/chart.txt"
}
def fetch(url):
    with urlopen(Request(url,headers={"User-Agent":"AKAD-offline-assets/1.0"}),timeout=30) as r:return r.read()
manifest={}
for url,name in ASSETS.items():
    p=VENDOR/name;p.parent.mkdir(parents=True,exist_ok=True)
    if not p.exists():p.write_bytes(fetch(url))
    manifest[name]={"source":url,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
font_url="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
font_css=fetch(font_url).decode()
for url in set(re.findall(r"url\((https://fonts.gstatic.com/[^)]+)\)",font_css)):
    name="fonts/"+url.rsplit("/",1)[-1]
    p=VENDOR/name
    if not p.exists():p.write_bytes(fetch(url))
    manifest[name]={"source":url,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
    font_css=font_css.replace(url,name)
(VENDOR/"fonts.css").write_text(font_css,encoding="utf-8")
for family in ["fraunces","inter"]:
    p=VENDOR/"licenses"/(family+".txt")
    if not p.exists():p.write_bytes(fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/"+family+"/OFL.txt"))
(VENDOR/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8")
for p in (ROOT/"admin").glob("*.html"):
    text=p.read_text(encoding="utf-8")
    for url,name in ASSETS.items():text=text.replace(url,"../vendor/"+name)
    text=text.replace("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js","../vendor/chart-4.4.4.umd.min.js")
    text=text.replace(font_url.replace("&","&amp;"),"../vendor/fonts.css").replace(font_url,"../vendor/fonts.css")
    p.write_text(text,encoding="utf-8")
files=sorted(p.relative_to(ROOT).as_posix() for folder in ["admin","js","css","vendor"] for p in (ROOT/folder).rglob("*") if p.is_file() and p.suffix in [".html",".js",".css",".woff",".woff2",".ttf"])
version=hashlib.sha256("".join(hashlib.sha256((ROOT/f).read_bytes()).hexdigest() for f in files).encode()).hexdigest()[:12]
(ROOT/"sw.js").write_text("""// Cache only the app shell. API responses and POST requests always use the network.
const CACHE='akad-shell-"""+version+"""';
const ROOT=new URL('./',self.location.href);
const FILES="""+json.dumps(files)+""";
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(f=>new URL(f,ROOT).href))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('akad-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==ROOT.origin||url.pathname.includes('/api/'))return;
 const relative=url.pathname.slice(ROOT.pathname.length);
 if(!FILES.includes(relative))return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(c=>c.put(event.request,response.clone()));return response;}).catch(()=>caches.match(event.request)));
 }else{
  event.respondWith(caches.open(CACHE).then(async cache=>{
   const saved=await cache.match(event.request);
   const update=fetch(event.request).then(response=>{if(response.ok)cache.put(event.request,response.clone());return response;});
   if(saved){event.waitUntil(update.catch(()=>{}));return saved;}
   return update;
  }));
 }
});
""",encoding="utf-8")
print("Offline shell:",len(files),"files; version",version)
