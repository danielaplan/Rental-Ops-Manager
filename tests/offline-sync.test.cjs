const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const BASE = process.env.AKAD_TEST_BASE_URL || "http://127.0.0.1:8017/",
  BASE2 = process.env.AKAD_TEST_BASE_URL_2 || "http://127.0.0.1:8018/";
const RUN = crypto.randomUUID().slice(0, 8),
  YEAR = crypto.randomInt(2100, 9999),
  PAST_DATE = new Date(Date.UTC(
    crypto.randomInt(2000, 2026),
    crypto.randomInt(0, 12),
    crypto.randomInt(1, 28),
  )).toISOString().slice(0, 10);
let testChecklistTemplates = [],
  testOwnerToken = null,
  testChecklistCount = 0;
const results = [];
const test = async (name, fn) => {
  const at = performance.now();
  await fn();
  results.push({
    name,
    passed: true,
    ms: Number((performance.now() - at).toFixed(2)),
  });
  console.log("PASS", name);
};
class MemoryStorage {
  constructor(map = new Map()) {
    this.map = map;
  }
  get length() {
    return this.map.size;
  }
  key(i) {
    return [...this.map.keys()][i] || null;
  }
  getItem(k) {
    return this.map.get(k) ?? null;
  }
  setItem(k, v) {
    this.map.set(k, String(v));
  }
  removeItem(k) {
    this.map.delete(k);
  }
}
const evalIn = (ctx, code) => vm.runInContext(code, ctx);
function device(
  token,
  userId = 1,
  storage = new MemoryStorage(),
  origin = BASE,
) {
  const events = new EventTarget(),
    timers = [];
  const ctx = vm.createContext({
    console,
    localStorage: storage,
    URL,
    crypto: crypto.webcrypto,
    structuredClone,
    AbortSignal,
    CustomEvent,
    navigator: { onLine: false, locks: { request: async (name, fn) => fn() } },
    document: { currentScript: { src: origin + "js/sync.js" }, hidden: false },
    fetch: (url, options) => fetch(url, options),
  });
  ctx.window = {
    location: { pathname: "/admin/bookings.html" },
    addEventListener: events.addEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
    setTimeout: (fn) => {
      timers.push(fn);
      return timers.length;
    },
    setInterval: (fn) => {
      ctx.interval = fn;
    },
  };
  vm.runInContext(fs.readFileSync("js/storage.js", "utf8"), ctx);
  evalIn(
    ctx,
    "STORAGE.saveAll('checklistTemplates'," +
      JSON.stringify(testChecklistTemplates) +
      ");",
  );
  evalIn(
    ctx,
    "STORAGE._set(STORAGE_KEYS.adminSession," +
      JSON.stringify({ session_token: token, user: { user_id: userId } }) +
      ");",
  );
  vm.runInContext(fs.readFileSync("js/api.js", "utf8"), ctx);
  vm.runInContext(fs.readFileSync("js/sync.js", "utf8"), ctx);
  evalIn(
    ctx,
    "STORAGE.saveAll('rentalItems',[{rental_item_id:'RI-001',service_id:'SVC-001',name:'Test speaker',quantity:2,required:true}]);",
  );
  ctx.events = events;
  return ctx;
}
const booking = (name, date = "2099-05-01", service = 1) => ({
  customer_name: name + " " + RUN,
  contact: "TEST-" + crypto.randomUUID().slice(0, 12),
  service_ids: ["SVC-" + String(service).padStart(3, "0")],
  package_id: service === 1 ? 1 : 3,
  event_date: date.replace("2099", String(YEAR)),
  start_time: "14:00",
  end_time: "18:00",
  location: "Synthetic test venue",
  status: "Confirmed",
  total: 2500,
  subtotal: 2500,
});
const create = (ctx, data) =>
  evalIn(ctx, "API.createBooking(" + JSON.stringify(data) + ")");
