package com.akad.rentalops.ui.charts;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;
import android.util.AttributeSet;
import android.view.View;

/** "Revenue & Bookings Trend": revenue (left axis, filled) + bookings (right axis) per month. */
public class LineChartView extends View {
    private static final int GREEN = 0xFF8A633F, GOLD = 0xFFD1A170, GRID = 0xFFDDD7CE, TEXT = 0xFF68645E;
    private String[] labels = new String[0];
    private double[] revenue = new double[0], bookings = new double[0];
    private float progress = 1f;
    private ValueAnimator anim;
    private final Paint grid = new Paint(Paint.ANTI_ALIAS_FLAG), text = new Paint(Paint.ANTI_ALIAS_FLAG),
            line1 = new Paint(Paint.ANTI_ALIAS_FLAG), fill1 = new Paint(Paint.ANTI_ALIAS_FLAG),
            line2 = new Paint(Paint.ANTI_ALIAS_FLAG), dot = new Paint(Paint.ANTI_ALIAS_FLAG);

    public LineChartView(Context c) { super(c); init(); }
    public LineChartView(Context c, AttributeSet a) { super(c, a); init(); }

    private void init() {
        grid.setColor(GRID); grid.setStrokeWidth(ChartUtil.dp(getContext(), 1));
        text.setColor(TEXT); text.setTextSize(ChartUtil.sp(getContext(), 10));
        line1.setColor(GREEN); line1.setStyle(Paint.Style.STROKE); line1.setStrokeWidth(ChartUtil.dp(getContext(), 2));
        line1.setStrokeJoin(Paint.Join.ROUND);
        fill1.setColor(GREEN); fill1.setAlpha(25); fill1.setStyle(Paint.Style.FILL);
        line2.setColor(GOLD); line2.setStyle(Paint.Style.STROKE); line2.setStrokeWidth(ChartUtil.dp(getContext(), 2));
        line2.setStrokeJoin(Paint.Join.ROUND);
        line2.setPathEffect(new DashPathEffect(new float[]{ChartUtil.dp(getContext(), 8), ChartUtil.dp(getContext(), 6)}, 0));
    }

    public void setData(String[] labels, double[] revenue, double[] bookings) {
        this.labels = labels; this.revenue = revenue; this.bookings = bookings;
        if (anim != null) anim.cancel();
        progress = 0f;
        anim = ChartUtil.animate(this, new ChartUtil.Progress() { @Override public void set(float p) { progress = p; } });
    }

    @Override protected void onDetachedFromWindow() { if (anim != null) anim.cancel(); super.onDetachedFromWindow(); }

    private static double max(double[] a) { double m = 0; for (double v : a) m = Math.max(m, v); return m; }

    @Override protected void onDraw(Canvas c) {
        int n = labels.length;
        if (n == 0) return;
        Context ctx = getContext();
        float left = ChartUtil.dp(ctx, 46), right = ChartUtil.dp(ctx, 26), top = ChartUtil.dp(ctx, 34), bottom = ChartUtil.dp(ctx, 46);
        float w = getWidth() - left - right, h = getHeight() - top - bottom;
        double rMax = ChartUtil.niceMax(max(revenue));
        double bMax = Math.max(1, Math.ceil(max(bookings)));
        int ticks = 5;

        // legend
        float lx = left + ChartUtil.dp(ctx, 40), ly = ChartUtil.dp(ctx, 14);
        dot.setColor(GREEN); c.drawCircle(lx, ly, ChartUtil.dp(ctx, 7), dot);
        text.setTextAlign(Paint.Align.LEFT);
        c.drawText("Revenue (₱)", lx + ChartUtil.dp(ctx, 10), ly + ChartUtil.dp(ctx, 4), text);
        float lx2 = lx + ChartUtil.dp(ctx, 10) + text.measureText("Revenue (₱)") + ChartUtil.dp(ctx, 12);
        dot.setColor(GOLD); c.drawCircle(lx2, ly, ChartUtil.dp(ctx, 7), dot);
        c.drawText("Bookings", lx2 + ChartUtil.dp(ctx, 10), ly + ChartUtil.dp(ctx, 4), text);

        // grid + axis labels
        for (int i = 0; i <= ticks; i++) {
            float y = top + h - h * i / ticks;
            c.drawLine(left, y, left + w, y, grid);
            text.setTextAlign(Paint.Align.RIGHT);
            c.drawText(ChartUtil.money(rMax * i / ticks), left - ChartUtil.dp(ctx, 6), y + ChartUtil.dp(ctx, 3), text);
            double bv = bMax * i / ticks;
            if (bv == Math.rint(bv)) {
                text.setTextAlign(Paint.Align.LEFT);
                c.drawText(String.valueOf((long) bv), left + w + ChartUtil.dp(ctx, 8), y + ChartUtil.dp(ctx, 3), text);
            }
        }
        // month labels (rotated)
        float[] xs = new float[n];
        for (int i = 0; i < n; i++) {
            xs[i] = n == 1 ? left + w / 2 : left + w * i / (n - 1);
            c.save();
            c.rotate(-35, xs[i], top + h + ChartUtil.dp(ctx, 14));
            text.setTextAlign(Paint.Align.RIGHT);
            c.drawText(labels[i], xs[i] + ChartUtil.dp(ctx, 4), top + h + ChartUtil.dp(ctx, 18), text);
            c.restore();
        }

        // reveal left -> right
        c.save();
        c.clipRect(left - ChartUtil.dp(ctx, 8), 0, left - ChartUtil.dp(ctx, 8) + (w + ChartUtil.dp(ctx, 16)) * progress, getHeight());
        Path area = new Path(), p1 = new Path(), p2 = new Path();
        for (int i = 0; i < n; i++) {
            float y1 = (float) (top + h - h * (rMax == 0 ? 0 : revenue[i] / rMax));
            float y2 = (float) (top + h - h * (bookings[i] / bMax));
            if (i == 0) { p1.moveTo(xs[i], y1); p2.moveTo(xs[i], y2); area.moveTo(xs[i], top + h); area.lineTo(xs[i], y1); }
            else { p1.lineTo(xs[i], y1); p2.lineTo(xs[i], y2); area.lineTo(xs[i], y1); }
        }
        area.lineTo(xs[n - 1], top + h);
        area.close();
        c.drawPath(area, fill1);
        c.drawPath(p1, line1);
        c.drawPath(p2, line2);
        for (int i = 0; i < n; i++) {
            float y1 = (float) (top + h - h * (rMax == 0 ? 0 : revenue[i] / rMax));
            float y2 = (float) (top + h - h * (bookings[i] / bMax));
            dot.setColor(GREEN); c.drawCircle(xs[i], y1, ChartUtil.dp(ctx, 3.5f), dot);
            dot.setColor(GOLD); c.drawCircle(xs[i], y2, ChartUtil.dp(ctx, 3.5f), dot);
        }
        c.restore();
    }

    @Override protected void onMeasure(int wSpec, int hSpec) {
        int h = (int) ChartUtil.dp(getContext(), 280);
        setMeasuredDimension(resolveSize(getSuggestedMinimumWidth(), wSpec), resolveSize(h, hSpec));
    }
}
