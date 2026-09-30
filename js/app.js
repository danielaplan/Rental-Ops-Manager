/**
 * app.js
 * Wires up the public landing page: pulls website_content, services,
 * gallery from the API layer and renders the public brochure and
 * staff contact information.
 */
$(function () {
  applySiteAppearance();
  renderSiteChrome();
  renderHero();
  renderAbout();
  renderServices();
  renderGallery();
  renderContact();
  refreshPublicSiteData().then(() => {
    applySiteAppearance();
    renderSiteChrome();
    renderHero();
    renderAbout();
    renderContact();
  });

  $('.navbar-nav .nav-link').on('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const nav = document.getElementById('mainNav');
    const scrollToTarget = () => {
      const navbar = document.querySelector('.navbar-custom');
      const offset = (navbar ? navbar.offsetHeight : 0) + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    if (nav && nav.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(nav).hide();
      window.setTimeout(scrollToTarget, 250);
    } else {
      scrollToTarget();
    }
  });
});

async function refreshPublicSiteData() {
  const endpoints = [
    ['settings', 'api/settings.php?do=get'],
    ['websiteContent', 'api/websiteContent.php?do=get']
  ];
  await Promise.all(endpoints.map(async ([collection, endpoint]) => {
    try {
      const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(3500) });
      const result = await response.json();
      if (response.ok && result.ok && result.data && typeof result.data === 'object') {
        STORAGE.setOne(collection, result.data);
      }
    } catch {}
  }));
}

function applySiteAppearance() {
  const settings = API.getSettings();
  const root = document.documentElement;
  const primary = normalizeHexColor(settings.primary_color);
  const accent = normalizeHexColor(settings.accent_color);

  if (primary) {
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-dark', adjustColor(primary, -18));
    root.style.setProperty('--color-primary-light', adjustColor(primary, 18));
  }
  if (accent) {
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-accent-dark', adjustColor(accent, -18));
  }
}

function normalizeHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value : null;
}

function safeWebUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch (error) {
    return '';
  }
}

function adjustColor(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const change = (channel) => Math.max(0, Math.min(255, channel + amount));
  const red = change((value >> 16) & 255);
  const green = change((value >> 8) & 255);
  const blue = change(value & 255);
  return '#' + [red, green, blue].map(channel => channel.toString(16).padStart(2, '0')).join('');
}

function renderSiteChrome() {
  const content = API.getWebsiteContent();
  const savedName = content.business_name || '';
  const name = !savedName || savedName.startsWith('Fiesta & Co.')
    ? CONFIG.businessNameFallback
    : savedName;
  $('.js-business-name').text(name);
  document.title = name + " | Event Rentals & Styling";
}

function renderHero() {
  const c = API.getWebsiteContent();
  $('#heroTitle').text(c.hero_title || "");
  const heroDescription = c.hero_description || '';
  $('#heroDesc').text(heroDescription.includes('Metro Manila')
    ? 'Karaoke rental, Sweet Corner packages, and balloon decorations for birthdays and special events.'
    : heroDescription);
  $('#heroImage').attr('src', safeWebUrl(c.hero_image));
}

function renderAbout() {
  const c = API.getWebsiteContent();
  $('#aboutTitle').text(c.about_title || "");
  const aboutDescription = c.about_description || '';
  $('#aboutDesc').text(aboutDescription.startsWith('Fiesta & Co.')
    ? 'We provide karaoke rental, Sweet Corner packages, and balloon decorations. Contact our team to discuss preferred dates and delivery arrangements.'
    : aboutDescription);
}

