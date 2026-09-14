/**
 * payments.js
 * Small helpers around recording payments and computing balances,
 * shared by admin/payments.html and the booking detail modal in
 * admin/bookings.html.
 */
const PaymentsHelper = {
  remainingBalance(booking) {
    return Math.max(Number(booking.total || 0) - Number(booking.amount_paid || 0), 0);
  },

  recordPayment(bookingId, amount, method, notes) {
    if (!amount || amount <= 0) return null;
    return API.createPayment({
      booking_id: bookingId,
      amount: Number(amount),
      method: method,
      notes: notes || ""
    });
  },

  renderHistory(bookingId, containerSelector) {
    const payments = API.getPaymentsForBooking(bookingId);
    const $wrap = $(containerSelector).empty();
    if (!payments.length) {
      $wrap.append('<p class="text-muted small mb-0">No payments recorded yet.</p>');
      return;
    }
    const rows = payments.map(p => `
      <tr>
        <td>${BookingCalc.formatDate(p.date)}</td>
        <td>${BookingCalc.formatCurrency(p.amount)}</td>
        <td>${p.method}</td>
        <td class="text-muted">${escapeHtmlA(p.notes || '')}</td>
      </tr>`).join('');
    $wrap.append(`<table class="table table-sm mb-0"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
};
