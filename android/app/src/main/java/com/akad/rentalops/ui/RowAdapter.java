package com.akad.rentalops.ui;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.akad.rentalops.R;
import com.akad.rentalops.util.Fmt;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** Generic card-row adapter used by every list screen (replaces the HTML admin-table rows). */
public class RowAdapter extends RecyclerView.Adapter<RowAdapter.VH> {
    public static class Row {
        public String title = "", subtitle = "", detail = "", meta = "", badge = "", badge2 = "";
        public JSONObject raw;
        public Row(JSONObject raw) { this.raw = raw; }
        public Row title(String v) { title = v == null ? "" : v; return this; }
        public Row subtitle(String v) { subtitle = v == null ? "" : v; return this; }
        public Row detail(String v) { detail = v == null ? "" : v; return this; }
        public Row meta(String v) { meta = v == null ? "" : v; return this; }
        public Row badge(String v) { badge = v == null ? "" : v; return this; }
        public Row badge2(String v) { badge2 = v == null ? "" : v; return this; }
        public String haystack() { return (title + " " + subtitle + " " + detail + " " + meta + " " + badge + " " + badge2).toLowerCase(); }
    }

    public interface OnClick { void onClick(Row row); }

    private final List<Row> rows = new ArrayList<>();
    private final OnClick click;

    public RowAdapter(OnClick click) { this.click = click; }

    public void submit(List<Row> next) {
        rows.clear();
        rows.addAll(next);
        notifyDataSetChanged();
    }

    @NonNull @Override public VH onCreateViewHolder(@NonNull ViewGroup p, int t) {
        return new VH(LayoutInflater.from(p.getContext()).inflate(R.layout.item_row, p, false));
    }

    @Override public void onBindViewHolder(@NonNull VH h, int i) {
        final Row r = rows.get(i);
        h.title.setText(r.title);
        setOrHide(h.subtitle, r.subtitle);
        setOrHide(h.detail, r.detail);
        setOrHide(h.meta, r.meta);
        Fmt.badge(h.badge, r.badge);
        Fmt.badge(h.badge2, r.badge2);
        h.itemView.setOnClickListener(click == null ? null : new View.OnClickListener() {
            @Override public void onClick(View v) { click.onClick(r); }
        });
    }

    private static void setOrHide(TextView tv, String s) {
        tv.setText(s);
        tv.setVisibility(s == null || s.isEmpty() ? View.GONE : View.VISIBLE);
    }

    @Override public int getItemCount() { return rows.size(); }

    static class VH extends RecyclerView.ViewHolder {
        final TextView title, subtitle, detail, meta, badge, badge2;
        VH(View v) {
            super(v);
            title = v.findViewById(R.id.rowTitle);
            subtitle = v.findViewById(R.id.rowSubtitle);
            detail = v.findViewById(R.id.rowDetail);
            meta = v.findViewById(R.id.rowMeta);
            badge = v.findViewById(R.id.rowBadge);
            badge2 = v.findViewById(R.id.rowBadge2);
        }
    }
}
