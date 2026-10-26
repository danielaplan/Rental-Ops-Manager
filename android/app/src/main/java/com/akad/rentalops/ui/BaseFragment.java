package com.akad.rentalops.ui;

import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

public abstract class BaseFragment extends Fragment {
    protected Navigator nav() {
        return getActivity() instanceof Navigator ? (Navigator) getActivity() : null;
    }

    protected boolean alive() { return isAdded() && getView() != null; }

    protected void toast(@Nullable String msg) {
        if (getContext() != null && msg != null) Toast.makeText(getContext(), msg, Toast.LENGTH_LONG).show();
    }

    protected void saved() { toast("Saved."); }
}
