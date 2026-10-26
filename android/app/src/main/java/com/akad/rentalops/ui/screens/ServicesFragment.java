package com.akad.rentalops.ui.screens;

import com.akad.rentalops.ui.FormField;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** admin/services.html -> api/services.php */
public class ServicesFragment extends ListScreen {
    @Override protected void load(Api.Callback cb) { Api.get("services.php", Api.q("do", "all"), cb); }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        return new RowAdapter.Row(o).title(Js.s(o, "service_name")).subtitle(Js.s(o, "description"))
                .detail("Prep " + Js.i(o, "default_preparation_minutes") + " min · Travel " + Js.i(o, "default_travel_minutes") + " min")
                .badge(Js.s(o, "status"));
    }

    @Override protected boolean canAdd() { return true; }
    @Override protected void onAdd() { edit(null); }
    @Override protected void onRowClick(RowAdapter.Row row) { edit(row.raw); }

    private void edit(final JSONObject o) {
        List<FormField> f = new ArrayList<>();
        f.add(FormField.text("service_name", "Service name").value(o == null ? "" : Js.s(o, "service_name")).req());
        f.add(FormField.multi("description", "Description").value(o == null ? "" : Js.s(o, "description")));
        f.add(FormField.number("default_preparation_minutes", "Preparation minutes").value(o == null ? "0" : String.valueOf(Js.i(o, "default_preparation_minutes"))));
        f.add(FormField.number("default_travel_minutes", "Travel minutes").value(o == null ? "0" : String.valueOf(Js.i(o, "default_travel_minutes"))));
        f.add(FormField.choice("status", "Status").choices(Fmt.ACTIVE_STATUS).value(o == null ? "Active" : Js.s(o, "status")));
        FormUi.dialog(requireContext(), o == null ? "Add Service" : "Edit Service", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                Api.Callback cb = new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { saved(); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                };
                if (o == null) Api.create("services.php", v, cb); else Api.update("services.php", Js.s(o, "service_id"), v, cb);
            }
        }, o == null ? null : new Runnable() {
            @Override public void run() { deleteRecord("services.php", Js.s(o, "service_id")); }
        });
    }

    private void deleteRecord(final String endpoint, final String id) {
        FormUi.confirm(requireContext(), "Delete this record? This cannot be undone.", new Runnable() {
            @Override public void run() {
                Api.delete(endpoint, id, new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { toast("Deleted."); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        });
    }
}
