/**
 * app.js
 * Wires up the public landing page: pulls website_content, services,
 * gallery from the API layer and renders them, plus handles the
 * inquiry/booking modal (availability check + totals + submit).
 */
$(function () {
  applySiteAppearance();
  renderSiteChrome();
  renderHero();
  renderAbout();
  renderServices();
  renderGallery();
  renderContact();
  initBookingForm();

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
  const name = content.business_name || CONFIG.businessNameFallback;
  $('.js-business-name').text(name);
  document.title = name + " | Event Rentals & Styling";
}

function renderHero() {
  const c = API.getWebsiteContent();
  $('#heroTitle').text(c.hero_title || "");
  $('#heroDesc').text(c.hero_description || "");
  $('#heroImage').attr('src', c.hero_image || "");
  $('.js-hero-btn-text').text(c.hero_button_text || "Book Now");
}

function renderAbout() {
  const c = API.getWebsiteContent();
  $('#aboutTitle').text(c.about_title || "");
  $('#aboutDesc').text(c.about_description || "");
}

function renderServices() {
  const services = API.getActiveServices();
  const categories = API.getCategories();
  const $wrap = $('#servicesGrid').empty();

  if (!services.length) {
    $wrap.append('<p class="text-muted">Services coming soon.</p>');
    return;
  }

  services.forEach(s => {
    const cat = categories.find(c => c.category_id === s.category_id);
    const card = `
      <div class="col-md-6 col-lg-4">
        <div class="service-card">
          <img src="${s.image}" alt="${escapeHtml(s.name)}">
          <div class="service-card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h3>${escapeHtml(s.name)}</h3>
              ${s.featured ? '<span class="badge-featured">Popular</span>' : ''}
            </div>
            ${cat ? `<div class="mb-2"><span class="text-muted" style="font-size:0.8rem;">${escapeHtml(cat.name)}</span></div>` : ''}
            <p class="desc">${escapeHtml(s.description)}</p>
            <div class="price">${BookingCalc.formatCurrency(s.price)} <small>${escapeHtml(s.price_label || '')}</small></div>
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

function openServiceDetails(serviceId) {
  const s = API.getService(serviceId);
  if (!s) return;
  const addons = API.getAddonsForService(serviceId);
  const inclusions = (s.inclusions || []).map(i => `<li>${escapeHtml(i)}</li>`).join('');
  const addonsHtml = addons.length
    ? `<h6 class="mt-3">Optional Add-ons</h6><ul>${addons.map(a => `<li>${escapeHtml(a.name)} — ${BookingCalc.formatCurrency(a.price)}</li>`).join('')}</ul>`
    : '';

  $('#serviceModalLabel').text(s.name);
  $('#serviceModalBody').html(`
    <img src="${s.image}" class="w-100 mb-3" style="border-radius:8px;aspect-ratio:16/9;object-fit:cover;">
    <p>${escapeHtml(s.description)}</p>
    <div class="fw-bold text-primary-custom mb-2" style="color:var(--color-primary);">${BookingCalc.formatCurrency(s.price)} <small class="text-muted fw-normal">${escapeHtml(s.price_label || '')}</small></div>
    <h6>What's Included</h6>
    <ul>${inclusions || '<li>Contact us for full inclusions</li>'}</ul>
    ${addonsHtml}
  `);
  $('#serviceModalBookBtn').data('id', serviceId);
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
          <img src="${img.image}" alt="${escapeHtml(img.title)}">
          <div class="gallery-caption">${escapeHtml(img.title)}</div>
        </div>
      </div>`);
  });
}

