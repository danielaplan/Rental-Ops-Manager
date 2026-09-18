/**
 * services.js
 * Small service-related presentation helpers shared by the public
 * site. Core CRUD lives in api.js; this file is just formatting
 * sugar so app.js stays focused on wiring up the DOM.
 */
const ServicesHelper = {
  categoryName(categoryId) {
    const cat = API.getCategories().find(c => c.category_id === categoryId);
    return cat ? cat.name : "";
  },
  activeAddonsFor(serviceId) {
    return API.getAddonsForService(serviceId);
  }
};
