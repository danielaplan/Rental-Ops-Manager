/**
 * Durable outbox. The existing synchronous API returns a local draft; only a
 * server acknowledgement removes Pending Sync. Each operation has its own
 * storage key so another tab cannot overwrite a queued operation.
 */
(() => {
  const prefix = 'er_sync_op_';
  const base = new URL('../api/',document.currentScript.src).href;
  const fields = {bookings:'id',categories:'category_id',services:'service_id',addons:'addon_id',customers:'customer_id',payments:'payment_id',rentalItems:'rental_item_id',gallery:'image_id',bookingItems:'booking_item_id',itemReleases:'release_id',itemHistory:'history_id',delivery:'booking_id'};
  let localDepth = 0, flushing = null;
  const reads = new Map();
  const uuid = () => crypto.randomUUID();
  const session = () => STORAGE._get(STORAGE_KEYS.adminSession, {});
  const owner = () => session()?.user?.user_id || null;
  const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, {detail}));
  const queue = () => {
    const list = [];
    for (let i=0; i<localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        const op = STORAGE._get(key);
        if (op && (!op.owner_id || op.owner_id === owner())) list.push(op);
      }
    }
    return list.sort((a,b) => a.sequence-b.sequence || a.client_id.localeCompare(b.client_id));
  };
  const persist = op => { STORAGE._set(prefix+op.client_id,op); emit('sync-state-changed'); };
  const dirty = (entity,id) => queue().some(op => op.entity===entity && String(op.local_id)===String(id));
  const ref = (entity,id) => {
    const aliases = STORAGE._get('er_sync_ids', {});
    if (aliases[entity+':'+id]) return aliases[entity+':'+id];
    if (String(id).startsWith('LOCAL-')) return id;
    return Number((String(id).match(/-(\d+)$/)||[])[1] || id) || id;
  };
  const localBooking = id => {
    const found = STORAGE.getAll('bookings').find(r => String(ref('bookings',r.id))===String(id));
    return found ? found.id : Number(id);
  };
  const normalize = (entity,row) => {
    const out = {...row};
    const field = fields[entity];
    const serverId = row[field] ?? row.booking_id;
    if (field && serverId != null) {
      const aliases=STORAGE._get('er_sync_ids',{});
      const alias=Object.keys(aliases).find(k => k.startsWith(entity+':') && String(aliases[k])===String(serverId));
      out[field]=alias ? alias.slice(entity.length+1) : serverId;
      out._server_id=serverId;
    }
    if(entity==='bookings') {
      out.id=out.id ?? row.booking_id; out.location=row.event_location; out.contact=row.contact;
      out.status=String(row.status||'pending').replace(/^./,c=>c.toUpperCase());
      ['service_ids','addon_ids'].forEach(k => { if(typeof out[k]==='string')out[k]=JSON.parse(out[k]||'[]'); });
      out.service_ids=(out.service_ids||[row.service_id]).map(id=>/^\d+$/.test(String(id))?'SVC-'+String(id).padStart(3,'0'):id);
      out.addon_ids=(out.addon_ids||[]).map(id=>/^\d+$/.test(String(id))?'ADD-'+String(id).padStart(3,'0'):id);
    }
    if(entity==='services'){out.name=row.service_name||row.name;out.service_id='SVC-'+String(serverId).padStart(3,'0');}
    if(entity==='categories')out.category_id='CAT-'+String(serverId).padStart(3,'0');
    if(entity==='addons')out.addon_id='ADD-'+String(serverId).padStart(3,'0');
    if(['addons','packages','rentalItems','bookingItems'].includes(entity)&&row.service_id!=null)out.service_id='SVC-'+String(row.service_id).padStart(3,'0');
    if(['rentalItems','bookingItems','equipment'].includes(entity)&&row.rental_item_id!=null)out.rental_item_id='RI-'+String(row.rental_item_id).padStart(3,'0');
    if(entity==='rentalItems')out.rental_item_id='RI-'+String(serverId).padStart(3,'0');
    if(row.booking_id!=null&&entity!=='bookings')out.booking_id=localBooking(row.booking_id);
    if(entity==='customers'){out.customer_id='CUS-'+String(serverId).padStart(3,'0');out.name=row.full_name;out.contact=row.contact_number;}
    if(entity==='payments'){out.method=row.payment_method;out.date=String(row.payment_date||'').slice(0,10);}
    ['subtotal','addons_total','total','amount_paid','amount','price','fees','discount','expected_qty','returned_qty','released_qty','amount_held','deduction_amount'].forEach(k=>{if(out[k]!=null)out[k]=Number(out[k]);});
    out.pending_sync=false;
    return out;
  };
  const merge = async (entity,rows,bookingId) => {
    if(!Array.isArray(rows))return;
    const before=STORAGE.getAll(entity);
    const pending=before.filter(r=>dirty(entity,r[fields[entity]] ?? r.booking_id) ||
      (entity==='bookingItems' && queue().some(op=>['bookingItems','equipment'].includes(op.entity)&&String(op.data.booking_id)===String(r.booking_id))));
    let mapped=rows.map(r=>normalize(entity,r));
    if(bookingId!=null)mapped=mapped.map(r=>({...r,booking_id:bookingId}));
    const field=fields[entity]||'booking_id';
    const preserved=bookingId!=null ? before.filter(r=>String(r.booking_id)!==String(bookingId)) : [];
    mapped=mapped.filter(r=>!pending.some(p=>String(ref(entity,p[field]))===String(ref(entity,r[field]))));
    const next=[...preserved,...mapped,...pending.filter(p=>!preserved.includes(p))];
    if(JSON.stringify(next)!==JSON.stringify(before)){STORAGE.memory[entity]=next;STORAGE.saveAll(entity,next);await STORAGE.saveCache(entity,next);emit('api-data-changed',{entity});}
  };
  const request = async (entity,action,data,query='') => {
    const token=session()?.session_token;
    const method=data===undefined?'GET':'POST';
    const response=await fetch(base+entity+'.php?do='+action+query,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(method==='POST'?{'Content-Type':'application/json'}:{})},...(method==='POST'?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(12000)});
    const result=await response.json();
    if(!response.ok||!result.ok){const e=new Error(result.error||'Request failed');e.code=result.code;throw e;}
    if(token&&session()?.session_token===token)STORAGE._set(STORAGE_KEYS.adminSession,{...session(),expiresAt:Date.now()+86400000});
    return result.data;
  };
  const read = (entity,action='all',query='',bookingId) => {
    if(!navigator.onLine)return Promise.resolve(null);
    const key=entity+action+query;
    const prior=reads.get(key);
    if(prior && Date.now()-prior.at<5000)return prior.promise;
    const promise=request(entity,action,undefined,query).then(async data=>{
      if(Array.isArray(data))await merge(entity,data,bookingId);
      return data;
    }).catch(error=>{emit('api-read-error',{entity,message:error.message});return null;});
    reads.set(key,{at:Date.now(),promise});
    return promise;
  };
  const enqueue = (entity,action,data,localId) => {
    if(!owner()||!session()?.session_token)throw new Error('Sign in online before recording offline entries.');
    const op={client_id:uuid(),local_id:localId,owner_id:owner(),entity,action,data:structuredClone(data),timestamp:new Date().toISOString(),sequence:Date.now()*1000+queue().length,status:'pending'};
    persist(op);
    if(fields[entity]){
      const rows=STORAGE.getAll(entity);const row=rows.find(r=>String(r[fields[entity]])===String(localId));
      if(row){row.pending_sync=true;STORAGE.saveAll(entity,rows);}
    }
    // A short delay groups dependent operations and keeps saves durable before navigation.
    window.setTimeout(()=>API.flushSyncQueue(),50);
    return op;
  };
  const payload = (entity,data) => {
    const out={...data};
    if(entity==='services'&&out.name)out.service_name=out.name;
    if(entity==='bookings'&&out.location)out.event_location=out.location;
    if(entity==='payments'&&out.method)out.payment_method=out.method;
    if(entity==='bookings'){delete out.amount_paid;delete out.payment_status;}
    return out;
  };
  const actions={
    createCategory:['categories','create'],updateCategory:['categories','update'],deleteCategory:['categories','delete'],
    createService:['services','create'],updateService:['services','update'],deleteService:['services','delete'],
    createAddon:['addons','create'],updateAddon:['addons','update'],deleteAddon:['addons','delete'],
    createRentalItem:['rentalItems','create'],updateRentalItem:['rentalItems','update'],deleteRentalItem:['rentalItems','delete'],
    createGalleryImage:['gallery','create'],updateGalleryImage:['gallery','update'],deleteGalleryImage:['gallery','delete'],
    createBooking:['bookings','create'],updateBooking:['bookings','update'],createPayment:['payments','create']
  };
  Object.entries(actions).forEach(([name,[entity,action]])=>{
    const local=API[name].bind(API);
    API[name]=function(...args){
      if(localDepth)return local(...args);
      if(!owner())throw new Error('Sign in before saving.');
      const old=action!=='create'?STORAGE.getAll(entity).find(r=>String(r[fields[entity]])===String(args[0])):null;
      localDepth++;let result;try{result=local(...args);}finally{localDepth--;}
      const data=payload(entity,action==='update'?args[1]||{}:action==='create'?args[0]||{}:{});
      let id=action==='create'?result?.[fields[entity]]:args[0];
      if(action==='create'&&result){
        const newId='LOCAL-'+entity+'-'+uuid();
        const rows=STORAGE.getAll(entity);const row=rows.find(r=>String(r[fields[entity]])===String(id));
        if(row){row[fields[entity]]=newId;row.pending_sync=true;STORAGE.saveAll(entity,rows);}
        if(entity==='bookings'){
          const items=STORAGE.getAll('bookingItems');items.filter(r=>r.booking_id===id).forEach(r=>r.booking_id=newId);STORAGE.saveAll('bookingItems',items);
        }
        result[fields[entity]]=newId;result.pending_sync=true;id=newId;
      }else data.id=id;
      if(entity==='bookings'&&action==='update'&&old){
        data._base={};
        ['status','event_date','start_time','end_time','event_location'].filter(k=>k in data).forEach(k=>data._base[k]=old[k]??old.location);
      }
      enqueue(entity,action,data,id);
      if(entity==='bookings'&&action==='create')enqueue('bookingItems','generate',{booking_id:id,service_ids:data.service_ids||[]},id);
      return result;
    };
  });
  const methods={getCategories:'categories',getServices:'services',getAddons:'addons',getBookings:'bookings',getCustomers:'customers',getPayments:'payments',getRentalItems:'rentalItems',getGallery:'gallery'};
  Object.entries(methods).forEach(([name,entity])=>{const local=API[name].bind(API);API[name]=function(...args){if(!localDepth)read(entity);return local(...args);};});
  const refreshObject=entity=>read(entity,'get').then(data=>{
    if(!data||typeof data!=='object'||Array.isArray(data)||queue().some(op=>op.entity===entity))return data;
    STORAGE.setOne(entity,data);emit('api-data-changed',{entity});return data;
  });
  API.refreshSettings=()=>refreshObject('settings');
  API.refreshWebsiteContent=()=>refreshObject('websiteContent');
  [['getSettings','settings'],['getWebsiteContent','websiteContent']].forEach(([name,entity])=>{
    const local=API[name].bind(API);
    API[name]=function(...args){if(!localDepth)refreshObject(entity);return local(...args);};
  });
  const wrapSingletonUpdate=(name,entity,relatedGetter,relatedEntity)=>{
    const local=API[name].bind(API);
    API[name]=function(data){
      if(localDepth)return local(data);
      if(!owner())throw new Error('Sign in before saving.');
      localDepth++;let result;try{result=local(data);}finally{localDepth--;}
      enqueue(entity,'update',result,entity+'-singleton');
      const related=API[relatedGetter]();
      enqueue(relatedEntity,'update',related,relatedEntity+'-singleton');
      return result;
    };
  };
  wrapSingletonUpdate('updateSettings','settings','getWebsiteContent','websiteContent');
  wrapSingletonUpdate('updateWebsiteContent','websiteContent','getSettings','settings');
  API.refreshSharedData=()=>owner()?Promise.all([
    ...['services','packages','addons','rentalItems','bookings','payments'].map(entity=>read(entity)),
    refreshObject('settings'),refreshObject('websiteContent')
  ]):Promise.resolve([]);
  ['getBookingItems','getPaymentsForBooking'].forEach(name=>{
    const entity=name==='getBookingItems'?'bookingItems':'payments',local=API[name].bind(API);
    API[name]=id=>{if(!localDepth&&!String(ref('bookings',id)).startsWith('LOCAL-'))read(entity,name==='getBookingItems'?'forBooking':'all','&booking_id='+encodeURIComponent(ref('bookings',id)),id);return local(id);};
  });
  const localGetBooking=API.getBooking.bind(API);
  API.getBooking=id=>localGetBooking(id);
  ['generateBookingChecklist','updateBookingItem','recordRelease','recordReturn','logItemHistory'].forEach(name=>{
    const local=API[name].bind(API);
    API[name]=function(...args){
      if(localDepth)return local(...args);
      localDepth++;let result;try{result=local(...args);}finally{localDepth--;}
      if(name==='generateBookingChecklist')enqueue('bookingItems','generate',{booking_id:args[0],service_ids:args[1]},args[0]);
      if(name==='updateBookingItem'){
        const row=STORAGE.getAll('bookingItems').find(r=>String(r.booking_item_id)===String(args[0]));
        if(row)enqueue('bookingItems','update',{...args[1],booking_id:row.booking_id,rental_item_id:row.rental_item_id},args[0]);
      }
      if(name==='recordRelease')enqueue('itemReleases','create',{booking_id:args[0],released_by:args[1],notes:args[2]||''},result.release_id);
      if(name==='recordReturn'){
        const items=args[2].map(r=>({rental_item_id:r.rental_item_id,returned_qty:r.returned_qty,condition:r.condition,notes:r.notes||''}));
        const rows=STORAGE.getAll('bookingItems');args[2].forEach(r=>{const row=rows.find(it=>String(it.booking_item_id)===String(r.booking_item_id));if(row)Object.assign(row,{returned_qty:r.returned_qty,condition:r.condition,notes:r.notes,inspected:true});});STORAGE.saveAll('bookingItems',rows);
        enqueue('equipment','inspect',{booking_id:args[0],items},args[0]);
      }
      if(name==='logItemHistory')enqueue('itemHistory','create',args[0],result?.history_id);
      return result;
    };
  });
  API.finalizeReturn=id=>enqueue('equipment','finalizeReturn',{booking_id:id},id);
  API.getPackages=()=>{read('packages');return STORAGE.getAll('packages');};
  API.getDeposit=id=>{
    if(!String(ref('bookings',id)).startsWith('LOCAL-'))read('deposits','get','&booking_id='+encodeURIComponent(ref('bookings',id))).then(row=>{if(row&&!dirty('deposits',id))merge('deposits',[row],id);});
    return STORAGE.getAll('deposits').find(r=>String(r.booking_id)===String(id))||{amount_held:0,deduction_amount:0,deduction_reason:''};
  };
  API.upsertDeposit=(id,data)=>{
    const held=Number(data.amount_held),ded=Number(data.deduction_amount);
    if(!Number.isFinite(held)||!Number.isFinite(ded)||held<0||ded<0||ded>held||(ded>0&&!String(data.deduction_reason||'').trim()))throw new Error('Enter non-negative amounts, keep deductions within the deposit, and give a reason for deductions.');
    const rows=STORAGE.getAll('deposits').filter(r=>String(r.booking_id)!==String(id));const result={...data,booking_id:id,refund_amount:held-ded,pending_sync:true};rows.push(result);STORAGE.saveAll('deposits',rows);enqueue('deposits','upsert',result,id);return result;
  };
  API.getDelivery=id=>STORAGE.getAll('delivery').find(r=>String(r.booking_id)===String(id))||{booking_id:id,delivery_method:'self_pickup',delivery_fee:0,fee_shouldered_by:'renter'};
  API.refreshDelivery=async id=>{
    if(String(ref('bookings',id)).startsWith('LOCAL-')||!navigator.onLine)return API.getDelivery(id);
    try{
      const saved=await request('delivery','get',undefined,'&booking_id='+encodeURIComponent(ref('bookings',id)));
      if(dirty('delivery',id))return API.getDelivery(id);
      const rows=STORAGE.getAll('delivery').filter(r=>String(r.booking_id)!==String(id));
      if(saved)rows.push({...saved,booking_id:id,delivery_fee:Number(saved.delivery_fee||0),pending_sync:false});
      STORAGE.saveAll('delivery',rows);emit('api-data-changed',{entity:'delivery'});
      return API.getDelivery(id);
    }catch(error){emit('api-read-error',{entity:'delivery',message:error.message});return API.getDelivery(id);}
  };
  API.upsertDelivery=(id,data)=>{
    const fee=Number(data.delivery_fee);
    if(!['self_pickup','lalamove','owner_delivered'].includes(data.delivery_method)||!['renter','owner'].includes(data.fee_shouldered_by)||!Number.isFinite(fee)||fee<0)throw new Error('Choose a delivery method and fee arrangement, and enter a non-negative delivery fee.');
    if(!owner())throw new Error('Sign in before saving delivery details.');
    const record={booking_id:id,delivery_method:data.delivery_method,delivery_fee:fee,fee_shouldered_by:data.fee_shouldered_by,pending_sync:true};
    const rows=STORAGE.getAll('delivery').filter(r=>String(r.booking_id)!==String(id));rows.push(record);STORAGE.saveAll('delivery',rows);
    enqueue('delivery','upsert',{booking_id:id,delivery_method:record.delivery_method,delivery_fee:fee,fee_shouldered_by:record.fee_shouldered_by},id);
    return record;
  };
  API.getSyncQueue=queue;
  API.ready=STORAGE.restoreCache().catch(error=>{emit('api-read-error',{entity:'offline cache',message:error.message});});
  API.retrySyncOperation=(id,patch={})=>{
    const op=queue().find(r=>r.client_id===id);if(!op)return;
    op.data={...op.data,...patch};if(op.conflict_kind==='stale'&&op.server_record&&op.data._base)Object.keys(op.data._base).forEach(k=>op.data._base[k]=op.server_record[k]);
    op.status='pending';delete op.reason;delete op.server_record;persist(op);
    queue().filter(r=>r.status==='failed'&&r.reason?.startsWith('Related ')).forEach(r=>{r.status='pending';persist(r);});
    return API.flushSyncQueue();
  };
  const flush = async () => {
    if(!navigator.onLine||!owner()||!session()?.session_token)return null;
    const aggregate={committed:[],conflicts:[],failed:[]};
    let pending=queue().filter(op=>op.status==='pending');
    while(pending.length){
      const batch=pending.slice(0,50);
      emit('sync-state-changed',{syncing:true});
      try {
        const data=await request('sync','commit',{queue:batch.map(op=>({...op,data:op.data}))});
        for(const ack of data.committed||[]){
          const op=batch.find(r=>r.client_id===ack.client_id);if(!op)continue;
          if(ack.server_id&&op.action==='create'){
            const aliases=STORAGE._get('er_sync_ids',{});aliases[op.entity+':'+op.local_id]=ack.server_id;STORAGE._set('er_sync_ids',aliases);
            const rows=STORAGE.getAll(op.entity);const row=rows.find(r=>String(r[fields[op.entity]])===String(op.local_id));if(row){row._server_id=ack.server_id;STORAGE.saveAll(op.entity,rows);}
          }
          localStorage.removeItem(prefix+op.client_id);
        }
        for(const [kind,state] of [['conflicts','conflict'],['failed','failed']])for(const failure of data[kind]||[]){
          const op=batch.find(r=>r.client_id===failure.client_id);if(op)persist({...op,status:state,reason:failure.reason,server_record:failure.server_record,conflict_kind:failure.kind});
        }
        for(const k of Object.keys(aggregate))aggregate[k].push(...(data[k]||[]));
        // An omitted acknowledgement stays pending, but must not loop forever.
        if(batch.some(op=>queue().some(r=>r.client_id===op.client_id&&r.status==='pending')))break;
        pending=queue().filter(op=>op.status==='pending');
      }catch(error){
        STORAGE._set('er_sync_last_error',{message:error.message,code:error.code,at:new Date().toISOString()});
        emit('sync-state-changed',{error:error.message});break;
      }
    }
    Object.keys(fields).forEach(entity=>{
      const rows=STORAGE.getAll(entity);let changed=false;
      rows.forEach(r=>{const pending=dirty(entity,r[fields[entity]]);if(r.pending_sync!==pending){r.pending_sync=pending;changed=true;}});
      if(changed)STORAGE.saveAll(entity,rows);
    });
    STORAGE._set('er_sync_last_result',aggregate);emit('sync-state-changed',{syncing:false});
    if(aggregate.committed.length){reads.clear();await API.refreshSharedData();emit('api-data-changed',{entity:'bookings'});}
    return aggregate;
  };
  API.flushSyncQueue=()=>{
    if(flushing)return flushing;
    flushing=(navigator.locks?navigator.locks.request('akad-outbox',flush):flush()).finally(()=>{flushing=null;});
    return flushing;
  };
  API.savedMessage=()=>navigator.onLine?'Saved on this device. Pending Sync until accepted.':'Saved offline. Pending Sync.';
  // Upgrade old queue entries without removing any failed or conflicting draft.
  const legacy=STORAGE._get('er_sync_queue',[]);
  if(legacy.length&&owner()){
    legacy.forEach((op,i)=>persist({...op,client_id:uuid(),owner_id:owner(),local_id:op.local_id||op.data?.id,status:'pending',sequence:Date.now()*1000+i,timestamp:op.timestamp||new Date().toISOString()}));
    localStorage.removeItem('er_sync_queue');
  }
  window.addEventListener('online',()=>{API.flushSyncQueue();API.refreshSharedData();});
  window.addEventListener('offline',()=>emit('sync-state-changed'));
  window.addEventListener('storage',()=>emit('sync-state-changed'));
  window.addEventListener('focus',()=>{API.flushSyncQueue();API.refreshSharedData();});
  window.setInterval(()=>{API.flushSyncQueue();if(!document.hidden)API.refreshSharedData();},15000);
  window.setTimeout(()=>API.ready.then(()=>{API.flushSyncQueue();API.refreshSharedData();}),0);
})();
