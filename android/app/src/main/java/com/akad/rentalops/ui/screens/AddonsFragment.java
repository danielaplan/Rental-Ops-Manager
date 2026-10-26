package com.akad.rentalops.ui.screens;

import com.akad.rentalops.ui.FormField;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Lookups;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** admin/addons.html -> api/addons.php (ADDONS: service_id, name, price, status) */
public class AddonsFragment extends ListScreen {
    private Lookups.Pairs services = new Lookups.Pairs();

    @Override protected void load(final Api.Callback cb) {
        Lookups.services(false, new Lookups.Done() {
            @Override public void done(Lookups.Pairs p) {
                services = p;
                Api.get("addons.php", Api.q("do", "all"), cb);
            }
        });
    }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        return new RowAdapter.Row(o).title(Js.s(o, "name")).subtitle(services.nameOf(Js.s(o, "service_id")))
                .meta(Fmt.peso(Js.d(o, "price"))).badge(Js.s(o, "status"));
    }

    @Override protected boolean canAdd() { return true; }
    @Override protected void onAdd() { edit(null); }
    @Override protected void onRowClick(RowAdapter.Row row) { edit(row.raw); }

    private void edit(final JSONObject o) {
        if (services.ids.isEmpty()) { toast("Add a service first."); return; }
        List<FormField> f = new ArrayList<>();
        f.add(FormField.text("name", "Add-on name").value(o == null ? "" : Js.s(o, "name")).req());
        f.add(FormField.choice("service_id", "Service").choices(services.idArray(), services.nameArray()).value(o == null ? "" : Js.s(o, "service_id")));
        f.add(FormField.money("price", "Price (₱)").value(o == null ? "0" : String.valueOf(Js.d(o, "price"))));
        f.add(FormField.choice("status", "Status").choices(Fmt.ACTIVE_STATUS).value(o == null ? "Active" : Js.s(o, "status")));
        FormUi.dialog(requireContext(), o == null ? "Add Add-on" : "Edit Add-on", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                try { v.put("service_id", Long.parseLong(v.optString("service_id"))); } catch (Exception ignored) {}
                Api.Callback cb = new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { saved(); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                };
                if (o == null) Api.create("addons.php", v, cb); else Api.update("addons.php", Js.s(o, "addon_id"), v, cb);
            }
        }, o == null ? null : new Runnable() {
            @Override public void run() {
                Api.delete("addons.php", Js.s(o, "addon_id"), new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { toast("Deleted."); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        });
    }
}
