package com.akad.rentalops.ui;

/** One input in a FormDialog / form screen. */
public class FormField {
    public enum Type { TEXT, MULTILINE, NUMBER, DECIMAL, PHONE, EMAIL, PASSWORD, DATE, TIME, CHOICE, CHECK, COLOR }

    public final String key, label;
    public final Type type;
    public String value = "";
    public String[] options;        // values sent to the server (CHOICE)
    public String[] optionLabels;   // text shown (CHOICE); defaults to options
    public boolean required;
    /** Name of the matching HTML element id on the website (declared in res/values/ids.xml). */
    public String webId;

    public FormField(String key, String label, Type type) { this.key = key; this.label = label; this.type = type; }

    public FormField value(String v) { value = v == null ? "" : v; return this; }
    public FormField id(String webId) { this.webId = webId; return this; }
    public FormField req() { required = true; return this; }
    public FormField choices(String... o) { options = o; optionLabels = o; return this; }
    public FormField choices(String[] values, String[] labels) { options = values; optionLabels = labels; return this; }

    public static FormField text(String k, String l) { return new FormField(k, l, Type.TEXT); }
    public static FormField multi(String k, String l) { return new FormField(k, l, Type.MULTILINE); }
    public static FormField number(String k, String l) { return new FormField(k, l, Type.NUMBER); }
    public static FormField money(String k, String l) { return new FormField(k, l, Type.DECIMAL); }
    public static FormField choice(String k, String l) { return new FormField(k, l, Type.CHOICE); }
    public static FormField check(String k, String l) { return new FormField(k, l, Type.CHECK); }
    public static FormField date(String k, String l) { return new FormField(k, l, Type.DATE); }
    public static FormField time(String k, String l) { return new FormField(k, l, Type.TIME); }
}
