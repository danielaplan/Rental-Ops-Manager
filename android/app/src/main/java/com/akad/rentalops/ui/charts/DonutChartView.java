package com.akad.rentalops.ui.charts;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.AttributeSet;
import android.view.View;

/** "Booking Status" doughnut with a wrapped legend underneath. */
public class DonutChartView extends View {
    private String[] labels = new String[0];
    private double[] values = new double[0];
    private int[] colors = new int[0];
    private float progress = 1f;
    private ValueAnimator anim;
    private final Paint arc = new Paint(Paint.ANTI_ALIAS_FLAG), text = new Paint(Paint.ANTI_ALIAS_FLAG), dot = new Paint(Paint.ANTI_ALIAS_FLAG);

    public DonutChartView(Context c) { super(c); init(); }
    public DonutChartView(Context c, AttributeSet a) { super(c, a); init(); }

    private void init() {
        arc.setStyle(Paint.Style.STROKE);
        text.setColor(0xFF68645E);
        text.setTextSize(ChartUtil.sp(getContext(), 10));
    }

    public void setData(String[] labels, double[] values, int[] colors) {
        this.labels = labels; this.values = values; this.colors = colors;
        if (anim != null) anim.cancel();
        progress = 0f;
        anim = ChartUtil.animate(this, new ChartUtil.Progress() { @Override public void set(float p) { progress = p; } });
    }

    @Override protected void onDetachedFromWindow() { if (anim != null) anim.cancel(); super.onDetachedFromWindow(); }

    @Override protected void onDraw(Canvas c) {
        Context ctx = getContext();
        float pad = ChartUtil.dp(ctx, 8), rowH = ChartUtil.dp(ctx, 20), gap = ChartUtil.dp(ctx, 12), r = ChartUtil.dp(ctx, 5);

        // layout legend rows first so the donut can use the remaining height
        int rows = 1;
        float x = 0, rowW = getWidth() - 2 * pad;
        float[] itemW = new float[labels.length];
        for (int i = 0; i < labels.length; i++) {
            itemW[i] = 2 * r + ChartUtil.dp(ctx, 5) + text.measureText(labels[i]) + gap;
            if (x + itemW[i] > rowW && x > 0) { rows++; x = 0; }
            x += itemW[i];
        }
        float legendH = rows * rowH;
        float areaH = getHeight() - legendH - pad;
        float outer = Math.min(getWidth() - 2 * pad, areaH) / 2f - ChartUtil.dp(ctx, 2);
        float stroke = outer * 0.30f;
        float cx = getWidth() / 2f, cy = pad + areaH / 2f;
        RectF oval = new RectF(cx - outer + stroke / 2, cy - outer + stroke / 2, cx + outer - stroke / 2, cy + outer - stroke / 2);
        arc.setStrokeWidth(stroke);

        double total = 0;
        for (double v : values) total += v;
        if (total <= 0) {
            arc.setColor(0xFFDDD7CE);
            c.drawArc(oval, 0, 360, false, arc);
        } else {
            float start = -90f;
            for (int i = 0; i < values.length; i++) {
                float sweep = (float) (values[i] / total * 360f) * progress;
                if (values[i] <= 0) continue;
                arc.setColor(colors[i]);
                c.drawArc(oval, start, Math.max(0, sweep - (values.length > 1 ? 0.8f : 0f)), false, arc);
                start += (float) (values[i] / total * 360f) * progress;
            }
        }

        // legend (centered per row)
        int idx = 0;
        float y = getHeight() - legendH + rowH / 2f;
        while (idx < labels.length) {
            int end = idx;
            float w = 0;
            while (end < labels.length && (w + itemW[end] <= rowW || end == idx)) { w += itemW[end]; end++; }
            float lx = (getWidth() - (w - gap)) / 2f;
            for (int i = idx; i < end; i++) {
                dot.setColor(colors[i]);
                c.drawCircle(lx + r, y, r, dot);
                text.setTextAlign(Paint.Align.LEFT);
                c.drawText(labels[i], lx + 2 * r + ChartUtil.dp(ctx, 5), y + ChartUtil.dp(ctx, 3.5f), text);
                lx += itemW[i];
            }
            y += rowH;
            idx = end;
        }
    }

    @Override protected void onMeasure(int wSpec, int hSpec) {
        int h = (int) ChartUtil.dp(getContext(), 270);
        setMeasuredDimension(resolveSize(getSuggestedMinimumWidth(), wSpec), resolveSize(h, hSpec));
    }
}
