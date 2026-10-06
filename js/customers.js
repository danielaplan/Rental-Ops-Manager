/**
 * customers.js
 * Thin helper wrapper around API.getCustomers() for the admin
 * customers page (search/filter convenience).
 */
const CustomersHelper = {
  renderVersion: 0,
  async search(query, requestVersion = ++this.renderVersion) {
    const q = (query || "").toLowerCase().trim();
    const list = await API.getCustomers();
    if (requestVersion !== this.renderVersion) return [];
    if (!q) return list;
    return list.filter(c =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.contact || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  }
};
