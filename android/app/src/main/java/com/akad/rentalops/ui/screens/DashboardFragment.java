package com.akad.rentalops.ui.screens;

import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.BaseFragment;
import com.akad.rentalops.ui.charts.BarChartView;
import com.akad.rentalops.ui.charts.DonutChartView;
import com.akad.rentalops.ui.charts.LineChartView;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;

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
 * admin/dashboard.html: sync panel, animated Revenue &amp; Bookings trend, Booking Status doughnut,
 * stat cards, Most Booked Services bars, Inventory Attention and Upcoming Bookings.
 * Pull down (or tap refresh) to reload and replay the chart animations.
 */
public class DashboardFragment extends BaseFragment {
    private SwipeRefreshLayout swipe;
    private GridLayout grid;
    private LinearLayout upcoming, attention;
    private TextView state, syncSummary, syncDetail;
    private LineChartView trend;
    private DonutChartView status;
    private BarChartView services;

    private JSONObject stats = new JSONObject();
    private JSONArray bookings = new JSONArray(), payments = new JSONArray(), rentalItems = new JSONArray();
    private int pendingCalls;

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        return inf.inflate(R.layout.fragment_dashboard, c, false);
    }

    @Override public void onViewCreated(@NonNull final View v, @Nullable Bundle b) {
        swipe = v.findViewById(R.id.swipe);
        grid = v.findViewById(R.id.statsRow);
        upcoming = v.findViewById(R.id.upcomingBody);
        attention = v.findViewById(R.id.attentionList);
        state = v.findViewById(R.id.dashboardDataState);
        trend = v.findViewById(R.id.revenueChart);
        status = v.findViewById(R.id.statusChart);
        services = v.findViewById(R.id.servicesChart);
        syncSummary = v.findViewById(R.id.syncSummary);
        syncDetail = v.findViewById(R.id.syncDetail);

        syncSummary.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                boolean open = syncDetail.getVisibility() == View.VISIBLE;
                syncDetail.setVisibility(open ? View.GONE : View.VISIBLE);
                syncSummary.setText((open ? "▸" : "▾") + "  Online · 0 Pending Sync");
            }
        });
        click(R.id.dashNewBooking, new Runnable() { public void run() { go(R.id.nav_manual_booking); } });
        click(R.id.dashViewAll, new Runnable() { public void run() { go(R.id.nav_bookings); } });
        click(R.id.dashManageServices, new Runnable() { public void run() { go(R.id.nav_services); } });
        click(R.id.dashViewInventory, new Runnable() { public void run() { go(R.id.nav_inventory); } });
        click(R.id.refreshDashboardData, new Runnable() { public void run() { reload(); } });
        click(R.id.dashBell, new Runnable() { public void run() { showNotifications(); } });
        swipe.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() { @Override public void onRefresh() { reload(); } });
        reload();
    }

    private void click(int id, final Runnable r) {
        getView().findViewById(id).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { r.run(); } });
    }

    private void go(int navId) { if (nav() != null) nav().goTo(navId); }

    // ------------------------------------------------------------------ loading
    private void reload() {
        swipe.setRefreshing(true);
        state.setText("Refreshing saved data…");
        pendingCalls = 4;
        Api.get("reports.php", Api.q("do", "dashboard"), new Api.Callback() {
            @Override public void onSuccess(Object d) { stats = Api.obj(d); done(null); }
            @Override public void onError(String m, String c, int s) { done(m); }
        });
        Api.get("bookings.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object d) { bookings = Api.arr(d); done(null); }
            @Override public void onError(String m, String c, int s) { done(m); }
        });
        Api.get("payments.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object d) { payments = Api.arr(d); done(null); }
            @Override public void onError(String m, String c, int s) { done(m); }
        });
        Api.get("rentalItems.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object d) { rentalItems = Api.arr(d); done(null); }
            @Override public void onError(String m, String c, int s) { done(m); }
        });
    }

    private String firstError;

    private void done(String error) {
        if (error != null) firstError = error;
        if (--pendingCalls > 0 || !alive()) return;
        swipe.setRefreshing(false);
        state.setText(firstError == null ? "Dashboard refreshed from updated saved data." : "Refresh failed: " + firstError + ". Showing saved data.");
        firstError = null;
        renderCharts();
        renderStats();
        renderAttention();
        renderUpcoming();
    }

    // ------------------------------------------------------------------ charts
    private void renderCharts() {
        // last six months: revenue = completed payments by payment date, bookings = non-cancelled by event date
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.DAY_OF_MONTH, 1);
        cal.add(Calendar.MONTH, -5);
        String[] keys = new String[6], labels = new String[6];
        double[] revenue = new double[6], count = new double[6];
        SimpleDateFormat key = new SimpleDateFormat("yyyy-MM", Locale.US), lab = new SimpleDateFormat("MMM yy", Locale.US);
        Map<String, Integer> index = new HashMap<>();
        for (int i = 0; i < 6; i++) {
            keys[i] = key.format(cal.getTime());
            labels[i] = lab.format(cal.getTime());
            index.put(keys[i], i);
            cal.add(Calendar.MONTH, 1);
        }
        for (int i = 0; i < payments.length(); i++) {
            JSONObject p = Js.at(payments, i);
            if (!"Completed".equals(Js.s(p, "payment_status"))) continue;
            Integer ix = index.get(Js.s(p, "payment_date").length() >= 7 ? Js.s(p, "payment_date").substring(0, 7) : "");
            if (ix != null) revenue[ix] += Js.d(p, "amount");
        }
        for (int i = 0; i < bookings.length(); i++) {
            JSONObject b = Js.at(bookings, i);
            if ("Cancelled".equals(Fmt.titleCase(Js.s(b, "status")))) continue;
            Integer ix = index.get(Js.s(b, "event_date").length() >= 7 ? Js.s(b, "event_date").substring(0, 7) : "");
            if (ix != null) count[ix] += 1;
        }
        trend.setData(labels, revenue, count);

        // booking status doughnut (colors follow the website chart)
        String[] names = {"Pending", "Confirmed", "Awaiting Payment", "Completed", "Cancelled"};
        int[] colors = {0xFFD9A441, 0xFF14332C, 0xFFE08A1E, 0xFF2E6E5F, 0xFFE74C3C};
        double[] vals = new double[names.length];
        for (int i = 0; i < bookings.length(); i++) {
            String st = Fmt.titleCase(Js.s(Js.at(bookings, i), "status"));
            for (int k = 0; k < names.length; k++) if (names[k].equals(st)) vals[k]++;
        }
        status.setData(names, vals, colors);

        // most booked services (reports.popularity.services)
        JSONObject pop = stats.optJSONObject("popularity");
        JSONArray svc = pop == null ? null : pop.optJSONArray("services");
        int n = svc == null ? 0 : svc.length();
        String[] sn = new String[n];
        double[] sv = new double[n];
        for (int i = 0; i < n; i++) { sn[i] = Js.s(Js.at(svc, i), "service_name"); sv[i] = Js.d(Js.at(svc, i), "booking_count"); }
        services.setData(sn, sv);
    }

    // ------------------------------------------------------------------ stat cards
    private void renderStats() {
        grid.removeAllViews();
        int awaiting = Js.i(stats, "awaiting_payment_bookings"), attn = Js.i(stats, "items_needing_attention");
        card("Collected Revenue", Fmt.peso(Js.d(stats, "total_revenue")), R.drawable.ic_money, "success");
        card("Total Bookings", String.valueOf(Js.i(stats, "total_bookings")), R.drawable.ic_list, "");
        card("Pending Approval", String.valueOf(Js.i(stats, "pending_bookings")), R.drawable.ic_hourglass, "warn");
        card("Confirmed Events", String.valueOf(Js.i(stats, "confirmed_bookings")), R.drawable.ic_check_circle, "");
        card("Awaiting Payment", String.valueOf(awaiting), R.drawable.ic_money, awaiting > 0 ? "warn" : "");
        card("Completed", String.valueOf(Js.i(stats, "completed_bookings")), R.drawable.ic_flag, "");
        card("Active Services", String.valueOf(Js.i(stats, "active_services")), R.drawable.ic_box, "");
        card("Items On Rental", String.valueOf(Js.i(stats, "items_on_rental")), R.drawable.ic_truck, "");
        card("Needs Attention", String.valueOf(attn), R.drawable.ic_warning, attn > 0 ? "danger" : "");
    }

    private void card(String label, String value, int icon, String cls) {
        View c = LayoutInflater.from(getContext()).inflate(R.layout.item_stat_card, grid, false);
        ((TextView) c.findViewById(R.id.statLabel)).setText(label);
        ((TextView) c.findViewById(R.id.statValue)).setText(value);
        ImageView iv = c.findViewById(R.id.statIcon);
        iv.setImageResource(icon);
        int accent, tint;
        switch (cls) {
            case "success": accent = 0xFF2E6E5F; tint = 0xFF2E6E5F; break;
            case "warn": accent = 0xFFD9A441; tint = 0xFFD9A441; break;
            case "danger": accent = 0xFFC0392B; tint = 0xFFC0392B; break;
            default: accent = 0x8C1F4E45; tint = 0xFF1F4E45;
        }
        iv.setColorFilter(tint);
        GradientDrawable box = new GradientDrawable();
        box.setCornerRadius(24f);
        box.setColor((tint & 0x00FFFFFF) | 0x26000000);
        c.findViewById(R.id.statIconBox).setBackground(box);
        c.findViewById(R.id.statBar).setBackgroundColor(accent);
        grid.addView(c);
    }

    // ------------------------------------------------------------------ inventory attention
    private void renderAttention() {
        attention.removeAllViews();
        int shown = 0;
        for (int i = 0; i < rentalItems.length(); i++) {
            final JSONObject it = Js.at(rentalItems, i);
            String st = Js.s(it, "status");
            if (!(st.equals("Damaged") || st.equals("Missing") || st.equals("Under Maintenance"))) continue;
            shown++;
            LinearLayout row = new LinearLayout(getContext());
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(0, 10, 0, 10);
            LinearLayout left = new LinearLayout(getContext());
            left.setOrientation(LinearLayout.VERTICAL);
            left.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            TextView name = new TextView(getContext());
            name.setText(Js.s(it, "name"));
            name.setTypeface(null, android.graphics.Typeface.BOLD);
            TextView sub = new TextView(getContext());
            sub.setText(Js.s(it, "item_code") + (Js.s(it, "notes").isEmpty() ? "" : " · " + Js.s(it, "notes")));
            sub.setTextSize(12);
            sub.setTextColor(ContextCompat.getColor(requireContext(), R.color.muted));
            left.addView(name);
            left.addView(sub);
            TextView badge = new TextView(getContext());
            badge.setPadding(20, 4, 20, 4);
            badge.setTextSize(11);
            badge.setTypeface(null, android.graphics.Typeface.BOLD);
            Fmt.badge(badge, st);
            row.addView(left);
            row.addView(badge);
            attention.addView(row);
        }
        if (shown == 0) {
            LinearLayout empty = new LinearLayout(getContext());
            empty.setOrientation(LinearLayout.VERTICAL);
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(0, 28, 0, 28);
            ImageView ic = new ImageView(getContext());
            ic.setImageResource(R.drawable.ic_shield_check);
            ic.setColorFilter(ContextCompat.getColor(requireContext(), R.color.badge_success));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(72, 72);
            lp.bottomMargin = 12;
            ic.setLayoutParams(lp);
            TextView t = new TextView(getContext());
            t.setText("All inventory items are in good condition.");
            t.setGravity(Gravity.CENTER);
            t.setTextColor(ContextCompat.getColor(requireContext(), R.color.muted));
            empty.addView(ic);
            empty.addView(t);
            attention.addView(empty);
        }
    }

    // ------------------------------------------------------------------ upcoming bookings table
    private static final int[] COL_DP = {90, 140, 130, 160, 100, 120};
    private static final String[] COL_HEAD = {"BOOKING ID", "CUSTOMER", "EVENT DATE", "SERVICES", "TOTAL", "STATUS"};

    private void renderUpcoming() {
        upcoming.removeAllViews();
        upcoming.addView(tableRow(COL_HEAD, null, true));
        JSONArray up = stats.optJSONArray("upcoming_bookings");
        if (up == null || up.length() == 0) {
            TextView t = new TextView(getContext());
            t.setText("No upcoming bookings found.");
            t.setTextColor(ContextCompat.getColor(requireContext(), R.color.muted));
            t.setPadding(12, 28, 12, 28);
            upcoming.addView(t);
            return;
        }
        for (int i = 0; i < up.length(); i++) {
            final JSONObject b = Js.at(up, i);
            String id = Js.s(b, "id");
            String[] cells = {Js.s(b, "booking_reference").isEmpty() ? id : Js.s(b, "booking_reference"), Js.s(b, "customer_name"),
                    Fmt.date(Js.s(b, "event_date")), Js.s(b, "service_name"), Fmt.peso(Js.d(b, "total")), Fmt.titleCase(Js.s(b, "status"))};
            LinearLayout row = tableRow(cells, Fmt.titleCase(Js.s(b, "status")), false);
            row.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { if (nav() != null) nav().openBooking(Js.s(b, "id")); }
            });
            upcoming.addView(row);
        }
    }

    private LinearLayout tableRow(String[] cells, String badgeStatus, boolean header) {
        LinearLayout row = new LinearLayout(getContext());
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        if (header) row.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.bg));
        float d = getResources().getDisplayMetrics().density;
        for (int i = 0; i < cells.length; i++) {
            TextView t = new TextView(getContext());
            t.setLayoutParams(new LinearLayout.LayoutParams((int) (COL_DP[i] * d), ViewGroup.LayoutParams.WRAP_CONTENT));
            t.setPadding((int) (10 * d), (int) (12 * d), (int) (6 * d), (int) (12 * d));
            if (header) {
                t.setText(cells[i]);
                t.setTextSize(11);
                t.setTypeface(null, android.graphics.Typeface.BOLD);
                t.setTextColor(ContextCompat.getColor(requireContext(), R.color.muted));
            } else if (i == cells.length - 1 && badgeStatus != null) {
                t.setTextSize(11);
                t.setTypeface(null, android.graphics.Typeface.BOLD);
                Fmt.badge(t, badgeStatus);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
                lp.leftMargin = (int) (10 * d);
                t.setPadding((int) (8 * d), (int) (3 * d), (int) (8 * d), (int) (3 * d));
                t.setLayoutParams(lp);
            } else {
                t.setText(cells[i]);
                t.setTextSize(13);
                t.setTextColor(i == 0 ? ContextCompat.getColor(requireContext(), R.color.primary) : ContextCompat.getColor(requireContext(), R.color.text));
            }
            row.addView(t);
        }
        if (!header) {
            row.setBackgroundResource(android.R.drawable.list_selector_background);
        }
        return row;
    }

    // ------------------------------------------------------------------ bell
    private void showNotifications() {
        Api.get("notifications.php", Api.q("do", "unresolved"), new Api.Callback() {
            @Override public void onSuccess(Object d) {
                if (!alive()) return;
                JSONArray a = Api.arr(d);
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < a.length(); i++) {
                    JSONObject n = Js.at(a, i);
                    sb.append("• ").append(Js.s(n, "message")).append("\n\n");
                }
                new AlertDialog.Builder(requireContext()).setTitle("Notifications")
                        .setMessage(a.length() == 0 ? "No action-required notifications." : sb.toString().trim())
                        .setPositiveButton("Close", null).show();
            }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }
}
