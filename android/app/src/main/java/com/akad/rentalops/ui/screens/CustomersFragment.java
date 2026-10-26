package com.akad.rentalops.ui.screens;

import com.akad.rentalops.ui.ListScreen;
import com.akad.rentalops.ui.RowAdapter;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/** admin/customers.html: name, contact, messenger/email, # bookings and total spent (computed from bookings). */
public class CustomersFragment extends ListScreen {
    private final Map<String, Integer> counts = new HashMap<>();
    private final Map<String, Double> spent = new HashMap<>();

    @Override protected String searchWebId() { return "custSearch"; }

    @Override protected void load(final Api.Callback cb) {
        Api.get("bookings.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object data) {
                counts.clear();
                spent.clear();
                JSONArray b = Api.arr(data);
                for (int i = 0; i < b.length(); i++) {
                    JSONObject o = b.optJSONObject(i);
                    if (o == null) continue;
                    String cid = Js.s(o, "customer_id");
                    counts.put(cid, (counts.containsKey(cid) ? counts.get(cid) : 0) + 1);
                    spent.put(cid, (spent.containsKey(cid) ? spent.get(cid) : 0d) + Js.d(o, "amount_paid"));
                }
                Api.get("customers.php", Api.q("do", "all"), cb);
            }
            @Override public void onError(String m, String c, int s) { cb.onError(m, c, s); }
        });
    }

    @Override protected RowAdapter.Row toRow(JSONObject o) {
        String id = Js.s(o, "customer_id");
        int n = counts.containsKey(id) ? counts.get(id) : 0;
        double paid = spent.containsKey(id) ? spent.get(id) : 0;
        return new RowAdapter.Row(o).title(Js.s(o, "full_name")).subtitle(Js.s(o, "contact_number"))
                .detail(Js.s(o, "messenger_handle")).meta(Fmt.peso(paid)).badge(n + (n == 1 ? " booking" : " bookings"));
    }
}
