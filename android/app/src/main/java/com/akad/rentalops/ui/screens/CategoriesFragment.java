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

/** admin/categories.html -> api/categories.php */
public class CategoriesFragment extends ListScreen {
    @Override protected void load(Api.Callback cb) { Api.get("categories.php", Api.q("do", "all"), cb); }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        return new RowAdapter.Row(o).title(Js.s(o, "name")).badge(Js.s(o, "status"));
    }

    @Override protected boolean canAdd() { return true; }
    @Override protected void onAdd() { edit(null); }
    @Override protected void onRowClick(RowAdapter.Row row) { edit(row.raw); }

    private void edit(final JSONObject o) {
        List<FormField> f = new ArrayList<>();
        f.add(FormField.text("name", "Name").value(o == null ? "" : Js.s(o, "name")).req());
        f.add(FormField.choice("status", "Status").choices(Fmt.ACTIVE_STATUS).value(o == null ? "Active" : Js.s(o, "status")));
        FormUi.dialog(requireContext(), o == null ? "Add Category" : "Edit Category", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                Api.Callback cb = new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { saved(); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                };
                if (o == null) Api.create("categories.php", v, cb); else Api.update("categories.php", Js.s(o, "category_id"), v, cb);
            }
        }, o == null ? null : new Runnable() {
            @Override public void run() {
                Api.delete("categories.php", Js.s(o, "category_id"), new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { toast("Deleted."); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        });
    }
}
