package com.akad.rentalops.ui;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.akad.rentalops.R;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Prefs;

import org.json.JSONObject;

/** admin/login.html -> POST api/auth.php {contact_number, password}. */
public class LoginActivity extends AppCompatActivity {
    private EditText user, pass;
    private TextView error;
    private Button button;
    private ProgressBar progress;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Prefs.init(this);
        // Fix #1 from login.html: only skip the form when the server confirms the token.
        setContentView(R.layout.activity_login);
        user = findViewById(R.id.loginUsername);
        pass = findViewById(R.id.loginPassword);
        error = findViewById(R.id.loginError);
        button = findViewById(R.id.loginButton);
        progress = findViewById(R.id.loginProgress);
        // UI preview: any contact number + password signs in. Demo values are prefilled.
        user.setText("0917-123-4567");
        pass.setText("password");

        button.setOnClickListener(new View.OnClickListener() { @Override public void onClick(View v) { submit(); } });

        if (Prefs.isLoggedIn()) {
            Api.get("auth.php", Api.q("do", "me"), new Api.Callback() {
                @Override public void onSuccess(Object data) { openMain(); }
                @Override public void onError(String m, String code, int status) {
                    if (status == 401) Prefs.clearSession();
                    else if (status == 0 && Prefs.isLoggedIn()) openMain();   // offline: trust local expiry
                }
            });
        }
    }

    private void submit() {
        String contact = user.getText().toString().trim();
        String password = pass.getText().toString();
        if (contact.isEmpty()) { showError("Please enter your contact number."); return; }
        if (password.isEmpty()) { showError("Please enter your password."); return; }
        error.setVisibility(View.GONE);
        button.setEnabled(false);
        progress.setVisibility(View.VISIBLE);
        Api.login(contact, password, new Api.Callback() {
            @Override public void onSuccess(Object data) {
                Prefs.saveSession((JSONObject) data);
                openMain();
            }
            @Override public void onError(String message, String code, int status) {
                button.setEnabled(true);
                progress.setVisibility(View.GONE);
                showError(message);
            }
        });
    }

    private void showError(String msg) { error.setText(msg); error.setVisibility(View.VISIBLE); }

    private void openMain() {
        startActivity(new Intent(this, MainActivity.class));
        finish();
    }
}