function renderServices() {
  const services = API.getActiveServices();
  const $wrap = $('#servicesGrid').empty();

  if (!services.length) {
    $wrap.append('<p class="text-muted">Services coming soon.</p>');
    return;
  }

  services.forEach(s => {
    const displayName = publicServiceName(s.name);
    const card = `
      <div class="col-md-6 col-lg-4">
        <div class="service-card">
          <img src="${escapeHtml(safeWebUrl(s.image))}" alt="${escapeHtml(displayName)}">
          <div class="service-card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h3>${escapeHtml(displayName)}</h3>
            </div>
            <p class="desc">A separate service line. Contact our team for current package options, inclusions, and pricing.</p>
            <button class="btn btn-outline-custom btn-sm w-100 js-view-service" data-id="${s.service_id}">View Details</button>
          </div>
        </div>
      </div>`;
    $wrap.append(card);
  });

  $(document).on('click', '.js-view-service', function () {
    openServiceDetails($(this).data('id'));
  });
}

function publicServiceName(name) {
  const serviceNames = {
    'Karaoke Rental': 'JBL Karaoke Rental',
    'Sweet Corner': 'Sweet Corner Setup',
    'Balloon Decoration': 'Balloon Decorations'
  };
  return serviceNames[name] || name;
}

function openServiceDetails(serviceId) {
  const s = API.getService(serviceId);
  if (!s) return;
  const displayName = publicServiceName(s.name);
  $('#serviceModalLabel').text(displayName);
  $('#serviceModalBody').html(`
    <img src="${escapeHtml(safeWebUrl(s.image))}" alt="${escapeHtml(displayName)}" class="w-100 mb-3" style="border-radius:8px;aspect-ratio:16/9;object-fit:cover;">
    <p class="mb-0 text-muted">Contact our staff to confirm current package options, inclusions, and pricing for this service.</p>
  `);
  new bootstrap.Modal('#serviceModal').show();
}

function renderGallery() {
  const images = API.getGallery();
    const $wrap = $('#galleryGrid').empty(); 
    const shown = images.slice(0, 6); 
    shown.forEach(img => { 
    $wrap.append(`
      <div class="col-md-4 col-6">
        <div class="gallery-item">
          <img src="${escapeHtml(safeWebUrl(img.image))}" alt="${escapeHtml(img.title)}">
          <div class="gallery-caption">${escapeHtml(img.title)}</div>
        </div>
      </div>`);
  });
}

function renderContact() {
  const c = API.getWebsiteContent();
  const phone = c.contact_phone === '0917-123-4567' ? '' : (c.contact_phone || '');
  const email = c.contact_email === 'hello@fiestaandco.ph' ? '' : (c.contact_email || '');
  const address = c.contact_address === '123 Rizal Avenue, Caloocan City, Metro Manila' ? '' : (c.contact_address || '');
  $('#contactPhone').text(phone).attr('href', phone ? 'tel:' + phone.replace(/[^0-9+]/g, '') : '#');
  $('#contactPhone').closest('.contact-info-item').toggle(!!phone);
  $('#contactEmail').text(email).attr('href', email ? 'mailto:' + email : '#');
  $('#contactEmail').closest('.contact-info-item').toggle(!!email);
  $('#contactAddress').text(address).closest('.contact-info-item').toggle(!!address);
  const facebook = safeWebUrl(c.contact_facebook === 'https://facebook.com/fiestaandco' ? '' : c.contact_facebook);
  const instagram = safeWebUrl(c.contact_instagram === 'https://instagram.com/fiestaandco' ? '' : c.contact_instagram);
  $('.js-fb-link').attr('href', facebook || '#').toggle(!!facebook);
  $('.js-ig-link').attr('href', instagram || '#').toggle(!!instagram);
  $('.js-fb-link').parent().toggle(!!(facebook || instagram));
  $('.js-footer-phone').text(phone).closest('p').toggle(!!phone);
  $('.js-footer-email').text(email).closest('p').toggle(!!email);
  $('.js-footer-phone').closest('.col-md-4').toggle(!!(phone || email));
  $('#contactUnavailable').prop('hidden', !!(phone || email || address || facebook || instagram));
  $('#contactActionText').text(phone || email || facebook || instagram
    ? 'Use the contact details on this page to ask about dates and delivery arrangements.'
    : 'Contact information is not configured yet. Ask the owners for their preferred contact channel.');
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

