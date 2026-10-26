package com.akad.rentalops.ui.screens;

import com.akad.rentalops.ui.FormField;
import com.akad.rentalops.ui.FormScreen;

import java.util.ArrayList;
import java.util.List;

/** admin/content.html -> api/websiteContent.php (public website copy). Keys identical to the web form. */
public class ContentFragment extends FormScreen {
    @Override protected String endpoint() { return "websiteContent.php"; }

    @Override protected String webId(String key) {
        switch (key) {
            case "business_name": return "cBusinessName";
            case "logo": return "cLogo";
            case "hero_title": return "cHeroTitle";
            case "hero_description": return "cHeroDesc";
            case "hero_image": return "cHeroImage";
            case "hero_button_text": return "cHeroBtn";
            case "about_title": return "cAboutTitle";
            case "about_description": return "cAboutDesc";
            case "contact_phone": return "cPhone";
            case "contact_email": return "cEmail";
            case "contact_address": return "cAddress";
            case "contact_facebook": return "cFacebook";
            case "contact_instagram": return "cInstagram";
            default: return null;
        }
    }

    @Override protected List<Section> sections() {
        List<Section> l = new ArrayList<>();
        l.add(new Section("Business")
                .add(FormField.text("business_name", "Business Name").value("AKAD Sweet Party Rentals"))
                .add(FormField.text("logo", "Logo URL (optional)")));
        l.add(new Section("Hero Section")
                .add(FormField.text("hero_title", "Title"))
                .add(FormField.multi("hero_description", "Description"))
                .add(FormField.text("hero_image", "Hero Image URL"))
                .add(FormField.text("hero_button_text", "Button Text")));
        l.add(new Section("About Section")
                .add(FormField.text("about_title", "Title"))
                .add(FormField.multi("about_description", "Description")));
        l.add(new Section("Contact Section")
                .add(new FormField("contact_phone", "Phone", FormField.Type.PHONE))
                .add(new FormField("contact_email", "Email", FormField.Type.EMAIL))
                .add(FormField.text("contact_address", "Address"))
                .add(FormField.text("contact_facebook", "Facebook URL"))
                .add(FormField.text("contact_instagram", "Instagram URL")));
        return l;
    }
}
