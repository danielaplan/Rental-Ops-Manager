/**
 * admin.js
 * Shared scaffolding for every admin/*.html page:
 *  - cached session guard (PHP validates authenticated requests)
 *  - sidebar navigation with active-state + mobile offcanvas behavior
 *  - small reusable UI helpers (toast, confirm-delete, badges)
 *
 * Offline work requires an existing online-authenticated session.
 */
const AdminAuth = {
  // Fix #6: expiresAt must be present and in the future — missing field = invalid session.
  isLoggedIn() {
    const s = STORAGE._get(STORAGE_KEYS.adminSession);
    return !!(s?.session_token && s?.user?.user_id && s.expiresAt && s.expiresAt > Date.now());
  },

  // Fix #3: Server-side verification — asks PHP if the token is still real.
  // Returns true if confirmed, false if rejected. Falls back to localStorage on network error (offline).
  async verifyWithServer() {
    const s = STORAGE._get(STORAGE_KEYS.adminSession);
    if (!s?.session_token) return false;
    try {
      const response = await fetch('../api/auth.php?do=me', {
        headers: { Authorization: `Bearer ${s.session_token}` }
      });
      if (!response.ok) {
        // Server rejected — wipe stale localStorage session so login page shows next time.
        localStorage.removeItem(STORAGE_KEYS.adminSession);
        return false;
      }
      return true;
    } catch {
      // Network error (offline mode) — trust the local expiry check only.
      return this.isLoggedIn();
    }
  },

  async login(username, password) {
    const response = await fetch('../api/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_number: username, password })
    });
    const text = await response.text();
    let envelope;
    try {
      envelope = text ? JSON.parse(text) : null;
    } catch {
      throw new Error('The server returned an invalid response. PHP is not running on this host — this app requires a PHP backend and cannot run on Vercel static hosting.');
    }
    if (!response.ok || !envelope?.ok) {
      throw new Error(envelope?.error || `Sign in failed (HTTP ${response.status}).`);
    }
    STORAGE._set(STORAGE_KEYS.adminSession, {
      username,
      loginAt: new Date().toISOString(),
      expiresAt: Date.now() + envelope.data.expires_in * 1000,
      ...envelope.data
    });
    return true;
  },

  // Fix #5: Calls PHP to delete the server session row before clearing localStorage.
  async logout() {
    const s = STORAGE._get(STORAGE_KEYS.adminSession);
    if (s?.session_token) {
      try {
        await fetch('../api/auth.php?do=logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${s.session_token}`
          },
          body: JSON.stringify({ session_token: s.session_token })
        });
      } catch {
        // Best-effort: always clear localStorage even if the server call fails.
      }
    }
    localStorage.removeItem(STORAGE_KEYS.adminSession);
    window.location.href = 'login.html';
  },

  // Fix #4: Now async — does a fast local check then a server ping.
  async requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
    const valid = await this.verifyWithServer();
    if (!valid) {
      window.location.href = 'login.html';
    }
  }
};

