package com.akad.rentalops.ui;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.akad.rentalops.R;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Js;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** Base for single-record form pages (Settings, Website Content): GET ?do=get, POST ?do=update. */
public abstract class FormScreen extends BaseFragment {
    public static class Section {
        public final String title;
        public final List<FormField> fields = new ArrayList<>();
        public Section(String title) { this.title = title; }
        public Section add(FormField f) { fields.add(f); return this; }
    }

    protected abstract String endpoint();
    protected abstract List<Section> sections();
    protected void onSavedData(JSONObject data) {}
    /** Website element id for an API key, e.g. business_name -> sBusinessName. */
    protected String webId(String key) { return null; }

    private final List<FormUi.Form> forms = new ArrayList<>();

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        return inf.inflate(R.layout.fragment_form_screen, c, false);
    }

    @Override public void onViewCreated(@NonNull final View v, @Nullable Bundle b) {
        final LinearLayout host = v.findViewById(R.id.formSections);
        v.findViewById(R.id.formSave).setEnabled(false);
        Api.get(endpoint(), Api.q("do", "get"), new Api.Callback() {
            @Override public void onSuccess(Object data) { if (alive()) build(host, Api.obj(data)); }
            @Override public void onError(String m, String c, int s) { toast(m); if (alive()) build(host, new JSONObject()); }
        });
        v.findViewById(R.id.formSave).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) { save(); }
        });
    }

    private void build(LinearLayout host, JSONObject data) {
        host.removeAllViews();
        forms.clear();
        for (Section s : sections()) {
            View card = LayoutInflater.from(getContext()).inflate(R.layout.item_form_section, host, false);
            ((TextView) card.findViewById(R.id.sectionTitle)).setText(s.title);
            for (FormField f : s.fields) f.id(webId(f.key));
            for (FormField f : s.fields) f.value(Js.s(data, f.key).isEmpty() ? f.value : Js.s(data, f.key));
            forms.add(FormUi.build(requireContext(), (ViewGroup) card.findViewById(R.id.sectionBody), s.fields));
            host.addView(card);
        }
        getView().findViewById(R.id.formSave).setEnabled(true);
    }

    private void save() {
        JSONObject all = new JSONObject();
        for (FormUi.Form f : forms) {
            JSONObject part = f.read();
            if (part == null) return;
            java.util.Iterator<String> it = part.keys();
            while (it.hasNext()) { String k = it.next(); Js.put(all, k, part.opt(k)); }
        }
        final JSONObject payload = all;
        Api.post(endpoint(), Api.q("do", "update"), payload, new Api.Callback() {
            @Override public void onSuccess(Object d) { if (alive()) { saved(); onSavedData(payload); } }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }
}
