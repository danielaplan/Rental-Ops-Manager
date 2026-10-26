package com.akad.rentalops.ui.screens;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.BaseFragment;
import com.akad.rentalops.ui.FormField;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Lookups;
import com.akad.rentalops.util.Prefs;
import com.google.android.material.tabs.TabLayout;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * admin/bookings.html detail modal as a full screen with the same four tabs:
 * Details (+ status, deposit, delivery) | Checklist &amp; Release | Return Inspection | Payments.
 */
public class BookingDetailFragment extends BaseFragment {
    private static final String ARG_ID = "booking_id";

    public static BookingDetailFragment newInstance(String id) {
        BookingDetailFragment f = new BookingDetailFragment();
        Bundle b = new Bundle();
        b.putString(ARG_ID, id);
        f.setArguments(b);
        return f;
    }

    private String bookingId;
    private JSONObject booking = new JSONObject();
    private JSONObject deposit = new JSONObject();
    private JSONObject delivery = new JSONObject();
    private JSONArray items = new JSONArray();
    private JSONArray payments = new JSONArray();
    private Lookups.Pairs services = new Lookups.Pairs();
    private final Map<String, String> addonNames = new HashMap<>();
    private final List<Long> pendingConflictIds = new ArrayList<>();
    private String pendingConflictStatus = "";
    private int outstanding;
    private View root;

