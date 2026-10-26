package com.akad.rentalops.util;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** Loads id/name pairs (services, packages, customers...) for dropdowns. */
public final class Lookups {
    private Lookups() {}

    public static class Pairs {
        public final List<String> ids = new ArrayList<>();
        public final List<String> names = new ArrayList<>();
        public final List<JSONObject> rows = new ArrayList<>();
        public String[] idArray() { return ids.toArray(new String[0]); }
        public String[] nameArray() { return names.toArray(new String[0]); }
        public String nameOf(String id) {
            int i = ids.indexOf(id);
            return i < 0 ? "" : names.get(i);
        }
        public int indexOf(String id) { return Math.max(0, ids.indexOf(id)); }
    }

    public interface Done { void done(Pairs p); }

    /** @param activeOnly drop rows whose status is not "Active". */
    public static void load(String endpoint, final String idKey, final String nameKey, final boolean activeOnly, final Done done) {
        Api.list(endpoint, new Api.Callback() {
            @Override public void onSuccess(Object data) {
                Pairs p = new Pairs();
                JSONArray a = Api.arr(data);
                for (int i = 0; i < a.length(); i++) {
                    JSONObject o = a.optJSONObject(i);
                    if (o == null) continue;
                    if (activeOnly && o.has("status") && !"Active".equalsIgnoreCase(Js.s(o, "status"))) continue;
                    p.ids.add(Js.s(o, idKey));
                    p.names.add(Js.s(o, nameKey));
                    p.rows.add(o);
                }
                done.done(p);
            }
            @Override public void onError(String m, String c, int s) { done.done(new Pairs()); }
        });
    }

    public static void services(boolean activeOnly, Done d) { load("services.php", "service_id", "service_name", activeOnly, d); }
}
