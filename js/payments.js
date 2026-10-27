/**
 * payments.js
 * Small helpers around recording payments and computing balances,
 * shared by admin/payments.html and the booking detail modal in
 * admin/bookings.html.
 */
const PaymentsHelper = {
  paymentTimestamp(date = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  },

  async pendingAmountsByBooking() {
    const pending = new Map();
    // Offline-created payments live in the sync queue, not the server table.
    const queue = API.getSyncQueue();
    queue.forEach(op => {
      if (op.entity !== 'payments' || op.action !== 'create' || op.status === 'synced') return;
      const bookingId = op.data?.booking_id;
      if (bookingId === null || bookingId === undefined || bookingId === '') return;
      const bid = String(bookingId);
      const amount = Number(op.data?.amount || 0);
      pending.set(bid, (pending.get(bid) || 0) + amount);
    });
    // Also surface server-side pending_sync rows for completeness.
    const payments = await API.getPayments();
    payments.forEach(payment => {
      if (payment.sync_status !== 'pending_sync') return;
      const key = String(payment.booking_id);
      pending.set(key, (pending.get(key) || 0) + Number(payment.amount || 0));
    });
    return pending;
  },

  async acceptedAmountPaid(booking, pendingAmounts) {
    const recorded = Number(booking.amount_paid || 0);
    const amounts = pendingAmounts && typeof pendingAmounts.then === 'function' ? await pendingAmounts : pendingAmounts || await PaymentsHelper.pendingAmountsByBooking();
    const pending = amounts.get(String(booking.id)) || 0;
    return Math.max(recorded - pending, 0);
  },

  async paymentStatus(booking, pendingAmounts) {
    const total = Number(booking.total || 0);
    const paid = await PaymentsHelper.acceptedAmountPaid(booking, pendingAmounts);
    if (total > 0 && paid >= total) return 'Fully Paid';
    if (paid > 0) return 'Partial';
    return 'Unpaid';
  },

  async remainingBalance(booking, pendingAmounts) {
    return Math.max(Number(booking.total || 0) - await PaymentsHelper.acceptedAmountPaid(booking, pendingAmounts), 0);
  },

  recordPayment(bookingId, amount, method, notes, details = {}) {
    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) return Promise.resolve(null);
    return API.createPayment({
      booking_id: bookingId,
      amount: paymentAmount,
      method: method,
      notes: notes || "",
      // The sync queue validates this field before it can be sent. Manual
      // bookings do not provide one, so give every newly recorded payment a
      // valid local timestamp unless a caller deliberately supplies one.
      payment_date: PaymentsHelper.paymentTimestamp(),
      ...details
    });
  },

  async renderHistory(bookingId, containerSelector, isCurrent = () => true) {
    const payments = (await API.getPayments()).filter(payment => String(payment.booking_id) === String(bookingId));
    if (!isCurrent()) return;
    const $wrap = $(containerSelector).empty();
    if (!payments.length) {
      $wrap.append('<p class="text-muted small mb-0">No payments recorded yet.</p>');
      return;
    }
    const rows = payments.map(p => `
      <tr>
        <td>${BookingCalc.formatDate(p.date)}</td>
        <td>${BookingCalc.formatCurrency(p.amount)}</td>
        <td>${escapeHtmlA(PaymentsHelper.methodLabel(p.method))}<br><small>${escapeHtmlA(p.payment_type || '')}</small></td>
        <td class="text-muted">${escapeHtmlA(p.notes || '')}</td>
        <td>${badgeStatus(p.payment_status || 'Completed',{Completed:'success',Pending:'warning',Failed:'danger'})}${p.pending_sync ? '<br><span class="badge bg-warning text-dark">Pending Sync</span>' : ''}</td>
        <td><button type="button" class="btn btn-sm btn-outline-secondary js-correct-payment" data-id="${escapeHtmlA(p.payment_id)}" ${p.pending_sync ? 'disabled title="Wait for this payment to sync before correcting it"' : ''}>Correct</button></td>
      </tr>`).join('');
    $wrap.append(`<table class="table table-sm mb-0"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Notes</th><th>Sync</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`);
  },

  methodLabel(method) {
    const normalized = String(method || '').toLowerCase();
    if (normalized === 'gcash') return 'GCash';
    if (['maribank', 'bank transfer'].includes(normalized)) return 'MariBank';
    return method || 'Not recorded';
  }
};
