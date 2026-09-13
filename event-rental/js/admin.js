/**
 * admin.js
 * Shared scaffolding for every admin/*.html page:
 *  - mock auth guard (redirects to login.html if no session)
 *  - sidebar navigation with active-state + mobile offcanvas behavior
 *  - small reusable UI helpers (toast, confirm-delete, badges)
 *
 * NOTE: Auth here is a MOCK frontend-only session flag in localStorage.
 * There is no real security. When PHP is added, replace AdminAuth with
 * real server-side session/cookie checks.
 */
const AdminAuth = {
  isLoggedIn() {
    return !!STORAGE._get(STORAGE_KEYS.adminSession);
  },
  login(username) {
    STORAGE._set(STORAGE_KEYS.adminSession, { username, loginAt: new Date().toISOString() });
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
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

function renderAdminSidebar(activeHref) {
  const settings = API.getSettings();
  let html = `<div class="brand">${escapeHtmlA(settings.business_name || CONFIG.businessNameFallback)}<div class="small fw-normal" style="color:rgba(255,255,255,0.5);">Admin Panel</div></div><nav class="nav flex-column pt-2">`;
  ADMIN_NAV.forEach(item => {
    if (item.section) {
      html += `<div class="nav-section-label">${item.section}</div>`;
    } else {
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
  renderAdminSidebar(activeHref);
  $('#adminPageTitle').text(pageTitle);

  $('#sidebarToggleBtn').on('click', function () {
    $('#adminSidebar').toggleClass('show');
    $('#sidebarBackdrop').toggleClass('show');
  });
  $('#sidebarBackdrop').on('click', function () {
    $('#adminSidebar').removeClass('show');
    $(this).removeClass('show');
  });
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
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;
  $('body').append(html);
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function badgeStatus(status, map) {
  const color = (map && map[status]) || 'secondary';
  return `<span class="badge bg-${color}">${status}</span>`;
}

function statusSelect(currentStatus, options, cssClass) {
  return `<select class="form-select form-select-sm ${cssClass || ''}">${options.map(o => `<option ${o === currentStatus ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
}
