package com.akad.rentalops.ui.screens;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.BaseFragment;
import com.akad.rentalops.ui.FormUi;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Lookups;
import com.google.android.material.button.MaterialButton;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** admin/manual-booking.html -> POST api/bookings.php?do=create (+ payments.php for the down payment). */
public class ManualBookingFragment extends BaseFragment {
    private View root;
    private Lookups.Pairs customers = new Lookups.Pairs();
    private Lookups.Pairs services = new Lookups.Pairs();
    private Lookups.Pairs packages = new Lookups.Pairs();
    private JSONArray allPackages = new JSONArray();
    private JSONArray allAddons = new JSONArray();
    private final List<JSONObject> shownAddons = new ArrayList<>();
    private final List<CheckBox> addonChecks = new ArrayList<>();
    private final List<Lookups.Pairs> pkgForService = new ArrayList<>();
    private String date = "", start = "", end = "";
    private String selectedServiceId = "";
    private boolean saving;
    private boolean agreedTouched;

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        root = inf.inflate(R.layout.fragment_manual_booking, c, false);
        return root;
    }

    private EditText et(int id) { return root.findViewById(id); }
    private Spinner sp(int id) { return root.findViewById(id); }
    private void fill(int id, String[] labels) { sp(id).setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, labels)); }

    @Override public void onViewCreated(@NonNull View v, @Nullable Bundle b) {
        fill(R.id.mCustType, Fmt.CUSTOMER_TYPES);
        fill(R.id.mSource, Fmt.BOOKING_SOURCES);
        fill(R.id.mEventType, Fmt.EVENT_TYPES);
        fill(R.id.mPayMethod, Fmt.PAYMENT_METHODS);
        et(R.id.mPreparation).setText("0");
        et(R.id.mTravel).setText("0");
        et(R.id.mDiscount).setText("0");
        et(R.id.mFees).setText("0");
        et(R.id.mAmountPaid).setText("0");
        et(R.id.mAgreedTotal).setText("0");

        pickerButton(R.id.mDate, 0);
        pickerButton(R.id.mStart, 1);
        pickerButton(R.id.mEnd, 2);

        TextWatcher recalc = new TextWatcher() {
            public void beforeTextChanged(CharSequence s, int a, int b2, int c) {}
            public void onTextChanged(CharSequence s, int a, int b2, int c) { recalculate(false); }
            public void afterTextChanged(Editable s) {}
        };
        et(R.id.mDiscount).addTextChangedListener(recalc);
        et(R.id.mFees).addTextChangedListener(recalc);
        et(R.id.mAgreedTotal).setOnFocusChangeListener(new View.OnFocusChangeListener() {
            @Override public void onFocusChange(View x, boolean focus) { if (focus) agreedTouched = true; }
        });
        sp(R.id.mCustomerId).setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override public void onItemSelected(AdapterView<?> p, View view, int pos, long id) {
                if (pos > 0 && pos - 1 < customers.rows.size()) {
                    JSONObject c = customers.rows.get(pos - 1);
                    et(R.id.mCustName).setText(Js.s(c, "full_name"));
                    et(R.id.mCustContact).setText(Js.s(c, "contact_number"));
                    et(R.id.mCustEmail).setText(Js.s(c, "messenger_handle"));
                    sp(R.id.mCustType).setSelection(1);
                }
            }
            @Override public void onNothingSelected(AdapterView<?> p) {}
        });
        root.findViewById(R.id.mSubmitBtn).setOnClickListener(new View.OnClickListener() { @Override public void onClick(View x) { submit(); } });
        loadLookups();
    }

    private void pickerButton(int id, final int which) {
        final MaterialButton btn = root.findViewById(id);
        btn.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View x) {
                if (which == 0) FormUi.pickDate(requireContext(), date, new FormUi.OnPicked() {
                    public void picked(String s) { date = s; btn.setText(Fmt.date(s)); checkAvailability(); }
                });
                else FormUi.pickTime(requireContext(), which == 1 ? start : end, new FormUi.OnPicked() {
                    public void picked(String s) {
                        if (which == 1) start = s; else end = s;
                        btn.setText(Fmt.time(s));
                        checkAvailability();
                    }
                });
            }
        });
    }

    // ---------------------------------------------------------------- data
    private void loadLookups() {
        Lookups.load("customers.php", "customer_id", "full_name", false, new Lookups.Done() {
            @Override public void done(Lookups.Pairs p) {
                if (!alive()) return;
                customers = p;
                List<String> names = new ArrayList<>();
                names.add("Create a new customer");
                for (int i = 0; i < p.names.size(); i++) names.add(p.names.get(i) + " · " + Js.s(p.rows.get(i), "contact_number"));
                fill(R.id.mCustomerId, names.toArray(new String[0]));
            }
        });
        Lookups.services(true, new Lookups.Done() {
            @Override public void done(Lookups.Pairs p) { if (alive()) { services = p; buildServiceRadios(); } }
        });
        Api.get("packages.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object d) { allPackages = Api.arr(d); if (alive()) refreshPackages(); }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
        Api.get("addons.php", Api.q("do", "all"), new Api.Callback() {
            @Override public void onSuccess(Object d) { allAddons = Api.arr(d); if (alive()) refreshAddons(); }
            @Override public void onError(String m, String c, int s) { toast(m); }
        });
    }

    private void buildServiceRadios() {
        RadioGroup g = root.findViewById(R.id.mServiceChecklist);
        g.removeAllViews();
        for (int i = 0; i < services.ids.size(); i++) {
            RadioButton rb = new RadioButton(getContext());
            rb.setId(View.generateViewId());
            rb.setTag(services.ids.get(i));
            rb.setText(services.names.get(i));
            g.addView(rb);
        }
        g.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override public void onCheckedChanged(RadioGroup group, int checkedId) {
                View rb = group.findViewById(checkedId);
                selectedServiceId = rb == null ? "" : String.valueOf(rb.getTag());
                refreshPackages();
                refreshAddons();
                checkAvailability();
            }
        });
    }

    private void refreshPackages() {
        packages = new Lookups.Pairs();
        packages.ids.add("");
        packages.names.add(selectedServiceId.isEmpty() ? "Select a service first" : "No package");
        packages.rows.add(new JSONObject());
        for (int i = 0; i < allPackages.length(); i++) {
            JSONObject p = Js.at(allPackages, i);
            if (!"Active".equalsIgnoreCase(Js.s(p, "status")) || !Js.s(p, "service_id").equals(selectedServiceId)) continue;
            packages.ids.add(Js.s(p, "package_id"));
            packages.names.add(Js.s(p, "package_name") + " — " + Fmt.peso(Js.d(p, "price")));
            packages.rows.add(p);
        }
        fill(R.id.mPackage, packages.nameArray());
        sp(R.id.mPackage).setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override public void onItemSelected(AdapterView<?> p, View view, int pos, long id) { agreedTouched = false; recalculate(true); }
            @Override public void onNothingSelected(AdapterView<?> p) {}
        });
        recalculate(true);
    }

    private void refreshAddons() {
        LinearLayout list = root.findViewById(R.id.mAddonChecklist);
        list.removeAllViews();
        shownAddons.clear();
        addonChecks.clear();
        for (int i = 0; i < allAddons.length(); i++) {
            JSONObject a = Js.at(allAddons, i);
            if (!"Active".equalsIgnoreCase(Js.s(a, "status")) || !Js.s(a, "service_id").equals(selectedServiceId)) continue;
            CheckBox cb = new CheckBox(getContext());
            cb.setText(Js.s(a, "name") + " — " + Fmt.peso(Js.d(a, "price")));
            cb.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                @Override public void onCheckedChanged(CompoundButton b, boolean c) { agreedTouched = false; recalculate(true); }
            });
            list.addView(cb);
            shownAddons.add(a);
            addonChecks.add(cb);
        }
        root.findViewById(R.id.mAddonSection).setVisibility(shownAddons.isEmpty() ? View.GONE : View.VISIBLE);
        recalculate(true);
    }

    // ---------------------------------------------------------------- pricing
    private double subtotal() {
        int pos = sp(R.id.mPackage).getSelectedItemPosition();
        return pos > 0 && pos < packages.rows.size() ? Js.d(packages.rows.get(pos), "price") : 0;
    }

    private double addonsTotal() {
        double t = 0;
        for (int i = 0; i < addonChecks.size(); i++) if (addonChecks.get(i).isChecked()) t += Js.d(shownAddons.get(i), "price");
        return t;
    }

    private void recalculate(boolean resetAgreed) {
        if (root == null) return;
        double sub = subtotal(), add = addonsTotal();
        double discount = Fmt.num(et(R.id.mDiscount).getText()), fees = Fmt.num(et(R.id.mFees).getText());
        double total = Math.max(0, sub + add - discount + fees);
        tv(R.id.mSumSubtotal, Fmt.peso(sub));
        tv(R.id.mSumAddons, Fmt.peso(add));
        tv(R.id.mSumDiscount, "-" + Fmt.peso(discount));
        tv(R.id.mSumFees, Fmt.peso(fees));
        tv(R.id.mSumTotal, Fmt.peso(total));
        // "Defaults to the calculated total and may be changed only to the amount agreed with the client."
        if (!agreedTouched) et(R.id.mAgreedTotal).setText(String.valueOf(total));
    }

    private void tv(int id, String s) { ((TextView) root.findViewById(id)).setText(s); }

    // ---------------------------------------------------------------- availability
    private void checkAvailability() {
        final TextView status = root.findViewById(R.id.mAvailabilityStatus);
        if (selectedServiceId.isEmpty() || date.isEmpty() || start.isEmpty() || end.isEmpty()) { status.setText(""); return; }
        if (end.compareTo(start) <= 0) { status.setText("End time must be after the start time."); return; }
        Api.get("bookings.php", Api.q("do", "availability", "service_id", selectedServiceId,
                "event_start_datetime", date + " " + start + ":00", "event_end_datetime", date + " " + end + ":00",
                "preparation_minutes", et(R.id.mPreparation).getText().toString(), "travel_minutes", et(R.id.mTravel).getText().toString()),
                new Api.Callback() {
                    @Override public void onSuccess(Object data) {
                        if (!alive()) return;
                        JSONObject d = Api.obj(data);
                        JSONObject c = d.optJSONObject("conflicts");
                        int blocks = c == null || c.optJSONArray("blocks") == null ? 0 : c.optJSONArray("blocks").length();
                        int bookings = c == null || c.optJSONArray("bookings") == null ? 0 : c.optJSONArray("bookings").length();
                        if (blocks > 0) status.setText("✖ This interval is blocked and cannot be saved.");
                        else if (bookings > 0) status.setText("⚠ " + bookings + " overlapping booking(s). Approval is required when confirming.");
                        else status.setText("✔ Available");
                    }
                    @Override public void onError(String m, String c, int s) { if (alive()) status.setText(m); }
                });
    }

    // ---------------------------------------------------------------- submit
    private void error(String msg) {
        TextView t = root.findViewById(R.id.manualSaveError);
        t.setText(msg);
        t.setVisibility(msg == null || msg.isEmpty() ? View.GONE : View.VISIBLE);
    }

    private void submit() {
        if (saving) return;
        error("");
        String name = et(R.id.mCustName).getText().toString().trim();
        String contact = et(R.id.mCustContact).getText().toString().trim();
        String location = et(R.id.mLocation).getText().toString().trim();
        if (name.isEmpty() || contact.isEmpty()) { error("Customer name and contact number are required."); return; }
        if (selectedServiceId.isEmpty()) { error("Select one service."); return; }
        if (date.isEmpty() || start.isEmpty() || end.isEmpty()) { error("Choose the event date, start time and end time."); return; }
        if (end.compareTo(start) <= 0) { error("End time must be after the start time."); return; }
        if (location.isEmpty()) { error("Event location is required."); return; }

        final double discount = Fmt.num(et(R.id.mDiscount).getText());
        final double fees = Fmt.num(et(R.id.mFees).getText());
        final double amountPaid = Fmt.num(et(R.id.mAmountPaid).getText());
        final double agreedTotal = Fmt.num(et(R.id.mAgreedTotal).getText());
        if (discount < 0 || fees < 0 || amountPaid < 0 || agreedTotal < 0) { error("Amounts must be non-negative."); return; }

        double sub = subtotal(), add = addonsTotal();
        double total = Math.max(0, sub + add - discount + fees);
        JSONArray serviceIds = new JSONArray();
        serviceIds.put(Long.parseLong(selectedServiceId));
        JSONArray addonIds = new JSONArray();
        for (int i = 0; i < addonChecks.size(); i++) if (addonChecks.get(i).isChecked()) addonIds.put(Js.i(shownAddons.get(i), "addon_id"));

        int custPos = sp(R.id.mCustomerId).getSelectedItemPosition();
        int pkgPos = sp(R.id.mPackage).getSelectedItemPosition();
        JSONObject body = Js.of(
                "customer_name", name, "contact", contact, "email", et(R.id.mCustEmail).getText().toString().trim(),
                "customer_type", Fmt.CUSTOMER_TYPES[sp(R.id.mCustType).getSelectedItemPosition()],
                "event_type", Fmt.EVENT_TYPES[sp(R.id.mEventType).getSelectedItemPosition()],
                "event_date", date, "start_time", start, "end_time", end,
                "event_location", location,
                "guests", (long) Fmt.num(et(R.id.mGuests).getText()),
                "special_requests", et(R.id.mSpecialRequests).getText().toString().trim(),
                "theme_notes", et(R.id.mThemeNotes).getText().toString().trim(),
                "preparation_minutes", (long) Fmt.num(et(R.id.mPreparation).getText()),
                "travel_minutes", (long) Fmt.num(et(R.id.mTravel).getText()),
                "service_ids", serviceIds, "addon_ids", addonIds,
                "discount", discount, "fees", fees, "subtotal", sub, "addons_total", add, "total", total,
                "agreed_total", agreedTotal, "amount_paid", 0, "status", "Pending",
                "source", Fmt.BOOKING_SOURCES[sp(R.id.mSource).getSelectedItemPosition()]);
        if (custPos > 0) Js.put(body, "customer_id", Long.parseLong(customers.ids.get(custPos - 1)));
        if (pkgPos > 0) Js.put(body, "package_id", Long.parseLong(packages.ids.get(pkgPos)));

        saving = true;
        root.findViewById(R.id.mSubmitBtn).setEnabled(false);
        Api.create("bookings.php", body, new Api.Callback() {
            @Override public void onSuccess(Object data) {
                if (!alive()) return;
                JSONObject created = Api.obj(data);
                final String id = Js.s(created, "booking_id").isEmpty() ? Js.s(created, "id") : Js.s(created, "booking_id");
                if (amountPaid > 0) {
                    JSONObject pay = Js.of("booking_id", Long.parseLong(id), "amount", amountPaid,
                            "payment_method", Fmt.PAYMENT_METHODS[sp(R.id.mPayMethod).getSelectedItemPosition()],
                            "payment_type", "Down payment", "payment_status", "Completed",
                            "notes", "Down payment / reservation fee");
                    Api.create("payments.php", pay, new Api.Callback() {
                        @Override public void onSuccess(Object d) { done(id); }
                        @Override public void onError(String m, String c, int s) {
                            toast("Booking saved, but the initial payment needs attention: " + m);
                            done(id);
                        }
                    });
                } else done(id);
            }
            @Override public void onError(String m, String c, int s) {
                saving = false;
                if (!alive()) return;
                root.findViewById(R.id.mSubmitBtn).setEnabled(true);
                error(m);
            }
        });
    }

    private void done(String id) {
        saving = false;
        if (!alive()) return;
        toast("Booking saved.");
        if (nav() != null) nav().openBooking(id);
    }
}
