package com.akad.rentalops.ui.screens;

import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.text.Editable;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.TextWatcher;
import android.text.style.ForegroundColorSpan;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
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
import com.akad.rentalops.ui.FormField;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Lookups;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * admin/inventory.html: sync panel, 7 stat cards (Total, Available, Reserved, On Rental, Damaged,
 * Maintenance, Missing), "All Rental Items" table with search + edit / history / delete actions,
 * and "Items Requiring Attention" table. Pull down or tap refresh to reload.
 */
public class InventoryFragment extends BaseFragment {
    private SwipeRefreshLayout swipe;
    private GridLayout statsGrid;
    private LinearLayout table, attention;
    private EditText search;
    private TextView syncSummary, syncDetail;

    private Lookups.Pairs services = new Lookups.Pairs();
    private JSONArray items = new JSONArray();

    private static final int[] COL_ALL = {140, 90, 125, 50, 105, 100, 130};
    private static final String[] HEAD_ALL = {"ITEM", "ITEM CODE", "SERVICE", "QTY", "STATUS", "CONDITION", "ACTIONS"};
    private static final int[] COL_ATT = {140, 90, 120, 160};
    private static final String[] HEAD_ATT = {"ITEM", "CODE", "STATUS", "NOTES"};

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        return inf.inflate(R.layout.fragment_inventory, c, false);
    }

    @Override public void onViewCreated(@NonNull View v, @Nullable Bundle b) {
        swipe = v.findViewById(R.id.swipe);
        statsGrid = v.findViewById(R.id.invStats);
        table = v.findViewById(R.id.invTable);
        attention = v.findViewById(R.id.invAttention);
        search = v.findViewById(R.id.invSearch);
        syncSummary = v.findViewById(R.id.syncSummary);
        syncDetail = v.findViewById(R.id.syncDetail);

        syncSummary.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                boolean open = syncDetail.getVisibility() == View.VISIBLE;
                syncDetail.setVisibility(open ? View.GONE : View.VISIBLE);
                syncSummary.setText((open ? "▸" : "▾") + "  Online · 0 Pending Sync");
            }
        });
        v.findViewById(R.id.invAdd).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { edit(null); } });
        v.findViewById(R.id.invRefresh).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { reload(); } });
        v.findViewById(R.id.invBell).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { showNotifications(); } });
        swipe.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() { @Override public void onRefresh() { reload(); } });
        search.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b2, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b2, int c) {}
            @Override public void afterTextChanged(Editable s) { renderTable(); }
        });
        reload();
    }

    // ------------------------------------------------------------------ loading
    private void reload() {
        swipe.setRefreshing(true);
        Lookups.services(false, new Lookups.Done() {
            @Override public void done(Lookups.Pairs p) {
                services = p;
                Api.get("rentalItems.php", Api.q("do", "all"), new Api.Callback() {
                    @Override public void onSuccess(Object d) {
                        if (!alive()) return;
                        items = Api.arr(d);
                        swipe.setRefreshing(false);
                        renderStats();
                        renderTable();
                        renderAttention();
                    }
                    @Override public void onError(String m, String c, int s) {
                        if (!alive()) return;
                        swipe.setRefreshing(false);
                        toast(m);
                    }
                });
            }
        });
    }

    private int count(String status) {
        int n = 0;
        for (int i = 0; i < items.length(); i++) if (Js.s(Js.at(items, i), "status").equalsIgnoreCase(status)) n++;
        return n;
    }

    // ------------------------------------------------------------------ stat cards
    private void renderStats() {
        statsGrid.removeAllViews();
        card("Total Items", items.length(), R.drawable.ic_list, 0xFF1F4E45);
        card("Available", count("Available"), R.drawable.ic_check_circle, 0xFF2E6E5F);
        card("Reserved", count("Reserved"), R.drawable.ic_tag, 0xFF1F4E45);
        card("On Rental", count("On Rental"), R.drawable.ic_truck, 0xFF1F4E45);
        card("Damaged", count("Damaged"), R.drawable.ic_warning, 0xFFC0392B);
        card("Maintenance", count("Under Maintenance"), R.drawable.ic_settings, 0xFFD9A441);
        card("Missing", count("Missing"), R.drawable.ic_flag, 0xFFC0392B);
    }

    private void card(String label, int value, int icon, int tint) {
        View c = LayoutInflater.from(getContext()).inflate(R.layout.item_stat_card, statsGrid, false);
        ((TextView) c.findViewById(R.id.statLabel)).setText(label);
        ((TextView) c.findViewById(R.id.statValue)).setText(String.valueOf(value));
        ImageView iv = c.findViewById(R.id.statIcon);
        iv.setImageResource(icon);
        iv.setColorFilter(tint);
        GradientDrawable box = new GradientDrawable();
        box.setCornerRadius(24f);
        box.setColor((tint & 0x00FFFFFF) | 0x26000000);
        c.findViewById(R.id.statIconBox).setBackground(box);
        c.findViewById(R.id.statBar).setVisibility(View.GONE); // the website's inventory cards have no accent bar
        statsGrid.addView(c);
    }

    // ------------------------------------------------------------------ All Rental Items
    private void renderTable() {
        table.removeAllViews();
        table.addView(headerRow(HEAD_ALL, COL_ALL));
        String q = search.getText() == null ? "" : search.getText().toString().trim().toLowerCase(Locale.US);
        int shown = 0;
        for (int i = 0; i < items.length(); i++) {
            final JSONObject o = Js.at(items, i);
            if (!q.isEmpty() && !(Js.s(o, "name") + " " + Js.s(o, "item_code")).toLowerCase(Locale.US).contains(q)) continue;
            shown++;
            table.addView(itemRow(o, shown % 2 == 0));
        }
        if (shown == 0) table.addView(empty(q.isEmpty() ? "No rental items yet." : "No items match your search.", sum(COL_ALL)));
    }

    private LinearLayout itemRow(final JSONObject o, boolean zebra) {
        float d = density();
        LinearLayout row = new LinearLayout(getContext());
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        if (zebra) row.setBackgroundColor(0x0A1F4E45);

        // item name, with the red * for items required by their service
        SpannableStringBuilder name = new SpannableStringBuilder(Js.s(o, "name"));
        if (Js.b(o, "required")) {
            int s = name.length();
            name.append(" *");
            name.setSpan(new ForegroundColorSpan(0xFFC0392B), s, name.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
        TextView tName = cell(name, COL_ALL[0], true);
        tName.setTypeface(null, Typeface.BOLD);
        row.addView(tName);
        row.addView(cell(Js.s(o, "item_code"), COL_ALL[1], false));
        row.addView(cell(services.nameOf(Js.s(o, "service_id")), COL_ALL[2], false));
        row.addView(cell(String.valueOf(Js.i(o, "quantity")), COL_ALL[3], false));

        FrameLayout_badge(row, Js.s(o, "status"), COL_ALL[4]);
        row.addView(cell(Js.s(o, "condition"), COL_ALL[5], false));

        LinearLayout actions = new LinearLayout(getContext());
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setLayoutParams(new LinearLayout.LayoutParams((int) (COL_ALL[6] * d), ViewGroup.LayoutParams.WRAP_CONTENT));
        actions.setPadding((int) (6 * d), (int) (8 * d), 0, (int) (8 * d));
        actions.addView(actionButton(R.drawable.ic_edit, 0xFF6B6960, "Edit", new Runnable() { public void run() { edit(o); } }));
        actions.addView(actionButton(R.drawable.ic_history, 0xFF2F80ED, "History", new Runnable() { public void run() { history(o); } }));
        actions.addView(actionButton(R.drawable.ic_delete, 0xFFC0392B, "Delete", new Runnable() { public void run() { confirmDelete(o); } }));
        row.addView(actions);

        View line = new View(getContext());
        LinearLayout wrap = new LinearLayout(getContext());
        wrap.setOrientation(LinearLayout.VERTICAL);
        wrap.addView(row);
        line.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 1));
        line.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.border));
        wrap.addView(line);
        return wrap;
    }

    private View actionButton(int icon, int tint, String desc, final Runnable r) {
        float d = density();
        ImageView iv = new ImageView(getContext());
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams((int) (30 * d), (int) (30 * d));
        lp.rightMargin = (int) (6 * d);
        iv.setLayoutParams(lp);
        iv.setPadding((int) (6 * d), (int) (6 * d), (int) (6 * d), (int) (6 * d));
        iv.setImageResource(icon);
        iv.setColorFilter(tint);
        iv.setContentDescription(desc);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(0xFFFFFFFF);
        bg.setCornerRadius(6 * d);
        bg.setStroke((int) Math.max(1, d), (tint & 0x00FFFFFF) | 0x80000000);
        iv.setBackground(bg);
        iv.setOnClickListener(new View.OnClickListener() { @Override public void onClick(View v) { r.run(); } });
        return iv;
    }

    private void FrameLayout_badge(LinearLayout row, String status, int widthDp) {
        float d = density();
        LinearLayout box = new LinearLayout(getContext());
        box.setLayoutParams(new LinearLayout.LayoutParams((int) (widthDp * d), ViewGroup.LayoutParams.WRAP_CONTENT));
        box.setPadding((int) (10 * d), (int) (10 * d), (int) (4 * d), (int) (10 * d));
        TextView t = new TextView(getContext());
        t.setTextSize(11);
        t.setTypeface(null, Typeface.BOLD);
        t.setPadding((int) (8 * d), (int) (3 * d), (int) (8 * d), (int) (3 * d));
        Fmt.badge(t, status);
        box.addView(t);
        row.addView(box);
    }

    // ------------------------------------------------------------------ Items Requiring Attention
    private void renderAttention() {
        attention.removeAllViews();
        attention.addView(headerRow(HEAD_ATT, COL_ATT));
        int shown = 0;
        for (int i = 0; i < items.length(); i++) {
            JSONObject o = Js.at(items, i);
            String st = Js.s(o, "status");
            if (!(st.equals("Damaged") || st.equals("Missing") || st.equals("Under Maintenance"))) continue;
            shown++;
            LinearLayout row = new LinearLayout(getContext());
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            TextView n = cell(Js.s(o, "name"), COL_ATT[0], false);
            n.setTypeface(null, Typeface.BOLD);
            row.addView(n);
            row.addView(cell(Js.s(o, "item_code"), COL_ATT[1], false));
            FrameLayout_badge(row, st, COL_ATT[2]);
            row.addView(cell(Js.s(o, "notes"), COL_ATT[3], false));
            attention.addView(row);
        }
        if (shown == 0) attention.addView(empty("Nothing needs attention.", sum(COL_ATT)));
    }

    // ------------------------------------------------------------------ history / delete
    private void history(JSONObject o) {
        String msg = "Code: " + Js.s(o, "item_code")
                + "\nService: " + services.nameOf(Js.s(o, "service_id"))
                + "\nQuantity: " + Js.i(o, "quantity")
                + "\nStatus: " + Js.s(o, "status")
                + "\nCondition: " + Js.s(o, "condition")
                + (Js.s(o, "notes").isEmpty() ? "" : "\nNotes: " + Js.s(o, "notes"))
                + "\n\nNo release or return history recorded yet.";
        new AlertDialog.Builder(requireContext()).setTitle(Js.s(o, "name") + " — History").setMessage(msg).setPositiveButton("Close", null).show();
    }

    private void confirmDelete(final JSONObject o) {
        new AlertDialog.Builder(requireContext()).setTitle("Delete rental item")
                .setMessage("Delete \"" + Js.s(o, "name") + "\"? This cannot be undone.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Delete", new android.content.DialogInterface.OnClickListener() {
                    @Override public void onClick(android.content.DialogInterface dlg, int w) { delete(o); }
                }).show();
    }

    private void delete(JSONObject o) {
        Api.delete("rentalItems.php", Js.s(o, "rental_item_id"), new Api.Callback() {
            @Override public void onSuccess(Object d) { if (alive()) { toast("Deleted."); reload(); } }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
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

    // ------------------------------------------------------------------ table helpers
    private float density() { return getResources().getDisplayMetrics().density; }

    private int sum(int[] a) { int s = 0; for (int x : a) s += x; return s; }

    private LinearLayout headerRow(String[] heads, int[] cols) {
        LinearLayout row = new LinearLayout(getContext());
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.bg));
        for (int i = 0; i < heads.length; i++) {
            TextView t = cell(heads[i], cols[i], false);
            t.setTextSize(11);
            t.setTypeface(null, Typeface.BOLD);
            t.setTextColor(ContextCompat.getColor(requireContext(), R.color.muted));
            row.addView(t);
        }
        return row;
    }

    private TextView cell(CharSequence text, int widthDp, boolean wrapName) {
        float d = density();
        TextView t = new TextView(getContext());
        t.setLayoutParams(new LinearLayout.LayoutParams((int) (widthDp * d), ViewGroup.LayoutParams.WRAP_CONTENT));
        t.setPadding((int) (10 * d), (int) (12 * d), (int) (6 * d), (int) (12 * d));
        t.setText(text);
        t.setTextSize(13);
        t.setTextColor(ContextCompat.getColor(requireContext(), R.color.text));
        return t;
    }

    private TextView empty(String msg, int widthDp) {
        float d = density();
        TextView t = new TextView(getContext());
        t.setLayoutParams(new LinearLayout.LayoutParams((int) (widthDp * d), ViewGroup.LayoutParams.WRAP_CONTENT));
        t.setText(msg);
        t.setGravity(Gravity.CENTER);
        t.setTextColor(ContextCompat.getColor(requireContext(), R.color.muted));
        t.setPadding(0, (int) (20 * d), 0, (int) (20 * d));
        return t;
    }

    private void edit(final JSONObject o) {
        if (services.ids.isEmpty()) { toast("Add a service first."); return; }
        List<FormField> f = new ArrayList<>();
        f.add(FormField.text("name", "Item name").value(o == null ? "" : Js.s(o, "name")).req());
        f.add(FormField.text("item_code", "Item code").value(o == null ? "" : Js.s(o, "item_code")));
        f.add(FormField.choice("service_id", "Service").choices(services.idArray(), services.nameArray()).value(o == null ? "" : Js.s(o, "service_id")));
        f.add(FormField.number("quantity", "Quantity").value(o == null ? "1" : String.valueOf(Js.i(o, "quantity"))));
        f.add(FormField.choice("status", "Status").choices(Fmt.INVENTORY_STATUSES).value(o == null ? "Available" : Js.s(o, "status")));
        f.add(FormField.choice("condition", "Condition").choices(Fmt.ITEM_CONDITIONS).value(o == null ? "Good" : Js.s(o, "condition")));
        f.add(FormField.check("required", "Required item for the service").value(o == null ? "0" : Js.b(o, "required") ? "1" : "0"));
        f.add(FormField.multi("notes", "Notes").value(o == null ? "" : Js.s(o, "notes")));
        FormUi.dialog(requireContext(), o == null ? "Add Rental Item" : "Edit Rental Item", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                try { v.put("service_id", Long.parseLong(v.optString("service_id"))); } catch (Exception ignored) {}
                Api.Callback cb = new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { saved(); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                };
                if (o == null) Api.create("rentalItems.php", v, cb); else Api.update("rentalItems.php", Js.s(o, "rental_item_id"), v, cb);
            }
        }, o == null ? null : new Runnable() {
            @Override public void run() {
                Api.delete("rentalItems.php", Js.s(o, "rental_item_id"), new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { toast("Deleted."); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        });
    }
}
