package com.akad.rentalops.ui.screens;

import android.graphics.Typeface;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.BaseFragment;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Js;
import com.google.android.material.button.MaterialButton;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.TreeSet;

/**
 * admin/audit.html -> api/audit.php (append-only; read-only on mobile too).
 * Filters: Owner, Action, Record, Date. Table columns: Date, Actor, Action, Record, Change, Description.
 */
public class AuditFragment extends BaseFragment {
    private static final String ALL = "All actors";
    private static final int[] W = {100, 100, 160, 90, 120, 230};
    private static final String[] HEAD = {"DATE", "ACTOR", "ACTION", "RECORD", "CHANGE", "DESCRIPTION"};

    private SwipeRefreshLayout swipe;
    private Spinner owner;
    private EditText actionIn, recordIn;
    private MaterialButton dateBtn;
    private TextView count, empty, syncSummary, syncDetail;
    private LinearLayout header, table;

    private JSONArray entries = new JSONArray();
    private String fOwner = ALL, fDate = "";
    private boolean ownerListReady;

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        return inf.inflate(R.layout.fragment_audit, c, false);
    }

    @Override public void onViewCreated(@NonNull View v, @Nullable Bundle b) {
        swipe = v.findViewById(R.id.audSwipe);
        owner = v.findViewById(R.id.audOwner);
        actionIn = v.findViewById(R.id.audAction);
        recordIn = v.findViewById(R.id.audRecord);
        dateBtn = v.findViewById(R.id.audDate);
        count = v.findViewById(R.id.audCount);
        empty = v.findViewById(R.id.audEmpty);
        syncSummary = v.findViewById(R.id.audSyncSummary);
        syncDetail = v.findViewById(R.id.audSyncDetail);
        header = v.findViewById(R.id.audHeader);
        table = v.findViewById(R.id.audTable);

        header.addView(row(HEAD, true));

        syncSummary.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                boolean open = syncDetail.getVisibility() == View.VISIBLE;
                syncDetail.setVisibility(open ? View.GONE : View.VISIBLE);
                syncSummary.setText((open ? "▸" : "▾") + "  Online · 0 Pending Sync");
            }
        });
        v.findViewById(R.id.audBell).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { showNotifications(); } });

        List<String> init = new ArrayList<>();
        init.add(ALL);
        owner.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, init));
        owner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override public void onItemSelected(AdapterView<?> p, View view, int pos, long id) {
                fOwner = String.valueOf(p.getItemAtPosition(pos));
                renderRows();
            }
            @Override public void onNothingSelected(AdapterView<?> p) {}
        });
        TextWatcher w = new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void afterTextChanged(Editable s) { renderRows(); }
        };
        actionIn.addTextChangedListener(w);
        recordIn.addTextChangedListener(w);
        dateBtn.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                FormUi.pickDate(requireContext(), fDate, new FormUi.OnPicked() {
                    public void picked(String d) { fDate = d; dateBtn.setText(us(d)); renderRows(); }
                });
            }
        });
        v.findViewById(R.id.audClear).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                owner.setSelection(0);
                actionIn.setText("");
                recordIn.setText("");
                fDate = "";
                dateBtn.setText(us(""));
                renderRows();
            }
        });
        swipe.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() { @Override public void onRefresh() { load(); } });
        load();
    }

    private static String us(String ymd) {
        return ymd.length() < 10 ? "mm/dd/yyyy" : ymd.substring(5, 7) + "/" + ymd.substring(8, 10) + "/" + ymd.substring(0, 4);
    }

    // ------------------------------------------------------------------ data
    private void load() {
        swipe.setRefreshing(true);
        Api.get("audit.php", Api.q("after_id", "0", "limit", "500"), new Api.Callback() {
            @Override public void onSuccess(Object d) {
                if (!alive()) return;
                swipe.setRefreshing(false);
                entries = Api.arr(d);
                fillOwners();
                renderRows();
            }
            @Override public void onError(String m, String c, int s) {
                if (!alive()) return;
                swipe.setRefreshing(false);
                toast(m);
            }
        });
    }

    private void fillOwners() {
        TreeSet<String> names = new TreeSet<>();
        for (int i = 0; i < entries.length(); i++) {
            String n = Js.s(Js.at(entries, i), "actor_name");
            if (!n.isEmpty()) names.add(n);
        }
        List<String> items = new ArrayList<>();
        items.add(ALL);
        items.addAll(names);
        owner.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, items));
        int keep = items.indexOf(fOwner);
        owner.setSelection(keep < 0 ? 0 : keep);
        if (keep < 0) fOwner = ALL;
    }

    private void renderRows() {
        if (table == null) return;
        String act = actionIn.getText().toString().trim().toLowerCase(Locale.ROOT);
        String rec = recordIn.getText().toString().trim().toLowerCase(Locale.ROOT).replace("#", " ").replaceAll("\\s+", " ").trim();
        table.removeAllViews();
        int shown = 0;
        for (int i = 0; i < entries.length(); i++) {
            JSONObject o = Js.at(entries, i);
            String actor = Js.s(o, "actor_name");
            String created = Js.s(o, "created_at");
            String record = (Js.s(o, "record_type") + " " + Js.s(o, "record_id")).toLowerCase(Locale.ROOT).trim();
            if (!fOwner.equals(ALL) && !fOwner.equals(actor)) continue;
            if (!act.isEmpty() && !Js.s(o, "action").toLowerCase(Locale.ROOT).contains(act)) continue;
            if (!rec.isEmpty() && !record.contains(rec)) continue;
            if (!fDate.isEmpty() && !created.startsWith(fDate)) continue;
            shown++;
            String oldS = Js.s(o, "old_status"), newS = Js.s(o, "new_status");
            String change = (oldS.isEmpty() ? "—" : oldS) + " → " + (newS.isEmpty() ? "—" : newS);
            String who = actor.isEmpty() ? Js.s(o, "origin") : actor;
            table.addView(row(new String[]{created, who, Js.s(o, "action"), Js.s(o, "record_type") + " #" + Js.s(o, "record_id"), change, Js.s(o, "description")}, false));
        }
        count.setText(shown + (shown == 1 ? " entry" : " entries"));
        empty.setVisibility(shown == 0 ? View.VISIBLE : View.GONE);
    }

    private LinearLayout row(String[] cells, boolean head) {
        LinearLayout r = new LinearLayout(getContext());
        r.setOrientation(LinearLayout.HORIZONTAL);
        r.setGravity(head ? Gravity.CENTER_VERTICAL : Gravity.CENTER_VERTICAL);
        float d = getResources().getDisplayMetrics().density;
        for (int i = 0; i < cells.length; i++) {
            TextView t = new TextView(getContext());
            t.setLayoutParams(new LinearLayout.LayoutParams((int) (W[i] * d), ViewGroup.LayoutParams.WRAP_CONTENT));
            t.setPadding((int) (10 * d), (int) (head ? 12 * d : 14 * d), (int) (6 * d), (int) (head ? 12 * d : 14 * d));
            t.setText(cells[i]);
            if (head) {
                t.setTextSize(11);
                t.setTypeface(null, Typeface.BOLD);
                t.setTextColor(ContextCompat.getColor(requireContext(), R.color.muted));
            } else {
                t.setTextSize(13);
                t.setTextColor(ContextCompat.getColor(requireContext(), R.color.text));
            }
            r.addView(t);
        }
        if (!head) {
            View line = new View(getContext());
            LinearLayout wrap = new LinearLayout(getContext());
            wrap.setOrientation(LinearLayout.VERTICAL);
            line.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, (int) Math.max(1, d)));
            line.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.border));
            wrap.addView(r);
            wrap.addView(line);
            return wrap;
        }
        return r;
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
