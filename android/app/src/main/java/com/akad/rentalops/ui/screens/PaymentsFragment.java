package com.akad.rentalops.ui.screens;

import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * admin/payments.html: "All Payments" (api/payments.php) and "Outstanding Balances" (from bookings).
 * Recording a payment happens on the booking detail screen (Payments tab).
 */
public class PaymentsFragment extends ListScreen {
    private final Map<String, JSONObject> bookings = new HashMap<>();

    @Override protected String[] filterOptions() { return new String[]{"All", "Payments", "Outstanding Balances"}; }

    @Override protected boolean matchesFilter(JSONObject o, String f) {
        String kind = Js.s(o, "_kind");
        return f.equals("Payments") ? kind.equals("payment") : kind.equals("balance");
    }

    @Override protected void load(final Api.Callback cb) {
        Api.get("bookings.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object data) {
                final JSONArray b = Api.arr(data);
                bookings.clear();
                for (int i = 0; i < b.length(); i++) {
                    JSONObject o = b.optJSONObject(i);
                    if (o != null) bookings.put(Js.s(o, "booking_id"), o);
                }
                Api.get("payments.php", Api.q("do", "all"), new Api.Callback() {
                    @Override public void onSuccess(Object pdata) {
                        JSONArray out = new JSONArray();
                        JSONArray pays = Api.arr(pdata);
                        for (int i = 0; i < pays.length(); i++) {
                            JSONObject p = pays.optJSONObject(i);
                            if (p != null) { Js.put(p, "_kind", "payment"); out.put(p); }
                        }
                        for (int i = 0; i < b.length(); i++) {
                            JSONObject o = b.optJSONObject(i);
                            if (o == null) continue;
                            String st = Fmt.titleCase(Js.s(o, "status"));
                            if (st.equals("Cancelled") || st.equals("Rejected")) continue;
                            if (balance(o) > 0) {
                                JSONObject copy = Js.of("_kind", "balance", "booking_id", Js.s(o, "booking_id"));
                                out.put(copy);
                            }
                        }
                        cb.onSuccess(out);
                    }
                    @Override public void onError(String m, String c, int s) { cb.onError(m, c, s); }
                });
            }
            @Override public void onError(String m, String c, int s) { cb.onError(m, c, s); }
        });
    }

    private static double balance(JSONObject booking) {
        double total = Js.d(booking, "agreed_total") > 0 ? Js.d(booking, "agreed_total") : Js.d(booking, "total");
        return Math.max(0, total - Js.d(booking, "amount_paid"));
    }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        JSONObject b = bookings.get(Js.s(o, "booking_id"));
        String bookingId = b == null ? Js.s(o, "booking_id") : Js.s(b, "booking_id");
        String bookingLabel = "Booking #" + bookingId;
        String who = b == null ? "" : Js.s(b, "customer_name");
        if (Js.s(o, "_kind").equals("balance")) {
            double total = Js.d(b, "agreed_total") > 0 ? Js.d(b, "agreed_total") : Js.d(b, "total");
            double paid = Js.d(b, "amount_paid");
            return new RowAdapter.Row(o).title("Balance · " + bookingLabel).subtitle(who)
                    .detail("Total " + Fmt.peso(total) + " · Paid " + Fmt.peso(paid))
                    .meta(Fmt.peso(balance(b))).badge(Fmt.paymentStatus(total, paid));
        }
        String method = Js.s(o, "payment_method");
        method = method.equalsIgnoreCase("gcash") ? "GCash" : method.equalsIgnoreCase("maribank") ? "MariBank" : method;
        String type = Js.s(o, "payment_type");
        return new RowAdapter.Row(o).title(bookingLabel + " · " + who)
                .subtitle(method + (type.isEmpty() ? "" : " · " + type) + " · " + Fmt.date(Js.s(o, "payment_date")))
                .detail(Js.s(o, "payment_reference").isEmpty() ? Js.s(o, "notes") : Js.s(o, "payment_reference"))
                .meta(Fmt.peso(Js.d(o, "amount"))).badge(Js.s(o, "payment_status"));
    }

    @Override protected void onRowClick(RowAdapter.Row row) {
        String id = Js.s(row.raw, "booking_id");
        if (!id.isEmpty() && nav() != null) nav().openBooking(id);
    }
}
