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

/** admin/packages.html -> api/packages.php (package pricing, deposit and promo rules). */
public class PackagesFragment extends ListScreen {
    private Lookups.Pairs services = new Lookups.Pairs();

    @Override protected void load(final Api.Callback cb) {
        Lookups.services(false, new Lookups.Done() {
            @Override public void done(Lookups.Pairs p) {
                services = p;
                Api.get("packages.php", Api.q("do", "all"), cb);
            }
        });
    }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        String detail = Js.i(o, "duration_minutes") + " min";
        if (Js.b(o, "requires_deposit")) detail += " · Deposit " + Fmt.peso(Js.d(o, "deposit_amount"));
        if (Js.b(o, "is_promotional")) detail += " · Promo " + Js.s(o, "promotion_start_date") + " → " + Js.s(o, "promotion_end_date");
        return new RowAdapter.Row(o).title(Js.s(o, "package_name")).subtitle(services.nameOf(Js.s(o, "service_id")))
                .detail(detail).meta(Fmt.peso(Js.d(o, "price"))).badge(Js.s(o, "status"));
    }

    @Override protected boolean canAdd() { return true; }
    @Override protected void onAdd() { edit(null); }
    @Override protected void onRowClick(RowAdapter.Row row) { edit(row.raw); }

    private void edit(final JSONObject o) {
        if (services.ids.isEmpty()) { toast("Add a service first."); return; }
        List<FormField> f = new ArrayList<>();
        f.add(FormField.text("package_name", "Package name").value(o == null ? "" : Js.s(o, "package_name")).req());
        f.add(FormField.choice("service_id", "Service").choices(services.idArray(), services.nameArray()).value(o == null ? "" : Js.s(o, "service_id")));
        f.add(FormField.money("price", "Price (₱)").value(o == null ? "0" : String.valueOf(Js.d(o, "price"))).req());
        f.add(FormField.multi("description", "Description").value(o == null ? "" : Js.s(o, "description")));
        f.add(FormField.multi("inclusions", "Inclusions").value(o == null ? "" : Js.s(o, "inclusions")));
        f.add(FormField.number("duration_minutes", "Duration (minutes)").value(o == null ? "0" : String.valueOf(Js.i(o, "duration_minutes"))));
        f.add(FormField.check("requires_deposit", "Requires refundable deposit").value(o == null ? "0" : Js.b(o, "requires_deposit") ? "1" : "0"));
        f.add(FormField.money("deposit_amount", "Deposit amount (₱)").value(o == null ? "0" : String.valueOf(Js.d(o, "deposit_amount"))));
        f.add(FormField.check("is_promotional", "Promotional package").value(o == null ? "0" : Js.b(o, "is_promotional") ? "1" : "0"));
        f.add(FormField.date("promotion_start_date", "Promotion start").value(o == null ? "" : Js.s(o, "promotion_start_date")));
        f.add(FormField.date("promotion_end_date", "Promotion end").value(o == null ? "" : Js.s(o, "promotion_end_date")));
        f.add(FormField.choice("status", "Status").choices(Fmt.ACTIVE_STATUS).value(o == null ? "Active" : Js.s(o, "status")));
        FormUi.dialog(requireContext(), o == null ? "Add Package" : "Edit Package", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                try { v.put("service_id", Long.parseLong(v.optString("service_id"))); } catch (Exception ignored) {}
                Api.Callback cb = new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { saved(); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                };
                if (o == null) Api.create("packages.php", v, cb); else Api.update("packages.php", Js.s(o, "package_id"), v, cb);
            }
        }, o == null ? null : new Runnable() {
            @Override public void run() {
                Api.delete("packages.php", Js.s(o, "package_id"), new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { toast("Deleted."); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        });
    }
}
