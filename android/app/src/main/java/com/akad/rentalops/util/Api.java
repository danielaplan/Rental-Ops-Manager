package com.akad.rentalops.util;

import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.provider.OpenableColumns;

import com.akad.rentalops.BuildConfig;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
    private static final int TIMEOUT_MS = 20_000;
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

    /** Uploads a gallery image using the same multipart contract as the web gallery form. */
    public static void uploadGalleryImage(final ContentResolver resolver, final Uri image, final Callback cb) {
        uploadImage("gallery-upload.php", resolver, image, cb);
    }

    /** Uploads an image used by a public service card. */
    public static void uploadServiceImage(final ContentResolver resolver, final Uri image, final Callback cb) {
        uploadImage("service-upload.php", resolver, image, cb);
    }

    private static void uploadImage(final String endpoint, final ContentResolver resolver, final Uri image, final Callback cb) {
        POOL.execute(new Runnable() {
            @Override public void run() {
                HttpURLConnection connection = null;
                try {
                    String mime = resolver.getType(image);
                    if (mime == null || !mime.startsWith("image/")) mime = "application/octet-stream";
                    String filename = displayName(resolver, image);
                    String boundary = "----AkadAndroid" + System.currentTimeMillis();
                    connection = (HttpURLConnection) new URL(urlFor(endpoint, null)).openConnection();
                    connection.setRequestMethod("POST");
                    connection.setConnectTimeout(TIMEOUT_MS);
                    connection.setReadTimeout(60_000);
                    connection.setDoOutput(true);
                    connection.setChunkedStreamingMode(16 * 1024);
                    connection.setRequestProperty("Accept", "application/json");
                    connection.setRequestProperty("Authorization", "Bearer " + Prefs.token());
                    connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

                    try (DataOutputStream out = new DataOutputStream(connection.getOutputStream());
                         InputStream in = resolver.openInputStream(image)) {
                        if (in == null) throw new IllegalArgumentException("The selected image could not be opened.");
                        out.writeBytes("--" + boundary + "\r\n");
                        out.writeBytes("Content-Disposition: form-data; name=\"image\"; filename=\"" + safeFilename(filename) + "\"\r\n");
                        out.writeBytes("Content-Type: " + mime + "\r\n\r\n");
                        byte[] buffer = new byte[16 * 1024];
                        int count;
                        while ((count = in.read(buffer)) != -1) out.write(buffer, 0, count);
                        out.writeBytes("\r\n--" + boundary + "--\r\n");
                    }

                    int status = connection.getResponseCode();
                    String raw = read(status >= 200 && status < 400 ? connection.getInputStream() : connection.getErrorStream());
                    JSONObject response = new JSONObject(raw);
                    if (status == HttpURLConnection.HTTP_UNAUTHORIZED) notifyUnauthorized();
                    if (status < 200 || status >= 300 || !response.optBoolean("ok", false)) {
                        fail(cb, response.optString("error", "Image upload failed."), response.optString("code", "server_error"), status);
                        return;
                    }
                    final Object data = response.opt("data");
                    MAIN.post(new Runnable() { @Override public void run() { cb.onSuccess(data); } });
                } catch (Exception ex) {
                    fail(cb, "Unable to upload the image. Check the selected file and your internet connection.", "network_error", 0);
                } finally {
                    if (connection != null) connection.disconnect();
                }
            }
        });
    }

    /** Performs an authenticated request to the PHP API and delivers its JSON data on the main thread. */
    private static void run(final String method, final String endpoint, final Map<String, String> query,
                            final JSONObject body, final Callback cb) {
        POOL.execute(new Runnable() {
            @Override public void run() {
                HttpURLConnection connection = null;
                try {
                    connection = (HttpURLConnection) new URL(urlFor(endpoint, query)).openConnection();
                    connection.setRequestMethod(method);
                    connection.setConnectTimeout(TIMEOUT_MS);
                    connection.setReadTimeout(TIMEOUT_MS);
                    connection.setRequestProperty("Accept", "application/json");
                    connection.setRequestProperty("Authorization", "Bearer " + Prefs.token());

                    if (body != null) {
                        byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
                        connection.setDoOutput(true);
                        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                        connection.setFixedLengthStreamingMode(bytes.length);
                        try (OutputStream out = connection.getOutputStream()) { out.write(bytes); }
                    }

                    int status = connection.getResponseCode();
                    String raw = read(status >= 200 && status < 400 ? connection.getInputStream() : connection.getErrorStream());
                    JSONObject response = new JSONObject(raw);
                    // A rejected sign-in is expected validation, not an expired authenticated session.
                    if (status == HttpURLConnection.HTTP_UNAUTHORIZED && !("auth.php".equals(endpoint) && query == null)) {
                        notifyUnauthorized();
                    }
                    if (status < 200 || status >= 300 || !response.optBoolean("ok", false)) {
                        fail(cb, response.optString("error", "Request failed."), response.optString("code", "server_error"), status);
                        return;
                    }
                    final Object data = response.opt("data");
                    MAIN.post(new Runnable() { @Override public void run() { cb.onSuccess(data); } });
                } catch (Exception ex) {
                    fail(cb, "Unable to reach the server. Please check your internet connection and try again.", "network_error", 0);
                } finally {
                    if (connection != null) connection.disconnect();
                }
            }
        });
    }

    private static String urlFor(String endpoint, Map<String, String> query) throws Exception {
        StringBuilder url = new StringBuilder(BuildConfig.API_BASE_URL).append(endpoint);
        if (query != null && !query.isEmpty()) {
            url.append('?');
            boolean first = true;
            for (Map.Entry<String, String> entry : query.entrySet()) {
                if (!first) url.append('&');
                url.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
                url.append('=').append(URLEncoder.encode(entry.getValue(), "UTF-8"));
                first = false;
            }
        }
        return url.toString();
    }

    private static String read(InputStream input) throws Exception {
        if (input == null) return "{\"ok\":false,\"error\":\"The server returned no response.\"}";
        StringBuilder text = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) text.append(line);
        }
        return text.toString();
    }

    private static String displayName(ContentResolver resolver, Uri uri) {
        try (Cursor cursor = resolver.query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                String name = cursor.getString(0);
                if (name != null && !name.trim().isEmpty()) return name;
            }
        } catch (Exception ignored) {}
        return "gallery-image";
    }

    private static String safeFilename(String filename) {
        return filename.replace("\"", "").replace("\r", "").replace("\n", "");
    }

    private static void notifyUnauthorized() {
        MAIN.post(new Runnable() {
            @Override public void run() {
                if (unauthorizedListener != null) unauthorizedListener.onUnauthorized();
            }
        });
    }

    private static void fail(final Callback cb, final String msg, final String code, final int status) {
        MAIN.post(new Runnable() { @Override public void run() { cb.onError(msg, code, status); } });
    }

    public static JSONArray arr(Object data) { return data instanceof JSONArray ? (JSONArray) data : new JSONArray(); }
    public static JSONObject obj(Object data) { return data instanceof JSONObject ? (JSONObject) data : new JSONObject(); }
}
