/**
 * calendar.js
 * Renders a month-grid calendar of bookings for admin/calendar.html.
 */
const CalendarHelper = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),

  render(containerSelector, onBookingClick) {
    const bookings = API.getBookings();
    const year = this.currentYear, month = this.currentMonth;
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthLabel = firstDay.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

    $('.js-calendar-label').text(monthLabel);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = '<div class="calendar-grid d-grid" style="grid-template-columns:repeat(7,1fr);gap:6px;">';
    dayNames.forEach(d => { html += `<div class="text-center fw-bold text-muted small py-1">${d}</div>`; });

    for (let i = 0; i < startOffset; i++) html += '<div></div>';

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.event_date === dateStr && b.status !== 'Cancelled' && b.status !== 'Rejected');
      const isToday = dateStr === new Date().toISOString().slice(0, 10);

      html += `<div class="border rounded p-1" style="min-height:90px;background:${isToday ? 'rgba(31,78,69,0.06)' : '#fff'};">
        <div class="small fw-bold ${isToday ? 'text-primary' : 'text-muted'}">${day}</div>`;
      dayBookings.slice(0, 3).forEach(b => {
        const color = CONFIG.bookingStatusColors[b.status] || 'secondary';
        html += `<div class="js-cal-booking badge bg-${color} d-block text-truncate mb-1" style="cursor:pointer;font-weight:400;text-align:left;" data-id="${b.id}" title="${escapeHtmlA(b.customer_name)}">${escapeHtmlA(b.customer_name)}</div>`;
      });
      if (dayBookings.length > 3) html += `<div class="small text-muted">+${dayBookings.length - 3} more</div>`;
      html += `</div>`;
    }
    html += '</div>';
    $(containerSelector).html(html);

    $(containerSelector).off('click', '.js-cal-booking').on('click', '.js-cal-booking', function () {
      if (onBookingClick) onBookingClick($(this).data('id'));
    });
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
  },
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
  }
};
