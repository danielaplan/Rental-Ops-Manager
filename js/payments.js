/**
 * payments.js
 * Small helpers around recording payments and computing balances,
 * shared by admin/payments.html and the booking detail modal in
 * admin/bookings.html.
 */
const PaymentsHelper = {
  amountCents(value) {
    const text = String(value ?? '').trim();
    if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(text)) return null;
    const [whole, fraction = ''] = text.split('.');
    return (Number(whole) * 100) + Number(fraction.padEnd(2, '0'));
  },

  paymentTimestamp(date = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  },

  async pendingAmountsByBooking() {
    const pending = new Map();
    const countedLocalIds = new Set();
    // Offline-created payments live in the sync queue, not the server table.
    const queue = API.getSyncQueue();
    queue.forEach(op => {
      if (op.entity !== 'payments' || op.action !== 'create' || op.status === 'synced') return;
      const bookingId = op.data?.booking_id;
      if (bookingId === null || bookingId === undefined || bookingId === '') return;
      const bid = String(bookingId);
      const amount = PaymentsHelper.amountCents(op.data?.amount || 0);
      if (amount === null) return;
      const current = PaymentsHelper.amountCents(pending.get(bid) || 0) || 0;
      pending.set(bid, (current + amount) / 100);
      if (op.local_id !== null && op.local_id !== undefined) countedLocalIds.add(String(op.local_id));
    });
    // Also surface server-side pending_sync rows for completeness.
    const payments = await API.getPayments();
    payments.forEach(payment => {
      if (!payment.pending_sync || countedLocalIds.has(String(payment.payment_id))) return;
      const key = String(payment.booking_id);
      const amount = PaymentsHelper.amountCents(payment.amount || 0);
      if (amount !== null) {
        const current = PaymentsHelper.amountCents(pending.get(key) || 0) || 0;
        pending.set(key, (current + amount) / 100);
      }
    });
    return pending;
  },

  async acceptedAmountPaid(booking, pendingAmounts) {
    const recorded = PaymentsHelper.amountCents(booking.amount_paid || 0) || 0;
    const bookingId = String(booking.id ?? booking.booking_id ?? '');
    const queued = bookingId.startsWith('LOCAL-')
      ? (PaymentsHelper.amountCents(pendingAmounts?.get(bookingId) || 0) || 0)
      : 0;
    return Math.max(recorded - queued, 0) / 100;
  },

  async paymentStatus(booking, pendingAmounts) {
    const total = PaymentsHelper.amountCents(booking.total || 0) || 0;
    const paid = Math.round((await PaymentsHelper.acceptedAmountPaid(booking, pendingAmounts)) * 100);
    if (total > 0 && paid >= total) return 'Fully Paid';
    if (paid > 0) return 'Partial';
    return 'Unpaid';
  },

  async remainingBalance(booking, pendingAmounts) {
    const total = PaymentsHelper.amountCents(booking.total || 0) || 0;
    const paid = Math.round((await PaymentsHelper.acceptedAmountPaid(booking, pendingAmounts)) * 100);
    return Math.max(total - paid, 0) / 100;
  },

  async totalOutstanding(bookings, pendingAmounts) {
    let total = 0;
    for (const booking of bookings) {
      if (String(booking.status || '').toLowerCase() === 'cancelled') continue;
      total += await PaymentsHelper.remainingBalance(booking, pendingAmounts);
    }
    return total;
  },

  recordPayment(bookingId, amount, method, notes, details = {}) {
    const paymentCents = PaymentsHelper.amountCents(amount);
    if (paymentCents === null || paymentCents <= 0) return Promise.resolve(null);
    const paymentAmount = Number(`${Math.trunc(paymentCents / 100)}.${String(paymentCents % 100).padStart(2, '0')}`);
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
