package com.akad.rentalops.ui.charts;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.AttributeSet;
import android.view.View;

/** "Most Booked Services": horizontal bars with integer x-axis. */
public class BarChartView extends View {
    private String[] labels = new String[0];
    private double[] values = new double[0];
    private float progress = 1f;
    private ValueAnimator anim;
    private final Paint bar = new Paint(Paint.ANTI_ALIAS_FLAG), grid = new Paint(Paint.ANTI_ALIAS_FLAG), text = new Paint(Paint.ANTI_ALIAS_FLAG);

    public BarChartView(Context c) { super(c); init(); }
    public BarChartView(Context c, AttributeSet a) { super(c, a); init(); }

    private void init() {
        bar.setColor(0xFF3F7266);
        grid.setColor(0xFFE3E0D6);
        grid.setStrokeWidth(ChartUtil.dp(getContext(), 1));
        text.setColor(0xFF6B6960);
        text.setTextSize(ChartUtil.sp(getContext(), 10));
    }

    public void setData(String[] labels, double[] values) {
        this.labels = labels; this.values = values;
        requestLayout();
        if (anim != null) anim.cancel();
        progress = 0f;
        anim = ChartUtil.animate(this, new ChartUtil.Progress() { @Override public void set(float p) { progress = p; } });
    }

    @Override protected void onDetachedFromWindow() { if (anim != null) anim.cancel(); super.onDetachedFromWindow(); }

    @Override protected void onDraw(Canvas c) {
        int n = labels.length;
        if (n == 0) return;
        Context ctx = getContext();
        float axisH = ChartUtil.dp(ctx, 26), pad = ChartUtil.dp(ctx, 6);
        float labelW = 0;
        for (String s : labels) labelW = Math.max(labelW, text.measureText(s));
        labelW = Math.min(labelW, getWidth() * 0.42f);
        float left = pad + labelW + ChartUtil.dp(ctx, 10), right = getWidth() - ChartUtil.dp(ctx, 12);
        float plotH = getHeight() - axisH - pad;
        double max = 1;
        for (double v : values) max = Math.max(max, v);
        double axisMax = Math.max(1, Math.ceil(max));
        float rowH = plotH / n;

        c.drawLine(left, pad, left, pad + plotH, grid);
        int ticks = (int) Math.min(axisMax, 5);
        for (int i = 0; i <= ticks; i++) {
            float x = left + (right - left) * i / ticks;
            c.drawLine(x, pad, x, pad + plotH, grid);
            text.setTextAlign(Paint.Align.CENTER);
            c.drawText(String.valueOf((long) Math.round(axisMax * i / ticks)), x, pad + plotH + ChartUtil.dp(ctx, 16), text);
        }
        for (int i = 0; i < n; i++) {
            float cy = pad + rowH * i + rowH / 2f;
            text.setTextAlign(Paint.Align.RIGHT);
            String label = labels[i];
            while (label.length() > 3 && text.measureText(label) > labelW) label = label.substring(0, label.length() - 2) + "…";
            c.drawText(label, pad + labelW, cy + ChartUtil.dp(ctx, 3.5f), text);
            float bh = Math.min(ChartUtil.dp(ctx, 30), rowH * 0.62f);
            float bw = (float) ((right - left) * (values[i] / axisMax)) * progress;
            float rad = ChartUtil.dp(ctx, 4);
            c.drawRoundRect(new RectF(left, cy - bh / 2, left + Math.max(bw, 0), cy + bh / 2), rad, rad, bar);
        }
    }

    @Override protected void onMeasure(int wSpec, int hSpec) {
        int rows = Math.max(1, labels.length);
        int h = (int) (ChartUtil.dp(getContext(), 44) * rows + ChartUtil.dp(getContext(), 40));
        setMeasuredDimension(resolveSize(getSuggestedMinimumWidth(), wSpec), resolveSize(h, hSpec));
    }
}
