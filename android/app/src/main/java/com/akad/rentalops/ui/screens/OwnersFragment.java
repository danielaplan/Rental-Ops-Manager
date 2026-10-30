package com.akad.rentalops.ui.screens;

import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Js;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import org.json.JSONObject;

import java.nio.charset.StandardCharsets;

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

    @Override protected void onAdd() { ownerDialog(null); }

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
                            ownerDialog(id);
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

    private void ownerDialog(final String resetOwnerId) {
        final boolean resetting = resetOwnerId != null;
        View root = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_owner_account, null);
        LinearLayout details = root.findViewById(R.id.ownerAccountDetails);
        TextInputEditText name = root.findViewById(R.id.ownerNameInput);
        TextInputEditText username = root.findViewById(R.id.ownerUsernameInput);
        TextInputEditText contact = root.findViewById(R.id.ownerContactInput);
        TextInputEditText password = root.findViewById(R.id.ownerPasswordInput);
        TextInputLayout nameLayout = root.findViewById(R.id.ownerNameLayout);
        TextInputLayout usernameLayout = root.findViewById(R.id.ownerUsernameLayout);
        TextInputLayout passwordLayout = root.findViewById(R.id.ownerPasswordLayout);
        TextView formError = root.findViewById(R.id.ownerFormError);
        if (resetting) {
            details.setVisibility(View.GONE);
            passwordLayout.setHint("New password");
        }

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setTitle(resetting ? "Reset password" : "Add Owner")
                .setView(root)
                .setPositiveButton(resetting ? "Reset password" : "Create Owner", null)
                .setNegativeButton(R.string.cancel, null)
                .create();
        dialog.setOnShowListener(ignored -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            nameLayout.setError(null);
            usernameLayout.setError(null);
            passwordLayout.setError(null);
            formError.setVisibility(View.GONE);

            String passwordValue = String.valueOf(password.getText());
            int passwordBytes = passwordValue.getBytes(StandardCharsets.UTF_8).length;
            boolean valid = true;
            if (passwordBytes < 8 || passwordBytes > 72) {
                passwordLayout.setError("Password must contain 8 to 72 bytes.");
                valid = false;
            }

            String nameValue = String.valueOf(name.getText()).trim();
            String usernameValue = String.valueOf(username.getText()).trim();
            if (!resetting) {
                if (nameValue.isEmpty()) {
                    nameLayout.setError("Full name is required.");
                    valid = false;
                }
                if (!usernameValue.matches("[A-Za-z0-9_.-]{1,100}")) {
                    usernameLayout.setError("Use letters, numbers, dots, underscores, or hyphens.");
                    valid = false;
                }
            }
            if (!valid) return;

            setDialogBusy(dialog, true);
            JSONObject values = Js.of("password", passwordValue);
            if (!resetting) {
                Js.put(values, "full_name", nameValue);
                Js.put(values, "username", usernameValue);
                String contactValue = String.valueOf(contact.getText()).trim();
                Js.put(values, "contact_number", contactValue.isEmpty() ? JSONObject.NULL : contactValue);
            }
            Api.Callback callback = new Api.Callback() {
                @Override public void onSuccess(Object data) {
                    if (!alive()) return;
                    dialog.dismiss();
                    saved();
                    reload();
                }

                @Override public void onError(String message, String code, int status) {
                    setDialogBusy(dialog, false);
                    formError.setText(message);
                    formError.setVisibility(View.VISIBLE);
                }
            };
            if (resetting) {
                Api.post("owners.php", Api.q("do", "resetPassword", "id", resetOwnerId), values, callback);
            } else {
                Api.create("owners.php", values, callback);
            }
        }));
        dialog.show();
    }

    private void setDialogBusy(AlertDialog dialog, boolean busy) {
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(!busy);
        dialog.getButton(AlertDialog.BUTTON_NEGATIVE).setEnabled(!busy);
    }
}
