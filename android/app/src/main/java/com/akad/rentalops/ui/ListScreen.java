package com.akad.rentalops.ui;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.akad.rentalops.R;
import com.akad.rentalops.util.Api;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Base for every "table" page of the web admin: loads rows, shows them as cards,
 * adds search, an optional filter dropdown, pull-to-refresh and an optional add button.
 */
public abstract class ListScreen extends BaseFragment {
    protected RecyclerView recycler;
    protected TextView emptyText;
    protected Spinner filterSpinner;
    protected EditText searchInput;
    protected SwipeRefreshLayout swipe;
    private RowAdapter adapter;
    private final List<RowAdapter.Row> all = new ArrayList<>();
    private String filter = "";

    // ---- to implement ----
    /** Fetch the data (usually Api.list("x.php", cb)). */
    protected abstract void load(Api.Callback cb);
    /** Convert one JSON record into a card row. */
    protected abstract RowAdapter.Row toRow(JSONObject o);

    // ---- optional hooks ----
    protected void onRowClick(RowAdapter.Row row) {}
    protected boolean canAdd() { return false; }
    protected void onAdd() {}
    protected String[] filterOptions() { return null; }          // first entry = "all"
    protected boolean matchesFilter(JSONObject o, String filterValue) { return true; }
    protected String hint() { return null; }
    /** Website ids of the search box / status filter on this page (null = keep generic id). */
    protected String searchWebId() { return null; }
    protected String filterWebId() { return null; }
    protected boolean searchable() { return true; }
    protected JSONArray extract(Object data) { return Api.arr(data); }
    protected void onLoaded(JSONArray rows) {}

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        return inf.inflate(R.layout.fragment_list, c, false);
    }

    @Override public void onViewCreated(@NonNull View v, @Nullable Bundle b) {
        recycler = v.findViewById(R.id.recycler);
        emptyText = v.findViewById(R.id.emptyText);
        filterSpinner = v.findViewById(R.id.filterSpinner);
        searchInput = v.findViewById(R.id.searchInput);
        swipe = v.findViewById(R.id.swipe);
        adapter = new RowAdapter(new RowAdapter.OnClick() {
            @Override public void onClick(RowAdapter.Row row) { onRowClick(row); }
        });
        recycler.setLayoutManager(new LinearLayoutManager(requireContext()));
        recycler.setAdapter(adapter);

        applyId(searchInput, searchWebId());
        applyId(filterSpinner, filterWebId());
        TextView hint = v.findViewById(R.id.listHint);
        if (hint() != null) { hint.setText(hint()); hint.setVisibility(View.VISIBLE); }

        searchInput.setVisibility(searchable() ? View.VISIBLE : View.GONE);
        searchInput.addTextChangedListener(new TextWatcher() {
            public void beforeTextChanged(CharSequence s, int a, int b2, int c) {}
            public void onTextChanged(CharSequence s, int a, int b2, int c) { applyFilters(); }
            public void afterTextChanged(Editable s) {}
        });

        final String[] opts = filterOptions();
        if (opts != null) {
            filterSpinner.setVisibility(View.VISIBLE);
            filterSpinner.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, opts));
            filterSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                @Override public void onItemSelected(AdapterView<?> p, View view, int pos, long id) {
                    filter = pos == 0 ? "" : opts[pos];
                    applyFilters();
                }
                @Override public void onNothingSelected(AdapterView<?> p) {}
            });
        }

        View fab = v.findViewById(R.id.fabAdd);
        if (canAdd()) {
            fab.setVisibility(View.VISIBLE);
            fab.setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { onAdd(); } });
        }
        swipe.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() { @Override public void onRefresh() { reload(); } });
        reload();
    }

    private void applyId(View view, String name) {
        if (name == null) return;
        int id = getResources().getIdentifier(name, "id", requireContext().getPackageName());
        if (id != 0) view.setId(id);
    }

    protected void reload() {
        if (swipe != null) swipe.setRefreshing(true);
        load(new Api.Callback() {
            @Override public void onSuccess(Object data) {
                if (!alive()) return;
                swipe.setRefreshing(false);
                JSONArray arr = extract(data);
                onLoaded(arr);
                all.clear();
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject o = arr.optJSONObject(i);
                    if (o != null) all.add(toRow(o));
                }
                applyFilters();
            }
            @Override public void onError(String message, String code, int status) {
                if (!alive()) return;
                swipe.setRefreshing(false);
                toast(message);
                emptyText.setText(message);
                emptyText.setVisibility(View.VISIBLE);
            }
        });
    }

    private void applyFilters() {
        if (!alive()) return;
        String q = searchInput.getText().toString().trim().toLowerCase();
        List<RowAdapter.Row> out = new ArrayList<>();
        for (RowAdapter.Row r : all) {
            if (!q.isEmpty() && !r.haystack().contains(q)) continue;
            if (!filter.isEmpty() && !matchesFilter(r.raw, filter)) continue;
            out.add(r);
        }
        adapter.submit(out);
        emptyText.setText(R.string.nothing_here);
        emptyText.setVisibility(out.isEmpty() ? View.VISIBLE : View.GONE);
    }
}
