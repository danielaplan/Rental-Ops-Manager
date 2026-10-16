const assert = require("node:assert/strict");

const BASE = process.env.AKAD_TEST_BASE_URL || "http://127.0.0.1:8017/";
const BASE2 = process.env.AKAD_TEST_BASE_URL_2 || "http://127.0.0.1:8018/";
const excludeBlockouts = process.env.AKAD_TEST_EXCLUDE_DEFERRED_BLOCKOUTS === '1';
const YEAR = 2100 + Math.floor(Math.random() * 7000);

async function request(path, { origin = BASE, token, method = "GET", body } = {}) {
  const response = await fetch(new URL(path, origin), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}

(async () => {
  const anonymous = await request("api/notifications.php");
  assert.equal(anonymous.status, 401);
  for (const path of [
    "api/categories.php",
    "api/customers.php",
    "api/rentalItems.php",
    "api/itemHistory.php",
    "api/itemReleases.php",
    "api/settings.php",
    "api/sync.php?do=queue",
    "api/reports.php?do=dashboard",
    "api/audit.php",
  ]) {
    assert.equal((await request(path)).status, 401, `${path} should require authentication`);
  }
  for (const path of [
    "api/services.php",
    "api/packages.php",
    "api/addons.php",
    "api/gallery.php",
    "api/websiteContent.php",
  ]) {
    assert.equal((await request(path)).status, 200, `${path} is an approved public-content read`);
  }

  const login = await request("api/auth.php", {
    method: "POST",
    body: { contact_number: "TEST-OWNER", password: "OfflineTest!2026" },
  });
  assert.equal(login.status, 200);
  const token = login.data.data.session_token;
  assert.equal((await request('api/audit.php?do=delete', { token, method: 'POST', body: {} })).status, 405);
  assert.equal((await request('api/notifications.php?do=resolve', { token, method: 'POST', body: {} })).status, 405);

  const notifications = await request("api/notifications.php?do=unresolved", { token });
  assert.equal(notifications.status, 200);
  assert.ok(Array.isArray(notifications.data.data));

  const date = `${YEAR}-05-01`;
  let blockId;
  if (!excludeBlockouts) {
  const block = await request("api/availabilityBlocks.php?do=create", {
    token,
    method: "POST",
    body: {
      service_id: null,
      start_datetime: `${date}T10:00:00`,
      end_datetime: `${date}T12:00:00`,
      reason: "Synthetic verification block",
    },
  });
  assert.equal(block.status, 201, JSON.stringify(block.data));
  blockId = block.data.data.block_id;
  } else console.log('EXCLUDED legacy internal blockout draft checks: deferred scope');

  const booking = {
    customer_name: "Verification Customer",
    contact: `VERIFY-${Date.now()}`,
    service_ids: ["1"],
    package_id: 1,
    event_date: date,
    start_time: "10:30",
    end_time: "11:30",
    location: "Synthetic verification venue",
    status: "Confirmed",
  };
  if (!excludeBlockouts) {
  const blockedBooking = await request("api/bookings.php?do=create", {
    token,
    method: "POST",
    body: booking,
  });
  assert.equal(blockedBooking.status, 409, JSON.stringify(blockedBooking.data));
  assert.equal(blockedBooking.data.code, "conflict");

  const deactivated = await request(`api/availabilityBlocks.php?do=deactivate&id=${blockId}`, {
    token,
    method: "POST",
    body: {},
  });
  assert.equal(deactivated.status, 200, JSON.stringify(deactivated.data));
  assert.equal(deactivated.data.data.status, "Inactive");
  }

  const acceptedBooking = await request("api/bookings.php?do=create", {
    token,
    method: "POST",
    body: booking,
  });
  assert.equal(acceptedBooking.status, 201, JSON.stringify(acceptedBooking.data));
  const acceptedBookingId = acceptedBooking.data.data.booking_id;

  const downPayment = await request("api/payments.php?do=create", {
    token,
    method: "POST",
    body: { booking_id: acceptedBookingId, amount: 200, payment_method: "GCash", notes: "Synthetic first payment" },
  });
  assert.equal(downPayment.status, 201, JSON.stringify(downPayment.data));
  assert.equal(downPayment.data.data.payment_type, "Down payment");
  assert.equal(downPayment.data.data.payment_status, "Completed");
  const balancePayment = await request("api/payments.php?do=create", {
    token,
    method: "POST",
    body: { booking_id: acceptedBookingId, amount: 2300, payment_method: "MariBank", notes: "Synthetic settlement" },
  });
  assert.equal(balancePayment.status, 201, JSON.stringify(balancePayment.data));
  assert.equal(balancePayment.data.data.payment_type, "Balance");

  const itemHistory = await request("api/itemHistory.php?do=create", {
    token,
    method: "POST",
    body: { rental_item_id: 1, booking_id: acceptedBookingId, action: "Released", qty: 1, condition: "Good" },
  });
  assert.equal(itemHistory.status, 201, JSON.stringify(itemHistory.data));
  assert.equal((await request("api/itemHistory.php?do=delete", { token, method: "POST", body: {} })).status, 405);
  const release = await request("api/itemReleases.php?do=create", {
    token,
    method: "POST",
    body: { booking_id: acceptedBookingId, released_by: "Owner", notes: "Synthetic test release" },
  });
  assert.equal(release.status, 201, JSON.stringify(release.data));
  assert.equal((await request("api/itemReleases.php?do=delete", { token, method: "POST", body: {} })).status, 405);

  const deposit = await request("api/deposits.php?do=upsert", {
    token,
    method: "POST",
    body: { booking_id: acceptedBookingId, amount_held: 100 },
  });
  assert.equal(deposit.status, 200, JSON.stringify(deposit.data));
  const refundRace = await Promise.all([
    request("api/deposits.php?do=deduct", {
      token,
      method: "POST",
      body: { booking_id: acceptedBookingId, amount: 100, affected_item: "Synthetic item", reason: "Synthetic test deduction" },
    }),
    request("api/deposits.php?do=refund", {
      origin: BASE2,
      token,
      method: "POST",
      body: { booking_id: acceptedBookingId },
    }),
  ]);
  assert.equal(refundRace.filter((result) => result.status === 200).length, 1);
  assert.ok(refundRace.every((result) => [200, 400, 409].includes(result.status)));

  const overlappingRequest = () => request("api/bookings.php?do=create", {
    token,
    method: "POST",
    body: {
      ...booking,
      contact: `VERIFY-${Math.random().toString(36).slice(2, 14)}`,
      event_date: `${YEAR}-06-01`,
      start_time: "10:00",
      end_time: "11:00",
    },
  });
  const simultaneous = await Promise.all([
    overlappingRequest(),
    request("api/bookings.php?do=create", {
      origin: BASE2,
      token,
      method: "POST",
      body: {
        ...booking,
        contact: `VERIFY-${Math.random().toString(36).slice(2, 14)}`,
        event_date: `${YEAR}-06-01`,
        start_time: "10:00",
        end_time: "11:00",
      },
    }),
  ]);
  assert.deepEqual(simultaneous.map((result) => result.status).sort(), [201, 409]);

  const invalidReport = await request("api/reports.php?do=report&start=2099-02-30&end=2099-03-01", { token });
  assert.equal(invalidReport.status, 400);

  const dashboard = await request("api/reports.php?do=dashboard", { token });
  assert.equal(dashboard.status, 200, JSON.stringify(dashboard.data));
  assert.ok(Object.hasOwn(dashboard.data.data.balances, "outstanding_balances"));
  assert.ok(Object.hasOwn(dashboard.data.data.balances, "failed_payments"));

  const secondaryLogin = await request("api/auth.php", {
    method: "POST",
    body: { username: "juan", password: "password" },
  });
  assert.equal(secondaryLogin.status, 200);
  const secondaryToken = secondaryLogin.data.data.session_token;
  assert.equal((await request("api/owners.php", { token: secondaryToken })).status, 403);

  const accountDeactivation = await request("api/owners.php?do=deactivate&id=2", {
    token,
    method: "POST",
    body: {},
  });
  assert.equal(accountDeactivation.status, 200, JSON.stringify(accountDeactivation.data));
  assert.equal((await request("api/auth.php?do=me", { token: secondaryToken })).status, 401);
  const reactivated = await request("api/owners.php?do=reactivate&id=2", {
    token,
    method: "POST",
    body: {},
  });
  assert.equal(reactivated.status, 200, JSON.stringify(reactivated.data));
  assert.equal((await request("api/auth.php", {
    method: "POST",
    body: { username: "juan", password: "password" },
  })).status, 200);
  for (let attempt = 0; attempt < 5; attempt++) {
    assert.equal((await request("api/auth.php", {
      method: "POST",
      body: { username: "juan", password: "incorrect-password" },
    })).status, 401);
  }
  assert.equal((await request("api/auth.php", {
    method: "POST",
    body: { username: "juan", password: "password" },
  })).status, 401);
  const passwordReset = await request("api/owners.php?do=resetPassword&id=2", {
    token,
    method: "POST",
    body: { password: "password" },
  });
  assert.equal(passwordReset.status, 200, JSON.stringify(passwordReset.data));
  assert.equal((await request("api/auth.php", {
    method: "POST",
    body: { username: "juan", password: "password" },
  })).status, 200);

  console.log("PASS authenticated boundaries/notifications, financial/history rules, concurrent conflicts, owner administration, and reports");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
