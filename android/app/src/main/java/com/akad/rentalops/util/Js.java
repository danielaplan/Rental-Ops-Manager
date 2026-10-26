package com.akad.rentalops.util;

import org.json.JSONArray;
import org.json.JSONObject;

/** Null-safe JSON readers (PHP returns numbers as strings and nulls freely). */
public final class Js {
    private Js() {}

    public static String s(JSONObject o, String k) {
        if (o == null || o.isNull(k)) return "";
        return o.optString(k, "");
    }

    public static double d(JSONObject o, String k) {
        if (o == null || o.isNull(k)) return 0;
        Object v = o.opt(k);
        if (v instanceof Number) return ((Number) v).doubleValue();
        try { return Double.parseDouble(String.valueOf(v)); } catch (Exception e) { return 0; }
    }

    public static int i(JSONObject o, String k) { return (int) Math.round(d(o, k)); }

    public static boolean b(JSONObject o, String k) {
        if (o == null || o.isNull(k)) return false;
        Object v = o.opt(k);
        if (v instanceof Boolean) return (Boolean) v;
        String t = String.valueOf(v);
        return t.equals("1") || t.equalsIgnoreCase("true");
    }

    public static JSONObject at(JSONArray a, int i) { JSONObject o = a.optJSONObject(i); return o == null ? new JSONObject() : o; }

    public static JSONObject put(JSONObject o, String k, Object v) {
        try { o.put(k, v); } catch (Exception ignored) {}
        return o;
    }

    public static JSONObject of(Object... kv) {
        JSONObject o = new JSONObject();
        for (int i = 0; i + 1 < kv.length; i += 2) put(o, String.valueOf(kv[i]), kv[i + 1]);
        return o;
    }

    public static JSONObject firstOrEmpty(Object data) {
        if (data instanceof JSONArray) return ((JSONArray) data).optJSONObject(0) == null ? new JSONObject() : ((JSONArray) data).optJSONObject(0);
        return data instanceof JSONObject ? (JSONObject) data : new JSONObject();
    }
}
