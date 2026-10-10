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
    let response;
    try {
      response = await fetch('../api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_number: username, password })
      });
    } catch (cause) {
      const error = new Error('The login server could not be reached. Open this page through the configured PHP site (not file:// or a static-only host) and check the server connection.');
      error.code = 'network_error';
      error.cause = cause;
      throw error;
    }
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
let adminSpaActive = false;
let adminSpaNavigationBound = false;
let adminSpaNavigationVersion = 0;
let adminSpaCurrentCacheKey = '';
const adminSpaScriptUrls = new Set(Array.from(document.scripts || []).map(script => script.src).filter(Boolean));
const adminSpaPageCache = new Map();
const adminSpaInitializedPages = new Set();

function isOwnerAdmin() {
  const session = STORAGE._get(STORAGE_KEYS.adminSession, {});
  return String(session?.user?.role || '').toLowerCase() === 'owner';
}

function getAdminBusinessName(settings) {
  const savedName = settings?.business_name || '';
  return savedName || CONFIG.businessNameFallback;
}

function updateAdminSidebarBrand() {
  const brandName = document.querySelector('#adminSidebar .brand-name');
  if (brandName) {
    brandName.textContent = getAdminBusinessName(STORAGE._get(STORAGE_KEYS.settings, {}));
  }
}

async function renderAdminSidebar(activeHref) {
  const settings = await API.getSettings().catch(() => ({}));
  const businessName = getAdminBusinessName(settings);
  let html = `<div class="brand"><span class="brand-name">${escapeHtmlA(businessName)}</span><div class="small fw-normal" style="color:rgba(255,255,255,0.5);">Admin Panel</div></div><nav class="nav flex-column pt-2" aria-label="Admin navigation">`;
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
  if (!adminSpaActive) await AdminAuth.requireLogin();
  if (OWNER_ONLY_ADMIN_PAGES.has(activeHref) && !isOwnerAdmin()) {
    if (adminSpaActive) {
      await navigateAdminPage('dashboard.html', { replace: true });
    } else {
      const main = document.querySelector('.admin-main');
      if (main) main.hidden = true;
      window.location.replace('dashboard.html');
    }
    return;
  }
  if (adminSpaActive) {
    document.querySelectorAll('#adminSidebar .nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === activeHref);
    });
  } else {
    await renderAdminSidebar(activeHref);
  }
  $('#adminPageTitle').text(pageTitle);
  initAdminSpaNavigation();
  window.initSyncPanel?.();

  $('#sidebarToggleBtn').off('click.adminChrome').on('click.adminChrome', function () {
    const isOpen = !$('#adminSidebar').hasClass('show');
    $('#adminSidebar').toggleClass('show', isOpen);
    $('#sidebarBackdrop').toggleClass('show', isOpen);
    $(this).attr('aria-expanded', String(isOpen));
  });
  $('#sidebarBackdrop').off('click.adminChrome').on('click.adminChrome', function () {
    $('#adminSidebar').removeClass('show');
    $(this).removeClass('show');
    $('#sidebarToggleBtn').attr('aria-expanded', 'false');
  });
}

function initAdminSpaNavigation() {
  const currentMain = document.querySelector('main.admin-main');
  const cacheKey = window.location.pathname + window.location.search;
  const currentPage = window.location.pathname.split('/').pop();
  if (currentMain && !adminSpaPageCache.has(cacheKey)) {
    adminSpaPageCache.set(cacheKey, {
      main: currentMain,
      title: document.title,
      modals: getAdminPageModals()
    });
    adminSpaInitializedPages.add(currentPage);
  }
  if (currentMain) adminSpaCurrentCacheKey = cacheKey;
  if (adminSpaNavigationBound) return;
  adminSpaNavigationBound = true;
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href, window.location.href);
    const page = url.pathname.split('/').pop();
    if (url.pathname === window.location.pathname) {
      if (!url.hash) event.preventDefault();
      return;
    }
    if (url.origin !== window.location.origin ||
        url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1) !==
          window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) ||
        !ADMIN_NAV.some(item => item.href === page)) return;
    event.preventDefault();
    closeAdminSidebar();
    void navigateAdminPage(url.href);
  });
  window.addEventListener('popstate', () => {
    const page = window.location.pathname.split('/').pop();
    if (ADMIN_NAV.some(item => item.href === page)) {
      void navigateAdminPage(window.location.href, { history: false });
    } else {
      window.location.reload();
    }
  });
}

function getAdminPageModals(root = document.body) {
  return Array.from(root.children).filter(element => element.classList.contains('modal'));
}

