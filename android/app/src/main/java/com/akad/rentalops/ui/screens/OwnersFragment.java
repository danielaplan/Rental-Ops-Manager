package com.akad.rentalops.ui.screens;

import androidx.appcompat.app.AlertDialog;

import com.akad.rentalops.ui.FormField;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Js;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** admin/owners.html -> api/owners.php (primary owner only). */
public class OwnersFragment extends ListScreen {
    @Override protected String hint() {
        return "Only the primary owner can manage the second owner account. Deactivation and password reset revoke that owner's active sessions.";
    }

    @Override protected void load(Api.Callback cb) { Api.get("owners.php", Api.q("do", "all"), cb); }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        return new RowAdapter.Row(o).title(Js.s(o, "full_name"))
                .subtitle(Js.s(o, "username") + (Js.s(o, "contact_number").isEmpty() ? "" : " · " + Js.s(o, "contact_number")))
                .badge(Js.s(o, "account_status")).badge2(Js.b(o, "is_primary_owner") ? "Primary" : "Owner");
    }

    @Override protected boolean canAdd() { return true; }

    @Override protected void onAdd() {
        List<FormField> f = new ArrayList<>();
        f.add(FormField.text("full_name", "Full name").req());
        f.add(FormField.text("username", "Username").req());
        f.add(new FormField("contact_number", "Contact number", FormField.Type.PHONE).req());
        f.add(new FormField("password", "Password", FormField.Type.PASSWORD).req());
        FormUi.dialog(requireContext(), "Add Owner", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                Api.create("owners.php", v, new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { saved(); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        }, null);
    }

    @Override protected void onRowClick(RowAdapter.Row row) {
        final JSONObject o = row.raw;
        if (Js.b(o, "is_primary_owner")) { toast("The primary owner account is managed from its own sign-in."); return; }
        final String id = Js.s(o, "user_id");
        final boolean active = "Active".equalsIgnoreCase(Js.s(o, "account_status"));
        new AlertDialog.Builder(requireContext()).setTitle(Js.s(o, "full_name"))
                .setItems(new String[]{active ? "Deactivate" : "Reactivate", "Reset password"}, new android.content.DialogInterface.OnClickListener() {
                    @Override public void onClick(android.content.DialogInterface d, int which) {
                        if (which == 0) {
                            Api.post("owners.php", Api.q("do", active ? "deactivate" : "reactivate", "id", id), new JSONObject(), cb());
                        } else {
                            resetPassword(id);
                        }
                    }
                }).show();
    }

    private Api.Callback cb() {
        return new Api.Callback() {
            @Override public void onSuccess(Object d) { if (alive()) { saved(); reload(); } }
            @Override public void onError(String m, String c, int s) { toast(m); }
        };
    }

    private void resetPassword(final String id) {
        List<FormField> f = new ArrayList<>();
        f.add(new FormField("password", "New password", FormField.Type.PASSWORD).req());
        FormUi.dialog(requireContext(), "Reset password", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                Api.post("owners.php", Api.q("do", "resetPassword", "id", id), v, cb());
            }
        }, null);
    }
}
