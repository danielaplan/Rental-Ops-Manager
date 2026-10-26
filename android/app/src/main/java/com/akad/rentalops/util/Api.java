package com.akad.rentalops.util;

import android.os.Handler;
import android.os.Looper;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Android counterpart of js/api.js. Every PHP endpoint answers with
 * { "ok": true, "data": ... } or { "ok": false, "error": "...", "code": "..." }
 * and authenticates with "Authorization: Bearer <session_token>".
 *
 * Callbacks are always delivered on the main thread.
 */
public final class Api {
    public interface Callback { void onSuccess(Object data); void onError(String message, String code, int status); }

    /** Convenience for callers that only care about success/failure text. */
    public abstract static class Simple implements Callback {
        @Override public void onError(String message, String code, int status) { onFail(message); }
        public abstract void onFail(String message);
    }

    /** Fired on the main thread when the server rejects the token (HTTP 401). */
    public interface UnauthorizedListener { void onUnauthorized(); }

    private static final ExecutorService POOL = Executors.newFixedThreadPool(4);
    private static final Handler MAIN = new Handler(Looper.getMainLooper());
    private static UnauthorizedListener unauthorizedListener;

    private Api() {}

    public static void setUnauthorizedListener(UnauthorizedListener l) { unauthorizedListener = l; }

    /** q("do","all","booking_id","5") -> ordered query map. */
    public static Map<String, String> q(String... kv) {
        Map<String, String> m = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) if (kv[i + 1] != null && !kv[i + 1].isEmpty()) m.put(kv[i], kv[i + 1]);
        return m;
    }

    public static void get(String endpoint, Map<String, String> query, Callback cb) { run("GET", endpoint, query, null, cb); }
    public static void post(String endpoint, Map<String, String> query, JSONObject body, Callback cb) {
        run("POST", endpoint, query, body == null ? new JSONObject() : body, cb);
    }

    // ---- Typed shortcuts mirroring the API object in js/api.js ----
    public static void list(String endpoint, Callback cb) { get(endpoint, q("do", "all"), cb); }
    public static void create(String endpoint, JSONObject body, Callback cb) { post(endpoint, q("do", "create"), body, cb); }
    public static void update(String endpoint, String id, JSONObject body, Callback cb) { post(endpoint, q("do", "update", "id", id), body, cb); }
    public static void delete(String endpoint, String id, Callback cb) { post(endpoint, q("do", "delete", "id", id), new JSONObject(), cb); }

    /** Login: POST api/auth.php with {contact_number, password}. */
    public static void login(String contact, String password, Callback cb) {
        JSONObject body = new JSONObject();
        try { body.put("contact_number", contact); body.put("password", password); } catch (Exception ignored) {}
        post("auth.php", null, body, cb);
    }

    public static void logout(Callback cb) {
        JSONObject body = new JSONObject();
        try { body.put("session_token", Prefs.token()); } catch (Exception ignored) {}
        post("auth.php", q("do", "logout"), body, cb);
    }

    /**
     * UI-ONLY BUILD: requests are answered by MockStore (in-memory sample data) after a short delay.
     * No network access is used. To connect to the PHP backend later, replace this method with an
     * HttpURLConnection call to <baseUrl>/api/<endpoint> (see README, "Connecting to the backend").
     */
    private static void run(final String method, final String endpoint, final Map<String, String> query,
                            final JSONObject body, final Callback cb) {
        POOL.execute(new Runnable() {
            @Override public void run() {
                try { Thread.sleep(250); } catch (InterruptedException ignored) {}
                try {
                    final Object data = MockStore.handle(method, endpoint, query, body);
                    MAIN.post(new Runnable() { @Override public void run() { cb.onSuccess(data); } });
                } catch (MockStore.MockError e) {
                    fail(cb, e.getMessage(), e.code, e.status);
                } catch (Exception ex) {
                    fail(cb, String.valueOf(ex.getMessage()), "client_error", 0);
                }
            }
        });
    }

    private static void fail(final Callback cb, final String msg, final String code, final int status) {
        MAIN.post(new Runnable() { @Override public void run() { cb.onError(msg, code, status); } });
    }

    public static JSONArray arr(Object data) { return data instanceof JSONArray ? (JSONArray) data : new JSONArray(); }
    public static JSONObject obj(Object data) { return data instanceof JSONObject ? (JSONObject) data : new JSONObject(); }
}
