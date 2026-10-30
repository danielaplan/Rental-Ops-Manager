package com.akad.rentalops.util;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * UI-only sample data (mirrors db/seed.sql) held in memory. Nothing is sent over the network.
 * Same JSON shapes as the PHP API, so every screen renders exactly as it would with real data.
 * Changes made in the UI (add/edit/delete, record payment, status changes...) live until the app is closed.
 */
public final class MockStore {
    public static class MockError extends Exception {
        public final String code; public final int status;
        MockError(String m, String code, int status) { super(m); this.code = code; this.status = status; }
    }

    private static final Map<String, JSONArray> T = new HashMap<>();
    private static final Map<String, JSONObject> deposits = new HashMap<>();
    private static final Map<String, JSONObject> delivery = new HashMap<>();
    private static final Map<String, JSONArray> items = new HashMap<>();
    private static JSONObject settings, content;
    private static boolean ready;
    private static int nextId = 100;

    private MockStore() {}

    private static final String[][] CRUD = {   // endpoint, table, id key
            {"services.php", "services", "service_id"}, {"categories.php", "categories", "category_id"},
            {"addons.php", "addons", "addon_id"}, {"packages.php", "packages", "package_id"},
            {"rentalItems.php", "rentalItems", "rental_item_id"}, {"gallery.php", "gallery", "image_id"},
            {"customers.php", "customers", "customer_id"}, {"payments.php", "payments", "payment_id"},
            {"bookings.php", "bookings", "booking_id"}};

    // ------------------------------------------------------------------ dispatcher
    public static synchronized Object handle(String method, String endpoint, Map<String, String> q, JSONObject body) throws MockError {
        init();
        String act = q == null || !q.containsKey("do") ? "" : q.get("do");
        String id = q == null ? null : q.get("id");

        if (endpoint.equals("auth.php")) {
            if (act.equals("me") || act.equals("logout")) return Js.of("logged_out", true);
            String contact = Js.s(body, "contact_number"), pass = Js.s(body, "password");
            if (contact.isEmpty() || pass.isEmpty()) throw new MockError("Username and password are required.", "validation", 400);
            boolean primary = contact.replace("-", "").equals("09171234567") || !contact.replace("-", "").equals("09182223333");
            return Js.of("session_token", "demo-token", "expires_in", 86400, "user", Js.of(
                    "user_id", primary ? 1 : 2, "full_name", primary ? "Maria Santos" : "Juan Dela Cruz", "username", primary ? "maria" : "juan",
                    "role", "owner", "contact_number", contact, "is_primary_owner", primary));
        }
        if (endpoint.equals("settings.php")) return act.equals("update") ? (settings = merge(settings, body)) : settings;
        if (endpoint.equals("websiteContent.php")) return act.equals("update") ? (content = merge(content, body)) : content;
        if (endpoint.equals("reports.php")) return act.equals("report") ? report(q.get("start"), q.get("end")) : dashboard();
        if (endpoint.equals("audit.php")) return T.get("audit");
        if (endpoint.equals("owners.php")) return owners(act, id, body);
        if (endpoint.equals("deposits.php")) return deposit(act, body, q);
        if (endpoint.equals("delivery.php")) return delivery(act, body, q);
        if (endpoint.equals("bookingItems.php")) return bookingItems(act, id, body, q);
        if (endpoint.equals("itemReleases.php")) return Js.of("release_id", nextId++, "booking_id", Js.s(body, "booking_id"));
        if (endpoint.equals("equipment.php")) return inspect(body);
        if (endpoint.equals("notifications.php")) return new JSONArray();

        if (endpoint.equals("bookings.php") && act.equals("availability"))
            return Js.of("available", true, "conflicts", Js.of("bookings", new JSONArray(), "blocks", new JSONArray()));
        if (endpoint.equals("payments.php") && q != null && q.containsKey("booking_id") && act.equals("all"))
            return filter(T.get("payments"), "booking_id", q.get("booking_id"));
        if (endpoint.equals("customers.php") && act.equals("search")) return T.get("customers");

        for (String[] c : CRUD) if (c[0].equals(endpoint)) return crud(c[1], c[2], act, id, body);
        throw new MockError("Not available in the UI preview.", "not_found", 404);
    }

