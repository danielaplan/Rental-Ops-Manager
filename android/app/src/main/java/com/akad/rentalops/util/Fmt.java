package com.akad.rentalops.util;

import android.graphics.drawable.GradientDrawable;
import android.widget.TextView;

import androidx.core.content.ContextCompat;

import com.akad.rentalops.R;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** Formatting + the constant lists from js/config.js (CONFIG). */
public final class Fmt {
    private Fmt() {}

    // ---- CONFIG constants ----
    public static final String[] BOOKING_STATUSES = {"Pending", "Confirmed", "Awaiting Completion", "Awaiting Payment", "Completed", "Cancelled"};
    public static final String[] PAYMENT_METHODS = {"GCash", "MariBank"};          // server enum: gcash | maribank
    public static final String[] PAYMENT_TYPES = {"Down payment", "Balance"};
    public static final String[] PAYMENT_STATUSES = {"Completed", "Pending", "Failed"};
    public static final String[] CUSTOMER_TYPES = {"First-time client", "Returning client"};
    public static final String[] BOOKING_SOURCES = {"Manual", "Facebook Messenger", "Phone Call", "SMS", "Referral", "Walk-in"};
    public static final String[] EVENT_TYPES = {"Birthday Party", "Wedding", "Debut", "Christening", "Corporate Event", "Reunion", "Anniversary", "Graduation", "Other"};
    public static final String[] INVENTORY_STATUSES = {"Available", "Reserved", "Released", "On Rental", "Returned", "Damaged", "Under Maintenance", "Missing"};
    public static final String[] ITEM_CONDITIONS = {"Good", "Minor Damage", "Damaged", "Missing", "Unwashed"};
    public static final String[] DELIVERY_METHODS = {"self_pickup", "lalamove", "owner_delivered"};
    public static final String[] DELIVERY_METHOD_LABELS = {"Self-pickup", "Lalamove", "Owner-delivered"};
    public static final String[] DELIVERY_RESPONSIBILITY = {"Customer", "Included in package", "Owner"};
    public static final String[] DELIVERY_RESPONSIBILITY_LABELS = {"Paid by customer", "Included in package", "Paid by owner"};
    public static final String[] ACTIVE_STATUS = {"Active", "Inactive"};

    private static final Map<String, Integer> BADGE = new HashMap<>();
    static {
        // CONFIG.bookingStatusColors / paymentStatusColors / inventoryStatusColors
        BADGE.put("Pending", R.color.badge_warning);
        BADGE.put("Confirmed", R.color.badge_info);
        BADGE.put("Reserved", R.color.badge_info);
        BADGE.put("Preparing", R.color.badge_primary);
        BADGE.put("Released", R.color.badge_primary);
        BADGE.put("On Rental", R.color.badge_primary);
        BADGE.put("Event Completed", R.color.badge_secondary);
        BADGE.put("Returned", R.color.badge_secondary);
        BADGE.put("Inspected", R.color.badge_secondary);
        BADGE.put("Awaiting Completion", R.color.badge_warning);
        BADGE.put("Awaiting Payment", R.color.badge_danger);
        BADGE.put("Completed", R.color.badge_success);
        BADGE.put("Cancelled", R.color.badge_dark);
        BADGE.put("Rejected", R.color.badge_danger);
        BADGE.put("Unpaid", R.color.badge_danger);
        BADGE.put("Partial", R.color.badge_warning);
        BADGE.put("Fully Paid", R.color.badge_success);
        BADGE.put("Available", R.color.badge_success);
        BADGE.put("Damaged", R.color.badge_danger);
        BADGE.put("Under Maintenance", R.color.badge_warning);
        BADGE.put("Missing", R.color.badge_dark);
        BADGE.put("Active", R.color.badge_success);
        BADGE.put("Inactive", R.color.badge_secondary);
        BADGE.put("Failed", R.color.badge_danger);
    }

    /** js: titleCaseStatus() - "awaiting_payment" -> "Awaiting Payment". */
    public static String titleCase(String v) {
        if (v == null || v.isEmpty()) return "Pending";
        StringBuilder sb = new StringBuilder();
        boolean up = true;
        for (char c : v.toLowerCase(Locale.ROOT).toCharArray()) {
            if (c == '_' || c == ' ') { sb.append(' '); up = true; }
            else { sb.append(up ? Character.toUpperCase(c) : c); up = false; }
        }
        return sb.toString();
    }

    /** js: calculatePaymentStatus() */
    public static String paymentStatus(double total, double paid) {
        if (total > 0 && paid >= total) return "Fully Paid";
        if (paid > 0) return "Partial";
        return "Unpaid";
    }

    private static final DecimalFormat MONEY = new DecimalFormat("#,##0.00");
    public static String peso(double v) { return "₱" + MONEY.format(v); }

    public static String date(String ymd) {
        if (ymd == null || ymd.length() < 10) return ymd == null ? "" : ymd;
        try {
            Date d = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(ymd.substring(0, 10));
            return new SimpleDateFormat("MMM d, yyyy", Locale.US).format(d);
        } catch (ParseException e) { return ymd; }
    }

    public static String time(String hms) {
        if (hms == null || hms.length() < 5) return hms == null ? "" : hms;
        try {
            Date d = new SimpleDateFormat("HH:mm", Locale.US).parse(hms.substring(0, 5));
            return new SimpleDateFormat("h:mm a", Locale.US).format(d);
        } catch (ParseException e) { return hms; }
    }

    public static String dateTime(String dt) {
        if (dt == null || dt.length() < 16) return dt == null ? "" : dt;
        return date(dt.substring(0, 10)) + " " + time(dt.substring(11, 16));
    }

    public static void badge(TextView tv, String text) {
        if (text == null || text.isEmpty()) { tv.setVisibility(android.view.View.GONE); return; }
        tv.setVisibility(android.view.View.VISIBLE);
        tv.setText(text);
        Integer res = BADGE.get(text);
        int color = ContextCompat.getColor(tv.getContext(), res == null ? R.color.badge_secondary : res);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(color);
        bg.setCornerRadius(40f);
        tv.setBackground(bg);
        // warning/info backgrounds are light: use dark text for contrast, like Bootstrap's text-dark
        boolean light = res != null && (res == R.color.badge_warning || res == R.color.badge_info);
        tv.setTextColor(ContextCompat.getColor(tv.getContext(), light ? R.color.primary_dark : R.color.white));
    }

    public static int indexOf(String[] arr, String v) {
        for (int i = 0; i < arr.length; i++) if (arr[i].equalsIgnoreCase(v)) return i;
        return 0;
    }

    public static double num(CharSequence t) {
        try { return Double.parseDouble(String.valueOf(t).trim()); } catch (Exception e) { return 0; }
    }
}
