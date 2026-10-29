/**
 * Durable async outbox. API writes resolve to a pending local draft; only a
 * server acknowledgement removes Pending Sync. Each operation has its own
 * storage key so another tab cannot overwrite a queued operation.
 */
(() => {
  const prefix = 'er_sync_op_';
  const base = new URL('../api/',document.currentScript.src).href;
  const fields = {bookings:'id',categories:'category_id',services:'service_id',addons:'addon_id',customers:'customer_id',payments:'payment_id',rentalItems:'rental_item_id',gallery:'image_id',packages:'package_id',checklistTemplates:'template_id',bookingItems:'booking_item_id',itemReleases:'release_id',itemHistory:'history_id',delivery:'booking_id',deposits:'booking_id'};
  let flushing = null;
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
    if(entity==='services'){
      const cached=STORAGE.getAll('services').find(value=>String(ref('services',value._server_id??value.service_id))===String(serverId));
      if(cached)Object.assign(out,cached,row);
    }
    if (field && serverId != null) {
      const aliases=STORAGE._get('er_sync_ids',{});
      const alias=Object.keys(aliases).find(k => k.startsWith(entity+':') && String(aliases[k])===String(serverId));
      out[field]=['bookings','payments'].includes(entity) ? serverId : (alias ? alias.slice(entity.length+1) : serverId);
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
    if(['rentalItems','bookingItems','equipment','itemHistory'].includes(entity)&&row.rental_item_id!=null)out.rental_item_id='RI-'+String(row.rental_item_id).padStart(3,'0');
    if(entity==='rentalItems')out.rental_item_id='RI-'+String(serverId).padStart(3,'0');
    if(entity==='packages')out.package_id='PKG-'+String(serverId).padStart(3,'0');
    if(entity==='checklistTemplates'){
      out.package_id='PKG-'+String(row.package_id).padStart(3,'0');
      out.items=(row.items||[]).map(item=>({...item,expected_quantity:Number(item.expected_quantity||0)}));
    }
    if(entity==='itemHistory')out.history_id='HIST-'+String(serverId).padStart(3,'0');
    if(row.booking_id!=null&&entity!=='bookings')out.booking_id=localBooking(row.booking_id);
    if(entity==='customers'){out.customer_id='CUS-'+String(serverId).padStart(3,'0');out.name=row.full_name;out.contact=row.contact_number;out.email=row.messenger_handle;}
    if(entity==='payments'){out.method=row.payment_method;out.date=String(row.payment_date||'').slice(0,10);}
    ['subtotal','addons_total','total','amount_paid','amount','price','fees','discount','expected_qty','returned_qty','released_qty','amount_held','deduction_amount'].forEach(k=>{if(out[k]!=null)out[k]=Number(out[k]);});
    out.pending_sync=false;
    return out;
  };
  const merge = async (entity,rows,scope) => {
    if(!Array.isArray(rows))return;
    const before=STORAGE.getAll(entity);
    const pending=before.filter(r=>dirty(entity,r[fields[entity]] ?? r.booking_id) ||
      (entity==='bookingItems' && queue().some(op=>['bookingItems','equipment'].includes(op.entity)&&String(op.data.booking_id)===String(r.booking_id))));
    let mapped=rows.map(r=>normalize(entity,r));
    const scopeField=scope&&typeof scope==='object'?scope.field:'booking_id';
    const scopeValue=scope&&typeof scope==='object'?scope.value:scope;
    if(scopeValue!=null)mapped=mapped.map(r=>({...r,[scopeField]:scopeValue}));
    const field=fields[entity]||'booking_id';
    const preserved=scopeValue!=null ? before.filter(r=>String(r[scopeField])!==String(scopeValue)) : [];
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
  const read = (entity,action='all',query='',scope) => {
    if(!navigator.onLine)return Promise.resolve(null);
    const key=entity+action+query;
    const prior=reads.get(key);
    if(prior && Date.now()-prior.at<5000)return prior.promise;
    const promise=request(entity,action,undefined,query).then(async data=>{
      if(Array.isArray(data))await merge(entity,data,scope);
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
  const saveRows=(entity,rows)=>{STORAGE.memory[entity]=rows;STORAGE.saveAll(entity,rows);Promise.resolve(STORAGE.saveCache(entity,rows)).catch(error=>emit('api-read-error',{entity,message:error.message}));};
  const remapAcceptedId=(entity,localId,serverId,serverRecord)=>{
    const field=fields[entity];
    if(!field||!['bookings','payments'].includes(entity))return;
    const rows=STORAGE.getAll(entity),row=rows.find(value=>String(value[field])===String(localId)||String(value._server_id)===String(serverId));
    const localCustomerId=entity==='bookings'?row?.customer_id:null;
    if(row){row[field]=serverId;row._server_id=serverId;saveRows(entity,rows);}
    if(entity==='bookings'){
      if(row&&serverRecord?.customer_id!=null){
        row.customer_id=serverRecord.customer_id;saveRows(entity,rows);
        const customers=STORAGE.getAll('customers'),customer=customers.find(value=>String(value.customer_id)===String(localCustomerId));
        if(customer){customer.customer_id='CUS-'+String(serverRecord.customer_id).padStart(3,'0');customer._server_id=serverRecord.customer_id;customer.pending_sync=false;saveRows('customers',customers);}
      }
      Object.keys(fields).filter(name=>name!=='bookings').forEach(name=>{
        const related=STORAGE.getAll(name);let changed=false;
        related.forEach(value=>{if(String(value.booking_id)===String(localId)){value.booking_id=serverId;changed=true;}});
        if(changed)saveRows(name,related);
      });
      queue().forEach(operation=>{
        if(String(operation.data?.booking_id)===String(localId)){operation.data.booking_id=serverId;persist(operation);}
      });
    }
  };
  const applyAcceptedDeposit=(operation,serverRecord)=>{
    if(!serverRecord||typeof serverRecord!=='object')return;
    const rows=STORAGE.getAll('deposits').slice();
    const bookingId=operation.data?.booking_id??operation.local_id;
    const index=rows.findIndex(row=>String(row.booking_id)===String(operation.local_id)||String(ref('bookings',row.booking_id))===String(ref('bookings',bookingId)));
    const accepted=normalize('deposits',serverRecord);
    accepted.booking_id=index>=0?rows[index].booking_id:operation.local_id;
    if(index>=0)rows[index]={...rows[index],...accepted,pending_sync:false};else rows.push({...accepted,pending_sync:false});
    saveRows('deposits',rows);
  };
  const nextLocalId=entity=>'LOCAL-'+entity+'-'+uuid();
  const defaults={
    categories:{status:'Active'},services:{status:'Active',featured:false,inclusions:[]},addons:{status:'Active'},
    rentalItems:{quantity:1,required:false,tracking:'quantity',status:'Available',condition:'Good',notes:''},
    gallery:{featured:false},bookings:{discount:0,fees:0,amount_paid:0,status:'Pending',payment_status:'Unpaid'},
    payments:{date:new Date().toISOString().slice(0,10)}
  };
  const createLocal=(entity,data)=>{
    const id=nextLocalId(entity),field=fields[entity];
    const record={...(defaults[entity]||{}),...data,[field]:id,pending_sync:true};
    if(entity==='bookings'){record.created_at=new Date().toISOString();record.payment_status='Unpaid';}
    const rows=STORAGE.getAll(entity).slice();rows.push(record);saveRows(entity,rows);return record;
  };
  const updateLocal=(entity,id,data)=>{
    const rows=STORAGE.getAll(entity).slice(),field=fields[entity];
    const index=rows.findIndex(row=>String(row[field])===String(id));
    if(index<0)return null;
    rows[index]={...rows[index],...data,pending_sync:true};saveRows(entity,rows);return rows[index];
  };
  const deleteLocal=(entity,id)=>{
    const field=fields[entity],rows=STORAGE.getAll(entity).filter(row=>String(row[field])!==String(id));
    saveRows(entity,rows);return true;
  };
  const generateLocalChecklist=(bookingId,serviceIds,packageId)=>{
    const retained=STORAGE.getAll('bookingItems').filter(item=>String(item.booking_id)!==String(bookingId));
    const created=[];
    const packageRef=packageId==null?null:String(ref('packages',packageId));
    const templates=STORAGE.getAll('checklistTemplates').filter(template=>
      template.status==='Active'&&String(ref('packages',template.package_id))===packageRef
    );
    if(templates.length>1)throw new Error('The selected package has multiple active checklist templates.');
    const template=templates[0];
    if(template){
      for(const item of template.items||[]){
        created.push({booking_item_id:nextLocalId('bookingItems'),booking_id:bookingId,template_item_id:item.template_item_id,rental_item_id:null,name:item.item_name,item_name_snapshot:item.item_name,expected_qty:Number(item.expected_quantity||0),released_qty:0,returned_qty:0,required:true,checked_released:false,condition:'',notes:'',pending_sync:true});
      }
    }else if(packageId==null){
      for(const serviceId of serviceIds||[])for(const item of STORAGE.getAll('rentalItems').filter(row=>String(row.service_id)===String(serviceId))){
        created.push({booking_item_id:nextLocalId('bookingItems'),booking_id:bookingId,rental_item_id:item.rental_item_id,service_id:serviceId,name:item.name,expected_qty:Number(item.quantity||0),released_qty:0,returned_qty:0,required:Boolean(item.required),checked_released:false,condition:'',notes:'',pending_sync:true});
      }
    }
    saveRows('bookingItems',[...retained,...created]);return created;
  };
  const upsertLocalCustomer=booking=>{
    const rows=STORAGE.getAll('customers').slice();
    const requested=booking.customer_id;
    let row=requested==null?null:rows.find(customer=>String(customer.customer_id)===String(requested)||String(customer._server_id)===String(ref('customers',requested)));
    if(!row){row={customer_id:nextLocalId('customers'),name:booking.customer_name,contact:booking.contact,email:booking.email||'',type:booking.customer_type||'Guest / No Account',pending_sync:true};rows.push(row);}
    booking.customer_id=row.customer_id;
    saveRows('customers',rows);
    const bookings=STORAGE.getAll('bookings');const saved=bookings.find(value=>String(value.id)===String(booking.id));
    if(saved){saved.customer_id=row.customer_id;saveRows('bookings',bookings);}
    return row;
  };
  const validateBookingDraft=data=>{
    const bytes=value=>new TextEncoder().encode(String(value??'').trim()).length;
    const newCustomer=!data.customer_id;
    if(bytes(data.customer_name)>100||bytes(data.contact??data.contact_number)>20)throw new Error('Customer name must be at most 100 characters and contact must be at most 20 characters.');
    if(bytes(data.email)>(newCustomer?100:255))throw new Error(`Email must be at most ${newCustomer?100:255} characters.`);
    if(bytes(data.event_location??data.location)>255)throw new Error('Event location must be at most 255 characters.');
  };
  const moneyCents=value=>{
    const text=String(value??'').trim();
    if(!/^\d{1,8}(?:\.\d{1,2})?$/.test(text))throw new Error('Amount must be non-negative with at most two decimal places.');
    const [whole,fraction='']=text.split('.');
    return Number(whole)*100+Number(fraction.padEnd(2,'0'));
  };
  const centsDecimal=cents=>`${Math.trunc(cents/100)}.${String(cents%100).padStart(2,'0')}`;
  const validatePaymentDraft=(input,old)=>{
    const data={...(old||{}),...input};
    const amountCents=moneyCents(data.amount), status=data.payment_status||'Completed';
    const date=String(data.payment_date||'').trim();
    const reference=data.payment_reference;
    if(amountCents<=0)throw new Error('Enter a payment amount greater than zero.');
    if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)||Number.isNaN(Date.parse(date.replace(' ','T'))))throw new Error('Enter a valid payment date and time.');
    if(new Date(date.replace(' ','T'))>new Date())throw new Error('Payment date cannot be in the future.');
    if(reference!==null&&reference!==undefined&&(!String(reference).trim()||new TextEncoder().encode(String(reference)).length>150))throw new Error('Payment reference must be at most 150 characters.');
    if(status!=='Completed')return;
    const bookingId=data.booking_id;
    const booking=STORAGE.getAll('bookings').find(row=>String(ref('bookings',row.id??row.booking_id))===String(ref('bookings',bookingId)));
    if(!booking)return;
    const priorCents=STORAGE.getAll('payments').filter(row=>String(row.payment_status||'Completed')==='Completed'&&String(row.payment_id)!==String(old?.payment_id)).filter(row=>String(ref('bookings',row.booking_id))===String(ref('bookings',bookingId))).reduce((sum,row)=>sum+moneyCents(row.amount||0),0);
    if(amountCents>Math.max(moneyCents(booking.total||0)-priorCents,0))throw new Error('Completed payment exceeds the remaining booking balance.');
  };
  const actions={
    createCategory:['categories','create'],updateCategory:['categories','update'],deleteCategory:['categories','delete'],
    createService:['services','create'],updateService:['services','update'],deleteService:['services','delete'],
    createAddon:['addons','create'],updateAddon:['addons','update'],deleteAddon:['addons','delete'],
    createRentalItem:['rentalItems','create'],updateRentalItem:['rentalItems','update'],deleteRentalItem:['rentalItems','delete'],
    createGalleryImage:['gallery','create'],updateGalleryImage:['gallery','update'],deleteGalleryImage:['gallery','delete'],
    createBooking:['bookings','create'],updateBooking:['bookings','update'],deleteBooking:['bookings','delete'],createPayment:['payments','create'],updatePayment:['payments','update']
  };
  Object.entries(actions).forEach(([name,[entity,action]])=>{
    API[name]=async function(...args){
      if(!owner())throw new Error('Sign in before saving.');
      if(entity==='bookings'&&action==='update'&&String(args[1]?.status).toLowerCase()==='completed')throw new Error('Complete a return inspection before marking this booking Completed.');
      const id=action==='create'?null:args[0];
      const old=id==null?null:STORAGE.getAll(entity).find(row=>String(row[fields[entity]])===String(id));
      const input=action==='create'?(args[0]||{}):action==='update'?(args[1]||{}):{};
      if(entity==='bookings')validateBookingDraft(input);
      if(entity==='payments'){
        validatePaymentDraft(input,old);
        input.amount=centsDecimal(moneyCents(input.amount??old?.amount));
      }
      let result;
      if(action==='create')result=createLocal(entity,input);
      else if(action==='update')result=updateLocal(entity,id,input);
      else result=deleteLocal(entity,id);
      if(action==='update'&&!result)throw new Error('Record not found on this device.');
      const localId=action==='create'?result[fields[entity]]:id;
      const data=payload(entity,input);if(action!=='create')data.id=localId;
      if(entity==='bookings'&&action==='update'&&old){
        data._base={};
        ['status','event_date','start_time','end_time','event_location','package_id','addon_ids','discount','fees','agreed_total','preparation_minutes','travel_minutes']
          .filter(key=>key in data).forEach(key=>data._base[key]=structuredClone(old[key]??(key==='event_location'?old.location:null)));
        if('service_ids' in data)data._base.service_id=old.service_id??old.service_ids?.[0]??null;
      }
      enqueue(entity,action,data,localId);
        if(entity==='bookings'&&action==='create'){
          upsertLocalCustomer(result);generateLocalChecklist(localId,result.service_ids||[],result.package_id);
        enqueue('bookingItems','generate',{booking_id:localId,service_ids:data.service_ids||[]},localId);
      }
      return result;
    };
  });
  const cachedRead=async(entity,action='all',query='',scope)=>{await read(entity,action,query,scope);return STORAGE.getAll(entity);};
  API.getCategories=()=>cachedRead('categories');
  API.getServices=()=>cachedRead('services');
  API.getActiveServices=async()=> (await API.getServices()).filter(row=>row.status==='Active');
  API.getService=async id=>(await API.getServices()).find(row=>String(row.service_id)===String(id))||null;
  API.getAddons=()=>cachedRead('addons');
  API.getAddonsForService=async id=>(await API.getAddons()).filter(row=>String(row.service_id)===String(id)&&row.status==='Active');
  API.getBookings=()=>cachedRead('bookings');
  API.getBooking=async id=>(await API.getBookings()).find(row=>String(row.id)===String(id))||null;
  API.getPayments=()=>cachedRead('payments');
  API.getRentalItems=()=>cachedRead('rentalItems');
  API.getRentalItemsForService=async id=>(await API.getRentalItems()).filter(row=>String(row.service_id)===String(id));
  API.getGallery=()=>cachedRead('gallery');
  API.getCustomers=async()=>{
    const [customers,bookings]=await Promise.all([cachedRead('customers'),API.getBookings()]);
    return customers.map(customer=>{const customerId=customer._server_id||ref('customers',customer.customer_id);const related=bookings.filter(booking=>String(booking.customer_id)===String(customerId));return {...customer,bookings_count:related.length,total_spent:related.reduce((sum,booking)=>sum+Number(booking.amount_paid||0),0),type:related[0]?.customer_type||customer.type||'Guest / No Account'};});
  };
  const refreshObject=entity=>read(entity,'get').then(data=>{
    if(!data||typeof data!=='object'||Array.isArray(data)||queue().some(op=>op.entity===entity))return data;
    STORAGE.setOne(entity,data);emit('api-data-changed',{entity});return data;
  });
  API.refreshSettings=()=>refreshObject('settings');
  API.refreshWebsiteContent=()=>refreshObject('websiteContent');
  API.getSettings=async()=>{await refreshObject('settings');return STORAGE._get(STORAGE_KEYS.settings,{});};
  API.getWebsiteContent=async()=>{await refreshObject('websiteContent');return STORAGE._get(STORAGE_KEYS.websiteContent,{});};
  const wrapSingletonUpdate=(name,entity,relatedGetter,relatedEntity)=>{
    API[name]=async function(data){
      if(!owner())throw new Error('Sign in before saving.');
      const key=entity==='settings'?STORAGE_KEYS.settings:STORAGE_KEYS.websiteContent;
      const result={...STORAGE._get(key,{}),...data};STORAGE.setOne(entity,result);
      enqueue(entity,'update',result,entity+'-singleton');
      const relatedKey=relatedEntity==='settings'?STORAGE_KEYS.settings:STORAGE_KEYS.websiteContent;
      const related={...STORAGE._get(relatedKey,{})};
      if(entity==='settings')Object.assign(related,{business_name:result.business_name,contact_phone:result.phone,contact_email:result.email,contact_address:result.address,contact_facebook:result.facebook,contact_instagram:result.instagram});
      else Object.assign(related,{business_name:result.business_name,phone:result.contact_phone,email:result.contact_email,address:result.contact_address,facebook:result.contact_facebook,instagram:result.contact_instagram});
      STORAGE.setOne(relatedEntity,related);
      enqueue(relatedEntity,'update',related,relatedEntity+'-singleton');
      return result;
    };
  };
  wrapSingletonUpdate('updateSettings','settings','getWebsiteContent','websiteContent');
  wrapSingletonUpdate('updateWebsiteContent','websiteContent','getSettings','settings');
  API.refreshSharedData=()=>owner()?Promise.all([
    ...['services','categories','packages','addons','rentalItems','checklistTemplates','bookings','payments','customers','gallery'].map(entity=>read(entity)),
    refreshObject('settings'),refreshObject('websiteContent')
  ]):Promise.resolve([]);
  API.getBookingItems=async id=>{if(!String(ref('bookings',id)).startsWith('LOCAL-'))await read('bookingItems','forBooking','&booking_id='+encodeURIComponent(ref('bookings',id)),id);return STORAGE.getAll('bookingItems').filter(row=>String(row.booking_id)===String(id));};
  API.getPaymentsForBooking=async id=>{if(!String(ref('bookings',id)).startsWith('LOCAL-'))await read('payments','all','&booking_id='+encodeURIComponent(ref('bookings',id)),id);return STORAGE.getAll('payments').filter(row=>String(row.booking_id)===String(id));};
  API.getItemHistory=async id=>{if(!String(ref('rentalItems',id)).startsWith('LOCAL-'))await read('itemHistory','forItem','&rental_item_id='+encodeURIComponent(ref('rentalItems',id)),{field:'rental_item_id',value:id});return STORAGE.getAll('itemHistory').filter(row=>String(row.rental_item_id)===String(id));};
  API.generateBookingChecklist=async(id,serviceIds)=>{const booking=STORAGE.getAll('bookings').find(row=>String(row.id)===String(id));const result=generateLocalChecklist(id,serviceIds,booking?.package_id);enqueue('bookingItems','generate',{booking_id:id,service_ids:serviceIds},id);return result;};
  API.updateBookingItem=async(id,data)=>{const row=updateLocal('bookingItems',id,data);if(!row)throw new Error('Checklist item not found on this device.');enqueue('bookingItems','update',{...data,booking_id:row.booking_id,checklist_item_id:row.checklist_item_id,template_item_id:row.template_item_id,rental_item_id:row.rental_item_id},id);return row;};
  API.deleteBookingItem=async id=>{deleteLocal('bookingItems',id);enqueue('bookingItems','delete',{id},id);return true;};
  API.logItemHistory=async entry=>{const row=createLocal('itemHistory',{date:new Date().toISOString(),...entry});enqueue('itemHistory','create',entry,row.history_id);return row;};
  API.recordRelease=async(bookingId,releasedBy,notes)=>{const row=createLocal('itemReleases',{booking_id:bookingId,released_by:releasedBy,notes:notes||'',released_at:new Date().toISOString()});enqueue('itemReleases','create',{booking_id:bookingId,released_by:releasedBy,notes:notes||''},row.release_id);return row;};
  API.recordReturn=async(bookingId,inspectedBy,itemResults,notes)=>{const rows=STORAGE.getAll('bookingItems');for(const item of itemResults){const row=rows.find(value=>String(value.booking_item_id)===String(item.booking_item_id));if(row)Object.assign(row,{returned_qty:item.returned_qty,condition:item.condition,notes:item.notes||notes||'',inspected:true,pending_sync:true});}saveRows('bookingItems',rows);const items=itemResults.map(item=>({checklist_item_id:item.checklist_item_id??item.booking_item_id,template_item_id:item.template_item_id,rental_item_id:item.rental_item_id??null,returned_qty:item.returned_qty,condition:item.condition,notes:item.notes||notes||''}));enqueue('equipment','inspect',{booking_id:bookingId,inspected_by:inspectedBy,items},bookingId);return {booking_id:bookingId,items,pending_sync:true};};
  API.finalizeReturn=async(id,review={})=>{const operation=enqueue('equipment','finalizeReturn',{booking_id:id,...review},id);return {booking_id:id,status:'pending',pending_sync:true,operation_id:operation.client_id};};
  API.getPackages=()=>cachedRead('packages');
  API.getChecklistTemplates=()=>cachedRead('checklistTemplates');
  API.getDeposit=async id=>STORAGE.getAll('deposits').find(r=>String(r.booking_id)===String(id))||{booking_id:id,amount_held:0,deduction_amount:0,deduction_reason:'',refund_amount:0};
  API.refreshDeposit=async id=>{
    if(String(ref('bookings',id)).startsWith('LOCAL-')||!navigator.onLine)return await API.getDeposit(id);
    try{
      const saved=await request('deposits','get',undefined,'&booking_id='+encodeURIComponent(ref('bookings',id)));
      if(dirty('deposits',id))return await API.getDeposit(id);
      const rows=STORAGE.getAll('deposits').filter(r=>String(r.booking_id)!==String(id));
      if(saved)rows.push({...saved,booking_id:id,amount_held:Number(saved.amount_held||0),deduction_amount:Number(saved.deduction_amount||0),refund_amount:Number(saved.refund_amount||0),pending_sync:false});
      saveRows('deposits',rows);emit('api-data-changed',{entity:'deposits'});
      return await API.getDeposit(id);
    }catch(error){emit('api-read-error',{entity:'deposits',message:error.message});return await API.getDeposit(id);}
  };
  API.upsertDeposit=async(id,data)=>{
    const heldCents=moneyCents(data.amount_held),dedCents=moneyCents(data.deduction_amount||0);
    if(heldCents<=0)throw new Error('Held deposit amount must be greater than zero.');
    if(dedCents>heldCents||(dedCents>0&&!String(data.deduction_reason||'').trim()))throw new Error('Enter non-negative amounts, keep deductions within the deposit, and give a reason for deductions.');
    const existing=await API.getDeposit(id),existingCents=moneyCents(existing.amount_held||0);
    const repairableZero=Boolean(existing.deposit_id)&&existingCents===0&&String(existing.refund_status||'Held')==='Held'&&!existing.refund_date&&moneyCents(existing.deduction_amount||0)===0&&!(existing.deductions||[]).length;
    if((existing.deposit_id||existing.pending_sync)&&heldCents!==existingCents&&!repairableZero)throw new Error('An existing held amount cannot be overwritten.');
    const held=heldCents/100,ded=dedCents/100,refund=(heldCents-dedCents)/100;
    const rows=STORAGE.getAll('deposits').filter(r=>String(r.booking_id)!==String(id));const result={...data,booking_id:id,amount_held:held,deductions:[],deduction_amount:ded,refund_amount:refund,refund_status:'Held',pending_sync:true};rows.push(result);saveRows('deposits',rows);enqueue('deposits','upsert',result,id);return result;
  };
  API.addDepositDeduction=async(id,data)=>{
    const deposit=await API.getDeposit(id),amountCents=moneyCents(data.amount),heldCents=moneyCents(deposit.amount_held||0),currentCents=moneyCents(deposit.deduction_amount||0);
    if(!deposit.deposit_id&&!deposit.pending_sync)throw new Error('Save the held deposit before adding deductions.');
    if(amountCents<=0||!String(data.affected_item||'').trim()||!String(data.reason||'').trim()||currentCents+amountCents>heldCents)throw new Error('Enter an affected item, reason, and amount within the held deposit.');
    const amount=amountCents/100;
    const deduction={deduction_id:'LOCAL-deduction-'+uuid(),affected_item:data.affected_item,reason:data.reason,amount,recorded_at:new Date().toISOString(),pending_sync:true};
    Object.assign(deposit,{deductions:[...(deposit.deductions||[]),deduction],deduction_amount:(currentCents+amountCents)/100,refund_amount:(heldCents-currentCents-amountCents)/100,pending_sync:true});
    saveRows('deposits',STORAGE.getAll('deposits').map(row=>String(row.booking_id)===String(id)?deposit:row));
    enqueue('deposits','deduct',{booking_id:id,affected_item:data.affected_item,reason:data.reason,amount},id);return deposit;
  };
  API.refundDeposit=async id=>{
    const deposit=await API.getDeposit(id);
    if(Number(deposit.refund_amount||0)<=0)throw new Error('No refundable balance remains for this deposit.');
    if(queue().some(operation=>operation.entity==='deposits'&&operation.action==='refund'&&(String(operation.local_id)===String(id)||String(operation.data?.booking_id)===String(id))))throw new Error('This deposit refund is already pending synchronization.');
    Object.assign(deposit,{refund_pending:true,pending_sync:true});
    saveRows('deposits',STORAGE.getAll('deposits').map(row=>String(row.booking_id)===String(id)?deposit:row));
    enqueue('deposits','refund',{booking_id:id},id);return deposit;
  };
  API.getDelivery=async id=>STORAGE.getAll('delivery').find(r=>String(r.booking_id)===String(id))||{booking_id:id,delivery_method:'self_pickup',delivery_fee:0,fee_shouldered_by:'renter'};
  API.refreshDelivery=async id=>{
    if(String(ref('bookings',id)).startsWith('LOCAL-')||!navigator.onLine)return await API.getDelivery(id);
    try{
      const saved=await request('delivery','get',undefined,'&booking_id='+encodeURIComponent(ref('bookings',id)));
      if(dirty('delivery',id))return await API.getDelivery(id);
      const rows=STORAGE.getAll('delivery').filter(r=>String(r.booking_id)!==String(id));
      if(saved)rows.push({...saved,booking_id:id,delivery_fee:Number(saved.delivery_fee||0),pending_sync:false});
      saveRows('delivery',rows);emit('api-data-changed',{entity:'delivery'});
      return await API.getDelivery(id);
    }catch(error){emit('api-read-error',{entity:'delivery',message:error.message});return await API.getDelivery(id);}
  };
  API.upsertDelivery=async(id,data)=>{
    const fee=Number(data.delivery_fee);
    if(!['self_pickup','lalamove','owner_delivered'].includes(data.delivery_method)||!['renter','owner','included','Customer','Owner','Included in package'].includes(data.fee_shouldered_by)||!Number.isFinite(fee)||fee<0)throw new Error('Choose a delivery method and fee arrangement, and enter a non-negative delivery fee.');
    if(!owner())throw new Error('Sign in before saving delivery details.');
    const record={booking_id:id,delivery_method:data.delivery_method,delivery_fee:fee,fee_shouldered_by:data.fee_shouldered_by,delivery_notes:data.delivery_notes||null,pending_sync:true};
    const rows=STORAGE.getAll('delivery').filter(r=>String(r.booking_id)!==String(id));rows.push(record);saveRows('delivery',rows);
    enqueue('delivery','upsert',{booking_id:id,delivery_method:record.delivery_method,delivery_fee:fee,fee_shouldered_by:record.fee_shouldered_by,delivery_notes:record.delivery_notes},id);
    return record;
  };
  API.getSyncQueue=queue;
  API.discardSyncOperation=id=>{
    const operation=queue().find(row=>row.client_id===id);
    if(!operation)return null;
    localStorage.removeItem(prefix+id);reads.clear();
    const field=fields[operation.entity],rows=field?STORAGE.getAll(operation.entity):[];
    const row=rows.find(value=>String(value[field])===String(operation.local_id));
    if(row){row.pending_sync=dirty(operation.entity,operation.local_id);saveRows(operation.entity,rows);}
    emit('sync-state-changed');
    return operation;
  };
  API.ready=STORAGE.restoreCache().catch(error=>{emit('api-read-error',{entity:'offline cache',message:error.message});});
  API.retrySyncOperation=(id,patch={})=>{
    const op=queue().find(r=>r.client_id===id);if(!op)return;
    const corrected={...op.data,...patch};
    if(op.entity==='payments'){
      const old=STORAGE.getAll('payments').find(row=>String(row.payment_id)===String(op.local_id));
      validatePaymentDraft(corrected,old);
      corrected.amount=centsDecimal(moneyCents(corrected.amount));
      if(old){Object.assign(old,corrected,{pending_sync:true});saveRows('payments',STORAGE.getAll('payments'));}
    }
    if(op.entity==='deposits'){
      const field=op.action==='upsert'?'amount_held':'amount';
      if(field in corrected){const cents=moneyCents(corrected[field]);if(cents<=0)throw new Error('Enter an amount greater than zero.');corrected[field]=centsDecimal(cents);}
    }
    op.data=corrected;if(op.conflict_kind==='stale'&&op.server_record&&op.data._base)Object.keys(op.data._base).forEach(k=>op.data._base[k]=op.server_record[k]);
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
          if(op.entity==='deposits')applyAcceptedDeposit(op,ack.data);
          if(ack.server_id&&op.action==='create'){
            const aliases=STORAGE._get('er_sync_ids',{});aliases[op.entity+':'+op.local_id]=ack.server_id;STORAGE._set('er_sync_ids',aliases);
            remapAcceptedId(op.entity,op.local_id,ack.server_id,ack.data);
            if(!['bookings','payments'].includes(op.entity)){
              const rows=STORAGE.getAll(op.entity);const row=rows.find(r=>String(r[fields[op.entity]])===String(op.local_id));if(row){row._server_id=ack.server_id;STORAGE.saveAll(op.entity,rows);}
            }
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
