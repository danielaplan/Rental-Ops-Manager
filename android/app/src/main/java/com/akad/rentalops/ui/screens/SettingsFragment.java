package com.akad.rentalops.ui.screens;

import com.akad.rentalops.ui.FormField;
import com.akad.rentalops.ui.FormScreen;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Prefs;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** admin/settings.html -> api/settings.php (JSON blob in APP_SETTINGS). Keys identical to the web form. */
public class SettingsFragment extends FormScreen {
    @Override protected String endpoint() { return "settings.php"; }

    @Override protected String webId(String key) {
        switch (key) {
            case "business_name": return "sBusinessName";
            case "logo": return "sLogo";
            case "phone": return "sPhone";
            case "email": return "sEmail";
            case "address": return "sAddress";
            case "facebook": return "sFacebook";
            case "instagram": return "sInstagram";
            case "min_booking_notice_days": return "sNoticeDays";
            case "booking_hours_open": return "sHoursOpen";
            case "booking_hours_close": return "sHoursClose";
            case "cancellation_policy": return "sCancelPolicy";
            case "primary_color": return "sPrimaryColor";
            case "accent_color": return "sAccentColor";
            default: return null;
        }
    }

    @Override protected List<Section> sections() {
        List<Section> l = new ArrayList<>();
        l.add(new Section("Business Settings")
                .add(FormField.text("business_name", "Business Name").value("AKAD Sweet Party Rentals"))
                .add(FormField.text("logo", "Logo URL"))
                .add(new FormField("phone", "Phone", FormField.Type.PHONE))
                .add(new FormField("email", "Email", FormField.Type.EMAIL))
                .add(FormField.text("address", "Address"))
                .add(FormField.text("facebook", "Facebook"))
                .add(FormField.text("instagram", "Instagram")));
        l.add(new Section("Booking Settings")
                .add(FormField.number("min_booking_notice_days", "Minimum Booking Notice (days)").value("2"))
                .add(FormField.time("booking_hours_open", "Booking Hours — Open").value("08:00"))
                .add(FormField.time("booking_hours_close", "Booking Hours — Close").value("22:00"))
                .add(FormField.multi("cancellation_policy", "Cancellation Policy")));
        l.add(new Section("Appearance (hex colours, applied to the public website)")
                .add(FormField.text("primary_color", "Primary Color").value("#1F4E45"))
                .add(FormField.text("accent_color", "Accent Color").value("#D9A441")));
        return l;
    }

    @Override protected void onSavedData(JSONObject d) { Prefs.setBusinessName(Js.s(d, "business_name")); }
}