function renderContact() {
  const c = API.getWebsiteContent();
  $('#contactPhone').text(c.contact_phone || '');
  $('#contactEmail').text(c.contact_email || '').attr('href', 'mailto:' + (c.contact_email || ''));
  $('#contactPhone').attr('href', 'tel:' + (c.contact_phone || '').replace(/[^0-9+]/g, ''));
  $('#contactAddress').text(c.contact_address || '');
  $('.js-fb-link').attr('href', c.contact_facebook || '#');
  $('.js-ig-link').attr('href', c.contact_instagram || '#');
  $('.js-footer-phone').text(c.contact_phone || '');
  $('.js-footer-email').text(c.contact_email || '');
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/* =========================================================
 * BOOKING / INQUIRY FORM
 * ========================================================= */
function initBookingForm() {
  populateServiceChecklist();
  setMinBookingDate();

  $('#serviceModalBookBtn').on('click', function () {
    const id = $(this).data('id');
    bootstrap.Modal.getInstance(document.getElementById('serviceModal'))?.hide();
    setTimeout(() => {
      new bootstrap.Modal('#bookingModal').show();
      $(`.js-service-check[value="${id}"]`).prop('checked', true).trigger('change');
    }, 300);
  });

  $(document).on('change', '.js-service-check', function () {
    $(this).closest('.service-check-card').toggleClass('selected', this.checked);
    renderAddonOptions();
    updateBookingSummary();
    checkAllAvailability();
  });

  $(document).on('change', '.js-addon-check, #bookingDate, #bookingStart, #bookingEnd', function () {
    updateBookingSummary();
    checkAllAvailability();
  });

  $('#bookingForm').on('submit', function (e) {
    e.preventDefault();
    submitBooking();
  });

  $('#bookingModal').on('hidden.bs.modal', function () {
    resetBookingForm();
  });
}

function setMinBookingDate() {
  const settings = API.getSettings();
  const noticeDays = settings.min_booking_notice_days || 2;
  const min = new Date();
  min.setDate(min.getDate() + Number(noticeDays));
  $('#bookingDate').attr('min', min.toISOString().slice(0, 10));
}

function populateServiceChecklist() {
  const services = API.getActiveServices();
  const $wrap = $('#serviceChecklist').empty();
  services.forEach(s => {
    $wrap.append(`
      <div class="col-md-6">
        <label class="service-check-card d-flex align-items-center gap-2 mb-0">
          <input type="checkbox" class="js-service-check form-check-input mt-0" value="${s.service_id}">
          <span class="flex-fill">
            <strong>${escapeHtml(s.name)}</strong><br>
            <small class="text-muted">${BookingCalc.formatCurrency(s.price)} ${escapeHtml(s.price_label || '')}</small>
          </span>
        </label>
      </div>`);
  });
}

function getSelectedServiceIds() {
  return $('.js-service-check:checked').map(function () { return this.value; }).get();
}
function getSelectedAddonIds() {
  return $('.js-addon-check:checked').map(function () { return this.value; }).get();
}

function renderAddonOptions() {
  const serviceIds = getSelectedServiceIds();
  const $wrap = $('#addonChecklist').empty();
  let addons = [];
  serviceIds.forEach(id => { addons = addons.concat(API.getAddonsForService(id)); });

  if (!addons.length) {
    $('#addonSection').hide();
    return;
  }
  $('#addonSection').show();
  addons.forEach(a => {
    $wrap.append(`
      <div class="col-md-6">
        <label class="d-flex align-items-center gap-2">
          <input type="checkbox" class="js-addon-check form-check-input mt-0" value="${a.addon_id}">
          <span>${escapeHtml(a.name)} — ${BookingCalc.formatCurrency(a.price)}</span>
        </label>
      </div>`);
  });
}

function updateBookingSummary() {
  const serviceIds = getSelectedServiceIds();
  const addonIds = getSelectedAddonIds();
  const { subtotal, addonsTotal, total } = BookingCalc.computeTotals(serviceIds, addonIds, 0, 0);
  $('#sumSubtotal').text(BookingCalc.formatCurrency(subtotal));
  $('#sumAddons').text(BookingCalc.formatCurrency(addonsTotal));
  $('#sumTotal').text(BookingCalc.formatCurrency(total));
  $('#bookingSummaryBox').toggle(serviceIds.length > 0);
}

function checkAllAvailability() {
  const serviceIds = getSelectedServiceIds();
  const date = $('#bookingDate').val();
  const start = $('#bookingStart').val();
  const end = $('#bookingEnd').val();
  const $status = $('#availabilityStatus');

  if (!serviceIds.length || !date || !start || !end) {
    $status.html('');
    return;
  }
  if (start >= end) {
    $status.html('<span class="availability-pill unavailable"><i class="bi bi-exclamation-circle"></i> End time must be after start time</span>');
    return;
  }

  const conflicts = serviceIds.filter(id => !API.checkAvailability(id, date, start, end).available);
  if (conflicts.length) {
    $status.html('<span class="availability-pill unavailable"><i class="bi bi-x-circle"></i> Already Booked / Unavailable for this date & time</span>');
    $('#bookingSubmitBtn').prop('disabled', true);
  } else {
    $status.html('<span class="availability-pill available"><i class="bi bi-check-circle"></i> Available</span>');
    $('#bookingSubmitBtn').prop('disabled', false);
  }
}

function submitBooking() {
  const serviceIds = getSelectedServiceIds();
  if (!serviceIds.length) { alert('Please select at least one service.'); return; }

  const date = $('#bookingDate').val();
  const start = $('#bookingStart').val();
  const end = $('#bookingEnd').val();
  const conflicts = serviceIds.filter(id => !API.checkAvailability(id, date, start, end).available);
  if (conflicts.length) { alert('One of the selected services is unavailable for that date/time.'); return; }

  const addonIds = getSelectedAddonIds();
  const { subtotal, addonsTotal, total } = BookingCalc.computeTotals(serviceIds, addonIds, 0, 0);

  const data = {
    customer_name: $('#custName').val().trim(),
    contact: $('#custContact').val().trim(),
    email: $('#custEmail').val().trim(),
    customer_type: "Guest / No Account",
    event_type: $('#eventType').val(),
    event_date: date,
    start_time: start,
    end_time: end,
    location: $('#eventLocation').val().trim(),
    guests: Number($('#eventGuests').val() || 0),
    special_requests: $('#specialRequests').val().trim(),
    service_ids: serviceIds,
    addon_ids: addonIds,
    discount: 0,
    fees: 0,
    subtotal, addons_total: addonsTotal, total,
    amount_paid: 0,
    source: "Website"
  };

  const booking = API.createBooking(data);
  bootstrap.Modal.getInstance(document.getElementById('bookingModal'))?.hide();
  $('#confirmBookingId').text(booking.id);
  new bootstrap.Modal('#bookingConfirmModal').show();
}

function resetBookingForm() {
  $('#bookingForm')[0].reset();
  $('.js-service-check').prop('checked', false);
  $('.service-check-card').removeClass('selected');
  $('#addonSection').hide();
  $('#availabilityStatus').html('');
  $('#bookingSummaryBox').hide();
  $('#bookingSubmitBtn').prop('disabled', false);
}
