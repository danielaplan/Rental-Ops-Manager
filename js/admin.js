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
  isLoggedIn() {
    const s=STORAGE._get(STORAGE_KEYS.adminSession);
    return !!(s?.session_token && s?.user?.user_id && (!s.expiresAt || s.expiresAt>Date.now()));
  },
  async login(username, password) {
    try {
      const response = await fetch('../api/auth.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact_number: username, password }) });
      const envelope = await response.json();
      if (!response.ok || !envelope.ok) throw new Error(envelope.error || 'Sign in failed.');
      STORAGE._set(STORAGE_KEYS.adminSession, { username, loginAt: new Date().toISOString(), expiresAt:Date.now()+envelope.data.expires_in*1000, ...envelope.data });
      return true;
    } catch (error) {
      throw error;
    }
  },
  logout() {
    localStorage.removeItem(STORAGE_KEYS.adminSession);
    window.location.href = "login.html";
  },
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = "login.html";
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

function renderAdminSidebar(activeHref) {
  const settings = API.getSettings();
  const savedName = settings.business_name || '';
  const businessName = !savedName || savedName.startsWith('Fiesta & Co.')
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
    if (confirm('Log out of the admin panel?')) AdminAuth.logout();
  });
}

function initAdminChrome(activeHref, pageTitle) {
  AdminAuth.requireLogin();
  if (OWNER_ONLY_ADMIN_PAGES.has(activeHref) && !isOwnerAdmin()) {
    const main = document.querySelector('.admin-main');
    if (main) main.hidden = true;
    window.location.replace('dashboard.html');
    return;
  }
  renderAdminSidebar(activeHref);
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

function confirmDelete(message, callback) {
  if (confirm(message || "Are you sure you want to delete this? This cannot be undone.")) {
    callback();
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
  return `<span class="badge bg-${color}">${status}</span>`;
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