    // ------------------------------------------------------------------ generic CRUD
    private static Object crud(String table, String key, String act, String id, JSONObject body) throws MockError {
        JSONArray rows = T.get(table);
        switch (act) {
            case "all": return rows;
            case "get": {
                JSONObject r = find(rows, key, id);
                if (r == null) throw new MockError("Record not found.", "not_found", 404);
                return r;
            }
            case "create": {
                JSONObject r = new JSONObject();
                copy(body, r);
                Js.put(r, key, nextId++);
                if (table.equals("payments")) {
                    if (!r.has("payment_date")) Js.put(r, "payment_date", today(0) + " 10:00:00");
                    applyPayment(r);
                }
                if (table.equals("bookings")) fillBooking(r);
                rows.put(r);
                return r;
            }
            case "update": {
                JSONObject r = find(rows, key, id);
                if (r == null) throw new MockError("Record not found.", "not_found", 404);
                copy(body, r);
                return r;
            }
            case "delete": {
                for (int i = 0; i < rows.length(); i++) if (Js.s(rows.optJSONObject(i), key).equals(id)) { rows.remove(i); break; }
                return Js.of("deleted", true);
            }
        }
        throw new MockError("Unsupported action.", "validation", 400);
    }

    private static void applyPayment(JSONObject p) {
        if (!Js.s(p, "payment_status").equals("Completed")) return;
        JSONObject b = find(T.get("bookings"), "booking_id", Js.s(p, "booking_id"));
        if (b != null) Js.put(b, "amount_paid", Js.d(b, "amount_paid") + Js.d(p, "amount"));
    }

    private static void fillBooking(JSONObject b) {
        Js.put(b, "booking_reference", "BK-" + (1000 + nextId));
        Js.put(b, "service_id", b.optJSONArray("service_ids") != null && b.optJSONArray("service_ids").length() > 0 ? b.optJSONArray("service_ids").opt(0) : 1);
        if (!b.has("customer_id")) Js.put(b, "customer_id", nextId++);
        if (!b.has("amount_paid")) Js.put(b, "amount_paid", 0);
        Js.put(b, "status", Fmt.titleCase(Js.s(b, "status")));
        JSONObject svc = find(T.get("services"), "service_id", Js.s(b, "service_id"));
        if (svc != null) Js.put(b, "service_name", Js.s(svc, "service_name"));
    }

    // ------------------------------------------------------------------ other endpoints
    private static Object owners(String act, String id, JSONObject body) throws MockError {
        JSONArray rows = T.get("owners");
        if (act.equals("create")) {
            JSONObject r = new JSONObject();
            copy(body, r);
            r.remove("password");
            Js.put(r, "user_id", nextId++);
            Js.put(r, "account_status", "Active");
            Js.put(r, "is_primary_owner", 0);
            rows.put(r);
            return r;
        }
        JSONObject r = find(rows, "user_id", id);
        if (r != null && act.equals("deactivate")) Js.put(r, "account_status", "Inactive");
        if (r != null && act.equals("reactivate")) Js.put(r, "account_status", "Active");
        return act.equals("all") ? rows : (r == null ? new JSONObject() : r);
    }

    private static Object deposit(String act, JSONObject body, Map<String, String> q) {
        String bid = act.equals("get") ? q.get("booking_id") : Js.s(body, "booking_id");
        JSONObject d = deposits.get(bid);
        if (act.equals("get")) return d == null ? new JSONObject() : d;
        if (d == null) { d = Js.of("booking_id", bid, "amount_held", 0, "deduction_amount", 0, "refund_amount", 0, "refund_status", "Held", "deductions", new JSONArray()); deposits.put(bid, d); }
        if (act.equals("upsert") || act.equals("create")) Js.put(d, "amount_held", Js.d(body, "amount_held"));
        if (act.equals("deduct")) {
            d.optJSONArray("deductions").put(Js.of("affected_item", Js.s(body, "affected_item"), "reason", Js.s(body, "reason"), "amount", Js.d(body, "amount")));
            Js.put(d, "deduction_amount", Js.d(d, "deduction_amount") + Js.d(body, "amount"));
        }
        if (act.equals("refund")) Js.put(d, "refund_status", "Refunded");
        if (!Js.s(d, "refund_status").equals("Refunded")) Js.put(d, "refund_amount", Js.d(d, "amount_held") - Js.d(d, "deduction_amount"));
        return d;
    }

    private static Object delivery(String act, JSONObject body, Map<String, String> q) {
        if (act.equals("get")) { JSONObject d = delivery.get(q.get("booking_id")); return d == null ? new JSONObject() : d; }
        JSONObject d = new JSONObject();
        copy(body, d);
        delivery.put(Js.s(body, "booking_id"), d);
        return d;
    }

