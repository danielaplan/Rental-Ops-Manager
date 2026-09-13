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
  initAdminSpaNavigation();

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
  if (window.__adminSpaNavigationReady) return;
  window.__adminSpaNavigationReady = true;

  $(document).on('click.adminSpa', '.admin-sidebar a[href]', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#' || this.id === 'adminLogoutBtn' || href.startsWith('http')) return;
    e.preventDefault();
    loadAdminPage(href, true);
  });

  window.addEventListener('popstate', function () {
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';
    if (page.endsWith('.html') && page !== 'login.html') loadAdminPage(page, false);
  });
}

async function loadAdminPage(href, pushHistory) {
  const url = new URL(href, window.location.href);
  const currentMain = document.querySelector('.admin-main');
  if (!currentMain) return;

  currentMain.classList.add('admin-page-loading');
  try {
    const response = await fetch(url.href);
    if (!response.ok) throw new Error('Unable to load admin page');
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const nextMain = parsed.querySelector('.admin-main');
    if (!nextMain) throw new Error('Admin page content was not found');

    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    currentMain.outerHTML = nextMain.outerHTML;
    parsed.body.querySelectorAll('.modal').forEach(modal => {
      document.body.appendChild(document.importNode(modal, true));
    });

    await loadAdminPageScripts(parsed, url);
    document.title = parsed.title || document.title;
    if (pushHistory) window.history.pushState({}, '', url.href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeAdminSidebar();
  } catch (error) {
    console.error('Admin navigation error:', error);
    window.location.href = url.href;
  }
}

async function loadAdminPageScripts(parsed, pageUrl) {
  const scripts = Array.from(parsed.querySelectorAll('script'));
  for (const source of scripts.filter(script => script.src)) {
    const sourceUrl = new URL(source.getAttribute('src'), pageUrl.href).href;
    const alreadyLoaded = Array.from(document.scripts).some(script => script.src === sourceUrl);
    if (alreadyLoaded) continue;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = sourceUrl;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  for (const inlineScript of scripts.filter(script => !script.src)) {
    if (inlineScript.textContent.trim()) {
      new Function(inlineScript.textContent)();
    }
  }
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
        <div class="toast-body">${message}</div>
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

function statusSelect(currentStatus, options, cssClass) {
  return `<select class="form-select form-select-sm ${cssClass || ''}">${options.map(o => `<option ${o === currentStatus ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
}
