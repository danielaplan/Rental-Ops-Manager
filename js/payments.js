/**
 * payments.js
 * Small helpers around recording payments and computing balances,
 * shared by admin/payments.html and the booking detail modal in
 * admin/bookings.html.
 */
const PaymentsHelper = {
  pendingAmountsByBooking() {
    const pending = new Map();
    API.getPayments().forEach(payment => {
      if (!payment.pending_sync) return;
      const key = String(payment.booking_id);
      pending.set(key, (pending.get(key) || 0) + Number(payment.amount || 0));
    });
    return pending;
  },

  acceptedAmountPaid(booking, pendingAmounts) {
    const recorded = Number(booking.amount_paid || 0);
    const amounts = pendingAmounts || PaymentsHelper.pendingAmountsByBooking();
    const pending = amounts.get(String(booking.id)) || 0;
    return Math.max(recorded - pending, 0);
  },

  paymentStatus(booking, pendingAmounts) {
    const total = Number(booking.total || 0);
    const paid = PaymentsHelper.acceptedAmountPaid(booking, pendingAmounts);
    if (total > 0 && paid >= total) return 'Fully Paid';
    if (paid > 0) return 'Partial';
    return 'Unpaid';
  },

  remainingBalance(booking, pendingAmounts) {
    return Math.max(Number(booking.total || 0) - PaymentsHelper.acceptedAmountPaid(booking, pendingAmounts), 0);
  },

  recordPayment(bookingId, amount, method, notes) {
    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) return null;
    return API.createPayment({
      booking_id: bookingId,
      amount: paymentAmount,
      method: method,
      notes: notes || ""
    });
  },

  renderHistory(bookingId, containerSelector) {
    const payments = API.getPayments().filter(payment => String(payment.booking_id) === String(bookingId));
    const $wrap = $(containerSelector).empty();
    if (!payments.length) {
      $wrap.append('<p class="text-muted small mb-0">No payments recorded yet.</p>');
      return;
    }
    const rows = payments.map(p => `
      <tr>
        <td>${BookingCalc.formatDate(p.date)}</td>
        <td>${BookingCalc.formatCurrency(p.amount)}</td>
        <td>${escapeHtmlA(PaymentsHelper.methodLabel(p.method))}</td>
        <td class="text-muted">${escapeHtmlA(p.notes || '')}</td>
        <td>${p.pending_sync ? '<span class="badge bg-warning text-dark">Pending Sync</span>' : '<span class="badge bg-success">Recorded</span>'}</td>
      </tr>`).join('');
    $wrap.append(`<table class="table table-sm mb-0"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Notes</th><th>Sync</th></tr></thead><tbody>${rows}</tbody></table>`);
  },

  methodLabel(method) {
    const normalized = String(method || '').toLowerCase();
    if (normalized === 'gcash') return 'GCash';
    if (['maribank', 'bank transfer'].includes(normalized)) return 'MariBank';
    return method || 'Not recorded';
  }
};