    private static Object bookingItems(String act, String id, JSONObject body, Map<String, String> q) {
        String bid = act.equals("forBooking") ? q.get("booking_id") : Js.s(body, "booking_id");
        JSONArray list = items.get(bid);
        if (list == null) {
            list = new JSONArray();
            if (act.equals("generate")) { makeItems(bid, list); items.put(bid, list); }
            return list;
        }
        if (act.equals("update")) {
            JSONObject it = find(list, "booking_item_id", id);
            if (it != null) copy(body, it);
        }
        return list;
    }

    private static void makeItems(String bid, JSONArray list) {
        String[][] base = {{"Smart TV 32\"", "1"}, {"Karaoke set", "1"}, {"JBL Speaker 520", "1"}, {"JBL battery microphone", "2"}};
        int n = 1;
        for (String[] b : base) list.put(Js.of("booking_item_id", Integer.parseInt(bid) * 10 + n, "checklist_item_id", Integer.parseInt(bid) * 10 + n++,
                "name", b[0], "expected_qty", Integer.parseInt(b[1]), "released_qty", 0, "returned_qty", 0, "required", 1, "checked_released", 0, "condition", "Good"));
    }

    private static Object inspect(JSONObject body) {
        JSONArray its = items.get(Js.s(body, "booking_id"));
        JSONArray sent = body.optJSONArray("items");
        if (its != null && sent != null) for (int i = 0; i < sent.length(); i++) {
            JSONObject s = sent.optJSONObject(i);
            JSONObject it = find(its, "booking_item_id", Js.s(s, "booking_item_id"));
            if (it != null) { Js.put(it, "returned_qty", Js.i(s, "returned_qty")); Js.put(it, "condition", Js.s(s, "condition")); }
        }
        JSONObject b = find(T.get("bookings"), "booking_id", Js.s(body, "booking_id"));
        if (b != null) Js.put(b, "status", "Awaiting Completion");
        return Js.of("saved", true);
    }

    private static JSONObject dashboard() {
        JSONArray b = T.get("bookings");
        int pending = 0, confirmed = 0, awaitPay = 0, completed = 0;
        double revenue = 0;
        Map<String, Integer> pop = new HashMap<>();
        JSONArray upcoming = new JSONArray();
        String today = today(0);
        for (int i = 0; i < b.length(); i++) {
            JSONObject o = b.optJSONObject(i);
            String st = Fmt.titleCase(Js.s(o, "status"));
            if (st.equals("Pending")) pending++;
            if (st.equals("Confirmed")) confirmed++;
            if (st.equals("Awaiting Payment")) awaitPay++;
            if (st.equals("Completed")) completed++;
            revenue += Js.d(o, "amount_paid");
            String sn = Js.s(o, "service_name");
            pop.put(sn, (pop.containsKey(sn) ? pop.get(sn) : 0) + 1);
            if (Js.s(o, "event_date").compareTo(today) >= 0 && (st.equals("Pending") || st.equals("Confirmed")) && upcoming.length() < 5)
                upcoming.put(Js.of("id", Js.s(o, "booking_id"), "booking_reference", Js.s(o, "booking_reference"), "event_date", Js.s(o, "event_date"),
                        "start_time", Js.s(o, "start_time"), "end_time", Js.s(o, "end_time"), "total", Js.d(o, "total"), "status", st,
                        "customer_name", Js.s(o, "customer_name"), "service_name", sn));
        }
        int onRental = 0, attention = 0;
        JSONArray inv = T.get("rentalItems");
        for (int i = 0; i < inv.length(); i++) {
            String is = Js.s(inv.optJSONObject(i), "status");
            if (is.equals("On Rental")) onRental++;
            if (is.equals("Damaged") || is.equals("Missing") || is.equals("Under Maintenance")) attention++;
        }
        JSONArray svc = new JSONArray();
        for (Map.Entry<String, Integer> e : pop.entrySet()) svc.put(Js.of("service_name", e.getKey(), "booking_count", e.getValue()));
        return Js.of("total_bookings", b.length(), "pending_bookings", pending, "confirmed_bookings", confirmed, "awaiting_payment_bookings", awaitPay,
                "completed_bookings", completed, "active_services", T.get("services").length(), "items_on_rental", onRental, "items_needing_attention", attention,
                "total_revenue", revenue, "popularity", Js.of("services", svc), "upcoming_bookings", upcoming);
    }

