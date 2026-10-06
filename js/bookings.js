/**
 * bookings.js
 * Shared booking math + helpers used by both the public inquiry form
 * and the admin manual-booking / edit-booking screens.
 */
const BookingCalc = {
  /**
   * @param {string[]} serviceIds
   * @param {string[]} addonIds
   * @param {number} discount
   * @param {number} fees
   */
  async computeTotals(serviceIds, addonIds, discount, fees, loadedServices, loadedAddons) {
    const ids = Array.isArray(serviceIds) ? serviceIds : [];
    const extra = Array.isArray(addonIds) ? addonIds : [];
    const services = Array.isArray(loadedServices) ? loadedServices : await API.getServices();
    const addons = Array.isArray(loadedAddons) ? loadedAddons : await API.getAddons();

    const subtotal = ids.reduce((sum, id) => {
      const s = services.find(x => x.service_id === id);
      return sum + (s ? Number(s.price) : 0);
    }, 0);

    const addonsTotal = extra.reduce((sum, id) => {
      const a = addons.find(x => x.addon_id === id);
      return sum + (a ? Number(a.price) : 0);
    }, 0);

    const total = Math.max(subtotal + addonsTotal - Number(discount || 0) + Number(fees || 0), 0);

    return { subtotal, addonsTotal, total };
  },

  formatCurrency(amount) {
    const n = Number(amount || 0);
    return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  },

  formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
  },

  formatTime(t) {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  },

  statusBadge(status, map) {
    const color = map[status] || "secondary";
    return `<span class="badge bg-${color}">${status}</span>`;
  }
};
