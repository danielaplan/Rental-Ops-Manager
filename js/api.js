/**
 * Promise-based frontend contract for the PHP API.
 *
 * Pages should only call API methods. This layer owns URLs, authentication,
 * PHP action parameters, field mapping, ID conversion, and response errors.
 */
function calculatePaymentStatus(booking) {
  const total = Number(booking.total || 0);
  const paid = Number(booking.amount_paid || 0);
  if (total > 0 && paid >= total) return "Fully Paid";
  if (paid > 0) return "Partial";
  return "Unpaid";
}

const API = (() => {
  const scriptUrl = document.currentScript?.src || window.location.href;
  const apiBase = new URL("../api/", scriptUrl);
  const timeoutMs = 12000;

  const session = () => {
    if (typeof STORAGE === "undefined" || typeof STORAGE._get !== "function") return {};
    const key = typeof STORAGE_KEYS !== "undefined" ? STORAGE_KEYS.adminSession : "er_admin_session";
    return STORAGE._get(key, {}) || {};
  };

  const serverId = value => {
    if (value === null || value === undefined || value === "") return value;
    if (typeof value === "number") return value;
    const text = String(value);
    if (/^\d+$/.test(text)) return Number(text);
    if (text.startsWith("LOCAL-")) throw new Error("This record has not been accepted by the server yet.");
    const match = text.match(/-(\d+)$/);
    return match ? Number(match[1]) : value;
  };

  const prefixedId = (prefix, value) => {
    if (value === null || value === undefined || value === "") return value;
    const text = String(value);
    if (text.startsWith("LOCAL-") || text.startsWith(prefix + "-")) return value;
    return `${prefix}-${String(value).padStart(3, "0")}`;
  };

  const titleCaseStatus = value => String(value || "Pending").toLowerCase()
    .replace(/(^|\s|_)([a-z])/g, (_match, space, letter) => `${space === "_" ? " " : space}${letter.toUpperCase()}`);

  const numericFields = (row, fields) => {
    const out = { ...row };
    fields.forEach(field => {
      if (out[field] !== null && out[field] !== undefined && out[field] !== "") out[field] = Number(out[field]);
    });
    return out;
  };

  const cachedRow = (collection, field, id) => {
    if (typeof STORAGE === "undefined" || typeof STORAGE.getAll !== "function") return null;
    return STORAGE.getAll(collection).find(row => {
      const candidate = row._server_id ?? row[field];
      if (String(candidate).startsWith("LOCAL-")) return false;
      return String(serverId(candidate)) === String(id);
    }) || null;
  };

  const normalize = (entity, value) => {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map(row => normalize(entity, row));
    let row = { ...value };

    if (entity === "categories") row.category_id = prefixedId("CAT", row.category_id);
    if (entity === "services") {
      const cached = cachedRow("services", "service_id", row.service_id);
      row = { ...(cached || {}), ...row };
      row._server_id = serverId(row.service_id);
      row.service_id = prefixedId("SVC", row._server_id);
      row.name = row.service_name ?? row.name;
    }
    if (entity === "addons") {
      row = numericFields(row, ["price"]);
      row.addon_id = prefixedId("ADD", row.addon_id);
      if (row.service_id != null) row.service_id = prefixedId("SVC", row.service_id);
    }
    if (entity === "rentalItems") {
      row = numericFields(row, ["quantity"]);
      row.rental_item_id = prefixedId("RI", row.rental_item_id);
      if (row.service_id != null) row.service_id = prefixedId("SVC", row.service_id);
      if (row.required != null) row.required = Boolean(Number(row.required));
    }
    if (entity === "bookingItems") {
      row = numericFields(row, ["expected_qty", "released_qty", "returned_qty"]);
      row.booking_item_id = prefixedId("BI", row.booking_item_id);
      if (row.rental_item_id != null) row.rental_item_id = prefixedId("RI", row.rental_item_id);
      if (row.service_id != null) row.service_id = prefixedId("SVC", row.service_id);
      if (row.required != null) row.required = Boolean(Number(row.required));
      if (row.checked_released != null) row.checked_released = Boolean(Number(row.checked_released));
    }
    if (entity === "bookings") {
      row = numericFields(row, ["subtotal", "addons_total", "total", "amount_paid", "discount", "fees", "guests"]);
      row.id = row.id ?? row.booking_id;
      row.location = row.event_location ?? row.location;
      row.contact = row.contact ?? row.contact_number;
      row.status = titleCaseStatus(row.status);
      row.service_ids = (Array.isArray(row.service_ids) ? row.service_ids : []).map(id => prefixedId("SVC", id));
      if (!row.service_ids.length && row.service_id != null) row.service_ids = [prefixedId("SVC", row.service_id)];
      row.addon_ids = (Array.isArray(row.addon_ids) ? row.addon_ids : []).map(id => prefixedId("ADD", id));
      row.payment_status = calculatePaymentStatus(row);
    }
    if (entity === "customers") {
      row.customer_id = prefixedId("CUS", row.customer_id);
      row.name = row.full_name ?? row.name;
      row.contact = row.contact_number ?? row.contact;
      row.email = row.messenger_handle ?? row.email;
    }
    if (entity === "payments") {
      row = numericFields(row, ["amount"]);
      row.payment_id = prefixedId("PAY", row.payment_id);
      row.method = row.payment_method ?? row.method;
      row.date = String(row.payment_date ?? row.date ?? "").slice(0, 10);
    }
    if (entity === "gallery") {
      row.image_id = prefixedId("IMG", row.image_id);
      if (row.featured != null) row.featured = Boolean(Number(row.featured));
    }
    if (entity === "packages") {
      row = numericFields(row, ["price"]);
      row.package_id = prefixedId("PKG", row.package_id);
      if (row.service_id != null) row.service_id = prefixedId("SVC", row.service_id);
      row.name = row.package_name ?? row.name;
    }
    if (entity === "itemHistory") {
      row.history_id = prefixedId("HIST", row.history_id);
      if (row.rental_item_id != null) row.rental_item_id = prefixedId("RI", row.rental_item_id);
      row.qty = Number(row.qty || 0);
    }
    if (entity === "itemReleases") row.release_id = prefixedId("REL", row.release_id);
    if (entity === "deposits") row = numericFields(row, ["amount_held", "deduction_amount", "refund_amount"]);
    if (entity === "delivery") row = numericFields(row, ["delivery_fee"]);
    if (entity === "reports" && Array.isArray(row.upcoming_bookings)) row.upcoming_bookings = normalize("bookings", row.upcoming_bookings);
    return row;
  };

  const payload = (entity, input = {}) => {
    const out = { ...input };
    if (entity === "services" && out.name !== undefined) {
      out.service_name = out.name;
      delete out.name;
    }
    if (entity === "customers") {
      if (out.name !== undefined) out.full_name = out.name;
      if (out.contact !== undefined) out.contact_number = out.contact;
      if (out.email !== undefined) out.messenger_handle = out.email;
      delete out.name;
      delete out.contact;
      delete out.email;
    }
    if (entity === "payments" && out.method !== undefined) {
      out.payment_method = out.method;
      delete out.method;
    }
    if (entity === "bookings") {
      if (out.location !== undefined) out.event_location = out.location;
      if (out.service_ids) out.service_ids = out.service_ids.map(serverId);
      if (out.addon_ids) out.addon_ids = out.addon_ids.map(serverId);
      if (out.package_id != null) out.package_id = serverId(out.package_id);
      if (out.customer_id != null) out.customer_id = serverId(out.customer_id);
      delete out.location;
    }
    ["service_id", "booking_id", "rental_item_id", "booking_item_id", "package_id", "customer_id"].forEach(field => {
      if (out[field] !== null && out[field] !== undefined && out[field] !== "") out[field] = serverId(out[field]);
    });
    return out;
  };

  const request = async (endpoint, options = {}) => {
    const url = new URL(endpoint, apiBase);
    Object.entries(options.query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });
    const token = session()?.session_token;
    const method = options.method || (options.body === undefined ? "GET" : "POST");
    const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    const init = { method, headers, cache: 'no-store' };
    if (options.body !== undefined) init.body = JSON.stringify(options.body);
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") init.signal = AbortSignal.timeout(timeoutMs);

    let response;
    try {
      response = await fetch(url.href, init);
    } catch (cause) {
      const error = new Error("Unable to reach the server.");
      error.code = "network_error";
      error.cause = cause;
      throw error;
    }
    const text = await response.text();
    let envelope;
    try {
      envelope = text ? JSON.parse(text) : null;
    } catch {
      const error = new Error("The server returned an invalid response. Confirm that PHP is running.");
      error.code = "invalid_response";
      error.status = response.status;
      throw error;
    }
    if (!response.ok || !envelope?.ok) {
      const error = new Error(envelope?.error || `Request failed (${response.status}).`);
      error.code = envelope?.code || "request_failed";
      error.status = response.status;
      error.details = envelope;
      throw error;
    }
    return envelope.data;
  };

  const list = async (endpoint, entity, query = {}) => normalize(entity, await request(endpoint, { query }));
  const create = async (endpoint, entity, data) => normalize(entity, await request(endpoint, { query: { do: "create" }, body: payload(entity, data) }));
  const update = async (endpoint, entity, id, data) => normalize(entity, await request(endpoint, { query: { do: "update", id: serverId(id) }, body: payload(entity, data) }));
  const remove = async (endpoint, id) => request(endpoint, { query: { do: "delete", id: serverId(id) }, body: {} });

  return {
    request,
    async refreshPublicData() {
      const state = {};
      await Promise.all(['settings', 'websiteContent', 'services', 'gallery'].map(async entity => {
        try {
          const collection = entity === 'services' || entity === 'gallery';
          const data = await request(entity + '.php', { query: { do: collection ? 'all' : 'get' } });
          if (!data || (collection ? !Array.isArray(data) : typeof data !== 'object' || Array.isArray(data))) return;
          const operations = typeof API.getSyncQueue === 'function' ? API.getSyncQueue() : [];
          if (collection) {
            const field = entity === 'services' ? 'service_id' : 'image_id';
            const before = STORAGE.getAll(entity);
            const pending = before.filter(row => row.pending_sync);
            const deleted = operations.filter(op => op.entity === entity && op.action === 'delete');
            const key = id => String(id).startsWith('LOCAL-') ? String(id) : String(serverId(id));
            const fresh = normalize(entity, data).filter(row =>
              !pending.some(draft => key(draft[field]) === key(row[field])) &&
              !deleted.some(op => key(op.local_id) === key(row[field])));
            const rows = [...fresh, ...pending];
            STORAGE.saveAll(entity, rows);
            if (typeof STORAGE.saveCache === 'function') await STORAGE.saveCache(entity, rows);
          } else if (!operations.some(op => op.entity === entity)) {
            const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS[entity] : null;
            const cached = key && typeof STORAGE._get === 'function' ? STORAGE._get(key, {}) : {};
            STORAGE.setOne(entity, { ...cached, ...data });
          }
          state[entity] = data;
        } catch (error) {
          // Public content remains available from the last successful cache.
          state.errors = { ...state.errors, [entity]: error.message };
        }
      }));
      return state;
    },
    getCategories: () => list("categories.php", "categories", { do: "all" }),
    createCategory: data => create("categories.php", "categories", data),
    updateCategory: (id, data) => update("categories.php", "categories", id, data),
    deleteCategory: async id => { await remove("categories.php", id); return true; },

    getServices: () => list("services.php", "services", { do: "all" }),
    async getActiveServices() { return (await this.getServices()).filter(row => row.status === "Active"); },
    async getService(id) { return normalize("services", await request("services.php", { query: { do: "get", id: serverId(id) } })); },
    createService: data => create("services.php", "services", data),
    updateService: (id, data) => update("services.php", "services", id, data),
    deleteService: async id => { await remove("services.php", id); return true; },

    getAddons: () => list("addons.php", "addons", { do: "all" }),
    getAddonsForService: serviceId => list("addons.php", "addons", { do: "forService", service_id: serverId(serviceId) }),
    createAddon: data => create("addons.php", "addons", data),
    updateAddon: (id, data) => update("addons.php", "addons", id, data),
    deleteAddon: async id => { await remove("addons.php", id); return true; },

    getRentalItems: () => list("rentalItems.php", "rentalItems", { do: "all" }),
    getRentalItemsForService: serviceId => list("rentalItems.php", "rentalItems", { do: "forService", service_id: serverId(serviceId) }),
    createRentalItem: data => create("rentalItems.php", "rentalItems", data),
    updateRentalItem: (id, data) => update("rentalItems.php", "rentalItems", id, data),
    deleteRentalItem: async id => { await remove("rentalItems.php", id); return true; },

    getBookingItems: bookingId => list("bookingItems.php", "bookingItems", { do: "forBooking", booking_id: serverId(bookingId) }),
    async generateBookingChecklist(bookingId, serviceIds) {
      return normalize("bookingItems", await request("bookingItems.php", { query: { do: "generate" }, body: { booking_id: serverId(bookingId), service_ids: serviceIds.map(serverId) } }));
    },
    updateBookingItem: (id, data) => update("bookingItems.php", "bookingItems", id, data),
    deleteBookingItem: id => request("bookingItems.php", { query: { do: "delete", id: serverId(id) }, body: {} }),

    async recordRelease(bookingId, releasedBy, notes) {
      return normalize("itemReleases", await request("itemReleases.php", { query: { do: "create" }, body: { booking_id: serverId(bookingId), released_by: releasedBy, notes: notes || "" } }));
    },
    async recordReturn(bookingId, inspectedBy, itemResults, notes) {
      const items = itemResults.map(item => payload("bookingItems", { ...item, notes: item.notes || notes || "" }));
      return request("equipment.php", { query: { do: "inspect" }, body: { booking_id: serverId(bookingId), inspected_by: inspectedBy, items } });
    },
    async logItemHistory(entry) {
      return normalize("itemHistory", await request("itemHistory.php", { query: { do: "create" }, body: payload("itemHistory", entry) }));
    },
    getItemHistory: rentalItemId => list("itemHistory.php", "itemHistory", { do: "forItem", rental_item_id: serverId(rentalItemId) }),
    finalizeReturn: bookingId => request("equipment.php", { query: { do: "finalizeReturn" }, body: { booking_id: serverId(bookingId) } }),

    async checkAvailability(serviceId, date, startTime, endTime, excludeBookingId) {
      if (serverId(serviceId) !== 1) return { available: true, conflictWith: null };
      const bookings = (await this.getBookings()).filter(booking => booking.event_date === date && booking.service_ids.some(id => serverId(id) === 1) && ["confirmed", "reserved", "preparing", "released"].includes(String(booking.status).toLowerCase()) && String(booking.id) !== String(excludeBookingId));
      const toMinutes = time => { const [hours, minutes] = String(time).split(":").map(Number); return hours * 60 + minutes; };
      const start = toMinutes(startTime), end = toMinutes(endTime);
      const conflict = bookings.find(booking => start < toMinutes(booking.end_time) && toMinutes(booking.start_time) < end);
      return { available: !conflict, conflictWith: conflict?.id || null };
    },

    getBookings: () => list("bookings.php", "bookings", { do: "all" }),
    async getBooking(id) { return normalize("bookings", await request("bookings.php", { query: { do: "get", id: serverId(id) } })); },
    async createBooking(data) { return normalize("bookings", await request("bookings.php", { query: { do: "create" }, body: payload("bookings", data) })); },
    async updateBooking(id, data) { return normalize("bookings", await request("bookings.php", { query: { do: "update", id: serverId(id) }, body: payload("bookings", data) })); },
    deleteBooking: id => request("bookings.php", { query: { do: "delete", id: serverId(id) }, body: {} }),

    async upsertCustomerFromBooking(booking) {
      const contact = booking.contact ?? booking.contact_number;
      const matches = await list("customers.php", "customers", { do: "search", q: contact || "" });
      const existing = matches.find(row => row.contact === contact);
      const data = { name: booking.customer_name, contact, email: booking.email || "" };
      return existing ? update("customers.php", "customers", existing.customer_id, data) : create("customers.php", "customers", data);
    },
    async getCustomers() {
      const [customers, bookings] = await Promise.all([
        list("customers.php", "customers", { do: "all" }),
        this.getBookings()
      ]);
      return customers.map(customer => {
        const customerId = serverId(customer.customer_id);
        const related = bookings.filter(booking =>
          String(booking.customer_id) === String(customerId) || booking.contact === customer.contact
        );
        return {
          ...customer,
          type: related[0]?.customer_type || customer.type || "Guest / No Account",
          bookings_count: related.length,
          total_spent: related.reduce((sum, booking) => sum + Number(booking.amount_paid || 0), 0)
        };
      });
    },

    getPayments: () => list("payments.php", "payments", { do: "all" }),
    getPaymentsForBooking: bookingId => list("payments.php", "payments", { do: "all", booking_id: serverId(bookingId) }),
    async createPayment(data) { return normalize("payments", await request("payments.php", { query: { do: "create" }, body: payload("payments", data) })); },

    getGallery: () => list("gallery.php", "gallery", { do: "all" }),
    createGalleryImage: data => create("gallery.php", "gallery", data),
    updateGalleryImage: (id, data) => update("gallery.php", "gallery", id, data),
    deleteGalleryImage: async id => { await remove("gallery.php", id); return true; },

    getWebsiteContent: () => request("websiteContent.php", { query: { do: "get" } }),
    updateWebsiteContent: data => request("websiteContent.php", { query: { do: "update" }, body: data }),
    getSettings: () => request("settings.php", { query: { do: "get" } }),
    updateSettings: data => request("settings.php", { query: { do: "update" }, body: data }),

    async getDashboardStats() { return normalize("reports", await request("reports.php", { query: { do: "dashboard" } })); },
    async getReportStats(startDate, endDate) { return normalize("reports", await request("reports.php", { query: { do: "report", start: startDate, end: endDate } })); },

    getSyncQueue() {
      if (typeof STORAGE === "undefined" || typeof STORAGE._get !== "function") return [];
      return STORAGE._get("er_sync_queue", []);
    },
    getPackages: () => list("packages.php", "packages", { do: "all" }),

    async getDeposit(bookingId) {
      const data = await request("deposits.php", { query: { do: "get", booking_id: serverId(bookingId) } });
      return normalize("deposits", data) || { booking_id: bookingId, amount_held: 0, deduction_amount: 0, deduction_reason: "", refund_amount: 0 };
    },
    async refreshDeposit(bookingId) { return this.getDeposit(bookingId); },
    async upsertDeposit(bookingId, data) {
      return normalize("deposits", await request("deposits.php", { query: { do: "upsert" }, body: payload("deposits", { ...data, booking_id: bookingId }) }));
    },

    async getDelivery(bookingId) {
      const data = await request("delivery.php", { query: { do: "get", booking_id: serverId(bookingId) } });
      return normalize("delivery", data) || { booking_id: bookingId, delivery_method: "self_pickup", delivery_fee: 0, fee_shouldered_by: "renter" };
    },
    async refreshDelivery(bookingId) { return this.getDelivery(bookingId); },
    async upsertDelivery(bookingId, data) {
      return normalize("delivery", await request("delivery.php", { query: { do: "upsert" }, body: payload("delivery", { ...data, booking_id: bookingId }) }));
    }
  };
})();