    private static boolean inRange(String ymd, String start, String end) {
        String d = ymd == null || ymd.length() < 10 ? "" : ymd.substring(0, 10);
        if (d.isEmpty()) return false;
        if (start != null && !start.isEmpty() && d.compareTo(start) < 0) return false;
        if (end != null && !end.isEmpty() && d.compareTo(end) > 0) return false;
        return true;
    }

    /** reports.php?do=report&start=&end= (blank start/end = all dates). Booking numbers use event dates, revenue uses payment dates. */
    private static JSONObject report(String start, String end) {
        JSONArray b = T.get("bookings"), pay = T.get("payments"), inv = T.get("rentalItems");
        int total = 0, pending = 0, confirmed = 0, awaitPay = 0, completed = 0, cancelled = 0, upcomingIn = 0, completedLife = 0, cancelledLife = 0;
        double outstanding = 0, revenue = 0, pendingPay = 0, failedPay = 0, held = 0, refunds = 0, deductions = 0;
        int deductionCount = 0, damaged = 0;
        java.util.Set<String> customers = new java.util.HashSet<>();
        Map<String, Integer> pop = new java.util.LinkedHashMap<>();
        JSONArray upcoming = new JSONArray();
        String today = today(0);
        for (int i = 0; i < b.length(); i++) {
            JSONObject o = b.optJSONObject(i);
            String st = Fmt.titleCase(Js.s(o, "status"));
            if (st.equals("Completed")) completedLife++;
            if (st.equals("Cancelled") || st.equals("Rejected")) cancelledLife++;
            if (!inRange(Js.s(o, "event_date"), start, end)) continue;
            total++;
            customers.add(Js.s(o, "customer_id"));
            if (st.equals("Pending")) pending++;
            if (st.equals("Confirmed")) confirmed++;
            if (st.equals("Awaiting Payment")) awaitPay++;
            if (st.equals("Completed")) completed++;
            if (st.equals("Cancelled") || st.equals("Rejected")) { cancelled++; continue; }
            outstanding += Math.max(0, Js.d(o, "total") - Js.d(o, "amount_paid"));
            String sn = Js.s(o, "service_name");
            pop.put(sn, (pop.containsKey(sn) ? pop.get(sn) : 0) + 1);
            if (Js.s(o, "event_date").compareTo(today) >= 0 && (st.equals("Pending") || st.equals("Confirmed"))) {
                upcomingIn++;
                if (upcoming.length() < 5)
                    upcoming.put(Js.of("id", Js.s(o, "booking_id"), "booking_reference", Js.s(o, "booking_reference"), "event_date", Js.s(o, "event_date"),
                            "total", Js.d(o, "total"), "status", st, "customer_name", Js.s(o, "customer_name"), "service_name", sn));
            }
        }
        for (int i = 0; i < pay.length(); i++) {
            JSONObject p = pay.optJSONObject(i);
            if (!inRange(Js.s(p, "payment_date"), start, end)) continue;
            String ps = Js.s(p, "payment_status");
            if (ps.equals("Completed")) revenue += Js.d(p, "amount");
            else if (ps.equals("Pending")) pendingPay += Js.d(p, "amount");
            else if (ps.equals("Failed")) failedPay += Js.d(p, "amount");
        }
        for (JSONObject d : deposits.values()) {
            if (Js.s(d, "refund_status").equals("Held")) { held += Js.d(d, "amount_held"); refunds += Js.d(d, "refund_amount"); }
            deductions += Js.d(d, "deduction_amount");
            JSONArray ded = d.optJSONArray("deductions");
            deductionCount += ded == null ? 0 : ded.length();
        }
        for (int i = 0; i < inv.length(); i++) {
            String is = Js.s(inv.optJSONObject(i), "status");
            if (is.equals("Damaged") || is.equals("Missing")) damaged++;
        }
        JSONArray ps = new JSONArray();
        for (Map.Entry<String, Integer> e : pop.entrySet()) ps.put(Js.of("name", e.getKey(), "count", e.getValue()));
        return Js.of("total_bookings", total, "total_customers", customers.size(), "pending", pending, "confirmed", confirmed,
                "awaiting_payment", awaitPay, "completed", completed, "cancelled", cancelled, "popular_services", ps, "damaged_or_missing", damaged,
                "total_revenue_collected", revenue, "total_pending_payments", pendingPay, "total_failed_payments", failedPay,
                "outstanding_balances", outstanding, "deposits_held", held, "refunds_available", refunds,
                "total_deductions_amount", deductions, "deductions_count", deductionCount, "upcoming_in_period", upcomingIn,
                "completed_lifetime", completedLife, "cancelled_lifetime", cancelledLife, "approved_overlaps", 0,
                "payments_pending_sync", 0, "upcoming_bookings", upcoming);
    }

