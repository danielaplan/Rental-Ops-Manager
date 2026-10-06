# Frontend testing reminder

The frontend changes have automated regression coverage. Browser and live database acceptance are still pending. Use an isolated test database and test records.

1. Open the app online and reload after its updated service worker activates. Sign in and confirm public content, sidebar, and each admin page load without console errors.
2. Start a manual booking, choose a service/package and add-ons, enter customer details, then reload. Confirm the complete draft is restored. With network throttling, submit twice rapidly: exactly one booking and one down payment should exist after sync and reload.
3. Simulate a failed read/save. Confirm a visible error, retained form values, and usable retry controls. If the booking succeeds but its down payment fails, use the existing booking to retry the payment; a second booking must not be created.
4. Change dates/services quickly, switch calendar months, open different booking details, and apply report filters rapidly. The latest selection must win. Change a field while a background refresh is in progress and confirm it is retained.
5. Create, edit, toggle, and delete catalog test records. Check Pending Sync versus accepted state, retry failures, and confirm persistence after reload. Check the report receipt and dashboard for numeric payment totals (no NaN or Promise text).
6. Record a payment, deposit, delivery, release, and return inspection. Reload and verify persisted values. An incomplete return must not complete the booking through the dedicated finalization workflow.
7. Go offline, create a booking with dependent records, and reload. Reconnect and confirm automatic replay, one accepted copy, correct linked records, and visible conflict/retry states.
8. Test the public page online and offline: cached images/content remain available, pending drafts survive refresh, and accepted deleted records disappear after a successful refresh.
9. At phone portrait, phone landscape, and desktop widths, check keyboard navigation, visible errors, enabled controls after failures, and navigation without duplicate actions.

Automated checks from the repository root:

```powershell
rtk node --test tests/frontend-api-direct.test.cjs tests/frontend-api-contract.test.cjs tests/public-site-data.test.cjs tests/frontend-async-workflows.test.cjs
rtk proxy python tests/check_syntax.py
rtk git diff --check
```

Live offline integration (only with the isolated verification servers running on ports 8017 and 8018):

```powershell
rtk proxy node tests/offline-sync.test.cjs
```

Backend issues still requiring separate fixes: CRUD defaults overriding a submitted Inactive status; general booking updates bypassing dedicated completion/return validation. These prevent claiming full-system acceptance.
