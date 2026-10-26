package com.akad.rentalops.ui;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Context;
import android.text.InputType;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.DatePicker;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.TimePicker;

import androidx.appcompat.app.AlertDialog;

import com.akad.rentalops.R;
import com.akad.rentalops.util.Fmt;
import com.akad.rentalops.util.Js;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

/** Builds form inputs from FormField definitions (dialogs and the Settings/Content screens). */
public final class FormUi {
    private FormUi() {}

    public interface Submit { void onSubmit(JSONObject values); }

    /** Holds the live views for a list of fields so values can be read back. */
    public static class Form {
        final List<FormField> fields = new ArrayList<>();
        final List<View> views = new ArrayList<>();

        /** Reads all inputs. Returns null (and flags the field) when a required one is empty. */
        public JSONObject read() {
            JSONObject out = new JSONObject();
            boolean ok = true;
            for (int i = 0; i < fields.size(); i++) {
                FormField f = fields.get(i);
                View v = views.get(i);
                switch (f.type) {
                    case CHOICE: {
                        int pos = ((Spinner) v.findViewById(R.id.choiceSpinner)).getSelectedItemPosition();
                        Js.put(out, f.key, pos >= 0 && pos < f.options.length ? f.options[pos] : "");
                        break;
                    }
                    case CHECK:
                        Js.put(out, f.key, ((CheckBox) v).isChecked() ? 1 : 0);
                        break;
                    default: {
                        TextInputLayout til = (TextInputLayout) v;
                        String t = String.valueOf(til.getEditText().getText()).trim();
                        if (f.required && t.isEmpty()) { til.setError(f.label + " is required"); ok = false; break; }
                        til.setError(null);
                        if (f.type == FormField.Type.NUMBER && !t.isEmpty()) Js.put(out, f.key, (long) Fmt.num(t));
                        else if (f.type == FormField.Type.DECIMAL && !t.isEmpty()) Js.put(out, f.key, Fmt.num(t));
                        else Js.put(out, f.key, t);
                    }
                }
            }
            return ok ? out : null;
        }
    }