    // ------------------------------------------------------------------ helpers
    private static JSONObject merge(JSONObject base, JSONObject patch) { copy(patch, base); return base; }

    private static void copy(JSONObject from, JSONObject to) {
        if (from == null) return;
        java.util.Iterator<String> it = from.keys();
        while (it.hasNext()) { String k = it.next(); Js.put(to, k, from.opt(k)); }
    }

    private static JSONObject find(JSONArray a, String key, String id) {
        if (a == null || id == null) return null;
        for (int i = 0; i < a.length(); i++) { JSONObject o = a.optJSONObject(i); if (o != null && Js.s(o, key).equals(id)) return o; }
        return null;
    }

    private static JSONArray filter(JSONArray a, String key, String val) {
        JSONArray out = new JSONArray();
        for (int i = 0; i < a.length(); i++) if (Js.s(a.optJSONObject(i), key).equals(val)) out.put(a.optJSONObject(i));
        return out;
    }

    private static String today(int offsetDays) {
        Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_MONTH, offsetDays);
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(c.getTime());
    }

    private static JSONArray arr(JSONObject... o) { JSONArray a = new JSONArray(); for (JSONObject x : o) a.put(x); return a; }

    // ------------------------------------------------------------------ sample data
    private static void init() {
        if (ready) return;
        ready = true;
        T.put("services", arr(
                Js.of("service_id", 1, "service_name", "JBL Karaoke Rental", "description", "Karaoke equipment rental.", "default_preparation_minutes", 0, "default_travel_minutes", 0, "status", "Active"),
                Js.of("service_id", 2, "service_name", "Sweet Corner Setup", "description", "Dessert and candy table setup.", "default_preparation_minutes", 0, "default_travel_minutes", 0, "status", "Active"),
                Js.of("service_id", 3, "service_name", "Balloon Decoration", "description", "Balloon garlands, arches, and backdrops.", "default_preparation_minutes", 60, "default_travel_minutes", 30, "status", "Active")));
        T.put("categories", arr(Js.of("category_id", 1, "name", "Entertainment", "status", "Active"), Js.of("category_id", 2, "name", "Food & Treats", "status", "Active"), Js.of("category_id", 3, "name", "Decorations", "status", "Active")));
        T.put("addons", arr(
                Js.of("addon_id", 1, "service_id", 1, "name", "JBL Wireless Microphone", "price", 200, "status", "Active"),
                Js.of("addon_id", 2, "service_id", 1, "name", "Microphone Stand", "price", 100, "status", "Active"),
                Js.of("addon_id", 3, "service_id", 2, "name", "Chocolate Fountain Machine", "price", 150, "status", "Active"),
                Js.of("addon_id", 4, "service_id", 2, "name", "Donut Wall Display", "price", 50, "status", "Active"),
                Js.of("addon_id", 5, "service_id", 2, "name", "Round Rotating Cake Stand", "price", 40, "status", "Active")));
        T.put("packages", arr(
                Js.of("package_id", 1, "service_id", 1, "package_name", "Karaoke Setup — 12 Hours", "price", 999, "description", "Twelve-hour karaoke setup rental.", "inclusions", "1 Smart TV 32\"\n1 karaoke set\n1 JBL Speaker 520\n2 JBL battery microphones", "duration_minutes", 720, "requires_deposit", 0, "deposit_amount", 0, "is_promotional", 0, "status", "Active"),
                Js.of("package_id", 2, "service_id", 1, "package_name", "Karaoke Setup — 24 Hours", "price", 1499, "description", "Twenty-four-hour karaoke setup rental.", "inclusions", "1 Smart TV 32\"\n1 karaoke set", "duration_minutes", 1440, "requires_deposit", 1, "deposit_amount", 500, "is_promotional", 0, "status", "Active"),
                Js.of("package_id", 3, "service_id", 1, "package_name", "JBL Speaker 520 Only — 12 Hours", "price", 699, "description", "Speaker-only rental.", "inclusions", "1 JBL Speaker 520", "duration_minutes", 720, "requires_deposit", 0, "deposit_amount", 0, "is_promotional", 0, "status", "Active"),
                Js.of("package_id", 4, "service_id", 2, "package_name", "Sweet Corner Set A", "price", 250, "description", "Rent-only Sweet Corner equipment set.", "inclusions", "1 donut wall display\n1 round cake stand", "duration_minutes", 0, "requires_deposit", 0, "deposit_amount", 0, "is_promotional", 0, "status", "Active"),
                Js.of("package_id", 5, "service_id", 2, "package_name", "Sweet Corner Set D", "price", 500, "description", "Rent-only Sweet Corner equipment set.", "inclusions", "1 donut wall display\n1 small chocolate fountain", "duration_minutes", 0, "requires_deposit", 0, "deposit_amount", 0, "is_promotional", 0, "status", "Active"),
                Js.of("package_id", 6, "service_id", 3, "package_name", "Package A", "price", 2799, "description", "Balloon decoration package.", "inclusions", "1 panel with cloth\n1 grass carpet\n1 cake stand", "duration_minutes", 0, "requires_deposit", 0, "deposit_amount", 0, "is_promotional", 0, "status", "Active"),
                Js.of("package_id", 7, "service_id", 3, "package_name", "Package K", "price", 3499, "description", "Balloon decoration package.", "inclusions", "1 panel with cloth\n3 colors of balloons", "duration_minutes", 0, "requires_deposit", 0, "deposit_amount", 0, "is_promotional", 1, "promotion_start_date", today(-5), "promotion_end_date", today(25), "status", "Active"),
                Js.of("package_id", 8, "service_id", 3, "package_name", "Package D", "price", 3999, "description", "Balloon decoration package.", "inclusions", "2 panels with cloth\n2 pcs spotlight", "duration_minutes", 0, "requires_deposit", 0, "deposit_amount", 0, "is_promotional", 0, "status", "Active")));
        T.put("rentalItems", arr(
                Js.of("rental_item_id", 1, "service_id", 3, "name", "LED number light", "quantity", 10, "item_code", "BAL-NUM", "required", 0, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 2, "service_id", 3, "name", "Souvenir rack", "quantity", 3, "item_code", "BAL-RACK", "required", 0, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 3, "service_id", 3, "name", "Celebrant chair", "quantity", 3, "item_code", "BAL-CHAIR", "required", 0, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 4, "service_id", 3, "name", "Spotlight", "quantity", 8, "item_code", "BAL-SPOT", "required", 0, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 5, "service_id", 3, "name", "HBD LED light", "quantity", 4, "item_code", "BAL-HBD", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 6, "service_id", 3, "name", "Bending light", "quantity", 6, "item_code", "BAL-LIGHT", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 7, "service_id", 3, "name", "Grass carpet", "quantity", 4, "item_code", "BAL-GRASS", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 8, "service_id", 3, "name", "Backdrop panel", "quantity", 6, "item_code", "BAL-PANEL", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 9, "service_id", 2, "name", "Chocolate fountain", "quantity", 2, "item_code", "SWT-CHOCO", "required", 0, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 10, "service_id", 2, "name", "Serving tray", "quantity", 20, "item_code", "SWT-TRAY", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 11, "service_id", 2, "name", "Cake stand", "quantity", 8, "item_code", "SWT-CAKE", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 12, "service_id", 2, "name", "Buffet table", "quantity", 4, "item_code", "SWT-TBL", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 13, "service_id", 1, "name", "Audio mixer", "quantity", 2, "item_code", "KAR-MIX", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 14, "service_id", 1, "name", "Wireless microphone", "quantity", 6, "item_code", "KAR-MIC", "required", 1, "status", "Available", "condition", "Good", "notes", ""),
                Js.of("rental_item_id", 15, "service_id", 1, "name", "JBL speaker", "quantity", 4, "item_code", "KAR-SPK", "required", 1, "status", "Available", "condition", "Good", "notes", "")));
        T.put("customers", arr(
                Js.of("customer_id", 1, "full_name", "Ana Reyes", "contact_number", "0917-555-0101", "messenger_handle", "ana.reyes"),
                Js.of("customer_id", 2, "full_name", "Carlo Mendoza", "contact_number", "0918-555-0102", "messenger_handle", "carlo.m"),
                Js.of("customer_id", 3, "full_name", "Liza Tan", "contact_number", "0919-555-0103", "messenger_handle", ""),
                Js.of("customer_id", 4, "full_name", "Mark Villanueva", "contact_number", "0920-555-0104", "messenger_handle", "mark.v")));
        T.put("bookings", arr(
                bk(1, "BK-1001", 1, "Ana Reyes", "0917-555-0101", 1, "JBL Karaoke Rental", 1, today(3), "10:00:00", "22:00:00", "Birthday Party", 40, "Quezon City", "Confirmed", 999, 200, 0, 0, 1199, 600),
                bk(2, "BK-1002", 2, "Carlo Mendoza", "0918-555-0102", 3, "Balloon Decoration", 7, today(7), "14:00:00", "20:00:00", "Wedding", 120, "Makati City", "Pending", 3499, 0, 100, 0, 3399, 0),
                bk(3, "BK-1003", 3, "Liza Tan", "0919-555-0103", 2, "Sweet Corner Setup", 5, today(10), "09:00:00", "18:00:00", "Christening", 60, "Pasig City", "Confirmed", 500, 190, 0, 0, 690, 690),
                bk(4, "BK-1004", 4, "Mark Villanueva", "0920-555-0104", 1, "JBL Karaoke Rental", 2, today(-12), "08:00:00", "20:00:00", "Reunion", 30, "Taguig City", "Awaiting Payment", 1499, 0, 0, 0, 1499, 500),
                bk(5, "BK-1005", 1, "Ana Reyes", "0917-555-0101", 3, "Balloon Decoration", 6, today(-30), "13:00:00", "19:00:00", "Debut", 80, "Manila", "Completed", 2799, 0, 0, 0, 2799, 2799),
                bk(7, "BK-0907", 3, "Liza Tan", "0919-555-0103", 2, "Sweet Corner Setup", 5, today(-62), "09:00:00", "18:00:00", "Birthday Party", 40, "Pasig City", "Completed", 500, 0, 0, 0, 500, 500),
                bk(8, "BK-0908", 4, "Mark Villanueva", "0920-555-0104", 1, "JBL Karaoke Rental", 1, today(-95), "10:00:00", "22:00:00", "Reunion", 35, "Taguig City", "Completed", 999, 0, 0, 0, 999, 999),
                bk(9, "BK-0909", 1, "Ana Reyes", "0917-555-0101", 3, "Balloon Decoration", 8, today(-128), "13:00:00", "19:00:00", "Debut", 90, "Manila", "Completed", 3999, 0, 0, 0, 3999, 3999),
                bk(10, "BK-0910", 2, "Carlo Mendoza", "0918-555-0102", 1, "JBL Karaoke Rental", 2, today(-150), "08:00:00", "20:00:00", "Wedding", 70, "Makati City", "Completed", 1499, 0, 0, 0, 1499, 1499),
                bk(6, "BK-1006", 2, "Carlo Mendoza", "0918-555-0102", 2, "Sweet Corner Setup", 4, today(-3), "10:00:00", "16:00:00", "Anniversary", 25, "Mandaluyong", "Cancelled", 250, 0, 0, 0, 250, 0)));
        T.put("payments", arr(
                pay(1, 1, 600, "GCash", "Completed", "Down payment", today(-4)),
                pay(2, 3, 690, "MariBank", "Completed", "Balance", today(-2)),
                pay(3, 4, 500, "GCash", "Completed", "Down payment", today(-14)),
                pay(4, 5, 2799, "GCash", "Completed", "Balance", today(-30)),
                pay(5, 2, 500, "MariBank", "Pending", "Down payment", today(-1)),
                pay(6, 7, 500, "GCash", "Completed", "Balance", today(-62)),
                pay(7, 8, 999, "MariBank", "Completed", "Balance", today(-95)),
                pay(8, 9, 3999, "GCash", "Completed", "Balance", today(-128)),
                pay(9, 10, 1499, "GCash", "Completed", "Balance", today(-150))));
        T.put("gallery", arr(
                Js.of("image_id", 1, "title", "Karaoke night setup", "image", "/uploads/gallery/karaoke.jpg", "featured", 1),
                Js.of("image_id", 2, "title", "Sweet corner table", "image", "/uploads/gallery/sweet-corner.jpg", "featured", 1),
                Js.of("image_id", 3, "title", "Balloon arch", "image", "/uploads/gallery/balloon-arch.jpg", "featured", 0)));
        T.put("owners", arr(
                Js.of("user_id", 1, "full_name", "Maria Santos", "username", "maria", "contact_number", "0917-123-4567", "account_status", "Active", "is_primary_owner", 1),
                Js.of("user_id", 2, "full_name", "Juan Dela Cruz", "username", "juan", "contact_number", "0918-222-3333", "account_status", "Active", "is_primary_owner", 0)));
        T.put("audit", arr(
                audit(6, "payment_recorded", "payment", 1, "Recorded ₱600.00 for BK-1001", "", "", today(-4)),
                audit(5, "booking_status_changed", "booking", 1, "BK-1001 confirmed", "Pending", "Confirmed", today(-4)),
                audit(4, "booking_created", "booking", 2, "Manual booking BK-1002 created", "", "", today(-2)),
                audit(3, "booking_cancelled", "booking", 6, "BK-1006 cancelled: customer request", "Pending", "Cancelled", today(-3)),
                audit(2, "package_updated", "package", 7, "Package K promotion dates changed", "", "", today(-6)),
                audit(1, "owner_login", "user", 1, "Owner signed in", "", "", today(-7))));
        settings = Js.of("business_name", "AKAD Sweet Party Rentals", "logo", "", "phone", "0917-123-4567", "email", "akad@example.com", "address", "Metro Manila",
                "facebook", "facebook.com/akadrentals", "instagram", "instagram.com/akadrentals", "min_booking_notice_days", 2, "booking_hours_open", "08:00",
                "booking_hours_close", "22:00", "cancellation_policy", "Cancellations 3 days before the event are fully refundable.", "primary_color", "#8A633F", "accent_color", "#D1A170");
        content = Js.of("business_name", "AKAD Sweet Party Rentals", "logo", "", "hero_title", "Make every celebration sweeter",
                "hero_description", "Karaoke rental, Sweet Corner packages, and balloon decorations.", "hero_image", "", "hero_button_text", "Book now",
                "about_title", "About us", "about_description", "We provide karaoke rental, Sweet Corner packages, and balloon decorations.",
                "contact_phone", "0917-123-4567", "contact_email", "akad@example.com", "contact_address", "Metro Manila",
                "contact_facebook", "facebook.com/akadrentals", "contact_instagram", "instagram.com/akadrentals");
        deposits.put("1", Js.of("booking_id", 1, "amount_held", 500, "deduction_amount", 0, "refund_amount", 500, "refund_status", "Held", "deductions", new JSONArray()));
        delivery.put("1", Js.of("booking_id", 1, "delivery_method", "lalamove", "delivery_fee", 250, "fee_shouldered_by", "Customer", "delivery_notes", "Call on arrival"));
        JSONArray it1 = new JSONArray();
        makeItems("1", it1);
        items.put("1", it1);
    }

    private static JSONObject bk(int id, String ref, int cid, String cname, String contact, int sid, String sname, int pid, String date, String st, String en,
                                 String type, int guests, String loc, String status, double sub, double addons, double disc, double fees, double total, double paid) {
        return Js.of("booking_id", id, "booking_reference", ref, "customer_id", cid, "customer_name", cname, "contact", contact, "email", "", "customer_type", "Returning client",
                "service_id", sid, "service_name", sname, "service_ids", new JSONArray().put(sid), "addon_ids", new JSONArray(), "package_id", pid,
                "event_date", date, "start_time", st, "end_time", en, "event_type", type, "guests", guests, "event_location", loc, "special_requests", "",
                "status", status, "subtotal", sub, "addons_total", addons, "discount", disc, "fees", fees, "total", total, "agreed_total", total, "amount_paid", paid,
                "preparation_minutes", 0, "travel_minutes", 0, "source", "Manual");
    }

    private static JSONObject pay(int id, int bid, double amt, String method, String status, String type, String date) {
        return Js.of("payment_id", id, "booking_id", bid, "amount", amt, "payment_method", method, "payment_status", status, "payment_type", type,
                "payment_date", date + " 10:00:00", "payment_reference", "", "notes", "");
    }

    private static JSONObject audit(int id, String action, String type, int rid, String desc, String oldS, String newS, String date) {
        return Js.of("audit_id", id, "action", action, "record_type", type, "record_id", rid, "description", desc, "old_status", oldS, "new_status", newS,
                "origin", "owner", "actor_name", "Maria Santos", "created_at", date + " 09:00:00");
    }
}
