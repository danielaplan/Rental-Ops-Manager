/**
 * inventory.js
 * Helpers for rendering rental item checklists, release checklist,
 * and return inspection - used inside admin/bookings.html and
 * admin/inventory.html.
 */
const InventoryHelper = {
  renderChecklist(bookingId, containerSelector, mode) {
    const items = API.getBookingItems(bookingId);
    const $wrap = $(containerSelector).empty();
    if (!items.length) {
      $wrap.append('<p class="text-muted">No rental items linked to this booking\'s services.</p>');
      return;
    }

    items.forEach(it => {
      if (mode === 'release') {
        $wrap.append(`
          <div class="checklist-row ${it.checked_released ? 'checked' : ''}" data-item="${it.booking_item_id}">
            <input type="checkbox" class="form-check-input js-release-check" ${it.checked_released ? 'checked' : ''}>
            <span class="item-name">${escapeHtmlA(it.name)} ${it.required ? '<span class="text-danger">*</span>' : ''}</span>
            <span class="text-muted">× ${it.expected_qty}</span>
          </div>`);
      } else if (mode === 'return') {
        const saved=it.inspected || !!it.condition;
        const returned=saved ? (it.returned_qty ?? 0) : it.expected_qty;
        const condition=saved ? it.condition : 'Good';
        const controlId='return-'+String(it.booking_item_id).replace(/[^a-zA-Z0-9_-]/g,'');
        $wrap.append(`
          <div class="checklist-row return-row" data-item="${it.booking_item_id}">
            <span class="item-name">${escapeHtmlA(it.name)}</span>
            <span class="text-muted small">Expected: ${it.expected_qty}</span>
            <div><label class="small" for="${controlId}-qty">Returned quantity</label><input id="${controlId}-qty" type="number" min="0" max="${it.expected_qty}" step="1" required class="form-control form-control-sm js-return-qty" value="${returned}"></div>
            <div><label class="small" for="${controlId}-condition">Condition</label><select id="${controlId}-condition" class="form-select form-select-sm js-return-condition">
              ${CONFIG.itemConditions.map(c => `<option ${c === condition ? 'selected' : ''}>${c}</option>`).join('')}
            </select></div>
            <div><label class="small" for="${controlId}-notes">Notes</label><input id="${controlId}-notes" type="text" maxlength="2000" class="form-control form-control-sm js-return-notes" value="${escapeHtmlA(it.notes||'')}"></div>
            ${Number(returned)<Number(it.expected_qty)?'<span class="text-danger small">Quantity shortfall</span>':''}
          </div>`);
      } else {
        $wrap.append(`
          <div class="checklist-row">
            <span class="item-name">${escapeHtmlA(it.name)}</span>
            <span class="text-muted">× ${it.expected_qty}</span>
            ${it.required ? '<span class="badge bg-secondary">Required</span>' : ''}
          </div>`);
      }
    });

    if (mode === 'release') this.updateReleaseProgress(containerSelector);
  },

  updateReleaseProgress(containerSelector) {
    const $rows = $(containerSelector).find('.checklist-row');
    const total = $rows.length;
    const checked = $rows.filter((i, el) => $(el).find('.js-release-check').is(':checked')).length;
    $('.js-release-progress').text(`${checked} / ${total} Items Checked`);
    $('.js-release-ready').toggle(checked === total && total > 0);
    $('.js-confirm-release-btn').prop('disabled', !(checked === total && total > 0));
  },

  collectReturnResults(containerSelector) {
    const results = [];
    $(containerSelector).find('.checklist-row').each(function () {
      const itemId = $(this).data('item');
      const items = STORAGE.getAll('bookingItems');
      const bi = items.find(x => String(x.booking_item_id) === String(itemId));
      results.push({
        booking_item_id: itemId,
        rental_item_id: bi ? bi.rental_item_id : null,
        name: bi ? bi.name : '',
        expected_qty: bi ? bi.expected_qty : 0,
        returned_qty: Number($(this).find('.js-return-qty').val() || 0),
        condition: $(this).find('.js-return-condition').val(),
        notes: $(this).find('.js-return-notes').val()
      });
    });
    return results;
  },

  summarizeReturn(results) {
    const totalExpected = results.reduce((s, r) => s + Number(r.expected_qty), 0);
    const totalReturned = results.reduce((s, r) => s + Number(r.returned_qty), 0);
    const missing = results.reduce((sum,r)=>sum+Math.max(Number(r.expected_qty)-Number(r.returned_qty),r.condition==='Missing'?Number(r.expected_qty):0),0);
    const damaged = results.filter(r => r.condition === 'Damaged' || r.condition === 'Minor Damage').length;
    const good = results.filter(r => r.condition === 'Good').length;
    return { totalExpected, totalReturned, missing, damaged, good };
  }
};
