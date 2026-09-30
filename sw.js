// Cache only the app shell. API responses and POST requests always use the network.
const CACHE='akad-shell-20260930-requirements-ui';
const ROOT=new URL('./',self.location.href);
const FILES=["admin/addons.html", "admin/bookings.html", "admin/calendar.html", "admin/categories.html", "admin/content.html", "admin/customers.html", "admin/dashboard.html", "admin/gallery.html", "admin/inventory.html", "admin/login.html", "admin/manual-booking.html", "admin/payments.html", "admin/reports.html", "admin/services.html", "admin/settings.html", "css/admin.css", "css/responsive.css", "css/style.css", "js/admin.js", "js/api.js", "js/app.js", "js/bookings.js", "js/calendar.js", "js/config.js", "js/customers.js", "js/inventory.js", "js/offline.js", "js/payments.js", "js/services.js", "js/storage.js", "js/sync-ui.js", "js/sync.js", "vendor/bootstrap-5.3.3.bundle.min.js", "vendor/bootstrap-5.3.3.min.css", "vendor/bootstrap-icons.css", "vendor/chart-4.4.4.umd.min.js", "vendor/fonts.css", "vendor/fonts/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcUByjDg.ttf", "vendor/fonts/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcaRyjDg.ttf", "vendor/fonts/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf", "vendor/fonts/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf", "vendor/fonts/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf", "vendor/fonts/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf", "vendor/fonts/bootstrap-icons.woff", "vendor/fonts/bootstrap-icons.woff2", "vendor/jquery-3.7.1.min.js"];
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
