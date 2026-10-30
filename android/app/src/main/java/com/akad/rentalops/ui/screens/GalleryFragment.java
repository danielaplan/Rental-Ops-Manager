package com.akad.rentalops.ui.screens;

import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Images;
import com.akad.rentalops.util.Js;
import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONObject;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** Native gallery editor backed by gallery-upload.php and api/gallery.php. */
public class GalleryFragment extends ListScreen {
    private static final long MAX_IMAGE_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> IMAGE_TYPES = new HashSet<>(Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp"));

    private Uri selectedImage;
    private ImageView activePreview;
    private TextView activeStatus;
    private TextView activeError;

    private final ActivityResultLauncher<String> imagePicker = registerForActivityResult(
            new ActivityResultContracts.GetContent(), uri -> {
                if (uri == null || activePreview == null) return;
                String validation = validateImage(uri);
                if (validation != null) {
                    selectedImage = null;
                    showFormError(validation);
                    return;
                }
                selectedImage = uri;
                activePreview.setImageURI(uri);
                activePreview.setVisibility(View.VISIBLE);
                activeStatus.setText("New image selected. It will upload when you save.");
                activeError.setVisibility(View.GONE);
            });

    @Override protected void load(Api.Callback cb) { Api.get("gallery.php", Api.q("do", "all"), cb); }

    @Override protected RowAdapter.Row toRow(JSONObject item) {
        return new RowAdapter.Row(item).title(Js.s(item, "title").isEmpty() ? "(untitled)" : Js.s(item, "title"))
                .subtitle("Tap to preview or edit").badge(Js.b(item, "featured") ? "Featured" : "");
    }

    @Override protected boolean canAdd() { return true; }
    @Override protected void onAdd() { edit(null); }
    @Override protected void onRowClick(RowAdapter.Row row) { preview(row.raw); }

    private void preview(final JSONObject item) {
        ImageView image = new ImageView(requireContext());
        image.setAdjustViewBounds(true);
        image.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 600));
        image.setScaleType(ImageView.ScaleType.FIT_CENTER);
        Images.load(image, Js.s(item, "image"));
        new AlertDialog.Builder(requireContext())
                .setTitle(Js.s(item, "title"))
                .setView(image)
                .setPositiveButton("Edit", (dialog, which) -> edit(item))
                .setNegativeButton("Close", null)
                .show();
    }

    private void edit(final JSONObject item) {
        selectedImage = null;
        View root = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_gallery_image, null);
        TextInputEditText title = root.findViewById(R.id.galleryTitleInput);
        CheckBox featured = root.findViewById(R.id.galleryFeaturedInput);
        activePreview = root.findViewById(R.id.galleryImagePreview);
        activeStatus = root.findViewById(R.id.galleryImageStatus);
        activeError = root.findViewById(R.id.galleryFormError);

        if (item != null) {
            title.setText(Js.s(item, "title"));
            featured.setChecked(Js.b(item, "featured"));
            if (!Js.s(item, "image").isEmpty()) {
                Images.load(activePreview, Js.s(item, "image"));
                activePreview.setVisibility(View.VISIBLE);
                activeStatus.setText("Current image. Choose another image only if you want to replace it.");
            }
        }
        root.findViewById(R.id.galleryChooseImage).setOnClickListener(v -> imagePicker.launch("image/*"));

        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext())
                .setTitle(item == null ? "Add Image" : "Edit Image")
                .setView(root)
                .setPositiveButton(R.string.save, null)
                .setNegativeButton(R.string.cancel, null);
        if (item != null) builder.setNeutralButton(R.string.delete, null);
        final AlertDialog dialog = builder.create();
        dialog.setOnShowListener(ignored -> {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
                String imageTitle = String.valueOf(title.getText()).trim();
                if (imageTitle.isEmpty()) {
                    showFormError("Enter a title for this image.");
                    return;
                }
                if (selectedImage == null && (item == null || Js.s(item, "image").isEmpty())) {
                    showFormError("Choose an image from your device.");
                    return;
                }
                setSaving(dialog, true);
                if (selectedImage != null) {
                    activeStatus.setText("Uploading image…");
                    Api.uploadGalleryImage(requireContext().getContentResolver(), selectedImage, new Api.Callback() {
                        @Override public void onSuccess(Object data) {
                            save(item, imageTitle, featured.isChecked(), String.valueOf(data), dialog);
                        }

                        @Override public void onError(String message, String code, int status) {
                            setSaving(dialog, false);
                            showFormError(message);
                        }
                    });
                } else {
                    save(item, imageTitle, featured.isChecked(), Js.s(item, "image"), dialog);
                }
            });
            if (item != null) {
                dialog.getButton(AlertDialog.BUTTON_NEUTRAL).setOnClickListener(v -> {
                    dialog.dismiss();
                    Api.delete("gallery.php", Js.s(item, "image_id"), new Api.Callback() {
                        @Override public void onSuccess(Object data) { if (alive()) { toast("Deleted."); reload(); } }
                        @Override public void onError(String message, String code, int status) { toast(message); }
                    });
                });
            }
        });
        dialog.setOnDismissListener(ignored -> {
            selectedImage = null;
            activePreview = null;
            activeStatus = null;
            activeError = null;
        });
        dialog.show();
    }

    private void save(JSONObject item, String title, boolean featured, String image, AlertDialog dialog) {
        JSONObject values = Js.of("title", title, "image", image, "featured", featured ? 1 : 0);
        Api.Callback callback = new Api.Callback() {
            @Override public void onSuccess(Object data) {
                if (!alive()) return;
                dialog.dismiss();
                saved();
                reload();
            }

            @Override public void onError(String message, String code, int status) {
                setSaving(dialog, false);
                showFormError(message);
            }
        };
        if (item == null) Api.create("gallery.php", values, callback);
        else Api.update("gallery.php", Js.s(item, "image_id"), values, callback);
    }

    private String validateImage(Uri uri) {
        String mime = requireContext().getContentResolver().getType(uri);
        if (!IMAGE_TYPES.contains(mime)) return "Choose a JPG, PNG, GIF, or WebP image.";
        long size = -1;
        try (Cursor cursor = requireContext().getContentResolver().query(
                uri, new String[]{OpenableColumns.SIZE}, null, null, null)) {
            if (cursor != null && cursor.moveToFirst() && !cursor.isNull(0)) size = cursor.getLong(0);
        } catch (Exception ignored) {}
        if (size == 0 || size > MAX_IMAGE_BYTES) return "Choose an image no larger than 5 MB.";
        return null;
    }

    private void setSaving(AlertDialog dialog, boolean saving) {
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(!saving);
        dialog.getButton(AlertDialog.BUTTON_NEGATIVE).setEnabled(!saving);
        if (dialog.getButton(AlertDialog.BUTTON_NEUTRAL) != null) {
            dialog.getButton(AlertDialog.BUTTON_NEUTRAL).setEnabled(!saving);
        }
    }

    private void showFormError(String message) {
        if (activeError == null) return;
        activeError.setText(message);
        activeError.setVisibility(View.VISIBLE);
    }
}