const q = (ctx) => evalIn(ctx, "API.getSyncQueue()");
async function login(origin = BASE) {
  const r = await fetch(origin + "api/auth.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact_number: "TEST-OWNER",
      password: "OfflineTest!2026",
    }),
  });
  const e = await r.json();
  assert.equal(e.ok, true);
  return e.data.session_token;
}
async function get(path, origin = BASE) {
  const response = await fetch(origin + path, {
    headers: { Authorization: "Bearer " + testOwnerToken },
  });
  const result = await response.json();
  assert.equal(response.ok, true, JSON.stringify(result));
  return result.data;
}
(async () => {
  const token = await login(),
    token2 = await login(BASE2);
  testOwnerToken = token;
  const templatesResponse = await fetch(BASE + "api/checklistTemplates.php?do=all", {
    headers: { Authorization: "Bearer " + token },
  });
  assert.equal(templatesResponse.status, 200);
  testChecklistTemplates = (await templatesResponse.json()).data;
  if (!testChecklistTemplates.some(template =>
    Number(template.package_id) === 1 && template.status === "Active"
  )) {
    const templateResponse = await fetch(BASE + "api/checklistTemplates.php?do=create", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        package_id: 1,
        template_name: "Offline sync " + RUN,
        items: [{ item_name: "Test speaker", expected_quantity: 2 }],
      }),
    });
    assert.equal(templateResponse.status, 200);
    const refreshedTemplates = await fetch(
      BASE + "api/checklistTemplates.php?do=all",
      { headers: { Authorization: "Bearer " + token } },
    );
    testChecklistTemplates = (await refreshedTemplates.json()).data;
  }
  let a, b, localId, serverId;
  await test("offline booking, deposit, payment, and full checklist survive reload", async () => {
    a = device(token);
    const row = await create(a, booking("Device A"));
    localId = row.id;
    await evalIn(
      a,
      "API.upsertDeposit(" +
        JSON.stringify(localId) +
        ",{amount_held:350,deduction_amount:50,deduction_reason:'Cleaning'});",
    );
    await evalIn(
      a,
      "API.createPayment({booking_id:" +
        JSON.stringify(localId) +
        ",amount:200,method:'GCash',notes:'Negotiated down payment'});",
    );
    const offlineChecklist = await evalIn(
      a,
      "API.getBookingItems(" + JSON.stringify(localId) + ")",
    );
    const item = offlineChecklist[0];
    testChecklistCount = offlineChecklist.length;
    assert.ok(item.template_item_id);
    const inspectionResults = offlineChecklist.map(checklistItem => ({
      booking_item_id: checklistItem.booking_item_id,
      template_item_id: checklistItem.template_item_id,
      rental_item_id: checklistItem.rental_item_id,
      returned_qty: checklistItem.expected_qty,
      expected_qty: checklistItem.expected_qty,
      condition: "Good",
      notes: "Offline inspection",
    }));
    for (const checklistItem of offlineChecklist) {
      await evalIn(
        a,
        "API.updateBookingItem(" +
          JSON.stringify(checklistItem.booking_item_id) +
          ",{checked_released:true});",
      );
    }
    await evalIn(
      a,
      "API.recordReturn(" +
        JSON.stringify(localId) +
        ',"Test owner",' +
        JSON.stringify(inspectionResults) +
        ',"");',
    );
    assert.equal(q(a).length, 5 + testChecklistCount);
    assert.equal(q(a)[0].status, "pending");
    assert.ok(localId.startsWith("LOCAL-"));
    a = device(token, 1, a.localStorage);
    assert.equal(q(a).length, 5 + testChecklistCount);
    assert.equal(
      (await evalIn(a, "API.getBooking(" + JSON.stringify(localId) + ")")).pending_sync,
      true,
    );
  });
  await test("reconnect uploads all entries in under 30 seconds with correct database links", async () => {
    a.navigator.onLine = true;
    const at = performance.now();
    const data = await evalIn(a, "API.flushSyncQueue()");
    assert.equal(data.failed.length, 0, JSON.stringify(data));
    assert.equal(data.conflicts.length, 0, JSON.stringify(data));
    assert.equal(q(a).length, 0);
    assert.ok(performance.now() - at < 30000);
    serverId = evalIn(
      a,
      'STORAGE._get("er_sync_ids",{})[' +
        JSON.stringify("bookings:" + localId) +
        "]",
    );
    const row = await get("api/bookings.php?do=get&id=" + serverId);
    assert.equal(Number(row.amount_paid), 200);
    assert.equal(Number(row.agreed_total), 2500);
    assert.equal(row.package_name_snapshot, "Standard Karaoke (up to 4 hrs)");
    assert.equal(row.payment_status, "Partially Paid");
    const dep = await get("api/deposits.php?do=get&booking_id=" + serverId);
    assert.equal(Number(dep.refund_amount), 300);
    const items = await get(
      "api/bookingItems.php?do=forBooking&booking_id=" + serverId,
    );
    assert.equal(items.length, testChecklistCount);
    assert.ok(items.every(item => Number(item.returned_qty) === Number(item.expected_qty)));
    assert.ok(items.every(item => item.condition_in === "Good" && item.checked_by));
  });
  await test("independent device retrieves the same accepted booking and negotiated amounts", async () => {
    b = device(token2, 1, new MemoryStorage(), BASE2);
    b.navigator.onLine = true;
    await evalIn(b, "API.refreshSharedData()");
    const row = evalIn(b, 'STORAGE.getAll("bookings")').find(
      (r) => Number(r._server_id) === Number(serverId),
    );
    assert.ok(row);
    assert.equal(row.amount_paid, 200);
    assert.equal(row.payment_status, "Partially Paid");
    assert.equal(row.pending_sync, false);
  });
  await test("conflicting offline booking and dependent checklist are retained through reload", async () => {
    b.navigator.onLine = false;
    const row = await create(b, booking("Device B conflict"));
    b.navigator.onLine = true;
    const data = await evalIn(b, "API.flushSyncQueue()");
    assert.equal(data.conflicts.length, 1);
    assert.equal(data.failed.length, 1);
    assert.equal(q(b).length, 2);
    b = device(token2, 1, b.localStorage, BASE2);
    assert.equal(
      q(b).find((op) => op.entity === "bookings").status,
      "conflict",
    );
    assert.equal(
      (await evalIn(b, "API.getBooking(" + JSON.stringify(row.id) + ")")).customer_name,
      "Device B conflict " + RUN,
    );
    b.navigator.onLine = true;
    const op = q(b).find((op) => op.entity === "bookings");
    await evalIn(
      b,
      "API.retrySyncOperation(" +
        JSON.stringify(op.client_id) +
        "," +
        JSON.stringify({ event_date: YEAR + "-05-02" }) +
        ")",
    );
    assert.equal(q(b).length, 0);
    const accepted = await get("api/bookings.php?do=all");
    assert.ok(
      accepted.some(
        (r) =>
          r.customer_name === "Device B conflict " + RUN &&
          r.event_date === YEAR + "-05-02",
      ),
    );
  });
  await test("lost response retries without duplicate bookings or payments", async () => {
    const c = device(token);
    const row = await create(c, booking("Lost acknowledgement", "2099-05-03"));
    await evalIn(
      c,
      "API.createPayment({booking_id:" +
        JSON.stringify(row.id) +
        ',amount:125,method:"GCash"});',
    );
    c.navigator.onLine = true;
    let drop = true;
    c.fetch = async (url, opts) => {
      const response = await fetch(url, opts);
      if (String(url).includes("sync.php") && drop) {
        drop = false;
        await response.text();
        throw new TypeError("Simulated lost response after commit");
      }
      return response;
    };
    await evalIn(c, "API.flushSyncQueue()");
    assert.equal(q(c).length, 3);
    await evalIn(c, "API.flushSyncQueue()");
    assert.equal(q(c).length, 0);
    const list = await get("api/bookings.php?do=all");
    const matches = list.filter(
      (r) => r.customer_name === "Lost acknowledgement " + RUN,
    );
    assert.equal(matches.length, 1);
    const payments = await get(
      "api/payments.php?do=all&booking_id=" + matches[0].booking_id,
    );
    assert.equal(payments.length, 1);
    assert.equal(Number(payments[0].amount), 125);
  });
  await test("stale status edits require review instead of overwriting another device", async () => {
    const c = device(token);
    c.navigator.onLine = true;
    await evalIn(c, "API.refreshSharedData()");
    const own = evalIn(c, 'STORAGE.getAll("bookings")').find(
      (r) => Number(r._server_id) === Number(serverId),
    );
    c.navigator.onLine = false;
    await evalIn(
      c,
      "API.updateBooking(" + JSON.stringify(own.id) + ',{status:"Cancelled",cancellation_reason:"Owner cancellation draft"});',
    );
    const res = await fetch(
      BASE2 + "api/bookings.php?do=update&id=" + serverId,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token2,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled", cancellation_reason: "Cancelled on another device" }),
      },
    );
    assert.equal(res.status, 200);
    c.navigator.onLine = true;
    const data = await evalIn(c, "API.flushSyncQueue()");
    assert.equal(data.conflicts.length, 1);
    assert.equal(q(c)[0].status, "conflict");
    const row = await get("api/bookings.php?do=get&id=" + serverId);
    assert.equal(row.status, "Cancelled");
    assert.equal(row.cancellation_reason, "Cancelled on another device");
  });
  await test("non-karaoke bookings do not conflict with karaoke; invalid ranges stay rejected", async () => {
    const c = device(token);
    await create(c, booking("Other service", "2099-05-04", 2));
    await create(c, booking("Karaoke on same day", "2099-05-04"));
    c.navigator.onLine = true;
    const data = await evalIn(c, "API.flushSyncQueue()");
    assert.equal(data.conflicts.length, 0);
    assert.equal(data.failed.length, 0);
    const r = await fetch(BASE + "api/bookings.php?do=create", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...booking("Invalid time", "2099-05-05"),
        start_time: "18:00",
        end_time: "14:00",
      }),
    });
    assert.equal(r.status, 400);
  });
  await test("direct booking creation generates an idempotent checklist", async () => {
    const customerResponse = await fetch(BASE + "api/customers.php?do=create", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Direct checklist " + RUN,
        contact_number: "DIRECT-" + RUN,
      }),
    });
    const customerResult = await customerResponse.json();
    assert.equal(customerResponse.status, 201, JSON.stringify(customerResult));
    const response = await fetch(BASE + "api/bookings.php?do=create", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...booking("Direct checklist", "2099-05-06"),
        customer_id: customerResult.data.customer_id,
        service_id: 1,
        service_ids: [1],
        status: "Pending",
      }),
    });
    const createResult = await response.json();
    assert.equal(response.status, 201, JSON.stringify(createResult));
    const saved = createResult.data;
    let items = await get("api/bookingItems.php?do=forBooking&booking_id=" + saved.id);
    assert.equal(items.length, 1);
    const update = await fetch(BASE + "api/bookingItems.php?do=update&id=" + items[0].booking_item_id, {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ checked_released: 1 }),
    });
    assert.equal(update.status, 200);
    const regenerate = await fetch(BASE + "api/bookingItems.php?do=generate", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: saved.id, service_ids: [1] }),
    });
    assert.equal(regenerate.status, 200);
    items = await get("api/bookingItems.php?do=forBooking&booking_id=" + saved.id);
    assert.equal(items.length, 1);
    assert.equal(Number(items[0].quantity_released), Number(items[0].expected_quantity));
  });
  await test("new services preserve a submitted inactive status", async () => {
    const response = await fetch(BASE + "api/services.php?do=create", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ service_name: "Inactive " + RUN, description: "Verification", status: "Inactive" }),
    });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).data.status, "Inactive");
  });
  await test("deposit bounds and deduction reasons are enforced without a fixed minimum", async () => {
    const c = device(token);
    await assert.rejects(() =>
      evalIn(
        c,
        "API.upsertDeposit(" +
          serverId +
          ',{amount_held:300,deduction_amount:400,deduction_reason:"Damage"});',
      ),
    );
    const r = await fetch(BASE + "api/deposits.php?do=upsert", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: serverId,
        amount_held: 75,
        deduction_amount: 5,
        deduction_reason: "",
      }),
    });
    assert.equal(r.status, 400);
  });
  await test("future bookings cannot be finalized before the post-event review", async () => {
    const c = device(token);
    const draft = await create(c, { ...booking("Future pending review", "2099-05-11"), status: "Pending" });
    await evalIn(c, "API.finalizeReturn(" + JSON.stringify(draft.id) + ");");
    c.navigator.onLine = true;
    const data = await evalIn(c, "API.flushSyncQueue()");
    assert.equal(data.failed.length, 1);
    assert.match(data.failed[0].reason, /Only bookings awaiting completion/);
    const id = evalIn(c, 'STORAGE._get("er_sync_ids",{})[' + JSON.stringify("bookings:" + draft.id) + "]");
    const row = await get("api/bookings.php?do=get&id=" + id);
    assert.equal(row.status, "Pending");
  });
  await test("completed package inspection and explicit post-event review release a due booking", async () => {
    const sourceBooking = await get("api/bookings.php?do=get&id=" + serverId);
    const response = await fetch(BASE + "api/bookings.php?do=create", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: sourceBooking.customer_id,
        service_id: 1,
        service_ids: [1],
        package_id: 1,
        event_date: PAST_DATE,
        start_time: "14:00",
        end_time: "18:00",
        location: "Synthetic post-event review",
        status: "Confirmed",
      }),
    });
    const created = await response.json();
    assert.equal(response.status, 201, JSON.stringify(created));
    const bookingId = created.data.id;
    const dueBooking = await get("api/bookings.php?do=get&id=" + bookingId);
    assert.equal(dueBooking.status, "Awaiting Completion");
    const checklist = await get(
      "api/bookingItems.php?do=forBooking&booking_id=" + bookingId,
    );
    assert.ok(checklist.length);
    for (const item of checklist) {
      const released = await fetch(
        BASE + "api/bookingItems.php?do=update&id=" + item.checklist_item_id,
        {
          method: "POST",
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ checked_released: true }),
        },
      );
      assert.equal(released.status, 200);
    }
    const inspection = await fetch(BASE + "api/equipment.php?do=inspect", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: bookingId,
        items: checklist.map(item => ({
          checklist_item_id: item.checklist_item_id,
          returned_qty: item.expected_qty,
          condition: "Good",
        })),
      }),
    });
    assert.equal(inspection.status, 200, await inspection.text());
    const c = device(token);
    await evalIn(
      c,
      "API.finalizeReturn(" +
        bookingId +
        ",{service_ready:true,payments_reviewed:true,deposits_reviewed:true,review_notes:'Reviewed offline return'});",
    );
    c.navigator.onLine = true;
    const finalized = await evalIn(c, "API.flushSyncQueue()");
    assert.equal(finalized.failed.length, 0, JSON.stringify(finalized));
    let result = await get("api/bookings.php?do=get&id=" + bookingId);
    assert.equal(result.status, "Awaiting Payment");
    assert.equal(result.review_notes, "Reviewed offline return");
    const payment = await fetch(BASE + "api/payments.php?do=create", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: bookingId,
        amount: result.agreed_total,
        payment_method: "GCash",
        payment_status: "Completed",
        payment_date: "2026-10-16 12:00:00",
      }),
    });
    assert.equal(payment.status, 201, await payment.text());
    await evalIn(c, "API.finalizeReturn(" + bookingId + ");");
    const paidFinalization = await evalIn(c, "API.flushSyncQueue()");
    assert.equal(paidFinalization.failed.length, 0, JSON.stringify(paidFinalization));
    result = await get("api/bookings.php?do=get&id=" + bookingId);
    assert.equal(result.status, "Completed");
  });
  await test("different signed-in user cannot upload another user outbox", async () => {
    const c = device(token);
    create(c, booking("Account-bound draft", "2099-05-06"));
    const d = device(token, 2, c.localStorage);
    assert.equal(q(d).length, 0);
  });
  await test("simultaneous karaoke confirmations serialize across two PHP processes", async () => {
    const customerResponse = await fetch(BASE + "api/customers.php?do=create", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Concurrent " + RUN,
        contact_number: "CONCURRENT-" + RUN,
      }),
    });
    const customer = (await customerResponse.json()).data;
    const data = {
        ...booking("Concurrent A", "2099-05-07", 2),
        customer_id: customer.customer_id,
          service_id: 2,
          service_ids: [2],
      },
      other = {
          ...booking("Concurrent B", "2099-05-07", 2),
        customer_id: customer.customer_id,
          service_id: 2,
          service_ids: [2],
      };
    const send = (origin, body) =>
      fetch(origin + "api/bookings.php?do=create", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    const responses = await Promise.all([send(BASE, data), send(BASE2, other)]);
    assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
  });
  await test("online event automatically uploads a persisted offline draft", async () => {
    const c = device(token);
    create(c, booking("Automatic reconnect", "2099-05-08"));
    c.navigator.onLine = true;
    const at = performance.now();
    c.events.dispatchEvent(new Event("online"));
    while (q(c).length && performance.now() - at < 30000)
      await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(q(c).length, 0, JSON.stringify({ queue: q(c), lastError: evalIn(c, 'STORAGE._get("er_sync_last_error",null)') }));
    assert.ok(performance.now() - at < 30000);
  });
  await test("periodic retry uploads when connection returns without an online event", async () => {
    const c = device(token);
    await create(c, booking("Periodic reconnect", "2099-05-09"));
    c.navigator.onLine = true;
    c.interval();
    await evalIn(c, "API.flushSyncQueue()");
    assert.equal(q(c).length, 0);
  });
  await test("incomplete inspection cannot finalize a return", async () => {
    const c = device(token),
      row = await create(c, booking("Incomplete return", "2099-05-10"));
    await evalIn(c, "API.finalizeReturn(" + JSON.stringify(row.id) + ");");
    c.navigator.onLine = true;
    const data = await evalIn(c, "API.flushSyncQueue()");
    assert.equal(data.failed.length, 1);
    assert.equal(q(c).length, 1);
    const id = evalIn(
      c,
      'STORAGE._get("er_sync_ids",{})[' +
        JSON.stringify("bookings:" + row.id) +
        "]",
    );
    assert.notEqual(
      (await get("api/bookings.php?do=get&id=" + id)).status,
      "completed",
    );
  });
  fs.writeFileSync(
    process.env.AKAD_TEST_OFFLINE_RESULTS || "tests/offline-sync-results.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        environment:
          "Two independent storage clients, live PHP/MySQL, synthetic isolated database",
        results,
      },
      null,
      2,
    ),
  );
  console.log(results.length + " integration checks passed.");
})().catch((error) => {
  if (error?.cause?.code === "ECONNREFUSED") {
    console.error("Offline verification server is not running. Run: rtk proxy python tests/start_verification.py");
  }
  console.error(error);
  process.exitCode = 1;
});
