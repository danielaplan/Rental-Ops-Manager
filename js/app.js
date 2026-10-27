/**
 * app.js
 * Wires up the public landing page: pulls website_content, services,
 * gallery from the API layer and renders the public brochure and
 * staff contact information.
 */
$(async function () {
  await API.ready;
  await applySiteAppearance();
  await renderSiteChrome();
  await renderHero();
  await renderAbout();
  await renderServices();
  await renderGallery();
  await renderContact();

  await refreshPublicSiteData();
  await applySiteAppearance();
  await renderSiteChrome();
  await renderHero();
  await renderAbout();
  await renderServices();
  await renderGallery();
  await renderContact();

  $('a[href^="#"]').on('click', function (e) {
    const hash = this.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();

    const nav = document.getElementById('mainNav');
    const scrollToTarget = () => {
      const navbar = document.querySelector('.navbar-custom');
      const offset = target.id === 'top' ? 0 : (navbar?.offsetHeight || 0);
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    if (nav && nav.classList.contains('show') && this.closest('#mainNav')) {
      bootstrap.Collapse.getOrCreateInstance(nav).hide();
      window.setTimeout(scrollToTarget, 250);
    } else if (this.matches('[data-bs-dismiss="modal"]')) {
      window.setTimeout(scrollToTarget, 180);
    } else {
      scrollToTarget();
    }
  });
});

const PUBLIC_STORAGE_KEYS = typeof STORAGE_KEYS !== 'undefined'
  ? STORAGE_KEYS
  : { settings: 'er_settings', websiteContent: 'er_website_content', services: 'er_services', gallery: 'er_gallery' };

async function resolveApiValue(loader, fallback) {
  try {
    const value = await Promise.resolve(loader());
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function publicSettingsCache() {
  if (typeof STORAGE === 'undefined' || !STORAGE) return {};
  if (typeof STORAGE._get === 'function') return STORAGE._get(PUBLIC_STORAGE_KEYS.settings, {}) || {};
  if (typeof STORAGE.getOne === 'function') return STORAGE.getOne('settings') || {};
  return {};
}

function publicContentCache() {
  if (typeof STORAGE === 'undefined' || !STORAGE) return {};
  if (typeof STORAGE._get === 'function') return STORAGE._get(PUBLIC_STORAGE_KEYS.websiteContent, {}) || {};
  if (typeof STORAGE.getOne === 'function') return STORAGE.getOne('websiteContent') || {};
  return {};
}

function publicServicesCache() {
  if (typeof STORAGE === 'undefined' || !STORAGE) return [];
  if (typeof STORAGE.getAll === 'function') return STORAGE.getAll('services') || [];
  return [];
}

function publicGalleryCache() {
  if (typeof STORAGE === 'undefined' || !STORAGE) return [];
  if (typeof STORAGE.getAll === 'function') return STORAGE.getAll('gallery') || [];
  return [];
}

async function refreshPublicSiteData() {
  const result = await API.refreshPublicData();
  const status = document.getElementById?.('publicDataStatus');
  if (status) {
    const failedEntities = Object.keys(result.errors || {});
    status.textContent = failedEntities.length
      ? 'Some website content could not be refreshed. Showing the latest saved content.'
      : '';
    status.hidden = failedEntities.length === 0;
  }
  return result;
}

async function applySiteAppearance() {
  const cached = publicSettingsCache();
  const settings = cached;
  const root = document.documentElement;
  const defaults = CONFIG.themeDefaults || { primary: '#8a633f', accent: '#d1a170', primaryDark: '#171714' };
  const primary = normalizeHexColor(settings.primary_color) || defaults.primary;
  const accent = normalizeHexColor(settings.accent_color) || defaults.accent;
  const defaultTheme = primary.toLowerCase() === defaults.primary.toLowerCase() && accent.toLowerCase() === defaults.accent.toLowerCase();

  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-dark', defaultTheme ? defaults.primaryDark : adjustColor(primary, -42));
  root.style.setProperty('--color-primary-light', adjustColor(primary, 18));
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-accent-dark', adjustColor(accent, -28));
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

function publicServicePresentationValue(service, field) {
  const map = publicContentCache()?.[field] || {};
  const candidates = [service?.service_id, service?._server_id];
  const serverId = service?._server_id ?? String(service?.service_id || '').match(/(\d+)$/)?.[1];
  if (serverId !== undefined && serverId !== null && serverId !== '') {
    candidates.push(`SVC-${String(serverId).padStart(3, '0')}`);
    const aliases = STORAGE._get('er_sync_ids', {});
    Object.entries(aliases).forEach(([key, value]) => {
      if (key.startsWith('services:') && String(value) === String(serverId)) candidates.push(key.slice('services:'.length));
    });
  }
  const key = candidates.find(candidate => candidate != null && map[String(candidate)]);
  return key == null ? '' : map[String(key)];
}

function adjustColor(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const change = (channel) => Math.max(0, Math.min(255, channel + amount));
  const red = change((value >> 16) & 255);
  const green = change((value >> 8) & 255);
  const blue = change(value & 255);
  return '#' + [red, green, blue].map(channel => channel.toString(16).padStart(2, '0')).join('');
}

window.addEventListener?.('storage', event => {
  if (event.key === PUBLIC_STORAGE_KEYS.settings) applySiteAppearance();
  if (event.key === PUBLIC_STORAGE_KEYS.websiteContent) {
    renderSiteChrome();
    renderHero();
    renderAbout();
    renderServices();
    renderGallery();
    renderContact();
  }
});

async function renderSiteChrome() {
  const cached = publicContentCache();
  const content = cached;
  const savedName = content.business_name || '';
  const name = !savedName || savedName === CONFIG.businessNameFallback
    ? CONFIG.businessNameFallback
    : savedName;
  $('.js-business-name').text(name);
  const logo = safeWebUrl(content.logo || publicSettingsCache().logo);
  document.querySelectorAll?.('.brand-mark').forEach(mark => {
    mark.textContent = '';
    if (logo) {
      const image = document.createElement('img');
      image.src = logo;
      image.alt = '';
      image.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:inherit';
      mark.append(image);
    } else { mark.textContent = 'A'; }
  });
  document.title = name + " | Event Rentals & Styling";
}

async function renderHero() {
  const content = publicContentCache();
  const configuredImage = safeWebUrl(content.hero_image);
  const usesLegacySeed = /images\.unsplash\.com\/photo-1530103862676/.test(configuredImage);
  const title = String(content.hero_title || '').trim();
  const description = String(content.hero_description || '').trim();
  const buttonText = String(content.hero_button_text || '').trim();
  $('#heroTitle').text(title || 'Turn your celebration into a moment everyone remembers.');
  $('#heroDesc').text(description || 'We bring the music, the sweets, and the picture-perfect details—so you can be fully present for every smile.');
  $('#heroButtonText').text(buttonText || 'Explore services');
  $('#heroImage').attr('src', configuredImage && !usesLegacySeed ? configuredImage : 'images/defaults/hero-bg.jpg');
}

async function renderAbout() {
  const cached = publicContentCache();
  const c = cached;
  $('#aboutTitle').text(c.about_title || "");
  const aboutDescription = c.about_description || '';
  $('#aboutDesc').text(aboutDescription === CONFIG.aboutFallback
    ? CONFIG.aboutFallback
    : aboutDescription);
}

async function renderServices() {
  const cachedServices = publicServicesCache().filter(service => service.status === 'Active');
  const services = cachedServices;
  const $wrap = $('#servicesGrid').empty();

  if (!services.length) {
    $wrap.append('<p class="text-muted">Services coming soon.</p>');
    return;
  }

  services.forEach(s => {
    const displayName = publicServiceName(s.name);
    const configuredImage = safeWebUrl(publicServicePresentationValue(s, 'service_images')) || safeWebUrl(s.image)
      || safeWebUrl((cachedServices.find(item => String(item.service_id) === String(s.service_id)) || {}).image);
    const serviceImage = (!/images\.unsplash\.com/.test(configuredImage) && configuredImage)
      || publicGalleryVisual(serviceGalleryKeywords(s.name))
      || publicServiceVisual(s.name);
    const card = `
      <div class="col-md-6 col-lg-4">
        <div class="service-card">
          <div class="service-card-media"><img src="${escapeHtml(serviceImage)}" alt="${escapeHtml(displayName)}"></div>
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

  const $document = $(document);
  if (typeof $document.off === 'function') {
    $document.off('click', '.js-view-service');
  }
  if (typeof $document.on === 'function') {
    $document.on('click', '.js-view-service', async function () {
      await openServiceDetails($(this).data('id'));
    });
  }
}

function publicServiceName(name) {
  const serviceNames = {
    'Karaoke Rental': 'JBL Karaoke Rental',
    'Sweet Corner': 'Sweet Corner Setup',
    'Balloon Decoration': 'Balloon Decorations'
  };
  return serviceNames[name] || name;
}

function publicServiceVisual(name) {
  const serviceImages = {
    'Karaoke Rental': 'images/defaults/karaoke-service.jpg',
    'JBL Karaoke Rental': 'images/defaults/karaoke-service.jpg',
    'Sweet Corner': 'images/defaults/sweet-corner-service.jpg',
    'Sweet Corner Setup': 'images/defaults/sweet-corner-service.jpg',
    'Balloon Decoration': 'images/defaults/balloon-service.jpg',
    'Balloon Decorations': 'images/defaults/balloon-service.jpg'
  };
  return serviceImages[name] || '';
}

function serviceGalleryKeywords(name) {
  if (/karaoke/i.test(name || '')) return ['karaoke'];
  if (/sweet|dessert/i.test(name || '')) return ['sweet', 'dessert'];
  if (/balloon|decoration/i.test(name || '')) return ['balloon', 'decoration'];
  return [name || ''];
}

function publicGalleryVisual(keywords, fallback = '') {
  const terms = (keywords || []).map(term => String(term).toLowerCase()).filter(Boolean);
  const match = publicGalleryCache().find(item => {
    const title = String(item.title || '').toLowerCase();
    return terms.some(term => title.includes(term));
  });
  return safeWebUrl(match?.image) || fallback;
}

async function openServiceDetails(serviceId) {
  const cachedService = publicServicesCache().find(item => String(item.service_id) === String(serviceId));
  const s = { ...(cachedService || {}), ...(await resolveApiValue(() => API.getService(serviceId), {})) };
  if (!s || (!s.name && !cachedService)) return;
  const displayName = publicServiceName(s.name || cachedService?.name || 'Service');
  $('#serviceModalLabel').text(displayName);
  $('#serviceModalBody').html(`
    <img src="${escapeHtml(safeWebUrl(publicServicePresentationValue(s, 'service_images') || s.image || cachedService?.image))}" alt="${escapeHtml(displayName)}" class="w-100 mb-3" style="border-radius:8px;aspect-ratio:16/9;object-fit:cover;">
    <p class="mb-0 text-muted">Contact our staff to confirm current package options, inclusions, and pricing for this service.</p>
  `);
  new bootstrap.Modal('#serviceModal').show();
}

async function renderGallery() {
  const cached = publicGalleryCache();
  const images = cached;
  const $wrap = $('#galleryGrid').empty();
  const shown = images.slice(0, 6);
  $('#galleryCarousel').toggle(shown.length > 0);
  [...shown, ...shown].forEach((img, index) => {
    $wrap.append(`
      <div class="gallery-slide" onmouseenter="pauseGalleryCarousel()" onmouseleave="startGalleryCarousel()" aria-hidden="${index >= shown.length ? 'true' : 'false'}">
        <div class="gallery-item">
          <img src="${escapeHtml(safeWebUrl(img.image))}" alt="${escapeHtml(img.title)}">
          <div class="gallery-caption">${escapeHtml(img.title)}</div>
        </div>
      </div>`);
  });
  galleryCarouselOffset = 0;
  galleryCarouselLastFrame = 0;
  startGalleryCarousel();
  $('#featuredSetupImage').attr('src', publicGalleryVisual(['sweet', 'dessert'], 'images/defaults/featured-sweet-corner.jpg'));
  $('#contactFeatureImage').attr('src', safeWebUrl(publicContentCache().contact_image) || publicGalleryVisual(['balloon', 'celebration'], 'images/defaults/contact-celebration.jpg'));
}

let galleryCarouselFrame = null;
let galleryCarouselOffset = 0;
let galleryCarouselLastFrame = 0;
let galleryCarouselPaused = false;
let galleryCarouselShiftTimer = null;

function startGalleryCarousel() {
  if (galleryCarouselFrame !== null) window.cancelAnimationFrame?.(galleryCarouselFrame);
  galleryCarouselFrame = null;
  galleryCarouselPaused = false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof window.requestAnimationFrame !== 'function' || typeof document.getElementById !== 'function') return;
  const track = document.getElementById('galleryGrid');
  if (!track || track.children.length < 2) return;
  track.style.transition = 'none';
  galleryCarouselLastFrame = 0;
  galleryCarouselFrame = window.requestAnimationFrame(animateGalleryCarousel);
}

function pauseGalleryCarousel() {
  galleryCarouselPaused = true;
  if (galleryCarouselFrame !== null) window.cancelAnimationFrame?.(galleryCarouselFrame);
  galleryCarouselFrame = null;
  galleryCarouselLastFrame = 0;
}

function shiftGalleryCarousel(direction) {
  const track = document.getElementById('galleryGrid');
  const firstSlide = track?.firstElementChild;
  if (!track || !firstSlide || track.children.length < 2) return;

  if (galleryCarouselShiftTimer !== null) window.clearTimeout(galleryCarouselShiftTimer);
  pauseGalleryCarousel();

  const styles = window.getComputedStyle?.(track);
  const gap = Number.parseFloat(styles?.columnGap || styles?.gap || '0') || 0;
  const step = firstSlide.getBoundingClientRect().width + gap;
  const loopWidth = track.scrollWidth / 2;

  // Before moving backwards past the first copy, silently switch to the
  // identical position in the duplicate set. The visible slide does not move.
  if (direction < 0 && loopWidth > 0 && galleryCarouselOffset + step > 0) {
    galleryCarouselOffset -= loopWidth;
    track.style.transition = 'none';
    track.style.transform = `translate3d(${galleryCarouselOffset}px,0,0)`;
    void track.offsetWidth;
  }

  galleryCarouselOffset += direction < 0 ? step : -step;
  track.style.transition = 'transform .48s cubic-bezier(.22,.7,.2,1)';
  track.style.transform = `translate3d(${galleryCarouselOffset}px,0,0)`;
  galleryCarouselShiftTimer = window.setTimeout(() => {
    galleryCarouselShiftTimer = null;
    // After moving into the duplicate set, silently return to its matching
    // position in the first set so both arrows can continue forever.
    if (loopWidth > 0) {
      while (galleryCarouselOffset <= -loopWidth) galleryCarouselOffset += loopWidth;
      while (galleryCarouselOffset > 0) galleryCarouselOffset -= loopWidth;
      track.style.transition = 'none';
      track.style.transform = `translate3d(${galleryCarouselOffset}px,0,0)`;
    }
    startGalleryCarousel();
  }, 500);
}

function animateGalleryCarousel(timestamp) {
  if (galleryCarouselPaused) return;
  const track = document.getElementById('galleryGrid');
  if (!track) return;
  if (galleryCarouselLastFrame) galleryCarouselOffset -= (timestamp - galleryCarouselLastFrame) * 0.032;
  galleryCarouselLastFrame = timestamp;
  const loopWidth = track.scrollWidth / 2;
  if (loopWidth > 0 && galleryCarouselOffset <= -loopWidth) galleryCarouselOffset += loopWidth;
  track.style.transform = `translate3d(${galleryCarouselOffset}px,0,0)`;
  if (!galleryCarouselPaused) galleryCarouselFrame = window.requestAnimationFrame(animateGalleryCarousel);
}

async function renderContact() {
  const cached = publicContentCache();
  const c = cached;
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
  const bookingLink = document.getElementById('howFacebookLink');
  if (bookingLink) {
    bookingLink.hidden = !facebook;
    if (facebook) bookingLink.setAttribute('href', facebook);
    else bookingLink.removeAttribute('href');
  }
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
