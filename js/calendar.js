/**
 * calendar.js
 * Renders a month-grid calendar of bookings for admin/calendar.html.
 */
const CalendarHelper = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),

  render(containerSelector, onBookingClick) {
    const bookings = API.getBookings();
    const byDate=new Map(),services=new Map(API.getServices().map(s=>[s.service_id,s.name]));
    bookings.forEach(b=>{if(!['Cancelled','Rejected'].includes(b.status)){const day=byDate.get(b.event_date)||[];day.push(b);byDate.set(b.event_date,day);}});
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
      const dayBookings = byDate.get(dateStr)||[];
      const isToday = dateStr === new Date().toISOString().slice(0, 10);

      html += `<div class="border rounded p-1" style="min-height:90px;background:${isToday ? 'rgba(31,78,69,0.06)' : '#fff'};">
        <div class="small fw-bold ${isToday ? 'text-primary' : 'text-muted'}">${day}</div>`;
      dayBookings.forEach((b,index) => {
        const color = CONFIG.bookingStatusColors[b.status] || 'secondary';
        const service=(b.service_ids||[]).map(id=>services.get(id)||id).join(', ');
        html += `<button type="button" class="js-cal-booking badge bg-${color} d-block text-truncate mb-1 w-100 border-0 ${index>=3?'cal-extra':''}" ${index>=3?'hidden':''} style="font-weight:400;text-align:left;" data-date="${dateStr}" data-id="${b.id}" aria-label="${escapeHtmlA(b.customer_name+', '+service+', '+b.status+', '+b.start_time)}">${escapeHtmlA(b.customer_name)}<br>${escapeHtmlA(service)} · ${escapeHtmlA(b.status)}</button>`;
      });
      if (dayBookings.length > 3) html += `<button type="button" class="js-cal-more btn btn-sm p-0" data-date="${dateStr}" aria-expanded="false">+${dayBookings.length - 3} more</button>`;
      html += `</div>`;
    }
    html += '</div>';
    $(containerSelector).html(html);

    $(containerSelector).off('click', '.js-cal-booking').on('click', '.js-cal-booking', function () {
      if (onBookingClick) onBookingClick($(this).data('id'));
    });
    $(containerSelector).off('click','.js-cal-more').on('click','.js-cal-more',function(){
      const expanded=this.getAttribute('aria-expanded')==='true';
      this.setAttribute('aria-expanded',String(!expanded));
      $(containerSelector).find('.cal-extra').filter((i,el)=>el.dataset.date===this.dataset.date).prop('hidden',expanded);
      this.textContent=expanded?'Show more':'Show fewer';
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
