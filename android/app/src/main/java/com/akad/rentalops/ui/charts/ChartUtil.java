package com.akad.rentalops.ui.charts;

import android.animation.ValueAnimator;
import android.content.Context;
import android.util.TypedValue;
import android.view.View;
import android.view.animation.DecelerateInterpolator;

/** Shared helpers for the hand-drawn dashboard charts (no third-party chart library needed). */
final class ChartUtil {
    private ChartUtil() {}

    static float dp(Context c, float v) { return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, c.getResources().getDisplayMetrics()); }
    static float sp(Context c, float v) { return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, v, c.getResources().getDisplayMetrics()); }

    interface Progress { void set(float p); }

    /** Eased 0 -> 1 animation, used when data arrives or the dashboard is refreshed ("live" charts). */
    static ValueAnimator animate(final View v, final Progress cb) {
        ValueAnimator a = ValueAnimator.ofFloat(0f, 1f);
        a.setDuration(900);
        a.setInterpolator(new DecelerateInterpolator());
        a.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override public void onAnimationUpdate(ValueAnimator va) { cb.set((Float) va.getAnimatedValue()); v.invalidate(); }
        });
        a.start();
        return a;
    }

    /** 1/2/2.5/5 x 10^n rounded-up axis maximum. */
    static double niceMax(double max) {
        if (max <= 0) return 1;
        double exp = Math.pow(10, Math.floor(Math.log10(max)));
        double f = max / exp;
        double nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
        return nf * exp;
    }

    static String money(double v) { return "₱" + (v == Math.rint(v) ? String.valueOf((long) v) : String.format(java.util.Locale.US, "%.0f", v)); }
}