async function removeAdminPageModals(modals) {
  await Promise.all(modals.map(modal => new Promise(resolve => {
    const instance = window.bootstrap?.Modal?.getInstance(modal);
    if (instance && modal.classList.contains('show')) {
      modal.addEventListener('hidden.bs.modal', () => {
        instance.dispose();
        modal.remove();
        resolve();
      }, { once: true });
      instance.hide();
      return;
    }
    instance?.dispose();
    modal.remove();
    resolve();
  })));
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');
}

async function loadAdminPageScripts(parsedPage, pageUrl) {
  for (const script of parsedPage.scripts) {
    const src = script.getAttribute('src');
    if (!src) continue;
    const url = new URL(src, pageUrl).href;
    if (adminSpaScriptUrls.has(url)) continue;
    await new Promise((resolve, reject) => {
      const loaded = document.createElement('script');
      loaded.src = url;
      loaded.onload = resolve;
      loaded.onerror = () => reject(new Error('Could not load admin page script: ' + url));
      document.head.append(loaded);
    });
    adminSpaScriptUrls.add(url);
  }
}

async function navigateAdminPage(destination, options = {}) {
  const version = ++adminSpaNavigationVersion;
  const url = new URL(destination, window.location.href);
  const page = url.pathname.split('/').pop();
  const cacheKey = url.pathname + url.search;
  if (OWNER_ONLY_ADMIN_PAGES.has(page) && !isOwnerAdmin()) {
    showAdminError(new Error('This admin page is available to the business owner only.'));
    return;
  }
  if (options.history !== false &&
      url.pathname === window.location.pathname && !url.search && !url.hash) return;

  try {
    const currentMain = document.querySelector('main.admin-main');
    if (!currentMain) throw new Error('The admin content area is unavailable.');
    const currentCacheKey = adminSpaCurrentCacheKey || window.location.pathname + window.location.search;
    const currentModals = getAdminPageModals();
    let parsedPage = null;
    let nextPage = adminSpaPageCache.get(cacheKey);
    if (!nextPage) {
      const response = await fetch(url.href, { headers: { 'X-Requested-With': 'fetch' } });
      if (!response.ok) throw new Error('Could not open ' + page + ' (HTTP ' + response.status + ').');
      const html = await response.text();
      parsedPage = new DOMParser().parseFromString(html, 'text/html');
      const nextMain = parsedPage.querySelector('main.admin-main');
      if (!nextMain) throw new Error('The requested admin page has no content area.');
      await loadAdminPageScripts(parsedPage, url);
      if (version !== adminSpaNavigationVersion) return;
      nextPage = {
        main: document.importNode(nextMain, true),
        title: parsedPage.title,
        modals: getAdminPageModals(parsedPage.body).map(modal => document.importNode(modal, true))
      };
    }

    await removeAdminPageModals(currentModals);
    if (version !== adminSpaNavigationVersion) return;
    currentMain.replaceWith(nextPage.main);
    nextPage.modals.forEach(modal => document.body.append(modal));
    adminSpaPageCache.set(currentCacheKey, {
      main: currentMain,
      title: document.title,
      modals: currentModals
    });
    adminSpaPageCache.set(cacheKey, nextPage);
    adminSpaCurrentCacheKey = cacheKey;
    document.title = nextPage.title;
    if (options.history !== false) {
      const method = options.replace ? 'replaceState' : 'pushState';
      window.history[method]({ adminPage: page }, '', url.href);
    }
    adminSpaActive = true;
    document.querySelectorAll('#adminSidebar .nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === page);
    });
    document.querySelector('#adminPageTitle')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    if (parsedPage && !adminSpaInitializedPages.has(page)) {
      parsedPage.querySelectorAll('script:not([src])').forEach(script => {
        if (!script.textContent.trim()) return;
        const loaded = document.createElement('script');
        loaded.textContent = script.textContent;
        document.body.append(loaded);
        loaded.remove();
      });
      adminSpaInitializedPages.add(page);
    }
  } catch (error) {
    if (version === adminSpaNavigationVersion) showAdminError(error);
  }
}

function closeAdminSidebar() {
  $('#adminSidebar').removeClass('show');
  $('#sidebarBackdrop').removeClass('show');
  $('#sidebarToggleBtn').attr('aria-expanded', 'false');
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
    else {
      const loginForm = document.getElementById('loginForm');
      if (loginForm) loginForm.after(alert);
      else document.body.prepend(alert);
    }
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
