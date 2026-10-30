package com.akad.rentalops.ui.screens;

import android.view.View;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Lookups;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** admin/bookings.html list -> api/bookings.php?do=all. Tap a row for the detail tabs. */
public class BookingsFragment extends ListScreen {
    private Lookups.Pairs services = new Lookups.Pairs();
    private static final String[] FILTERS;
    static {
        List<String> l = new ArrayList<>();
        l.add("All Statuses");
        l.addAll(Arrays.asList(Fmt.BOOKING_STATUSES));
        FILTERS = l.toArray(new String[0]);
    }

    @Override protected String searchWebId() { return "filterSearch"; }
    @Override protected String filterWebId() { return "filterStatus"; }

    @Override protected void load(final Api.Callback cb) {
        Lookups.services(false, new Lookups.Done() {
            @Override public void done(Lookups.Pairs p) {
                services = p;
                Api.get("bookings.php", Api.q("do", "all"), cb);
            }
        });
    }

    @Override protected String[] filterOptions() { return FILTERS; }

    @Override protected boolean matchesFilter(JSONObject o, String f) {
        return Fmt.titleCase(Js.s(o, "status")).equalsIgnoreCase(f);
    }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        return toBookingRow(o, services);
    }

    /** Shared by Bookings, Dashboard, Calendar and Reports. */
    public static RowAdapter.Row toBookingRow(JSONObject o, Lookups.Pairs services) {
        String id = Js.s(o, "booking_id").isEmpty() ? Js.s(o, "id") : Js.s(o, "booking_id");
        double total = Js.d(o, "total");
        double paid = Js.d(o, "amount_paid");
        String svc = Js.s(o, "service_name");
        if (svc.isEmpty() && services != null) svc = services.nameOf(Js.s(o, "service_id"));
        String customer = Js.s(o, "customer_name");
        String bookingLabel = "Booking #" + id;
        return new RowAdapter.Row(o)
                .title(customer.isEmpty() ? bookingLabel : customer)
                .subtitle(bookingLabel + " · " + Fmt.date(Js.s(o, "event_date")) + ", " + Fmt.time(Js.s(o, "start_time")) + "–" + Fmt.time(Js.s(o, "end_time")))
                .detail(svc)
                .meta(Fmt.peso(total))
                .badge(o.has("amount_paid") ? Fmt.paymentStatus(total, paid) : Js.s(o, "payment_status"))
                .badge2(Fmt.titleCase(Js.s(o, "status")));
    }

    @Override protected boolean canAdd() { return true; }
    @Override protected void onAdd() { if (nav() != null) nav().goTo(R.id.nav_manual_booking); }

    @Override protected void onRowClick(RowAdapter.Row row) {
        String id = Js.s(row.raw, "booking_id").isEmpty() ? Js.s(row.raw, "id") : Js.s(row.raw, "booking_id");
        if (nav() != null) nav().openBooking(id);
    }
}
