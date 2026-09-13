/**
 * storage.js
 * The ONLY file that talks to window.localStorage directly.
 * Every collection below is meant to map 1:1 to a future MySQL table.
 * api.js is the layer everything else in the app should call -
 * it currently forwards to STORAGE, but later can forward to PHP endpoints
 * (api/services.php, api/bookings.php, etc.) instead, with zero changes
 * to any page-level JS.
 */

const STORAGE_KEYS = {
  services: "er_services",
  categories: "er_categories",
  addons: "er_addons",
  bookings: "er_bookings",
  bookingItems: "er_booking_items",
  customers: "er_customers",
  payments: "er_payments",
  gallery: "er_gallery",
  rentalItems: "er_rental_items",
  itemReleases: "er_item_releases",
  itemReturns: "er_item_returns",
  itemHistory: "er_item_history",
  websiteContent: "er_website_content",
  settings: "er_settings",
  adminSession: "er_admin_session",
  seedVersion: "er_seed_version"
};

const STORAGE = {
  _get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (fallback !== undefined ? fallback : null);
    } catch (e) {
      console.error("Storage read error for", key, e);
      return fallback !== undefined ? fallback : null;
    }
  },
  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Storage write error for", key, e);
      return false;
    }
  },
  getAll(collection) {
    return this._get(STORAGE_KEYS[collection], []);
  },
  saveAll(collection, arr) {
    return this._set(STORAGE_KEYS[collection], arr);
  },
  getOne(collection, keyName) {
    return this._get(STORAGE_KEYS[collection], null);
  },
  setOne(collection, value) {
    return this._set(STORAGE_KEYS[collection], value);
  },
  nextId(prefix, arr, idField) {
    let max = 0;
    arr.forEach(item => {
      const raw = String(item[idField] || "").replace(prefix, "");
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return prefix + String(max + 1).padStart(3, "0");
  },
  nextBookingId(arr) {
    const year = new Date().getFullYear();
    let max = 0;
    arr.forEach(b => {
      const m = String(b.id || "").match(/BK-(\d{4})-(\d{4})/);
      if (m && parseInt(m[1], 10) === year) {
        const n = parseInt(m[2], 10);
        if (n > max) max = n;
      }
    });
    return `BK-${year}-${String(max + 1).padStart(4, "0")}`;
  }
};

/* ---------------------------------------------------------------
 * SEED DATA - runs once (or when SEED_VERSION changes) so the
 * prototype has realistic content to demo against.
 * ------------------------------------------------------------- */
function seedDatabase(force) {
  const SEED_VERSION = "5";
  if (!force && STORAGE._get(STORAGE_KEYS.seedVersion) === SEED_VERSION) return;

  const categories = [
    { category_id: "CAT-001", name: "Entertainment", status: "Active" },
    { category_id: "CAT-002", name: "Food & Treats", status: "Active" },
    { category_id: "CAT-003", name: "Decorations", status: "Active" }
  ];

  const services = [
    {
      service_id: "SVC-001",
      name: "Karaoke Rental",
      category_id: "CAT-001",
      description: "Full karaoke setup with a huge song library, wireless mics, and a big screen so everyone gets a turn on the mic.",
      price: 2500,
      price_label: "per event (up to 4 hrs)",
      image: "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800&q=80",
      status: "Active",
      featured: true,
      inclusions: ["Karaoke machine", "2 wireless microphones", "32\" TV/Screen", "Speaker system", "Song catalog access"]
    },
    {
      service_id: "SVC-002",
      name: "Sweet Corner",
      category_id: "CAT-002",
      description: "A beautifully arranged dessert and candy table your guests will photograph before they even taste it.",
      price: 3500,
      price_label: "per set-up (good for 30 pax)",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
      status: "Active",
      featured: true,
      inclusions: ["Dessert display stands", "Candy jars & scoops", "Table linen & backdrop", "Personalized tags"]
    },
    {
      service_id: "SVC-003",
      name: "Balloon Decoration",
      category_id: "CAT-003",
      description: "Custom balloon garlands, arches, and backdrops styled around your event's theme and colors.",
      price: 4000,
      price_label: "per design (starting price)",
      image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
      status: "Active",
      featured: true,
      inclusions: ["Balloon garland or arch", "Theme color matching", "Setup & teardown", "1 focal backdrop"]
    }
  ];

  const addons = [
    { addon_id: "ADD-001", service_id: "SVC-001", name: "Extra Microphone", price: 300, status: "Active" },
    { addon_id: "ADD-002", service_id: "SVC-001", name: "Extra Speaker", price: 500, status: "Active" },
    { addon_id: "ADD-003", service_id: "SVC-001", name: "Additional Hour", price: 500, status: "Active" },
    { addon_id: "ADD-004", service_id: "SVC-003", name: "LED Lights", price: 500, status: "Active" },
    { addon_id: "ADD-005", service_id: "SVC-003", name: "Custom Signage", price: 300, status: "Active" },
    { addon_id: "ADD-006", service_id: "SVC-003", name: "Backdrop", price: 1000, status: "Active" }
  ];

  const rentalItems = [
    { rental_item_id: "RI-001", service_id: "SVC-001", name: "Karaoke Machine", quantity: 1, item_code: "KM-01", required: true, tracking: "quantity", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-002", service_id: "SVC-001", name: "Microphone", quantity: 2, item_code: "MIC", required: true, tracking: "individual", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-003", service_id: "SVC-001", name: "TV / Screen", quantity: 1, item_code: "TV-01", required: true, tracking: "quantity", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-004", service_id: "SVC-001", name: "Speakers", quantity: 2, item_code: "SPK", required: true, tracking: "individual", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-005", service_id: "SVC-001", name: "Remote Control", quantity: 1, item_code: "RC-01", required: false, tracking: "quantity", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-006", service_id: "SVC-001", name: "HDMI Cable", quantity: 2, item_code: "HDMI", required: false, tracking: "quantity", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-007", service_id: "SVC-001", name: "Power Cable", quantity: 2, item_code: "PWR", required: false, tracking: "quantity", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-008", service_id: "SVC-001", name: "Extension Cord", quantity: 1, item_code: "EXT-01", required: false, tracking: "quantity", status: "Available", condition: "Good", notes: "" },

    { rental_item_id: "RI-009", service_id: "SVC-002", name: "Dessert Stands", quantity: 5, item_code: "DS", required: true, tracking: "quantity", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-010", service_id: "SVC-002", name: "Candy Jars", quantity: 8, item_code: "CJ", required: true, tracking: "quantity", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-011", service_id: "SVC-002", name: "Table Linen", quantity: 1, item_code: "TL-01", required: true, tracking: "quantity", status: "Available", condition: "Good", notes: "" },

    { rental_item_id: "RI-012", service_id: "SVC-003", name: "Balloon Arch Frame", quantity: 1, item_code: "BAF-01", required: true, tracking: "quantity", status: "Available", condition: "Good", notes: "" },
    { rental_item_id: "RI-013", service_id: "SVC-003", name: "Air Pump", quantity: 2, item_code: "PUMP", required: false, tracking: "quantity", status: "Available", condition: "Good", notes: "" }
  ];

  const customers = [
    { customer_id: "CUS-001", name: "Juan Dela Cruz", contact: "0917-123-4567", email: "juan@example.com", type: "Guest / No Account" },
    { customer_id: "CUS-002", name: "Maria Santos", contact: "0918-222-3333", email: "", type: "Guest / No Account" },
    { customer_id: "CUS-003", name: "Ana Cruz", contact: "0919-444-5555", email: "ana@example.com", type: "Registered" }
  ];

  const today = new Date();
  const d = (offsetDays) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offsetDays);
    return dt.toISOString().slice(0, 10);
  };

  const bookings = [
    {
      id: "BK-2026-0001",
      customer_id: "CUS-001",
      customer_name: "Juan Dela Cruz",
      contact: "0917-123-4567",
      email: "juan@example.com",
      customer_type: "Guest / No Account",
      event_type: "Birthday Party",
      event_date: d(7),
      start_time: "14:00",
      end_time: "18:00",
      location: "Quezon City",
      guests: 40,
      special_requests: "Theme: Superheroes",
      service_ids: ["SVC-001"],
      addon_ids: ["ADD-001"],
      discount: 0,
      fees: 0,
      subtotal: 2500,
      addons_total: 300,
      total: 2800,
      amount_paid: 1000,
      status: "Confirmed",
      payment_status: "Partial",
      source: "Website",
      created_at: new Date().toISOString()
    },
    {
      id: "BK-2026-0002",
      customer_id: "CUS-002",
      customer_name: "Maria Santos",
      contact: "0918-222-3333",
      email: "",
      customer_type: "Guest / No Account",
      event_type: "Christening",
      event_date: d(10),
      start_time: "11:00",
      end_time: "15:00",
      location: "Caloocan City",
      guests: 60,
      special_requests: "",
      service_ids: ["SVC-002"],
      addon_ids: [],
      discount: 0,
      fees: 0,
      subtotal: 3500,
      addons_total: 0,
      total: 3500,
      amount_paid: 3500,
      status: "Reserved",
      payment_status: "Fully Paid",
      source: "Manual",
      created_at: new Date().toISOString()
    },
    {
      id: "BK-2026-0003",
      customer_id: "CUS-003",
      customer_name: "Ana Cruz",
      contact: "0919-444-5555",
      email: "ana@example.com",
      customer_type: "Registered",
      event_type: "Debut",
      event_date: d(12),
      start_time: "17:00",
      end_time: "22:00",
      location: "Malabon City",
      guests: 100,
      special_requests: "Pastel pink and gold theme",
      service_ids: ["SVC-003"],
      addon_ids: ["ADD-006"],
      discount: 200,
      fees: 0,
      subtotal: 4000,
      addons_total: 1000,
      total: 4800,
      amount_paid: 0,
      status: "Pending",
      payment_status: "Unpaid",
      source: "Website",
      created_at: new Date().toISOString()
    }
  ];

  const payments = [
    { payment_id: "PAY-001", booking_id: "BK-2026-0001", amount: 1000, method: "GCash", date: d(-1), notes: "Downpayment" },
    { payment_id: "PAY-002", booking_id: "BK-2026-0002", amount: 3500, method: "Cash", date: d(-2), notes: "Paid in full" }
  ];

  const gallery = [
    { image_id: "IMG-001", title: "Karaoke Night Set-up", image: "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800&q=80", featured: true },
    { image_id: "IMG-002", title: "Sweet Corner Display", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80", featured: true },
    { image_id: "IMG-003", title: "Pastel Balloon Arch", image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80", featured: true },
    { image_id: "IMG-004", title: "Debut Celebration", image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80", featured: false },
    { image_id: "IMG-005", title: "Birthday Bash", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80", featured: false },
    { image_id: "IMG-006", title: "Backdrop Styling", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", featured: false }
  ];

  const websiteContent = {
    business_name: "Fiesta & Co. Event Rentals",
    logo: "",
    hero_title: "Celebrations, fully set up for you.",
    hero_description: "Karaoke, sweet corners, and balloon styling for birthdays, debuts, christenings, and everything worth celebrating around Metro Manila.",
    hero_image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80",
    hero_button_text: "Check Availability",
    about_title: "We handle the set-up, you host the party",
    about_description: "Fiesta & Co. has been styling and equipping local celebrations for years. From a single karaoke unit to a full dessert and balloon package, we deliver, set up, and pick up - so you can actually enjoy your own event instead of running it.",
    contact_phone: "0917-123-4567",
    contact_email: "hello@fiestaandco.ph",
    contact_address: "123 Rizal Avenue, Caloocan City, Metro Manila",
    contact_facebook: "https://facebook.com/fiestaandco",
    contact_instagram: "https://instagram.com/fiestaandco"
  };

  const settings = {
    business_name: "Fiesta & Co. Event Rentals",
    logo: "",
    phone: "0917-123-4567",
    email: "hello@fiestaandco.ph",
    address: "123 Rizal Avenue, Caloocan City, Metro Manila",
    facebook: "https://facebook.com/fiestaandco",
    instagram: "https://instagram.com/fiestaandco",
    min_booking_notice_days: 2,
    booking_hours_open: "08:00",
    booking_hours_close: "22:00",
    cancellation_policy: "Cancellations made at least 5 days before the event date receive a full refund of the downpayment. Cancellations within 5 days forfeit the downpayment.",
    primary_color: "#1F4E45",
    accent_color: "#D9A441"
  };

  STORAGE.saveAll("categories", categories);
  STORAGE.saveAll("services", services);
  STORAGE.saveAll("addons", addons);
  STORAGE.saveAll("rentalItems", rentalItems);
  STORAGE.saveAll("customers", customers);
  STORAGE.saveAll("bookings", bookings);
  STORAGE.saveAll("bookingItems", []);
  STORAGE.saveAll("payments", payments);
  STORAGE.saveAll("gallery", gallery);
  STORAGE.saveAll("itemReleases", []);
  STORAGE.saveAll("itemReturns", []);
  STORAGE.saveAll("itemHistory", []);
  STORAGE.setOne("websiteContent", websiteContent);
  STORAGE.setOne("settings", settings);
  STORAGE._set(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

seedDatabase(false);
