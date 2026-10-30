package com.akad.rentalops.ui.screens;

import android.content.Intent;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.BaseFragment;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.ui.charts.BarChartView;
import com.akad.rentalops.ui.charts.DonutChartView;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;
import com.google.android.material.button.MaterialButton;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * admin/reports.html: date range, live charts (Bookings by Status, Most Popular Services), stat cards,
 * operational totals, Package Popularity and Damaged / Missing items.
 *
 * "Live": while the screen is visible it re-reads the data every {@link #LIVE_MS} ms and the charts
 * re-animate only when their numbers actually changed. Tap the Live pill to pause/resume, pull down
 * or tap "Refresh data" to reload immediately.
 *
 * Empty From/To = all booking dates. Apply copies the picked dates into the report; Reset clears them.
 */
public class ReportsFragment extends BaseFragment {
    private static final long LIVE_MS = 15000;
    private static final DecimalFormat WHOLE = new DecimalFormat("#,##0"), CENTS = new DecimalFormat("#,##0.00");

    private View root;
    private SwipeRefreshLayout swipe;
    private MaterialButton startBtn, endBtn;
    private TextView state, live, rangeBadge, syncSummary, syncDetail, servicesEmpty, packagesEmpty, damagedEmpty;
    private DonutChartView statusChart;
    private BarChartView servicesChart;
    private GridLayout statsGrid, opsGrid;
    private LinearLayout packagesTable, damagedTable;

    private String start = "", end = "";            // applied range (yyyy-MM-dd, "" = open)
    private String pickStart = "", pickEnd = "";    // values shown in the inputs, applied on "Apply"
    private boolean liveOn = true;
    private int gen;                                 // bumps on every load so stale responses are ignored
    private long lastLoad;
    private String statusSig = "", servicesSig = "", lastTime = "";
    private JSONObject lastReport = new JSONObject();

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable tick = new Runnable() {
        @Override public void run() { if (liveOn && alive()) load(true); schedule(); }
    };

    private static final class Load {
        int pending = 5;
        String error;
        JSONObject report = new JSONObject();
        JSONArray bookings = new JSONArray(), packages = new JSONArray(), rentalItems = new JSONArray();
    }

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        root = inf.inflate(R.layout.fragment_reports, c, false);
        return root;
    }

    @Override public void onViewCreated(@NonNull View v, @Nullable Bundle b) {
        swipe = v.findViewById(R.id.repSwipe);
        startBtn = v.findViewById(R.id.repStart);
        endBtn = v.findViewById(R.id.repEnd);
        state = v.findViewById(R.id.repState);
        live = v.findViewById(R.id.repLive);
        rangeBadge = v.findViewById(R.id.repRangeBadge);
        syncSummary = v.findViewById(R.id.repSyncSummary);
        syncDetail = v.findViewById(R.id.repSyncDetail);
        servicesEmpty = v.findViewById(R.id.repServicesEmpty);
        packagesEmpty = v.findViewById(R.id.repPackagesEmpty);
        damagedEmpty = v.findViewById(R.id.repDamagedEmpty);
        statusChart = v.findViewById(R.id.repStatusChart);
        servicesChart = v.findViewById(R.id.repServicesChart);
        statsGrid = v.findViewById(R.id.repStats);
        opsGrid = v.findViewById(R.id.repOps);
        packagesTable = v.findViewById(R.id.repPackages);
        damagedTable = v.findViewById(R.id.repDamaged);

        syncSummary.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                boolean open = syncDetail.getVisibility() == View.VISIBLE;
                syncDetail.setVisibility(open ? View.GONE : View.VISIBLE);
                syncSummary.setText((open ? "▸" : "▾") + "  Online · 0 Pending Sync");
            }
        });
        startBtn.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                FormUi.pickDate(requireContext(), pickStart, new FormUi.OnPicked() { public void picked(String d) { pickStart = d; showInputs(); } });
            }
        });
        endBtn.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                FormUi.pickDate(requireContext(), pickEnd, new FormUi.OnPicked() { public void picked(String d) { pickEnd = d; showInputs(); } });
            }
        });
        v.findViewById(R.id.repRun).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                if (!pickStart.isEmpty() && !pickEnd.isEmpty() && pickStart.compareTo(pickEnd) > 0) {
                    toast("The start date must be on or before the end date.");
                    return;
                }
                start = pickStart; end = pickEnd;
                statusSig = ""; servicesSig = "";   // replay the chart animations for the new range
                load(false);
            }
        });
        v.findViewById(R.id.repReset).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                pickStart = ""; pickEnd = ""; start = ""; end = "";
                showInputs();
                statusSig = ""; servicesSig = "";
                load(false);
            }
        });
        v.findViewById(R.id.repRefresh).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { load(false); } });
        v.findViewById(R.id.repReceipt).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { showReceipt(); } });
        v.findViewById(R.id.repBell).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { showNotifications(); } });
        live.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                liveOn = !liveOn;
                paintLive();
                if (liveOn) { load(true); schedule(); } else handler.removeCallbacks(tick);
                toast(liveOn ? "Live updates on." : "Live updates paused.");
            }
        });
        swipe.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() { @Override public void onRefresh() { load(false); } });

        showInputs();
        paintLive();
        load(false);
    }

    @Override public void onResume() {
        super.onResume();
        if (lastLoad > 0 && liveOn && System.currentTimeMillis() - lastLoad > LIVE_MS && alive()) load(true);
        schedule();
    }

    @Override public void onPause() {
        handler.removeCallbacks(tick);
        super.onPause();
    }

    @Override public void onDestroyView() {
        handler.removeCallbacks(tick);
        gen++;
        super.onDestroyView();
    }

    private void schedule() {
        handler.removeCallbacks(tick);
        if (liveOn) handler.postDelayed(tick, LIVE_MS);
    }

    // ------------------------------------------------------------------ inputs
    private static String us(String ymd) {
        return ymd.length() < 10 ? "mm/dd/yyyy" : ymd.substring(5, 7) + "/" + ymd.substring(8, 10) + "/" + ymd.substring(0, 4);
    }

    private void showInputs() {
        startBtn.setText(us(pickStart));
        endBtn.setText(us(pickEnd));
    }

    private void paintLive() {
        int color = ContextCompat.getColor(requireContext(), liveOn ? R.color.badge_success : R.color.muted);
        live.setTextColor(color);
        live.setText((liveOn ? "● Live" : "❚❚ Paused") + (lastTime.isEmpty() ? "" : " · " + lastTime));
    }

    private String rangeText() {
        if (start.isEmpty() && end.isEmpty()) return "All booking dates";
        if (start.isEmpty()) return "Until " + Fmt.date(end);
        if (end.isEmpty()) return "From " + Fmt.date(start);
        return Fmt.date(start) + " – " + Fmt.date(end);
    }

    private boolean inRange(String ymd) {
        String d = ymd == null || ymd.length() < 10 ? "" : ymd.substring(0, 10);
        if (d.isEmpty()) return false;
        if (!start.isEmpty() && d.compareTo(start) < 0) return false;
        if (!end.isEmpty() && d.compareTo(end) > 0) return false;
        return true;
    }

    // ------------------------------------------------------------------ loading
    private void load(final boolean silent) {
        final int g = ++gen;
        if (!silent) {
            swipe.setRefreshing(true);
            state.setText("Refreshing saved data…");
        }
        final Load l = new Load();
        Api.get("reports.php", Api.q("do", "report", "start", start, "end", end), new Api.Callback() {
            @Override public void onSuccess(Object d) { l.report = Api.obj(d); done(g, l, null); }
            @Override public void onError(String m, String c, int s) { done(g, l, m); }
        });
        Api.get("bookings.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object d) { l.bookings = Api.arr(d); done(g, l, null); }
            @Override public void onError(String m, String c, int s) { done(g, l, m); }
        });
        Api.get("packages.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object d) { l.packages = Api.arr(d); done(g, l, null); }
            @Override public void onError(String m, String c, int s) { done(g, l, m); }
        });
        Api.get("rentalItems.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object d) { l.rentalItems = Api.arr(d); done(g, l, null); }
            @Override public void onError(String m, String c, int s) { done(g, l, m); }
        });
        Api.get("payments.php", Api.q("do", "all"), new Api.Callback() {   // keeps the cache warm for the receipt / future payment widgets
            @Override public void onSuccess(Object d) { done(g, l, null); }
            @Override public void onError(String m, String c, int s) { done(g, l, m); }
        });
    }

    private void done(int g, Load l, String error) {
        if (g != gen) return;                       // a newer load replaced this one
        if (error != null && l.error == null) l.error = error;
        if (--l.pending > 0 || !alive()) return;
        swipe.setRefreshing(false);
        if (l.error != null) {
            state.setText("Refresh failed: " + l.error + ". Showing saved data.");
            return;
        }
        lastLoad = System.currentTimeMillis();
        lastTime = new SimpleDateFormat("h:mm:ss a", Locale.US).format(new Date());
        lastReport = l.report;
        state.setText("Report refreshed from updated saved data.");
        paintLive();
        rangeBadge.setText(rangeText());
        renderCharts(l);
        renderStats(l.report);
        renderOps(l.report);
        renderPackages(l);
        renderDamaged(l);
    }

    // ------------------------------------------------------------------ live charts
    private void renderCharts(Load l) {
        // Bookings by Status (event date inside the range)
        double[] counts = new double[6];   // Pending, Confirmed, Awaiting Completion, Awaiting Payment, Completed, Cancelled/Rejected
        for (int i = 0; i < l.bookings.length(); i++) {
            JSONObject b = Js.at(l.bookings, i);
            if (!inRange(Js.s(b, "event_date"))) continue;
            String st = Fmt.titleCase(Js.s(b, "status"));
            if (st.equals("Pending")) counts[0]++;
            else if (st.equals("Confirmed")) counts[1]++;
            else if (st.equals("Awaiting Completion")) counts[2]++;
            else if (st.equals("Awaiting Payment")) counts[3]++;
            else if (st.equals("Completed")) counts[4]++;
            else if (st.equals("Cancelled") || st.equals("Rejected")) counts[5]++;
        }
        String[] allNames = {"Pending", "Confirmed", "Awaiting Completion", "Awaiting Payment", "Completed", "Cancelled/Rejected"};
        int[] allColors = {0xFFD1A170, 0xFF171714, 0xFF6C757D, 0xFFC77700, 0xFF8A633F, 0xFFB5B0A3};
        List<String> names = new ArrayList<>();
        List<Integer> colorList = new ArrayList<>();
        List<Double> vals = new ArrayList<>();
        for (int i = 0; i < allNames.length; i++) {
            if (i == 2 && counts[i] == 0) continue;   // only show "Awaiting Completion" when it has bookings
            names.add(allNames[i]); colorList.add(allColors[i]); vals.add(counts[i]);
        }
        String[] n = names.toArray(new String[0]);
        double[] v = new double[n.length];
        int[] c = new int[n.length];
        for (int i = 0; i < n.length; i++) { v[i] = vals.get(i); c[i] = colorList.get(i); }
        String sig = Arrays.toString(n) + Arrays.toString(v);
        if (!sig.equals(statusSig)) { statusSig = sig; statusChart.setData(n, v, c); }   // animate only when the numbers changed

        // Most Popular Services (report.popular_services)
        JSONArray ps = lastReport.optJSONArray("popular_services");
        int count = ps == null ? 0 : ps.length();
        String[] sn = new String[count];
        double[] sv = new double[count];
        for (int i = 0; i < count; i++) { sn[i] = Js.s(Js.at(ps, i), "name"); sv[i] = Js.d(Js.at(ps, i), "count"); }
        String ssig = Arrays.toString(sn) + Arrays.toString(sv);
        if (!ssig.equals(servicesSig)) { servicesSig = ssig; servicesChart.setData(sn, sv); }
        servicesChart.setVisibility(count == 0 ? View.GONE : View.VISIBLE);
        servicesEmpty.setVisibility(count == 0 ? View.VISIBLE : View.GONE);
    }

    // ------------------------------------------------------------------ stat cards
    private static String money(double v) { return "₱" + (v == Math.rint(v) ? WHOLE.format(v) : CENTS.format(v)); }

    private void renderStats(JSONObject d) {
        statsGrid.removeAllViews();
        double outstanding = Js.d(d, "outstanding_balances");
        int awaiting = Js.i(d, "awaiting_payment"), damaged = Js.i(d, "damaged_or_missing");
        card("Total Bookings", String.valueOf(Js.i(d, "total_bookings")), R.drawable.ic_list, "");
        card("Customers", String.valueOf(Js.i(d, "total_customers")), R.drawable.ic_people, "");
        card("Total Revenue", money(Js.d(d, "total_revenue_collected")), R.drawable.ic_money, "success");
        card("Payments Pending Sync", money(Js.d(d, "payments_pending_sync")), R.drawable.ic_refresh, "");
        card("Outstanding Balance", money(outstanding), R.drawable.ic_hourglass, outstanding > 0 ? "warn" : "");
        card("Awaiting Payment", String.valueOf(awaiting), R.drawable.ic_money, awaiting > 0 ? "warn" : "");
        card("Damaged / Missing Items", String.valueOf(damaged), R.drawable.ic_warning, damaged > 0 ? "danger" : "");
    }

    private void card(String label, String value, int icon, String cls) {
        View c = LayoutInflater.from(getContext()).inflate(R.layout.item_stat_card, statsGrid, false);
        ((TextView) c.findViewById(R.id.statLabel)).setText(label);
        ((TextView) c.findViewById(R.id.statValue)).setText(value);
        ImageView iv = c.findViewById(R.id.statIcon);
        iv.setImageResource(icon);
        int accent, tint;
        switch (cls) {
            case "success": accent = 0xFF2E6E5F; tint = 0xFF2E6E5F; break;
            case "warn": accent = 0xFFD1A170; tint = 0xFFD1A170; break;
            case "danger": accent = 0xFFC0392B; tint = 0xFFC0392B; break;
            default: accent = 0x8C8A633F; tint = 0xFF8A633F;
        }
        iv.setColorFilter(tint);
        GradientDrawable box = new GradientDrawable();
        box.setCornerRadius(24f);
        box.setColor((tint & 0x00FFFFFF) | 0x26000000);
        c.findViewById(R.id.statIconBox).setBackground(box);
        c.findViewById(R.id.statBar).setBackgroundColor(accent);
        statsGrid.addView(c);
    }

    // ------------------------------------------------------------------ operational totals
    private void renderOps(JSONObject d) {
        opsGrid.removeAllViews();
        mini("Pending Payments", money(Js.d(d, "total_pending_payments")));
        mini("Failed Payments", money(Js.d(d, "total_failed_payments")));
        mini("Deposits Held", money(Js.d(d, "deposits_held")));
        mini("Refunds Available", money(Js.d(d, "refunds_available")));
        mini("Deductions", Js.i(d, "deductions_count") + " · " + money(Js.d(d, "total_deductions_amount")));
        mini("Upcoming in Period", String.valueOf(Js.i(d, "upcoming_in_period")));
        mini("Completed Lifetime", String.valueOf(Js.i(d, "completed_lifetime")));
        mini("Cancelled Lifetime", String.valueOf(Js.i(d, "cancelled_lifetime")));
        mini("Approved Overlaps", String.valueOf(Js.i(d, "approved_overlaps")));
    }

    private void mini(String label, String value) {
        View c = LayoutInflater.from(getContext()).inflate(R.layout.item_mini_stat, opsGrid, false);
        ((TextView) c.findViewById(R.id.miniLabel)).setText(label);
        ((TextView) c.findViewById(R.id.miniValue)).setText(value);
        opsGrid.addView(c);
    }

    // ------------------------------------------------------------------ package popularity
    private static final class Pkg { String name, service; int count, done, cancelled; }

    private void renderPackages(Load l) {
        Map<String, Pkg> map = new LinkedHashMap<>();
        for (int i = 0; i < l.bookings.length(); i++) {
            JSONObject b = Js.at(l.bookings, i);
            String pid = Js.s(b, "package_id");
            if (pid.isEmpty() || pid.equals("0") || !inRange(Js.s(b, "event_date"))) continue;
            String st = Fmt.titleCase(Js.s(b, "status"));
            Pkg p = map.get(pid);
            if (p == null) {
                p = new Pkg();
                p.name = "Package #" + pid;
                for (int k = 0; k < l.packages.length(); k++)
                    if (Js.s(Js.at(l.packages, k), "package_id").equals(pid)) p.name = Js.s(Js.at(l.packages, k), "package_name");
                p.service = Js.s(b, "service_name");
                map.put(pid, p);
            }
            p.count++;
            if (st.equals("Completed")) p.done++;
            if (st.equals("Cancelled") || st.equals("Rejected")) p.cancelled++;
        }
        List<Pkg> rows = new ArrayList<>(map.values());
        Collections.sort(rows, new Comparator<Pkg>() { @Override public int compare(Pkg a, Pkg b) { return b.count - a.count; } });
        packagesTable.removeAllViews();   // header row lives in fragment_reports.xml
        for (Pkg p : rows)
            packagesTable.addView(packageRow(new String[]{p.name, p.service, String.valueOf(p.count), String.valueOf(p.done), String.valueOf(p.cancelled)}));
        packagesEmpty.setVisibility(rows.isEmpty() ? View.VISIBLE : View.GONE);
    }

    /** Fits the screen: Package + Service share the leftover width, the three counts are 58dp each (same as the XML header). */
    private LinearLayout packageRow(String[] cells) {
        LinearLayout row = new LinearLayout(getContext());
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        float d = getResources().getDisplayMetrics().density;
        for (int i = 0; i < cells.length; i++) {
            TextView t = new TextView(getContext());
            t.setLayoutParams(i < 2
                    ? new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
                    : new LinearLayout.LayoutParams((int) (58 * d), ViewGroup.LayoutParams.WRAP_CONTENT));
            t.setPadding((int) (4 * d), (int) (12 * d), (int) (4 * d), (int) (12 * d));
            t.setText(cells[i]);
            t.setTextSize(13);
            t.setTextColor(ContextCompat.getColor(requireContext(), R.color.text));
            if (i >= 2) t.setGravity(Gravity.CENTER);
            row.addView(t);
        }
        return row;
    }

    // ------------------------------------------------------------------ damaged / missing
    private static final int[] DMG_W = {190, 110, 120};
    private static final String[] DMG_HEAD = {"ITEM", "CODE", "STATUS"};

    private void renderDamaged(Load l) {
        damagedTable.removeAllViews();
        damagedTable.addView(tableRow(DMG_W, DMG_HEAD, true, null));
        int shown = 0;
        for (int i = 0; i < l.rentalItems.length(); i++) {
            JSONObject it = Js.at(l.rentalItems, i);
            String st = Js.s(it, "status");
            if (!(st.equals("Damaged") || st.equals("Missing"))) continue;
            shown++;
            damagedTable.addView(tableRow(DMG_W, new String[]{Js.s(it, "name"), Js.s(it, "item_code"), st}, false, st));
        }
        damagedEmpty.setVisibility(shown == 0 ? View.VISIBLE : View.GONE);
    }

    private LinearLayout tableRow(int[] widths, String[] cells, boolean header, String badgeStatus) {
        LinearLayout row = new LinearLayout(getContext());
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        if (header) row.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.bg));
        float d = getResources().getDisplayMetrics().density;
        for (int i = 0; i < cells.length; i++) {
            TextView t = new TextView(getContext());
            t.setLayoutParams(new LinearLayout.LayoutParams((int) (widths[i] * d), ViewGroup.LayoutParams.WRAP_CONTENT));
            t.setPadding((int) (10 * d), (int) (12 * d), (int) (6 * d), (int) (12 * d));
            if (header) {
                t.setText(cells[i]);
                t.setTextSize(11);
                t.setTypeface(null, Typeface.BOLD);
                t.setTextColor(ContextCompat.getColor(requireContext(), R.color.muted));
            } else if (badgeStatus != null && i == cells.length - 1) {
                t.setTextSize(11);
                t.setTypeface(null, Typeface.BOLD);
                Fmt.badge(t, badgeStatus);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
                lp.leftMargin = (int) (10 * d);
                t.setPadding((int) (8 * d), (int) (3 * d), (int) (8 * d), (int) (3 * d));
                t.setLayoutParams(lp);
            } else {
                t.setText(cells[i]);
                t.setTextSize(13);
                t.setTextColor(ContextCompat.getColor(requireContext(), R.color.text));
            }
            row.addView(t);
        }
        return row;
    }

    // ------------------------------------------------------------------ receipt / notifications
    private String receiptText() {
        JSONObject d = lastReport;
        StringBuilder sb = new StringBuilder();
        sb.append("REPORT SUMMARY\n");
        sb.append("Period: ").append(rangeText()).append('\n');
        sb.append("Generated: ").append(new SimpleDateFormat("MMM d, yyyy h:mm a", Locale.US).format(new Date())).append("\n\n");
        sb.append("Bookings: ").append(Js.i(d, "total_bookings")).append('\n');
        sb.append("  Pending: ").append(Js.i(d, "pending")).append('\n');
        sb.append("  Confirmed: ").append(Js.i(d, "confirmed")).append('\n');
        sb.append("  Awaiting payment: ").append(Js.i(d, "awaiting_payment")).append('\n');
        sb.append("  Completed: ").append(Js.i(d, "completed")).append('\n');
        sb.append("  Cancelled: ").append(Js.i(d, "cancelled")).append('\n');
        sb.append("Customers: ").append(Js.i(d, "total_customers")).append("\n\n");
        sb.append("Revenue collected: ").append(money(Js.d(d, "total_revenue_collected"))).append('\n');
        sb.append("Outstanding balance: ").append(money(Js.d(d, "outstanding_balances"))).append('\n');
        sb.append("Pending payments: ").append(money(Js.d(d, "total_pending_payments"))).append('\n');
        sb.append("Failed payments: ").append(money(Js.d(d, "total_failed_payments"))).append('\n');
        sb.append("Deposits held: ").append(money(Js.d(d, "deposits_held"))).append('\n');
        sb.append("Refunds available: ").append(money(Js.d(d, "refunds_available"))).append('\n');
        sb.append("Deductions: ").append(Js.i(d, "deductions_count")).append(" · ").append(money(Js.d(d, "total_deductions_amount"))).append('\n');
        sb.append("Damaged / missing items: ").append(Js.i(d, "damaged_or_missing"));
        return sb.toString();
    }

    private void showReceipt() {
        final String text = receiptText();
        TextView body = new TextView(requireContext());
        body.setText(text);
        body.setTypeface(Typeface.MONOSPACE);
        body.setTextSize(13);
        body.setTextColor(ContextCompat.getColor(requireContext(), R.color.text));
        int pad = (int) (20 * getResources().getDisplayMetrics().density);
        body.setPadding(pad, pad, pad, pad);
        ScrollView sv = new ScrollView(requireContext());
        sv.addView(body);
        new AlertDialog.Builder(requireContext()).setTitle("Report receipt").setView(sv)
                .setPositiveButton("Share", new android.content.DialogInterface.OnClickListener() {
                    @Override public void onClick(android.content.DialogInterface dlg, int which) {
                        Intent i = new Intent(Intent.ACTION_SEND);
                        i.setType("text/plain");
                        i.putExtra(Intent.EXTRA_SUBJECT, "Report summary");
                        i.putExtra(Intent.EXTRA_TEXT, text);
                        startActivity(Intent.createChooser(i, "Share report"));
                    }
                })
                .setNegativeButton("Close", null).show();
    }

    private void showNotifications() {
        Api.get("notifications.php", Api.q("do", "unresolved"), new Api.Callback() {
            @Override public void onSuccess(Object d) {
                if (!alive()) return;
                JSONArray a = Api.arr(d);
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < a.length(); i++) sb.append("• ").append(Js.s(Js.at(a, i), "message")).append("\n\n");
                new AlertDialog.Builder(requireContext()).setTitle("Notifications")
                        .setMessage(a.length() == 0 ? "No action-required notifications." : sb.toString().trim())
                        .setPositiveButton("Close", null).show();
            }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }
}
