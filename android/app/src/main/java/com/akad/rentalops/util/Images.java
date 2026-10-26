package com.akad.rentalops.util;

import android.graphics.drawable.ColorDrawable;
import android.widget.ImageView;

/** UI-only build: no network, so gallery images show a placeholder block. */
public final class Images {
    private Images() {}

    public static void load(ImageView view, String src) {
        view.setImageDrawable(new ColorDrawable(0xFFE3E0D6));
    }
}
