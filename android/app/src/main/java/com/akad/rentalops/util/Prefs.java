package com.akad.rentalops.util;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

/** Mirrors STORAGE_KEYS.adminSession from js/storage.js: token + user + expiry. */
public final class Prefs {
    private static final String FILE = "rental_ops_session";
    private static SharedPreferences sp;

    private Prefs() {}

    public static void init(Context c) {
        if (sp == null) sp = c.getApplicationContext().getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }

    public static String token() { return sp.getString("session_token", ""); }

    public static boolean isLoggedIn() {
        return !token().isEmpty() && sp.getLong("expires_at", 0) > System.currentTimeMillis();
    }

    /** Saves the data object returned by api/auth.php (session_token, expires_in, user{...}). */
    public static void saveSession(JSONObject data) {
        JSONObject user = data.optJSONObject("user");
        sp.edit()
                .putString("session_token", data.optString("session_token"))
                .putLong("expires_at", System.currentTimeMillis() + data.optLong("expires_in", 86400) * 1000L)
                .putString("full_name", user == null ? "" : user.optString("full_name"))
                .putString("contact_number", user == null ? "" : user.optString("contact_number"))
                .putBoolean("is_primary_owner", user != null && user.optBoolean("is_primary_owner"))
                .putInt("user_id", user == null ? 0 : user.optInt("user_id"))
                .apply();
    }

    public static void clearSession() {
        sp.edit().remove("session_token").remove("expires_at").remove("full_name")
                .remove("contact_number").remove("is_primary_owner").remove("user_id").apply();
    }

    public static String fullName() { return sp.getString("full_name", ""); }
    public static String contact() { return sp.getString("contact_number", ""); }
    public static boolean isPrimaryOwner() { return sp.getBoolean("is_primary_owner", false); }
    public static int userId() { return sp.getInt("user_id", 0); }

    public static String businessName() { return sp.getString("business_name", "AKAD Sweet Party Rentals"); }
    public static void setBusinessName(String n) { if (n != null && !n.isEmpty()) sp.edit().putString("business_name", n).apply(); }
}
