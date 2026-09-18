/**
 * customers.js
 * Thin helper wrapper around API.getCustomers() for the admin
 * customers page (search/filter convenience).
 */
const CustomersHelper = {
  search(query) {
    const q = (query || "").toLowerCase().trim();
    const list = API.getCustomers();
    if (!q) return list;
    return list.filter(c =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.contact || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  }
};
