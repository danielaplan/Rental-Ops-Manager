package com.akad.rentalops.ui.screens;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.akad.rentalops.ui.FormField;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Images;
import com.akad.rentalops.util.Js;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * admin/gallery.html -> api/gallery.php (GALLERY: title, image URL/path, featured).
 * Each row shows the title and image path; tap to preview/edit. (File upload to gallery-upload.php is
 * not wired in this first mobile pass; paste an image URL or site path instead.)
 */
public class GalleryFragment extends ListScreen {
    @Override protected void load(Api.Callback cb) { Api.get("gallery.php", Api.q("do", "all"), cb); }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        return new RowAdapter.Row(o).title(Js.s(o, "title").isEmpty() ? "(untitled)" : Js.s(o, "title"))
                .subtitle(Js.s(o, "image")).badge(Js.b(o, "featured") ? "Featured" : "");
    }

    @Override protected boolean canAdd() { return true; }
    @Override protected void onAdd() { edit(null); }
    @Override protected void onRowClick(RowAdapter.Row row) { preview(row.raw); }

    private void preview(final JSONObject o) {
        ImageView iv = new ImageView(requireContext());
        iv.setAdjustViewBounds(true);
        iv.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 600));
        iv.setScaleType(ImageView.ScaleType.FIT_CENTER);
        Images.load(iv, Js.s(o, "image"));
        new androidx.appcompat.app.AlertDialog.Builder(requireContext())
                .setTitle(Js.s(o, "title"))
                .setView(iv)
                .setPositiveButton("Edit", new android.content.DialogInterface.OnClickListener() {
                    @Override public void onClick(android.content.DialogInterface d, int w) { edit(o); }
                })
                .setNegativeButton("Close", null).show();
    }

    private void edit(final JSONObject o) {
        List<FormField> f = new ArrayList<>();
        f.add(FormField.text("title", "Title").value(o == null ? "" : Js.s(o, "title")));
        f.add(FormField.text("image", "Image URL or site path").value(o == null ? "" : Js.s(o, "image")).req());
        f.add(FormField.check("featured", "Featured on website").value(o == null ? "0" : Js.b(o, "featured") ? "1" : "0"));
        FormUi.dialog(requireContext(), o == null ? "Add Image" : "Edit Image", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                Api.Callback cb = new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { saved(); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                };
                if (o == null) Api.create("gallery.php", v, cb); else Api.update("gallery.php", Js.s(o, "image_id"), v, cb);
            }
        }, o == null ? null : new Runnable() {
            @Override public void run() {
                Api.delete("gallery.php", Js.s(o, "image_id"), new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { toast("Deleted."); reload(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        });
    }
}
