(() => {
  let syncing=false,working=false,readError='',refreshTimer=null;
  async function runSync(work) {
    if (working) return;
    working=true; readError=''; render();
    try { await work(); }
    catch(error) { readError=error.message || 'Synchronization failed. Please retry.'; }
    finally { working=false; render(); }
  }
  const esc=s=>escapeHtmlA(s);
  window.initSyncPanel=()=>{
    if(!document.querySelector('#syncPanel')){
      const panel=document.createElement('details');panel.id='syncPanel';panel.className='sync-panel border rounded p-3 mb-3 bg-white';
      panel.innerHTML='<summary><span id="syncStatus" role="status" aria-live="polite"></span></summary><p id="offlineSetup" class="small mt-2 mb-2"></p><p id="syncReadError" class="small text-danger mb-2" role="alert" hidden></p><button type="button" class="btn btn-sm btn-outline-secondary" id="syncNow">Refresh data and sync</button><div id="syncOperations" class="mt-3"></div>';
      document.querySelector('.admin-topbar')?.after(panel);
      panel.querySelector('#syncNow').addEventListener('click', () => runSync(async () => { await API.refreshSharedData(); await API.flushSyncQueue(); }));
      panel.addEventListener('submit',e=>{
        if(!e.target.matches('.sync-edit'))return;e.preventDefault();
        const form=e.target,date=form.elements.event_date.value,start=form.elements.start_time.value,end=form.elements.end_time.value;
        if(!date||!start||!end||start>=end){form.querySelector('[role=alert]').textContent='Choose a date and an end time after the start time.';return;}
        void runSync(() => API.retrySyncOperation(form.dataset.operation,{event_date:date,start_time:start,end_time:end}));
      });
      panel.addEventListener('click',e=>{const button=e.target.closest('[data-retry]');if(button)void runSync(() => API.retrySyncOperation(button.dataset.retry));});
    }
    render();
  };
  function render(){
    const status=document.querySelector('#syncStatus');if(!status)return;
    const ops=API.getSyncQueue(),conflicts=ops.filter(op=>op.status==='conflict').length,failed=ops.filter(op=>op.status==='failed').length;
    status.textContent=(navigator.onLine?'Online':'Offline')+' · '+(syncing?'Syncing · ':'')+ops.length+' Pending Sync'+(conflicts?' · '+conflicts+' conflicts':'')+(failed?' · '+failed+' need attention':'');
    const error=document.querySelector('#syncReadError');
    if(error){error.textContent=readError;error.hidden=!readError;}
    document.querySelector('#syncNow').disabled=!navigator.onLine||syncing||working;
    document.querySelectorAll('#syncOperations button').forEach(button=>{button.disabled=working||syncing||!navigator.onLine;});
    document.querySelector('#offlineSetup').textContent=window.akadOfflineReady?'Offline pages are ready on this device. Existing signed-in sessions can record local entries.':'Offline setup is not complete yet. Keep this page online until setup finishes.';
    if(working||document.activeElement?.closest('.sync-edit'))return;

    // Build stale-edit comparison table for conflicts
    function staleComparison(op) {
      if (!op.server_record || !op.data._base) return '';
      const base = op.data._base;
      const server = op.server_record;
      const local = op.data;
      const keys = new Set([...Object.keys(base), ...Object.keys(server), ...Object.keys(local)]);
      const rows = [...keys].filter(k => {
        const b = base[k], s = server[k], l = local[k];
        return b !== s || b !== l || s !== l;
      }).map(k => {
        const b = base[k] ?? '';
        const s = server[k] ?? '';
        const l = local[k] ?? '';
        return `<tr><th scope="row">${esc(k)}</th><td>${esc(b)}</td><td>${esc(s)}</td><td>${esc(l)}</td></tr>`;
      }).join('');
      if (!rows) return '';
      return `<details class="mt-2"><summary class="small text-muted">Stale-edit comparison</summary>
        <table class="table table-sm table-bordered mt-2" style="font-size:.8rem;">
          <thead><tr><th>Field</th><th>Your previous</th><th>Server now</th><th>Your change</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></details>`;
    }

    document.querySelector('#syncOperations').innerHTML=ops.length ? ops.map(op=>{
      const booking=STORAGE.getAll('bookings').find(b=>String(b.id)===String(op.local_id)),draft={...booking,...op.data};
      const comparison = staleComparison(op);
      const editor=op.entity==='bookings'&&['conflict','failed'].includes(op.status)?`<details><summary>Edit booking date/time and retry</summary>${comparison}<form class="sync-edit row g-2 mt-1" data-operation="${esc(op.client_id)}">
        <div class="col-sm-4"><label for="date-${op.client_id}">Event date</label><input required class="form-control" id="date-${op.client_id}" name="event_date" type="date" value="${esc(draft.event_date||'')}"></div>
        <div class="col-sm-4"><label for="start-${op.client_id}">Start time</label><input required class="form-control" id="start-${op.client_id}" name="start_time" type="time" value="${esc(String(draft.start_time||'').slice(0,5))}"></div>
        <div class="col-sm-4"><label for="end-${op.client_id}">End time</label><input required class="form-control" id="end-${op.client_id}" name="end_time" type="time" value="${esc(String(draft.end_time||'').slice(0,5))}"></div>
        <div role="alert" class="text-danger small"></div><div><button class="btn btn-sm btn-admin-primary">Apply and retry</button></div></form></details>`:'';
      return `<article class="border-top py-2"><strong>${esc(op.entity)} · ${esc(op.action)}</strong><span class="badge bg-secondary ms-2">${esc(op.status==='pending'?'Pending Sync':op.status)}</span><p class="small mb-1">${esc(draft.customer_name||op.local_id||'')} ${esc(draft.event_date||'')}</p>${op.reason?`<p class="text-danger small" role="alert">${esc(op.reason)} Your draft is retained.</p>`:''}${editor}${op.status==='failed'&&!editor?`<button type="button" class="btn btn-sm btn-outline-secondary" data-retry="${op.client_id}">Retry</button>`:''}</article>`;
    }).join(''):'<p class="small text-muted mb-0">No pending changes for this signed-in user.</p>';
  }
  window.addEventListener('sync-state-changed',e=>{if(e.detail?.syncing!==undefined)syncing=e.detail.syncing;render();});
  window.addEventListener('offline-ready',render);
  document.addEventListener('input',e=>{const modal=e.target.closest('#bookingDetailModal');if(modal)modal.dataset.edited='true';});
  document.addEventListener('change',e=>{const modal=e.target.closest('#bookingDetailModal');if(modal)modal.dataset.edited='true';});
  document.addEventListener('hidden.bs.modal',e=>{if(e.target.id==='bookingDetailModal')delete e.target.dataset.edited;});
  window.addEventListener('api-data-changed',event=>{
    const page=location.pathname.split('/').pop();
    const entity=event.detail?.entity;
    if(entity==='delivery'||entity==='deposits')return;
    window.clearTimeout(refreshTimer);
    refreshTimer=window.setTimeout(async()=>{
      try {
      if(page==='calendar.html'&&typeof CalendarHelper!=='undefined')await CalendarHelper.render('#calendarWrap',typeof showBookingPeek==='function'?showBookingPeek:null);
      if(page==='bookings.html'&&typeof renderBookingsTable==='function')await renderBookingsTable($('#filterStatus').val(),$('#filterSearch').val());
      if(page==='services.html'&&typeof renderServicesTable==='function')await renderServicesTable();
      if(page==='categories.html'&&typeof renderCategoriesTable==='function')await renderCategoriesTable();
      if(page==='addons.html'&&typeof renderAddonsTable==='function')await renderAddonsTable();
      if(page==='inventory.html'&&typeof renderInventory==='function')await renderInventory($('#invSearch').val());
      if(page==='gallery.html'&&typeof renderGallery==='function')await renderGallery();
      if(page==='customers.html'&&typeof renderCustomers==='function')await renderCustomers($('#custSearch').val());
      if(page==='payments.html'&&typeof renderPayments==='function')await renderPayments();
      if(page==='dashboard.html'&&typeof renderDashboard==='function'){await renderDashboard();$('#dashboardDataState').text('Dashboard refreshed from updated saved data.');}
      if(page==='reports.html'&&typeof renderReport==='function'){await renderReport($('#reportStartDate').val(),$('#reportEndDate').val());$('#reportDataState').text('Report refreshed from updated saved data.');}
      if(entity==='settings'&&typeof renderAdminSidebar==='function'){
        const activeHref=document.querySelector('.admin-sidebar .nav-link.active')?.getAttribute('href');
        await renderAdminSidebar(activeHref);
      }
      render();
      } catch(error) { readError=error.message; render(); }
    },100);
    const modal=document.querySelector('#bookingDetailModal.show');
    if(modal&&!modal.dataset.edited&&typeof loadBookingDetail==='function'&&typeof currentBookingId!=='undefined')loadBookingDetail(currentBookingId).catch(error=>{readError=error.message;render();});
  });
  window.addEventListener('api-read-error',event=>{
    readError='Could not refresh '+(event.detail?.entity||'saved data')+': '+(event.detail?.message||'Check the connection and retry.');
    const message='Could not refresh '+(event.detail?.entity||'saved data')+': showing the last saved values.';
    if(location.pathname.endsWith('/dashboard.html'))$('#dashboardDataState').text(message);
    if(location.pathname.endsWith('/reports.html'))$('#reportDataState').text(message);
    render();
  });
})();

