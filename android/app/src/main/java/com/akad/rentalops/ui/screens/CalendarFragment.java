package com.akad.rentalops.ui.screens;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.GridLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.BaseFragment;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Lookups;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** admin/calendar.html: month grid of bookings (Cancelled/Rejected hidden). Tap a day to list its bookings. */
public class CalendarFragment extends BaseFragment {
    private View root;
    private int year, month;     // month: 0-11
    private JSONArray bookings = new JSONArray();
    private Lookups.Pairs services = new Lookups.Pairs();
    private final Map<String, List<JSONObject>> byDate = new HashMap<>();
    private String selected = "";

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        root = inf.inflate(R.layout.fragment_calendar, c, false);
        return root;
    }

    @Override public void onViewCreated(@NonNull View v, @Nullable Bundle b) {
        Calendar now = Calendar.getInstance();
        year = now.get(Calendar.YEAR);
        month = now.get(Calendar.MONTH);
        v.findViewById(R.id.prevMonthBtn).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) { month--; if (month < 0) { month = 11; year--; } render(); }
        });
        v.findViewById(R.id.nextMonthBtn).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) { month++; if (month > 11) { month = 0; year++; } render(); }
        });
        Lookups.services(false, new Lookups.Done() {
            @Override public void done(Lookups.Pairs p) {
                services = p;
                Api.get("bookings.php", Api.q("do", "all"), new Api.Callback() {
                    @Override public void onSuccess(Object d) {
                        bookings = Api.arr(d);
                        byDate.clear();
                        for (int i = 0; i < bookings.length(); i++) {
                            JSONObject o = Js.at(bookings, i);
                            String st = Fmt.titleCase(Js.s(o, "status"));
                            if (st.equals("Cancelled") || st.equals("Rejected")) continue;
                            String key = Js.s(o, "event_date");
                            if (!byDate.containsKey(key)) byDate.put(key, new ArrayList<JSONObject>());
                            byDate.get(key).add(o);
                        }
                        if (alive()) render();
                    }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        });
        render();
    }

    private void render() {
        if (!alive()) return;
        Calendar first = Calendar.getInstance();
        first.set(year, month, 1);
        ((TextView) root.findViewById(R.id.calendarLabel)).setText(
                first.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale.US) + " " + year);
        GridLayout grid = root.findViewById(R.id.calendarWrap);
        grid.removeAllViews();
        String[] names = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
        for (String n : names) {
            TextView t = new TextView(getContext());
            t.setText(n);
            t.setGravity(android.view.Gravity.CENTER);
            t.setTextSize(11);
            t.setTextColor(0xFF68645E);
            GridLayout.LayoutParams lp = new GridLayout.LayoutParams(GridLayout.spec(GridLayout.UNDEFINED), GridLayout.spec(GridLayout.UNDEFINED, 1f));
            lp.width = 0;
            grid.addView(t, lp);
        }
        int offset = first.get(Calendar.DAY_OF_WEEK) - 1;
        for (int i = 0; i < offset; i++) {
            View blank = new View(getContext());
            GridLayout.LayoutParams lp = new GridLayout.LayoutParams(GridLayout.spec(GridLayout.UNDEFINED), GridLayout.spec(GridLayout.UNDEFINED, 1f));
            lp.width = 0;
            lp.height = 1;
            grid.addView(blank, lp);
        }
        int days = first.getActualMaximum(Calendar.DAY_OF_MONTH);
        Calendar today = Calendar.getInstance();
        for (int d = 1; d <= days; d++) {
            final String key = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, d);
            View cell = LayoutInflater.from(getContext()).inflate(R.layout.item_cal_day, grid, false);
            ((TextView) cell.findViewById(R.id.calDayNum)).setText(String.valueOf(d));
            List<JSONObject> list = byDate.get(key);
            TextView count = cell.findViewById(R.id.calDayCount);
            if (list != null && !list.isEmpty()) {
                count.setText(String.valueOf(list.size()));
                Fmt.badge(count, String.valueOf(list.size()));
                count.setVisibility(View.VISIBLE);
            }
            boolean isToday = today.get(Calendar.YEAR) == year && today.get(Calendar.MONTH) == month && today.get(Calendar.DAY_OF_MONTH) == d;
            if (isToday) cell.setBackgroundResource(R.drawable.bg_cal_today);
            cell.setOnClickListener(new View.OnClickListener() { @Override public void onClick(View v) { showDay(key); } });
            grid.addView(cell);
        }
        showDay(selected.startsWith(String.format(Locale.US, "%04d-%02d", year, month + 1)) ? selected : "");
    }

    private void showDay(String key) {
        selected = key;
        TextView title = root.findViewById(R.id.calendarSelectedTitle);
        LinearLayout list = root.findViewById(R.id.calendarDayList);
        list.removeAllViews();
        if (key.isEmpty()) { title.setText("Tap a day to see bookings"); return; }
        title.setText(Fmt.date(key));
        List<JSONObject> day = byDate.get(key);
        if (day == null || day.isEmpty()) {
            TextView t = new TextView(getContext());
            t.setText("No bookings on this day.");
            list.addView(t);
            return;
        }
        for (final JSONObject b : day) {
            RowAdapter.Row r = BookingsFragment.toBookingRow(b, services);
            TextView t = new TextView(getContext());
            t.setPadding(0, 14, 0, 14);
            t.setText(r.title + "\n" + r.subtitle + " · " + r.detail + "\n" + r.badge + (b.has("has_approved_overlap") && Js.b(b, "has_approved_overlap") ? "  ⚠ approved overlap" : ""));
            t.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { if (nav() != null) nav().openBooking(Js.s(b, "booking_id")); }
            });
            list.addView(t);
        }
    }
}