    public static Form build(Context ctx, ViewGroup parent, List<FormField> fields) {
        Form form = new Form();
        LayoutInflater inf = LayoutInflater.from(ctx);
        for (final FormField f : fields) {
            View v;
            if (f.type == FormField.Type.CHOICE) {
                v = inf.inflate(R.layout.item_form_choice, parent, false);
                ((TextView) v.findViewById(R.id.choiceLabel)).setText(f.label);
                Spinner sp = v.findViewById(R.id.choiceSpinner);
                String[] labels = f.optionLabels != null ? f.optionLabels : f.options;
                sp.setAdapter(new ArrayAdapter<>(ctx, android.R.layout.simple_spinner_dropdown_item, labels));
                sp.setSelection(Math.max(0, Fmt.indexOf(f.options, f.value)));
            } else if (f.type == FormField.Type.CHECK) {
                CheckBox cb = new CheckBox(ctx);
                cb.setText(f.label);
                cb.setChecked(f.value.equals("1") || f.value.equalsIgnoreCase("true"));
                v = cb;
            } else {
                v = inf.inflate(R.layout.item_form_field, parent, false);
                final TextInputLayout til = (TextInputLayout) v;
                til.setHint(f.label);
                final TextInputEditText et = v.findViewById(R.id.fieldInput);
                et.setText(f.value);
                applyWebId(ctx, et, f);
                switch (f.type) {
                    case MULTILINE: et.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_MULTI_LINE | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES); et.setMinLines(2); break;
                    case NUMBER: et.setInputType(InputType.TYPE_CLASS_NUMBER); break;
                    case DECIMAL: et.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL); break;
                    case PHONE: et.setInputType(InputType.TYPE_CLASS_PHONE); break;
                    case EMAIL: et.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS); break;
                    case PASSWORD: et.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD); break;
                    case DATE: pickerOnly(et, true); break;
                    case TIME: pickerOnly(et, false); break;
                    default: et.setInputType(InputType.TYPE_CLASS_TEXT);
                }
            }
            parent.addView(v);
            form.fields.add(f);
            form.views.add(v);
        }
        return form;
    }

    /** Gives the input the same id the website uses (e.g. sBusinessName), when declared in ids.xml. */
    private static void applyWebId(Context ctx, View v, FormField f) {
        if (f.webId == null) return;
        int id = ctx.getResources().getIdentifier(f.webId, "id", ctx.getPackageName());
        if (id != 0) v.setId(id);
    }

    private static void pickerOnly(final TextInputEditText et, final boolean date) {
        et.setFocusable(false);
        et.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                if (date) pickDate(et.getContext(), String.valueOf(et.getText()), new OnPicked() { public void picked(String s) { et.setText(s); } });
                else pickTime(et.getContext(), String.valueOf(et.getText()), new OnPicked() { public void picked(String s) { et.setText(s); } });
            }
        });
    }

    public interface OnPicked { void picked(String value); }

    public static void pickDate(Context ctx, String current, final OnPicked cb) {
        Calendar c = Calendar.getInstance();
        if (current != null && current.length() >= 10) {
            try {
                c.set(Integer.parseInt(current.substring(0, 4)), Integer.parseInt(current.substring(5, 7)) - 1, Integer.parseInt(current.substring(8, 10)));
            } catch (Exception ignored) {}
        }
        new DatePickerDialog(ctx, new DatePickerDialog.OnDateSetListener() {
            @Override public void onDateSet(DatePicker p, int y, int m, int d) {
                cb.picked(String.format(Locale.US, "%04d-%02d-%02d", y, m + 1, d));
            }
        }, c.get(Calendar.YEAR), c.get(Calendar.MONTH), c.get(Calendar.DAY_OF_MONTH)).show();
    }

    public static void pickTime(Context ctx, String current, final OnPicked cb) {
        int h = 9, m = 0;
        if (current != null && current.length() >= 5) {
            try { h = Integer.parseInt(current.substring(0, 2)); m = Integer.parseInt(current.substring(3, 5)); } catch (Exception ignored) {}
        }
        new TimePickerDialog(ctx, new TimePickerDialog.OnTimeSetListener() {
            @Override public void onTimeSet(TimePicker p, int hh, int mm) {
                cb.picked(String.format(Locale.US, "%02d:%02d", hh, mm));
            }
        }, h, m, false).show();
    }

    /** Add/edit dialog. onDelete may be null (hides the Delete button). */
    public static void dialog(Context ctx, String title, List<FormField> fields, final Submit submit, final Runnable onDelete) {
        View root = LayoutInflater.from(ctx).inflate(R.layout.dialog_form, null);
        ViewGroup container = root.findViewById(R.id.formContainer);
        final Form form = build(ctx, container, fields);
        AlertDialog.Builder b = new AlertDialog.Builder(ctx)
                .setTitle(title)
                .setView(root)
                .setPositiveButton(R.string.save, null)
                .setNegativeButton(R.string.cancel, null);
        if (onDelete != null) b.setNeutralButton(R.string.delete, null);
        final AlertDialog dlg = b.create();
        dlg.setOnShowListener(new android.content.DialogInterface.OnShowListener() {
            @Override public void onShow(android.content.DialogInterface d) {
                dlg.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
                    @Override public void onClick(View v) {
                        JSONObject vals = form.read();
                        if (vals == null) return;
                        dlg.dismiss();
                        submit.onSubmit(vals);
                    }
                });
                if (onDelete != null) {
                    dlg.getButton(AlertDialog.BUTTON_NEUTRAL).setOnClickListener(new View.OnClickListener() {
                        @Override public void onClick(View v) {
                            dlg.dismiss();
                            onDelete.run();
                        }
                    });
                }
            }
        });
        dlg.show();
    }

    public static void confirm(Context ctx, String message, final Runnable onYes) {
        new AlertDialog.Builder(ctx).setMessage(message)
                .setPositiveButton("Yes", new android.content.DialogInterface.OnClickListener() {
                    @Override public void onClick(android.content.DialogInterface d, int w) { onYes.run(); }
                })
                .setNegativeButton(R.string.cancel, null).show();
    }
}
