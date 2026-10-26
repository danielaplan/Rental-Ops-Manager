package com.akad.rentalops.ui;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;

import com.akad.rentalops.R;
import com.akad.rentalops.ui.screens.*;
import com.akad.rentalops.util.Api;
import com.akad.rentalops.util.Js;
import com.akad.rentalops.util.Prefs;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.navigation.NavigationView;

import org.json.JSONObject;

/** Mobile replacement for the sidebar + admin-main shell of every admin/*.html page (js/admin.js ADMIN_NAV). */
public class MainActivity extends AppCompatActivity implements Navigator, NavigationView.OnNavigationItemSelectedListener {
    private DrawerLayout drawer;
    private NavigationView navView;
    private MaterialToolbar toolbar;
    private int currentNav = R.id.nav_dashboard;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Prefs.init(this);
        if (!Prefs.isLoggedIn()) { toLogin(); return; }
        setContentView(R.layout.activity_main);

        drawer = findViewById(R.id.drawerLayout);
        navView = findViewById(R.id.navView);
        toolbar = findViewById(R.id.toolbar);
        navView.setNavigationItemSelectedListener(this);
        toolbar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                if (getSupportFragmentManager().getBackStackEntryCount() > 0) onBackPressed();
                else drawer.openDrawer(GravityCompat.START);
            }
        });
        getSupportFragmentManager().addOnBackStackChangedListener(new FragmentManager.OnBackStackChangedListener() {
            @Override public void onBackStackChanged() { updateNavIcon(); }
        });

        // Owner-only menu entries (PRIMARY_OWNER_ONLY_ADMIN_PAGES = owners.html).
        navView.getMenu().findItem(R.id.nav_owners).setVisible(Prefs.isPrimaryOwner());

        View header = navView.getHeaderView(0);
        ((TextView) header.findViewById(R.id.navBusinessName)).setText(Prefs.businessName());
        ((TextView) header.findViewById(R.id.navUser)).setText(Prefs.fullName() + (Prefs.isPrimaryOwner() ? " · Primary owner" : " · Owner"));

        // Any 401 from the API sends the user back to login (token expired / revoked).
        Api.setUnauthorizedListener(new Api.UnauthorizedListener() {
            @Override public void onUnauthorized() { Prefs.clearSession(); toLogin(); }
        });

        // Business name from api/settings.php for the drawer header.
        Api.get("settings.php", Api.q("do", "get"), new Api.Callback() {
            @Override public void onSuccess(Object data) {
                String n = Js.s((JSONObject) data, "business_name");
                if (!n.isEmpty()) {
                    Prefs.setBusinessName(n);
                    ((TextView) navView.getHeaderView(0).findViewById(R.id.navBusinessName)).setText(n);
                }
            }
            @Override public void onError(String m, String c, int s) {}
        });

        if (b == null) goTo(R.id.nav_dashboard);
    }

    private void toLogin() {
        startActivity(new Intent(this, LoginActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK));
        finish();
    }

    private void updateNavIcon() {
        boolean nested = getSupportFragmentManager().getBackStackEntryCount() > 0;
        toolbar.setNavigationIcon(nested ? R.drawable.ic_back : R.drawable.ic_menu);
        toolbar.setNavigationIconTint(0xFFFFFFFF);
    }

    @Override public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        drawer.closeDrawer(GravityCompat.START);
        if (item.getItemId() == R.id.nav_logout) { doLogout(); return false; }
        goTo(item.getItemId());
        return true;
    }

    private void doLogout() {
        Api.logout(new Api.Callback() {
            @Override public void onSuccess(Object d) {}
            @Override public void onError(String m, String c, int s) {}
        });
        Prefs.clearSession();
        toLogin();
    }

    @Override public void goTo(int id) {
        Fragment f;
        String title;
        if (id == R.id.nav_dashboard) { f = new DashboardFragment(); title = "Dashboard"; }
        else if (id == R.id.nav_bookings) { f = new BookingsFragment(); title = "Bookings"; }
        else if (id == R.id.nav_manual_booking) { f = new ManualBookingFragment(); title = "Manual Booking"; }
        else if (id == R.id.nav_calendar) { f = new CalendarFragment(); title = "Calendar"; }
        else if (id == R.id.nav_services) { f = new ServicesFragment(); title = "Services"; }
        else if (id == R.id.nav_packages) { f = new PackagesFragment(); title = "Packages"; }
        else if (id == R.id.nav_categories) { f = new CategoriesFragment(); title = "Categories"; }
        else if (id == R.id.nav_addons) { f = new AddonsFragment(); title = "Add-ons"; }
        else if (id == R.id.nav_inventory) { f = new InventoryFragment(); title = "Inventory"; }
        else if (id == R.id.nav_customers) { f = new CustomersFragment(); title = "Customers"; }
        else if (id == R.id.nav_payments) { f = new PaymentsFragment(); title = "Payments"; }
        else if (id == R.id.nav_gallery) { f = new GalleryFragment(); title = "Gallery"; }
        else if (id == R.id.nav_content) { f = new ContentFragment(); title = "Website Content"; }
        else if (id == R.id.nav_reports) { f = new ReportsFragment(); title = "Reports"; }
        else if (id == R.id.nav_audit) { f = new AuditFragment(); title = "Audit History"; }
        else if (id == R.id.nav_owners) { f = new OwnersFragment(); title = "Owner Accounts"; }
        else if (id == R.id.nav_settings) { f = new SettingsFragment(); title = "Settings"; }
        else return;
        currentNav = id;
        navView.setCheckedItem(id);
        getSupportFragmentManager().popBackStack(null, FragmentManager.POP_BACK_STACK_INCLUSIVE);
        getSupportFragmentManager().beginTransaction().replace(R.id.container, f).commit();
        setTitle(title);
    }

    @Override public void push(Fragment fragment, String title) {
        getSupportFragmentManager().beginTransaction().replace(R.id.container, fragment).addToBackStack(null).commit();
        setTitle(title);
    }

    @Override public void openBooking(String bookingId) { push(BookingDetailFragment.newInstance(bookingId), "Booking"); }

    @Override public void setTitle(CharSequence title) {
        if (toolbar != null) toolbar.setTitle(title);
        super.setTitle(title);
    }

    @Override public void setTitle(String title) { setTitle((CharSequence) title); }

    @Override public void onBackPressed() {
        if (drawer != null && drawer.isDrawerOpen(GravityCompat.START)) { drawer.closeDrawer(GravityCompat.START); return; }
        FragmentManager fm = getSupportFragmentManager();
        if (fm.getBackStackEntryCount() > 0) {
            fm.popBackStack();
            // restore title of the underlying drawer destination
            toolbar.setTitle(navTitle(currentNav));
            return;
        }
        if (currentNav != R.id.nav_dashboard) { goTo(R.id.nav_dashboard); return; }
        super.onBackPressed();
    }

    private String navTitle(int id) {
        MenuItem mi = navView.getMenu().findItem(id);
        return mi == null ? "" : String.valueOf(mi.getTitle());
    }
}
