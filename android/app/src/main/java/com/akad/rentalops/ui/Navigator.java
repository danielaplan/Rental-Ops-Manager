package com.akad.rentalops.ui;

import androidx.fragment.app.Fragment;

/** Implemented by MainActivity so screens can open other screens. */
public interface Navigator {
    /** Push a detail screen on top of the current one. */
    void push(Fragment fragment, String title);

    /** Jump to a drawer destination (R.id.nav_*). */
    void goTo(int navId);

    /** Open bookings.php detail for a booking id. */
    void openBooking(String bookingId);

    void setTitle(String title);
}