    // Return-inspection widgets (one entry per checklist row)
    private final List<EditText> returnQty = new ArrayList<>();
    private final List<Spinner> returnCond = new ArrayList<>();

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        root = inf.inflate(R.layout.fragment_booking_detail, c, false);
        return root;
    }

    @Override public void onViewCreated(@NonNull View v, @Nullable Bundle b) {
        bookingId = getArguments() == null ? "" : getArguments().getString(ARG_ID, "");
        TabLayout tabs = v.findViewById(R.id.detailTabs);
        tabs.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override public void onTabSelected(TabLayout.Tab t) { showTab(t.getPosition()); }
            @Override public void onTabUnselected(TabLayout.Tab t) {}
            @Override public void onTabReselected(TabLayout.Tab t) {}
        });

        spinner(R.id.dStatusSelect, Fmt.BOOKING_STATUSES, 0);
        spinner(R.id.payMethod, Fmt.PAYMENT_METHODS, 0);
        spinner(R.id.payPurpose, Fmt.PAYMENT_TYPES, 0);
        spinner(R.id.payStatus, Fmt.PAYMENT_STATUSES, 0);
        spinner(R.id.deliveryMethod, Fmt.DELIVERY_METHOD_LABELS, 0);
        spinner(R.id.deliveryResponsibility, Fmt.DELIVERY_RESPONSIBILITY_LABELS, 0);
        text(R.id.releasedByInput).setText(Prefs.fullName());
        text(R.id.inspectedByInput).setText(Prefs.fullName());

        click(R.id.dSaveBookingBtn, new Runnable() { public void run() { saveStatus(); } });
        click(R.id.dApproveConflictBtn, new Runnable() { public void run() { approveConflict(); } });
        click(R.id.cancelBookingBtn, new Runnable() { public void run() { cancelBooking(); } });
        click(R.id.saveDepositBtn, new Runnable() { public void run() { saveDeposit(); } });
        click(R.id.addDeductionBtn, new Runnable() { public void run() { addDeduction(); } });
        click(R.id.refundDepositBtn, new Runnable() { public void run() { refundDeposit(); } });
        click(R.id.saveDeliveryBtn, new Runnable() { public void run() { saveDelivery(); } });
        click(R.id.confirmReleaseBtn, new Runnable() { public void run() { confirmRelease(); } });
        click(R.id.completeReturnBtn, new Runnable() { public void run() { saveReturn(); } });
        click(R.id.recordPaymentBtn, new Runnable() { public void run() { recordPayment(); } });
        loadAll();
    }

    // ------------------------------------------------------------------ helpers
    private EditText text(int id) { return root.findViewById(id); }
    private TextView tv(int id) { return root.findViewById(id); }
    private void set(int id, String s) { tv(id).setText(s == null ? "" : s); tv(id).setVisibility(View.VISIBLE); }

    private void click(int id, final Runnable r) {
        root.findViewById(id).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View v) { r.run(); } });
    }

    private void spinner(int id, String[] labels, int sel) {
        Spinner s = root.findViewById(id);
        s.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, labels));
        s.setSelection(sel);
    }

    private void showTab(int pos) {
        int[] ids = {R.id.tabDetails, R.id.tabChecklist, R.id.tabReturn, R.id.tabPayments};
        for (int i = 0; i < ids.length; i++) root.findViewById(ids[i]).setVisibility(i == pos ? View.VISIBLE : View.GONE);
    }

    private Api.Callback failToast() {
        return new Api.Callback() {
            @Override public void onSuccess(Object d) {}
            @Override public void onError(String m, String c, int s) { toast(m); }
        };
    }

    // ------------------------------------------------------------------ loading
    private void loadAll() {
        root.findViewById(R.id.detailProgress).setVisibility(View.VISIBLE);
        outstanding = 7;
        Api.get("bookings.php", Api.q("do", "get", "id", bookingId), new Api.Callback() {
            @Override public void onSuccess(Object d) { booking = Api.obj(d); step(); }
            @Override public void onError(String m, String c, int s) { toast(m); step(); }
        });
        Lookups.services(false, new Lookups.Done() { @Override public void done(Lookups.Pairs p) { services = p; step(); } });
        Api.list("addons.php", new Api.Callback() {
            @Override public void onSuccess(Object d) {
                JSONArray a = Api.arr(d);
                for (int i = 0; i < a.length(); i++) addonNames.put(Js.s(Js.at(a, i), "addon_id"), Js.s(Js.at(a, i), "name") + " (" + Fmt.peso(Js.d(Js.at(a, i), "price")) + ")");
                step();
            }
            @Override public void onError(String m, String c, int s) { step(); }
        });
        Api.get("deposits.php", Api.q("do", "get", "booking_id", bookingId), new Api.Callback() {
            @Override public void onSuccess(Object d) { deposit = Api.obj(d); step(); }
            @Override public void onError(String m, String c, int s) { step(); }
        });
        Api.get("delivery.php", Api.q("do", "get", "booking_id", bookingId), new Api.Callback() {
            @Override public void onSuccess(Object d) { delivery = Api.obj(d); step(); }
            @Override public void onError(String m, String c, int s) { step(); }
        });
        Api.get("bookingItems.php", Api.q("do", "forBooking", "booking_id", bookingId), new Api.Callback() {
            @Override public void onSuccess(Object d) { items = Api.arr(d); step(); }
            @Override public void onError(String m, String c, int s) { step(); }
        });
        Api.get("payments.php", Api.q("do", "all", "booking_id", bookingId), new Api.Callback() {
            @Override public void onSuccess(Object d) { payments = Api.arr(d); step(); }
            @Override public void onError(String m, String c, int s) { step(); }
        });
    }

    private void step() {
        if (--outstanding > 0 || !alive()) return;
        root.findViewById(R.id.detailProgress).setVisibility(View.GONE);
        renderAll();
    }

    private static String hm(String t) { return t != null && t.length() >= 5 ? t.substring(0, 5) : "00:00"; }

    private void refreshQuietly() { loadAll(); }

    // ------------------------------------------------------------------ rendering
    private void renderAll() {
        renderDetails();
        renderDeposit();
        renderDelivery();
        renderChecklist();
        renderReturn();
        renderPayments();
    }

    private void renderDetails() {
        String ref = Js.s(booking, "booking_reference");
        set(R.id.dBookingRef, ref.isEmpty() ? "Booking #" + bookingId : ref);
        String status = Fmt.titleCase(Js.s(booking, "status"));
        double total = Js.d(booking, "total");
        double paid = Js.d(booking, "amount_paid");
        Fmt.badge(tv(R.id.dStatusBadge), status);
        Fmt.badge(tv(R.id.dPaymentBadge), Fmt.paymentStatus(total, paid));

        set(R.id.dCustName, Js.s(booking, "customer_name"));
        String contact = Js.s(booking, "contact").isEmpty() ? Js.s(booking, "contact_number") : Js.s(booking, "contact");
        set(R.id.dCustContact, contact);
        set(R.id.dCustEmail, Js.s(booking, "email"));
        set(R.id.dCustType, Js.s(booking, "customer_type"));
        set(R.id.dEventType, Js.s(booking, "event_type"));
        set(R.id.dEventDateTime, Fmt.date(Js.s(booking, "event_date")) + ", " + Fmt.time(Js.s(booking, "start_time")) + "–" + Fmt.time(Js.s(booking, "end_time")));
        set(R.id.dEventLocation, Js.s(booking, "event_location"));
        set(R.id.dEventGuests, Js.i(booking, "guests") > 0 ? Js.i(booking, "guests") + " guests" : "");
        set(R.id.dSpecialRequests, Js.s(booking, "special_requests"));

        StringBuilder sb = new StringBuilder();
        JSONArray sids = booking.optJSONArray("service_ids");
        if (sids != null && sids.length() > 0) {
            for (int i = 0; i < sids.length(); i++) sb.append("• ").append(serviceName(String.valueOf(sids.opt(i)))).append('\n');
        } else {
            sb.append("• ").append(serviceName(Js.s(booking, "service_id"))).append('\n');
        }
        if (!Js.s(booking, "package_name_snapshot").isEmpty()) sb.append("Package: ").append(Js.s(booking, "package_name_snapshot")).append('\n');
        JSONArray aids = booking.optJSONArray("addon_ids");
        if (aids != null) for (int i = 0; i < aids.length(); i++) {
            String n = addonNames.get(String.valueOf(aids.opt(i)));
            sb.append("+ ").append(n == null ? "Add-on " + aids.opt(i) : n).append('\n');
        }
        set(R.id.dServicesList, sb.toString().trim());

        set(R.id.dSubtotal, Fmt.peso(Js.d(booking, "subtotal")));
        set(R.id.dAddonsTotal, Fmt.peso(Js.d(booking, "addons_total")));
        set(R.id.dDiscount, "-" + Fmt.peso(Js.d(booking, "discount")));
        set(R.id.dFees, Fmt.peso(Js.d(booking, "fees")));
        set(R.id.dTotal, Fmt.peso(total));
        set(R.id.dPaid, Fmt.peso(paid));
        double agreed = Js.d(booking, "agreed_total") > 0 ? Js.d(booking, "agreed_total") : total;
        set(R.id.dBalance, Fmt.peso(Math.max(0, agreed - paid)));

        Spinner sp = root.findViewById(R.id.dStatusSelect);
        sp.setSelection(Fmt.indexOf(Fmt.BOOKING_STATUSES, status));
        boolean closed = status.equals("Cancelled") || status.equals("Completed");
        root.findViewById(R.id.cancelBookingBtn).setVisibility(closed ? View.GONE : View.VISIBLE);
    }

    private String serviceName(String id) {
        String n = services.nameOf(id);
        return n.isEmpty() ? (Js.s(booking, "service_name").isEmpty() ? "Service " + id : Js.s(booking, "service_name")) : n;
    }

    private void renderDeposit() {
        text(R.id.depositHeld).setText(Js.d(deposit, "amount_held") > 0 ? String.valueOf(Js.d(deposit, "amount_held")) : "");
        String info = "Deductions: " + Fmt.peso(Js.d(deposit, "deduction_amount"))
                + " · Refundable: " + Fmt.peso(Js.d(deposit, "refund_amount"))
                + "\nStatus: " + (Js.s(deposit, "refund_status").isEmpty() ? "Not recorded" : Js.s(deposit, "refund_status"))
                + "\nThis status records the agreed refund amount; it does not confirm a money transfer.";
        set(R.id.depositInfo, info);
        StringBuilder sb = new StringBuilder();
        JSONArray ded = deposit.optJSONArray("deductions");
        if (ded != null) for (int i = 0; i < ded.length(); i++) {
            JSONObject d = Js.at(ded, i);
            sb.append("– ").append(Js.s(d, "affected_item")).append(": ").append(Fmt.peso(Js.d(d, "amount"))).append(" (").append(Js.s(d, "reason")).append(")\n");
        }
        set(R.id.depositDeductions, sb.toString().trim());
    }

    private void renderDelivery() {
        String m = Js.s(delivery, "delivery_method");
        ((Spinner) root.findViewById(R.id.deliveryMethod)).setSelection(Fmt.indexOf(Fmt.DELIVERY_METHODS, m.isEmpty() ? "self_pickup" : m));
        ((Spinner) root.findViewById(R.id.deliveryResponsibility)).setSelection(Fmt.indexOf(Fmt.DELIVERY_RESPONSIBILITY, Js.s(delivery, "fee_shouldered_by")));
        text(R.id.deliveryFee).setText(String.valueOf(Js.d(delivery, "delivery_fee")));
        text(R.id.deliveryNotes).setText(Js.s(delivery, "delivery_notes"));
    }

    // -- checklist / release
    private void renderChecklist() {
        LinearLayout list = root.findViewById(R.id.releaseChecklistWrap);
        list.removeAllViews();
        if (items.length() == 0) {
            TextView t = new TextView(getContext());
            t.setText("No checklist items yet.");
            list.addView(t);
            Button gen = new Button(getContext());
            gen.setText("Generate checklist");
            gen.setOnClickListener(new View.OnClickListener() { @Override public void onClick(View v) { generateChecklist(); } });
            list.addView(gen);
        }
        for (int i = 0; i < items.length(); i++) {
            final JSONObject it = Js.at(items, i);
            CheckBox cb = new CheckBox(getContext());
            cb.setText(Js.s(it, "name") + "  ×" + Js.i(it, "expected_qty") + (Js.b(it, "required") ? "  (required)" : ""));
            cb.setChecked(Js.b(it, "checked_released"));
            cb.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                @Override public void onCheckedChanged(CompoundButton b, boolean checked) {
                    Js.put(it, "checked_released", checked ? 1 : 0);
                    Api.update("bookingItems.php", Js.s(it, "booking_item_id"), Js.of("booking_id", Js.i(booking, "booking_id"), "checked_released", checked, "released_qty", checked ? Js.i(it, "expected_qty") : 0), failToast());
                    updateReleaseProgress();
                }
            });
            list.addView(cb);
        }
        updateReleaseProgress();
    }

    private void updateReleaseProgress() {
        int checked = 0;
        for (int i = 0; i < items.length(); i++) if (Js.b(Js.at(items, i), "checked_released")) checked++;
        tv(R.id.releaseProgress).setText(checked + " / " + items.length() + " Items Checked" + (items.length() > 0 && checked == items.length() ? "  ✔ Ready for Release" : ""));
        root.findViewById(R.id.confirmReleaseBtn).setEnabled(items.length() > 0 && checked == items.length());
    }

    private void generateChecklist() {
        JSONArray ids = booking.optJSONArray("service_ids") == null ? new JSONArray() : booking.optJSONArray("service_ids");
        Api.post("bookingItems.php", Api.q("do", "generate"), Js.of("booking_id", Js.i(booking, "booking_id"), "service_ids", ids), new Api.Callback() {
            @Override public void onSuccess(Object d) { if (alive()) refreshQuietly(); }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }

    private void confirmRelease() {
        String by = text(R.id.releasedByInput).getText().toString().trim();
        Api.post("itemReleases.php", Api.q("do", "create"),
                Js.of("booking_id", Js.i(booking, "booking_id"), "released_by", by.isEmpty() ? "Staff" : by, "notes", text(R.id.releaseNotesInput).getText().toString().trim()),
                new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { saved(); refreshQuietly(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
    }

    // -- return inspection
    private void renderReturn() {
        LinearLayout list = root.findViewById(R.id.returnChecklistWrap);
        list.removeAllViews();
        returnQty.clear();
        returnCond.clear();
        for (int i = 0; i < items.length(); i++) {
            JSONObject it = Js.at(items, i);
            TextView name = new TextView(getContext());
            name.setText(Js.s(it, "name") + " — expected " + Js.i(it, "expected_qty"));
            name.setTypeface(null, android.graphics.Typeface.BOLD);
            list.addView(name);
            EditText qty = new EditText(getContext());
            qty.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
            qty.setHint("Returned qty");
            qty.setText(String.valueOf(Js.i(it, "returned_qty") > 0 ? Js.i(it, "returned_qty") : Js.i(it, "expected_qty")));
            list.addView(qty);
            Spinner cond = new Spinner(getContext());
            cond.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, Fmt.ITEM_CONDITIONS));
            cond.setSelection(Fmt.indexOf(Fmt.ITEM_CONDITIONS, Js.s(it, "condition")));
            list.addView(cond);
            returnQty.add(qty);
            returnCond.add(cond);
        }
        if (items.length() == 0) {
            TextView t = new TextView(getContext());
            t.setText("Generate the checklist on the Checklist & Release tab first.");
            list.addView(t);
        }
    }

    private void saveReturn() {
        JSONArray results = new JSONArray();
        int expected = 0, returned = 0, good = 0, damaged = 0, missing = 0;
        for (int i = 0; i < items.length(); i++) {
            JSONObject it = Js.at(items, i);
            int qty;
            try { qty = Integer.parseInt(returnQty.get(i).getText().toString().trim()); } catch (Exception e) { qty = -1; }
            int exp = Js.i(it, "expected_qty");
            if (qty < 0 || qty > exp) { toast("Enter whole returned quantities between zero and the expected quantity."); return; }
            String cond = Fmt.ITEM_CONDITIONS[returnCond.get(i).getSelectedItemPosition()];
            expected += exp; returned += qty;
            if (cond.equals("Good")) good++;
            if (cond.equals("Damaged") || cond.equals("Minor Damage")) damaged++;
            missing += Math.max(exp - qty, cond.equals("Missing") ? exp : 0);
            results.put(Js.of("booking_item_id", Js.s(it, "booking_item_id"), "checklist_item_id", Js.s(it, "checklist_item_id"),
                    "template_item_id", it.opt("template_item_id"), "rental_item_id", it.opt("rental_item_id"),
                    "name", Js.s(it, "name"), "expected_qty", exp, "returned_qty", qty, "condition", cond,
                    "notes", text(R.id.returnNotesInput).getText().toString().trim()));
        }
        if (results.length() == 0) { toast("No checklist items to inspect."); return; }
        final String summary = "Expected " + expected + " · Returned " + returned + " · Good " + good + " · Damaged " + damaged + " · Missing " + missing;
        String by = text(R.id.inspectedByInput).getText().toString().trim();
        Api.post("equipment.php", Api.q("do", "inspect"),
                Js.of("booking_id", Js.i(booking, "booking_id"), "inspected_by", by.isEmpty() ? "Staff" : by, "items", results),
                new Api.Callback() {
                    @Override public void onSuccess(Object d) {
                        if (!alive()) return;
                        tv(R.id.returnSummary).setText(summary + "\nThe owner must complete the post-event review before final release.");
                        saved();
                        refreshQuietly();
                    }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
    }

    // -- payments
    private void renderPayments() {
        LinearLayout list = root.findViewById(R.id.paymentHistoryWrap);
        list.removeAllViews();
        if (payments.length() == 0) {
            TextView t = new TextView(getContext());
            t.setText("No payments recorded yet.");
            list.addView(t);
            return;
        }
        for (int i = 0; i < payments.length(); i++) {
            JSONObject p = Js.at(payments, i);
            TextView t = new TextView(getContext());
            t.setPadding(0, 8, 0, 8);
            t.setText(Fmt.date(Js.s(p, "payment_date")) + " · " + Js.s(p, "payment_method") + " · " + Js.s(p, "payment_type")
                    + "\n" + Fmt.peso(Js.d(p, "amount")) + " — " + Js.s(p, "payment_status")
                    + (Js.s(p, "payment_reference").isEmpty() ? "" : "\nRef: " + Js.s(p, "payment_reference")));
            list.addView(t);
        }
    }

    private void recordPayment() {
        double amount = Fmt.num(text(R.id.payAmount).getText());
        if (amount <= 0) { toast("Enter a payment amount greater than zero."); return; }
        JSONObject body = Js.of(
                "booking_id", Js.i(booking, "booking_id"),
                "amount", amount,
                "payment_method", Fmt.PAYMENT_METHODS[((Spinner) root.findViewById(R.id.payMethod)).getSelectedItemPosition()],
                "payment_type", Fmt.PAYMENT_TYPES[((Spinner) root.findViewById(R.id.payPurpose)).getSelectedItemPosition()],
                "payment_status", Fmt.PAYMENT_STATUSES[((Spinner) root.findViewById(R.id.payStatus)).getSelectedItemPosition()],
                "payment_reference", text(R.id.payReference).getText().toString().trim(),
                "notes", text(R.id.payNotes).getText().toString().trim());
        Api.create("payments.php", body, new Api.Callback() {
            @Override public void onSuccess(Object d) {
                if (!alive()) return;
                saved();
                text(R.id.payAmount).setText("");
                text(R.id.payReference).setText("");
                text(R.id.payNotes).setText("");
                refreshQuietly();
            }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }

    // -- deposit & delivery
    private void saveDeposit() {
        double held = Fmt.num(text(R.id.depositHeld).getText());
        if (held < 0) { toast("Deposit cannot be negative."); return; }
        Api.post("deposits.php", Api.q("do", "upsert"), Js.of("booking_id", Js.i(booking, "booking_id"), "amount_held", held), new Api.Callback() {
            @Override public void onSuccess(Object d) { if (alive()) { saved(); refreshQuietly(); } }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }

    private void addDeduction() {
        String item = text(R.id.deductionItem).getText().toString().trim();
        String reason = text(R.id.deductionReasonNew).getText().toString().trim();
        double amt = Fmt.num(text(R.id.deductionAmount).getText());
        if (item.isEmpty() || reason.isEmpty() || amt <= 0) { toast("Enter the affected item, an amount, and a reason."); return; }
        Api.post("deposits.php", Api.q("do", "deduct"), Js.of("booking_id", Js.i(booking, "booking_id"), "affected_item", item, "amount", amt, "reason", reason), new Api.Callback() {
            @Override public void onSuccess(Object d) {
                if (!alive()) return;
                saved();
                text(R.id.deductionItem).setText("");
                text(R.id.deductionAmount).setText("");
                text(R.id.deductionReasonNew).setText("");
                refreshQuietly();
            }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }

    private void refundDeposit() {
        FormUi.confirm(requireContext(), "Mark the current refundable balance as refunded?", new Runnable() {
            @Override public void run() {
                Api.post("deposits.php", Api.q("do", "refund"), Js.of("booking_id", Js.i(booking, "booking_id")), new Api.Callback() {
                    @Override public void onSuccess(Object d) { if (alive()) { toast("Deposit refund recorded."); refreshQuietly(); } }
                    @Override public void onError(String m, String c, int s) { toast(m); }
                });
            }
        });
    }

    private void saveDelivery() {
        JSONObject body = Js.of(
                "booking_id", Js.i(booking, "booking_id"),
                "delivery_method", Fmt.DELIVERY_METHODS[((Spinner) root.findViewById(R.id.deliveryMethod)).getSelectedItemPosition()],
                "delivery_fee", Fmt.num(text(R.id.deliveryFee).getText()),
                "fee_shouldered_by", Fmt.DELIVERY_RESPONSIBILITY[((Spinner) root.findViewById(R.id.deliveryResponsibility)).getSelectedItemPosition()],
                "delivery_notes", text(R.id.deliveryNotes).getText().toString().trim());
        Api.post("delivery.php", Api.q("do", "upsert"), body, new Api.Callback() {
            @Override public void onSuccess(Object d) { if (alive()) saved(); }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }

    // -- status workflow (same rules as #dSaveBookingBtn in bookings.html)
    private void conflictMessage(String msg) {
        TextView t = tv(R.id.dSaveConflictMsg);
        t.setText(msg);
        t.setVisibility(msg == null || msg.isEmpty() ? View.GONE : View.VISIBLE);
    }

    private void saveStatus() {
        final String newStatus = Fmt.BOOKING_STATUSES[((Spinner) root.findViewById(R.id.dStatusSelect)).getSelectedItemPosition()];
        String current = Fmt.titleCase(Js.s(booking, "status"));
        conflictMessage("");
        root.findViewById(R.id.dConflictApproval).setVisibility(View.GONE);
        pendingConflictIds.clear();
        if (newStatus.equals(current)) { toast("Status unchanged."); return; }
        if (newStatus.equals("Completed")) {
            conflictMessage("Use Save Return Inspection to request completion after recording the returned items.");
            return;
        }
        if (newStatus.equals("Confirmed")) { checkAvailabilityThenSave(newStatus); return; }
        Api.update("bookings.php", bookingId, Js.of("status", newStatus), statusSaved());
    }

    private Api.Callback statusSaved() {
        return new Api.Callback() {
            @Override public void onSuccess(Object d) { if (alive()) { saved(); refreshQuietly(); } }
            @Override public void onError(String m, String c, int s) { conflictMessage(m); }
        };
    }

    private void checkAvailabilityThenSave(final String newStatus) {
        JSONArray sids = booking.optJSONArray("service_ids");
        final List<String> serviceIds = new ArrayList<>();
        if (sids != null && sids.length() > 0) for (int i = 0; i < sids.length(); i++) serviceIds.add(String.valueOf(sids.opt(i)));
        else serviceIds.add(Js.s(booking, "service_id"));
        final boolean[] blocked = {false};
        final Map<Long, Boolean> conflictIds = new HashMap<>();
        final int[] left = {serviceIds.size()};
        for (String sid : serviceIds) {
            String d = Js.s(booking, "event_date");
            Api.get("bookings.php", Api.q("do", "availability", "service_id", sid,
                    "event_start_datetime", d + " " + hm(Js.s(booking, "start_time")) + ":00",
                    "event_end_datetime", d + " " + hm(Js.s(booking, "end_time")) + ":00",
                    "exclude_booking_id", bookingId,
                    "preparation_minutes", String.valueOf(Js.i(booking, "preparation_minutes")),
                    "travel_minutes", String.valueOf(Js.i(booking, "travel_minutes"))), new Api.Callback() {
                @Override public void onSuccess(Object data) {
                    JSONObject conflicts = Api.obj(data).optJSONObject("conflicts");
                    if (conflicts != null) {
                        JSONArray bl = conflicts.optJSONArray("blocks");
                        if (bl != null && bl.length() > 0) blocked[0] = true;
                        JSONArray bk = conflicts.optJSONArray("bookings");
                        if (bk != null) for (int i = 0; i < bk.length(); i++) {
                            JSONObject c = Js.at(bk, i);
                            long cid = Js.i(c, "booking_id") > 0 ? Js.i(c, "booking_id") : Js.i(c, "id");
                            if (cid > 0) conflictIds.put(cid, true);
                        }
                    }
                    finish();
                }
                @Override public void onError(String m, String c, int s) { toast(m); finish(); }
                private void finish() {
                    if (--left[0] > 0 || !alive()) return;
                    if (blocked[0]) { conflictMessage("Cannot confirm: this interval contains a blocked period that cannot be overridden."); return; }
                    if (!conflictIds.isEmpty()) {
                        pendingConflictIds.clear();
                        pendingConflictIds.addAll(conflictIds.keySet());
                        pendingConflictStatus = newStatus;
                        conflictMessage(conflictIds.size() + " active booking overlap" + (conflictIds.size() == 1 ? "" : "s") + " must be explicitly approved. No change has been saved.");
                        root.findViewById(R.id.dConflictApproval).setVisibility(View.VISIBLE);
                        return;
                    }
                    Api.update("bookings.php", bookingId, Js.of("status", newStatus), statusSaved());
                }
            });
        }
    }

    private void approveConflict() {
        String reason = text(R.id.dConflictReason).getText().toString().trim();
        if (pendingConflictIds.isEmpty() || reason.isEmpty()) { conflictMessage("Enter the business reason for approving the listed overlaps."); return; }
        JSONArray ids = new JSONArray();
        for (Long l : pendingConflictIds) ids.put(l.longValue());
        Api.update("bookings.php", bookingId, Js.of("status", pendingConflictStatus, "approve_conflicts", true, "conflicting_booking_ids", ids, "override_reason", reason), statusSaved());
    }

    private void cancelBooking() {
        List<FormField> f = new ArrayList<>();
        f.add(FormField.multi("cancellation_reason", "Reason for cancellation").req());
        FormUi.dialog(requireContext(), "Cancel booking", f, new FormUi.Submit() {
            @Override public void onSubmit(JSONObject v) {
                Api.update("bookings.php", bookingId, Js.of("status", "Cancelled", "cancellation_reason", Js.s(v, "cancellation_reason")), statusSaved());
            }
        }, null);
    }
}
