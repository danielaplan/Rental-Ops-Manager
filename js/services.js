/**
 * services.js
 * Small service-related presentation helpers shared by the public
 * site. Core CRUD lives in api.js; this file is just formatting
 * sugar so app.js stays focused on wiring up the DOM.
 */
const ServicesHelper = {
  async categoryName(categoryId) {
    const categories = await API.getCategories();
    const cat = categories.find(c => c.category_id === categoryId);
    return cat ? cat.name : "";
  },
  async activeAddonsFor(serviceId) {
    return await API.getAddonsForService(serviceId);
  }
};