function escapeHtmlA(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const ADMIN_NAV = [
  { label: "Dashboard", href: "dashboard.html", icon: "bi-grid-1x2" },
  { section: "Bookings" },
  { label: "Bookings", href: "bookings.html", icon: "bi-journal-check" },
  { label: "Manual Booking", href: "manual-booking.html", icon: "bi-pencil-square" },
  { label: "Calendar", href: "calendar.html", icon: "bi-calendar3" },
  { section: "Catalog" },
  { label: "Services", href: "services.html", icon: "bi-boxes" },
  { label: "Categories", href: "categories.html", icon: "bi-tags" },
  { label: "Add-ons", href: "addons.html", icon: "bi-plus-square" },
  { label: "Inventory", href: "inventory.html", icon: "bi-clipboard-check" },
  { section: "People & Money" },
  { label: "Customers", href: "customers.html", icon: "bi-people" },
  { label: "Payments", href: "payments.html", icon: "bi-cash-coin" },
  { section: "Website" },
  { label: "Gallery", href: "gallery.html", icon: "bi-images" },
  { label: "Website Content", href: "content.html", icon: "bi-file-earmark-text" },
  { section: "System" },
  { label: "Reports", href: "reports.html", icon: "bi-bar-chart" },
  { label: "Settings", href: "settings.html", icon: "bi-gear" }
];

const OWNER_ONLY_ADMIN_PAGES = new Set([
  'services.html', 'categories.html', 'addons.html', 'gallery.html',
  'content.html', 'settings.html'
]);

function isOwnerAdmin() {
  const session = STORAGE._get(STORAGE_KEYS.adminSession, {});
  return String(session?.user?.role || '').toLowerCase() === 'owner';
}

async function renderAdminSidebar(activeHref) {
  const settings = await API.getSettings().catch(() => ({}));
  const savedName = settings?.business_name || '';
  const businessName = !savedName
    ? CONFIG.businessNameFallback
    : savedName === CONFIG.businessNameFallback
      ? CONFIG.businessNameFallback
      : savedName;
  let html = `<div class="brand">${escapeHtmlA(businessName)}<div class="small fw-normal" style="color:rgba(255,255,255,0.5);">Admin Panel</div></div><nav class="nav flex-column pt-2">`;
  ADMIN_NAV.forEach((item, index) => {
    if (item.section) {
      const visibleInSection = ADMIN_NAV.slice(index + 1).some(next => {
        if (next.section) return false;
        return !OWNER_ONLY_ADMIN_PAGES.has(next.href) || isOwnerAdmin();
      });
      if (visibleInSection) html += `<div class="nav-section-label">${item.section}</div>`;
    } else {
      if (OWNER_ONLY_ADMIN_PAGES.has(item.href) && !isOwnerAdmin()) return;
      const active = item.href === activeHref ? 'active' : '';
      html += `<a class="nav-link ${active}" href="${item.href}"><i class="bi ${item.icon}"></i> ${item.label}</a>`;
    }
  });
  html += `<a class="nav-link mt-3 border-top border-light border-opacity-25 pt-3" href="#" id="adminLogoutBtn"><i class="bi bi-box-arrow-right"></i> Logout</a></nav>`;
  $('#adminSidebar').html(html);
  $('#adminLogoutBtn').on('click', function (e) {
    e.preventDefault();
    if (confirm('Log out of the admin panel?')) { AdminAuth.logout(); }
  });
}

async function initAdminChrome(activeHref, pageTitle) {
  await AdminAuth.requireLogin();
  if (OWNER_ONLY_ADMIN_PAGES.has(activeHref) && !isOwnerAdmin()) {
    const main = document.querySelector('.admin-main');
    if (main) main.hidden = true;
    window.location.replace('dashboard.html');
    return;
  }
  await renderAdminSidebar(activeHref);
  $('#adminPageTitle').text(pageTitle);
  initAdminSpaNavigation();
  window.initSyncPanel?.();

  $('#sidebarToggleBtn').off('click.adminChrome').on('click.adminChrome', function () {
    $('#adminSidebar').toggleClass('show');
    $('#sidebarBackdrop').toggleClass('show');
  });
  $('#sidebarBackdrop').off('click.adminChrome').on('click.adminChrome', function () {
    $('#adminSidebar').removeClass('show');
    $(this).removeClass('show');
  });
}

function initAdminSpaNavigation() {
  // Native links use the cached app shell and initialize each page once.
}

function closeAdminSidebar() {
  $('#adminSidebar').removeClass('show');
  $('#sidebarBackdrop').removeClass('show');
}

function showAdminError(error) {
  let alert = document.getElementById('adminAsyncError');
  if (!alert) {
    alert = document.createElement('div');
    alert.id = 'adminAsyncError';
    alert.className = 'alert alert-danger';
    alert.setAttribute('role', 'alert');
    const topbar = document.querySelector('.admin-topbar');
    if (topbar) topbar.after(alert);
    else document.body.prepend(alert);
  }
  alert.textContent = error?.message || 'The operation failed. Please retry. Your form values have been retained.';
  alert.hidden = false;
}

// jQuery does not handle rejected Promises returned by event callbacks.
// Keep failures visible and lock an action before its first asynchronous read.
const adminActionsInFlight = new WeakSet();
function adminEventHandler(callback) {
  return async function (...args) {
    const event = args[0];
    const exclusive = event?.type === 'submit' ||
      (event?.type === 'click' && this?.matches?.('button, input[type=submit]'));
    if (exclusive && adminActionsInFlight.has(this)) { event.preventDefault(); return; }
    const controls = exclusive && this.id !== 'manualBookingForm'
      ? (this.matches('form') ? [...this.querySelectorAll('[type=submit]')] : [this]) : [];
    const disabled = controls.map(control => control.disabled);
    if (exclusive) adminActionsInFlight.add(this);
    controls.forEach(control => { control.disabled = true; });
    try {
      return await callback.apply(this, args);
    } catch (error) {
      showAdminError(error);
    } finally {
      if (exclusive) adminActionsInFlight.delete(this);
      controls.forEach((control, index) => { control.disabled = disabled[index]; });
    }
  };
}

$.fn.onAdmin = function (...args) {
  const index = args.length - 1;
  if (typeof args[index] === 'function') args[index] = adminEventHandler(args[index]);
  return this.on(...args);
};

function adminReady(callback) {
  $(adminEventHandler(callback));
}

async function confirmDelete(message, callback) {
  if (confirm(message || "Are you sure you want to delete this? This cannot be undone.")) {
    try { await callback(); } catch (error) { showAdminError(error); }
  }
}

function showAdminToast(message, type) {
  type = type || 'success';
  const id = 'toast-' + Date.now();
  const html = `
    <div id="${id}" class="toast align-items-center text-white bg-${type} border-0" role="alert" style="position:fixed;top:1rem;right:1rem;z-index:3000;">
      <div class="d-flex">
        <div class="toast-body">${escapeHtmlA(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;
  $('body').append(html);
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
  window.setTimeout(() => toast.hide(), 2500);
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function badgeStatus(status, map) {
  const color = (map && map[status]) || 'secondary';
  return `<span class="badge bg-${color}">${escapeHtmlA(status)}</span>`;
}

/* Field-level validation error display. Attaches a small red message
   under the field and marks the control invalid so the browser's
   built-in validation styling stays consistent. */
function showFieldError(selector, message) {
  const $field = $(selector);
  if (!$field.length) return;
  $field.addClass('is-invalid');
  let $msg = $field.nextAll('.invalid-feedback');
  if (!$msg.length) {
    $msg = $(`<div class="invalid-feedback"></div>`).insertAfter($field);
  }
  $msg.text(message);
}

function clearFieldError(selector) {
  const $field = $(selector);
  if (!$field.length) return;
  $field.removeClass('is-invalid');
  $field.nextAll('.invalid-feedback').remove();
}

function statusSelect(currentStatus, options, cssClass) {
  return `<select class="form-select form-select-sm ${cssClass || ''}">${options.map(o => `<option ${o === currentStatus ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
}
