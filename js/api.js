/**
 * api.js
 * -----------------------------------------------------------------
 * This is the ONLY layer the rest of the app (public pages + admin
 * pages) should call to read or write data. Right now every method
 * reads/writes localStorage via storage.js. Later, each method body
 * can be swapped for a fetch() call to the matching PHP endpoint
 * (see comments) WITHOUT changing any calling code elsewhere.
 *
 *   API.getServices()        -> GET  api/services.php
 *   API.createService(data)  -> POST api/services.php
 *   ... etc.
 *
 * All methods return plain JS values (objects/arrays), same shape
 * a JSON API response would be decoded into.
 * ------------------------------------------------------------- */
function calculatePaymentStatus(booking) {
  const total = Number(booking.total || 0);
  const paid = Number(booking.amount_paid || 0);
  if (total > 0 && paid >= total) return "Fully Paid";
  if (paid > 0) return "Partial";
  return "Unpaid";
}

const API = {

  /* ============ CATEGORIES ============ */
  getCategories() {
    return STORAGE.getAll("categories");
  },
  createCategory(data) {
    const list = STORAGE.getAll("categories");
    const id = STORAGE.nextId("CAT-", list, "category_id");
    const record = { category_id: id, status: "Active", ...data };
    list.push(record);
    STORAGE.saveAll("categories", list);
    return record;
  },
  updateCategory(id, data) {
    const list = STORAGE.getAll("categories");
    const idx = list.findIndex(c => c.category_id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    STORAGE.saveAll("categories", list);
    return list[idx];
  },
  deleteCategory(id) {
    let list = STORAGE.getAll("categories");
    list = list.filter(c => c.category_id !== id);
    STORAGE.saveAll("categories", list);
    return true;
  },

  /* ============ SERVICES ============ */
  getServices() {
    return STORAGE.getAll("services");
  },
  getActiveServices() {
    return STORAGE.getAll("services").filter(s => s.status === "Active");
  },
  getService(id) {
    return STORAGE.getAll("services").find(s => s.service_id === id) || null;
  },
  createService(data) {
    const list = STORAGE.getAll("services");
    const id = STORAGE.nextId("SVC-", list, "service_id");
    const record = {
      service_id: id, status: "Active", featured: false,
      inclusions: [], ...data
    };
    list.push(record);
    STORAGE.saveAll("services", list);
    return record;
  },
  updateService(id, data) {
    const list = STORAGE.getAll("services");
    const idx = list.findIndex(s => s.service_id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    STORAGE.saveAll("services", list);
    return list[idx];
  },
  deleteService(id) {
    let list = STORAGE.getAll("services");
    list = list.filter(s => s.service_id !== id);
    STORAGE.saveAll("services", list);
    return true;
  },

  /* ============ ADD-ONS ============ */
  getAddons() {
    return STORAGE.getAll("addons");
  },
  getAddonsForService(serviceId) {
    return STORAGE.getAll("addons").filter(a => a.service_id === serviceId && a.status === "Active");
  },
  createAddon(data) {
    const list = STORAGE.getAll("addons");
    const id = STORAGE.nextId("ADD-", list, "addon_id");
    const record = { addon_id: id, status: "Active", ...data };
    list.push(record);
    STORAGE.saveAll("addons", list);
    return record;
  },
  updateAddon(id, data) {
    const list = STORAGE.getAll("addons");
    const idx = list.findIndex(a => a.addon_id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    STORAGE.saveAll("addons", list);
    return list[idx];
  },
  deleteAddon(id) {
    let list = STORAGE.getAll("addons");
    list = list.filter(a => a.addon_id !== id);
    STORAGE.saveAll("addons", list);
    return true;
  },

  /* ============ RENTAL ITEMS (per-service catalog) ============ */
  getRentalItems() {
    return STORAGE.getAll("rentalItems");
  },
  getRentalItemsForService(serviceId) {
    return STORAGE.getAll("rentalItems").filter(i => i.service_id === serviceId);
  },
  createRentalItem(data) {
    const list = STORAGE.getAll("rentalItems");
    const id = STORAGE.nextId("RI-", list, "rental_item_id");
    const record = {
      rental_item_id: id, status: "Available", condition: "Good",
      tracking: "quantity", required: false, notes: "", ...data
    };
    list.push(record);
    STORAGE.saveAll("rentalItems", list);
    return record;
  },
  updateRentalItem(id, data) {
    const list = STORAGE.getAll("rentalItems");
    const idx = list.findIndex(i => i.rental_item_id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    STORAGE.saveAll("rentalItems", list);
    return list[idx];
  },
  deleteRentalItem(id) {
    let list = STORAGE.getAll("rentalItems");
    list = list.filter(i => i.rental_item_id !== id);
    STORAGE.saveAll("rentalItems", list);
    return true;
  },
  logItemHistory(entry) {
    const list = STORAGE.getAll("itemHistory");
    list.unshift({ history_id: "HIST-" + Date.now(), date: new Date().toISOString(), ...entry });
    STORAGE.saveAll("itemHistory", list);
  },
  getItemHistory(rentalItemId) {
    return STORAGE.getAll("itemHistory").filter(h => h.rental_item_id === rentalItemId);
  },

  /* ============ BOOKING ITEMS (checklist per booking) ============ */
  getBookingItems(bookingId) {
    return STORAGE.getAll("bookingItems").filter(bi => bi.booking_id === bookingId);
  },
  generateBookingChecklist(bookingId, serviceIds) {
    let list = STORAGE.getAll("bookingItems");
    list = list.filter(bi => bi.booking_id !== bookingId); // regenerate cleanly
    const rentalItems = STORAGE.getAll("rentalItems");
    serviceIds.forEach(sid => {
      rentalItems.filter(ri => ri.service_id === sid).forEach(ri => {
        list.push({
          booking_item_id: "BI-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          booking_id: bookingId,
          rental_item_id: ri.rental_item_id,
          service_id: sid,
          name: ri.name,
          expected_qty: ri.quantity,
          released_qty: 0,
          returned_qty: 0,
          required: ri.required,
          checked_released: false,
          condition: "",
          notes: ""
        });
      });
    });
    STORAGE.saveAll("bookingItems", list);
    return list.filter(bi => bi.booking_id === bookingId);
  },
  updateBookingItem(bookingItemId, data) {
    const list = STORAGE.getAll("bookingItems");
    const idx = list.findIndex(bi => bi.booking_item_id === bookingItemId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    STORAGE.saveAll("bookingItems", list);
    return list[idx];
  },

  /* ============ RELEASE / RETURN RECORDS ============ */
  recordRelease(bookingId, releasedBy, notes) {
    const list = STORAGE.getAll("itemReleases");
    const record = {
      release_id: "REL-" + Date.now(), booking_id: bookingId,
      released_by: releasedBy, notes: notes || "", released_at: new Date().toISOString()
    };
    list.push(record);
    STORAGE.saveAll("itemReleases", list);
    // history entries
    const items = API.getBookingItems(bookingId);
    items.forEach(it => {
      API.logItemHistory({
        rental_item_id: it.rental_item_id, booking_id: bookingId,
        action: "Released", qty: it.expected_qty, condition: "Good"
      });
    });
    return record;
  },
  recordReturn(bookingId, inspectedBy, itemResults, notes) {
    const list = STORAGE.getAll("itemReturns");
    const record = {
      return_id: "RET-" + Date.now(), booking_id: bookingId,
      inspected_by: inspectedBy, notes: notes || "",
      inspected_at: new Date().toISOString(), items: itemResults
    };
    list.push(record);
    STORAGE.saveAll("itemReturns", list);
    itemResults.forEach(r => {
      API.logItemHistory({
        rental_item_id: r.rental_item_id, booking_id: bookingId,
        action: "Returned", qty: r.returned_qty, condition: r.condition
      });
    });
    return record;
  },

  /* ============ AVAILABILITY ============ */
  checkAvailability(serviceId, date, startTime, endTime, excludeBookingId) {
    if(serviceId!=='SVC-001' && Number(serviceId)!==1)return {available:true,conflictWith:null};
    const bookings=STORAGE.getAll("bookings").filter(b=>b.event_date===date &&
      (b.service_ids||[]).some(id=>id==='SVC-001'||Number(id)===1) &&
      ['confirmed','reserved','preparing','released'].includes(String(b.status).toLowerCase()) && String(b.id)!==String(excludeBookingId));
    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const s1 = toMin(startTime), e1 = toMin(endTime);
    const conflict = bookings.find(b => {
      const s2 = toMin(b.start_time), e2 = toMin(b.end_time);
      return s1 < e2 && s2 < e1;
    });
    return { available: !conflict, conflictWith: conflict ? conflict.id : null };
  },

  /* ============ BOOKINGS ============ */
  getBookings() {
    const list = STORAGE.getAll("bookings");
    let changed = false;
    const normalized = list.map(booking => {
      const paymentStatus = calculatePaymentStatus(booking);
      if (booking.payment_status === paymentStatus) return booking;
      changed = true;
      return { ...booking, payment_status: paymentStatus };
    });
    if (changed) STORAGE.saveAll("bookings", normalized);
    return normalized;
  },
  getBooking(id) {
    return API.getBookings().find(b => b.id === id) || null;
  },
  createBooking(data) {
    const list = STORAGE.getAll("bookings");
    const id = STORAGE.nextBookingId(list);
    const record = {
      id, discount: 0, fees: 0, amount_paid: 0,
      status: "Pending", payment_status: "Unpaid",
      created_at: new Date().toISOString(),
      ...data
    };
    record.payment_status = calculatePaymentStatus(record);
    list.push(record);
    STORAGE.saveAll("bookings", list);

    // Upsert customer
    API.upsertCustomerFromBooking(record);
    // Auto-generate rental checklist
    API.generateBookingChecklist(id, record.service_ids || []);
    return record;
  },
  updateBooking(id, data) {
    const list = STORAGE.getAll("bookings");
    const idx = list.findIndex(b => b.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    list[idx].payment_status = calculatePaymentStatus(list[idx]);
    STORAGE.saveAll("bookings", list);
    return list[idx];
  },

  upsertCustomerFromBooking(booking) {
    const list = STORAGE.getAll("customers");
    let existing = list.find(c => c.contact === booking.contact);
    if (existing) {
      existing.name = booking.customer_name;
      existing.email = booking.email || existing.email;
    } else {
      const id = STORAGE.nextId("CUS-", list, "customer_id");
      existing = {
        customer_id: id, name: booking.customer_name, contact: booking.contact,
        email: booking.email || "", type: booking.customer_type || "Guest / No Account"
      };
      list.push(existing);
    }
    STORAGE.saveAll("customers", list);
    return existing;
  },

  /* ============ CUSTOMERS ============ */
  getCustomers() {
    const customers = STORAGE.getAll("customers");
    const bookings = STORAGE.getAll("bookings");
    return customers.map(c => {
      const theirs = bookings.filter(b => b.contact === c.contact);
      return {
        ...c,
        bookings_count: theirs.length,
        total_spent: theirs.reduce((sum, b) => sum + (b.amount_paid || 0), 0)
      };
    });
  },

  /* ============ PAYMENTS ============ */
  getPayments() {
    return STORAGE.getAll("payments");
  },
  getPaymentsForBooking(bookingId) {
    return STORAGE.getAll("payments").filter(p => p.booking_id === bookingId);
  },
  createPayment(data) {
    const list = STORAGE.getAll("payments");
    const id = STORAGE.nextId("PAY-", list, "payment_id");
    const record = { payment_id: id, date: new Date().toISOString().slice(0, 10), ...data };
    list.push(record);
    STORAGE.saveAll("payments", list);

    // update booking amount_paid
    const booking = API.getBooking(data.booking_id);
    if (booking) {
      const newPaid = (booking.amount_paid || 0) + Number(data.amount || 0);
      API.updateBooking(booking.id, { amount_paid: newPaid });
    }
    return record;
  },

  /* ============ GALLERY ============ */
  getGallery() {
    return STORAGE.getAll("gallery");
  },
  createGalleryImage(data) {
    const list = STORAGE.getAll("gallery");
    const id = STORAGE.nextId("IMG-", list, "image_id");
    const record = { image_id: id, featured: false, ...data };
    list.push(record);
    STORAGE.saveAll("gallery", list);
    return record;
  },
  updateGalleryImage(id, data) {
    const list = STORAGE.getAll("gallery");
    const idx = list.findIndex(g => g.image_id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    STORAGE.saveAll("gallery", list);
    return list[idx];
  },
  deleteGalleryImage(id) {
    let list = STORAGE.getAll("gallery");
    list = list.filter(g => g.image_id !== id);
    STORAGE.saveAll("gallery", list);
    return true;
  },

  /* ============ WEBSITE CONTENT ============ */
  getWebsiteContent() {
    return STORAGE._get(STORAGE_KEYS.websiteContent, {});
  },
  updateWebsiteContent(data) {
    const current = API.getWebsiteContent();
    const updated = { ...current, ...data };
    STORAGE.setOne("websiteContent", updated);
    const settings = API.getSettings();
    STORAGE.setOne("settings", {
      ...settings,
      business_name: updated.business_name,
      phone: updated.contact_phone,
      email: updated.contact_email,
      address: updated.contact_address,
      facebook: updated.contact_facebook,
      instagram: updated.contact_instagram
    });
    return updated;
  },

  /* ============ SETTINGS ============ */
  getSettings() {
    return STORAGE._get(STORAGE_KEYS.settings, {});
  },
  updateSettings(data) {
    const current = API.getSettings();
    const updated = { ...current, ...data };
    STORAGE.setOne("settings", updated);
    const content = API.getWebsiteContent();
    STORAGE.setOne("websiteContent", {
      ...content,
      business_name: updated.business_name,
      contact_phone: updated.phone,
      contact_email: updated.email,
      contact_address: updated.address,
      contact_facebook: updated.facebook,
      contact_instagram: updated.instagram
    });
    return updated;
  },

  /* ============ DASHBOARD / REPORTS AGGREGATES ============ */
  getDashboardStats() {
    const bookings = STORAGE.getAll("bookings");
    const services = STORAGE.getAll("services");
    const items = STORAGE.getAll("rentalItems");
    const today = new Date().toISOString().slice(0, 10);

    const revenue = bookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0);
    const countByStatus = (s) => bookings.filter(b => b.status === s).length;

    return {
      total_bookings: bookings.length,
      pending_bookings: countByStatus("Pending"),
      confirmed_bookings: countByStatus("Confirmed"),
      completed_bookings: countByStatus("Completed"),
      total_revenue: revenue,
      active_services: services.filter(s => s.status === "Active").length,
      available_inventory: items.filter(i => i.status === "Available").length,
      items_on_rental: items.filter(i => i.status === "On Rental" || i.status === "Released").length,
      items_needing_attention: items.filter(i => ["Damaged", "Under Maintenance", "Missing"].includes(i.status)).length,
      upcoming_bookings: bookings.filter(b => b.event_date >= today && !["Completed", "Cancelled", "Rejected"].includes(b.status))
        .sort((a, b) => a.event_date.localeCompare(b.event_date)).slice(0, 5)
    };
  },

  getReportStats(startDate, endDate) {
    const allBookings = STORAGE.getAll("bookings");
    const bookings = allBookings.filter(b => {
      if (startDate && b.event_date < startDate) return false;
      if (endDate && b.event_date > endDate) return false;
      return true;
    });
    const services = STORAGE.getAll("services");
    const items = STORAGE.getAll("rentalItems");

    const serviceCount = {};
    bookings.forEach(b => (b.service_ids || []).forEach(sid => {
      serviceCount[sid] = (serviceCount[sid] || 0) + 1;
    }));
    const popular = Object.entries(serviceCount)
      .map(([sid, count]) => ({
        name: (services.find(s => s.service_id === sid) || {}).name || sid,
        count
      }))
      .sort((a, b) => b.count - a.count);

    const outstanding = bookings.reduce((sum, b) => sum + Math.max((b.total || 0) - (b.amount_paid || 0), 0), 0);
    const customers = new Set(bookings.map(b => b.customer_id || b.customer_name).filter(Boolean));

    return {
      total_bookings: bookings.length,
      total_customers: customers.size,
      pending: bookings.filter(b => b.status === "Pending").length,
      confirmed: bookings.filter(b => b.status === "Confirmed").length,
      completed: bookings.filter(b => b.status === "Completed").length,
      cancelled: bookings.filter(b => b.status === "Cancelled" || b.status === "Rejected").length,
      total_revenue: bookings.reduce((s, b) => s + (b.amount_paid || 0), 0),
      outstanding_balance: outstanding,
      popular_services: popular,
      damaged_or_missing: items.filter(i => ["Damaged", "Missing"].includes(i.status)).length,
      range_start: startDate || "",
      range_end: endDate || ""
    };
  }
};
