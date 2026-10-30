const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('Android booking cards follow web payment-before-status presentation', () => {
  const source = read('android/app/src/main/java/com/akad/rentalops/ui/screens/BookingsFragment.java');
  assert.match(source, /\.title\(customer\.isEmpty\(\) \? bookingLabel : customer\)/);
  assert.match(source, /\.subtitle\(bookingLabel \+ " · "/);
  assert.match(source, /\.badge\(o\.has\("amount_paid"\) \? Fmt\.paymentStatus/);
  assert.match(source, /\.badge2\(Fmt\.titleCase\(Js\.s\(o, "status"\)\)\)/);
});

test('Android dashboard shows outstanding balance from Completed payments only', () => {
  const source = read('android/app/src/main/java/com/akad/rentalops/ui/screens/DashboardFragment.java');
  assert.match(source, /card\("Outstanding Balance", Fmt\.peso\(outstandingBalance\)/);
  assert.match(source, /if \(!"Completed"\.equalsIgnoreCase\(Js\.s\(payment, "payment_status"\)\)\) continue/);
  assert.match(source, /"Cancelled"\.equals\(statusName\) \|\| "Rejected"\.equals\(statusName\)/);
  assert.match(source, /outstanding \+= Math\.max\(0, total - accepted\)/);
});

test('Android dashboard upcoming table displays the same numeric booking ID as the web table', () => {
  const source = read('android/app/src/main/java/com/akad/rentalops/ui/screens/DashboardFragment.java');
  assert.match(source, /String id = Js\.s\(b, "booking_id"\)\.isEmpty\(\) \? Js\.s\(b, "id"\) : Js\.s\(b, "booking_id"\)/);
  assert.match(source, /String\[\] cells = \{id, Js\.s\(b, "customer_name"\)/);
  assert.doesNotMatch(source, /String\[\] cells = \{Js\.s\(b, "booking_reference"\)/);
});

test('Android login reuses the website hero image behind a readable overlay', () => {
  const layout = read('android/app/src/main/res/layout/activity_login.xml');
  const overlay = read('android/app/src/main/res/drawable/bg_login_image_overlay.xml');
  assert.match(layout, /android:src="@drawable\/login_hero_bg"/);
  assert.match(layout, /android:scaleType="centerCrop"/);
  assert.match(layout, /android:background="@drawable\/bg_login_image_overlay"/);
  assert.match(overlay, /android:startColor="#E6171512"/);
  assert.ok(fs.existsSync(path.join(root, 'android/app/src/main/res/drawable-nodpi/login_hero_bg.jpg')));
});

test('Android payment and balance rows identify bookings with the numeric server booking ID', () => {
  const source = read('android/app/src/main/java/com/akad/rentalops/ui/screens/PaymentsFragment.java');
  assert.match(source, /String bookingLabel = "Booking #" \+ bookingId/);
  assert.match(source, /title\("Balance · " \+ bookingLabel\)/);
  assert.match(source, /title\(bookingLabel \+ " · " \+ who\)/);
  assert.doesNotMatch(source, /Js\.s\(b, "booking_reference"\)/);
});

test('Android gallery uses device image selection and authenticated multipart upload instead of URL entry', () => {
  const gallery = read('android/app/src/main/java/com/akad/rentalops/ui/screens/GalleryFragment.java');
  const api = read('android/app/src/main/java/com/akad/rentalops/util/Api.java');
  const layout = read('android/app/src/main/res/layout/dialog_gallery_image.xml');
  assert.match(gallery, /ActivityResultContracts\.GetContent/);
  assert.match(gallery, /imagePicker\.launch\("image\/\*"\)/);
  assert.match(gallery, /Api\.uploadGalleryImage/);
  assert.doesNotMatch(gallery, /Image URL or site path/);
  assert.match(api, /multipart\/form-data; boundary=/);
  assert.match(api, /name=\\"image\\"/);
  assert.match(layout, /android:id="@\+id\/galleryChooseImage"/);
});

test('service images are uploadable from Android and persist for the public website', () => {
  const service = read('android/app/src/main/java/com/akad/rentalops/ui/screens/ServicesFragment.java');
  const api = read('android/app/src/main/java/com/akad/rentalops/util/Api.java');
  const layout = read('android/app/src/main/res/layout/dialog_service.xml');
  const definition = read('api/catalog_definitions.php');
  const schema = read('db/schema.sql');
  const publicSite = read('js/app.js');
  assert.match(service, /ActivityResultContracts\.GetContent/);
  assert.match(service, /Api\.uploadServiceImage/);
  assert.match(layout, /serviceChooseImage/);
  assert.match(api, /uploadImage\("service-upload\.php"/);
  assert.match(definition, /'description','image','status'/);
  assert.match(schema, /image\s+VARCHAR\(500\) NULL/);
  assert.match(publicSite, /safeWebUrl\(s\.image\)/);
});

test('Rejected Android sign-in stays on the login screen instead of triggering stale session navigation', () => {
  const login = read('android/app/src/main/java/com/akad/rentalops/ui/LoginActivity.java');
  const api = read('android/app/src/main/java/com/akad/rentalops/util/Api.java');
  assert.match(login, /Api\.setUnauthorizedListener\(null\)/);
  assert.match(api, /!\("auth\.php"\.equals\(endpoint\) && query == null\)/);
  assert.match(login, /showError\(message\)/);
});

test('Android login inputs use a high-contrast hint color', () => {
  const layout = read('android/app/src/main/res/layout/activity_login.xml');
  const hint = read('android/app/src/main/res/color/login_hint.xml');
  const colors = read('android/app/src/main/res/values/colors.xml');
  assert.equal((layout.match(/android:textColorHint="@color\/login_hint"/g) || []).length, 4);
  assert.equal((layout.match(/app:hintTextColor="@color\/login_hint"/g) || []).length, 2);
  assert.match(hint, /android:color="#F4E7D5"/);
  assert.match(hint, /android:state_focused="true" android:color="#FFF8EE"/);
  assert.match(colors, /<color name="login_field">#D91D1712<\/color>/);
});

test('Android owner password validation remains inside a password-toggle modal', () => {
  const owners = read('android/app/src/main/java/com/akad/rentalops/ui/screens/OwnersFragment.java');
  const layout = read('android/app/src/main/res/layout/dialog_owner_account.xml');
  assert.match(layout, /app:endIconMode="password_toggle"/);
  assert.match(layout, /android:id="@\+id\/ownerFormError"/);
  assert.match(owners, /passwordValue\.getBytes\(StandardCharsets\.UTF_8\)\.length/);
  assert.match(owners, /Password must contain 8 to 72 bytes/);
  assert.match(owners, /formError\.setText\(message\)/);
  assert.match(owners, /dialog\.dismiss\(\);\s*saved\(\);/);
  assert.doesNotMatch(owners, /FormUi\.dialog/);
});

test('Android dashboard renders Bookings dashed while Revenue remains solid', () => {
  const chart = read('android/app/src/main/java/com/akad/rentalops/ui/charts/LineChartView.java');
  assert.match(chart, /line2\.setPathEffect\(new DashPathEffect/);
  assert.doesNotMatch(chart, /line1\.setPathEffect/);
  assert.match(chart, /c\.drawPath\(p1, line1\)/);
  assert.match(chart, /c\.drawPath\(p2, line2\)/);
});
