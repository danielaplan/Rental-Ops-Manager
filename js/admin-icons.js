(() => {
const ADMIN_LUCIDE_ICONS = Object.freeze({
  'bi-archive': 'archive', 'bi-arrow-clockwise': 'refresh-cw', 'bi-arrow-counterclockwise': 'rotate-ccw',
  'bi-arrow-left': 'arrow-left', 'bi-bar-chart': 'chart-bar', 'bi-bar-chart-line-fill': 'chart-no-axes-column-increasing',
  'bi-bell': 'bell', 'bi-bookmark': 'bookmark', 'bi-box-arrow-right': 'log-out', 'bi-box-arrow-up-right': 'external-link',
  'bi-box-seam': 'package', 'bi-boxes': 'boxes', 'bi-calendar-check': 'calendar-check', 'bi-calendar3': 'calendar-days',
  'bi-cash-coin': 'circle-dollar-sign', 'bi-cash-stack': 'banknote', 'bi-check-circle': 'circle-check-big',
  'bi-check-circle-fill': 'circle-check-big', 'bi-check2': 'check', 'bi-check2-all': 'check-check',
  'bi-check2-circle': 'circle-check', 'bi-chevron-left': 'chevron-left', 'bi-chevron-right': 'chevron-right',
  'bi-clipboard-check': 'clipboard-check', 'bi-clipboard-data': 'clipboard-list', 'bi-clock-history': 'history',
  'bi-cloud-arrow-up': 'cloud-upload', 'bi-exclamation-circle': 'circle-alert', 'bi-exclamation-triangle': 'triangle-alert',
  'bi-exclamation-triangle-fill': 'triangle-alert', 'bi-eye': 'eye', 'bi-file-earmark-text': 'file-text',
  'bi-flag': 'flag', 'bi-funnel': 'funnel', 'bi-gear': 'settings', 'bi-graph-up-arrow': 'chart-no-axes-combined',
  'bi-grid-1x2': 'layout-dashboard', 'bi-hourglass-split': 'hourglass', 'bi-images': 'images',
  'bi-info-circle': 'circle-info', 'bi-journal-check': 'notebook-tabs', 'bi-list': 'menu',
  'bi-pause-circle': 'circle-pause', 'bi-pencil': 'pencil', 'bi-pencil-square': 'square-pen',
  'bi-people': 'users', 'bi-person-gear': 'user-cog', 'bi-person-plus': 'user-plus', 'bi-pie-chart-fill': 'chart-pie',
  'bi-plus': 'plus', 'bi-plus-lg': 'plus', 'bi-plus-square': 'square-plus', 'bi-question-circle': 'circle-help',
  'bi-receipt': 'receipt', 'bi-save': 'save', 'bi-shield-check': 'shield-check', 'bi-sliders': 'sliders-horizontal',
  'bi-tags': 'tags', 'bi-tools': 'wrench', 'bi-trash': 'trash-2', 'bi-truck': 'truck',
  'bi-x-circle': 'circle-x', 'bi-x-lg': 'x'
});

let adminIconRenderQueued = false;

function renderAdminIcons() {
  adminIconRenderQueued = false;
  if (!window.lucide?.createIcons) return;
  document.querySelectorAll('i.bi').forEach(icon => {
    const bootstrapName = [...icon.classList].find(name => ADMIN_LUCIDE_ICONS[name]);
    if (bootstrapName) icon.setAttribute('data-lucide', ADMIN_LUCIDE_ICONS[bootstrapName]);
  });
  window.lucide.createIcons({ attrs: { 'aria-hidden': 'true', 'stroke-width': 2 }, icons: window.lucide.icons });
}

function queueAdminIconRender() {
  if (adminIconRenderQueued) return;
  adminIconRenderQueued = true;
  (window.queueMicrotask || (callback => Promise.resolve().then(callback)))(renderAdminIcons);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueAdminIconRender, { once: true });
else queueAdminIconRender();

if (window.MutationObserver) {
  new MutationObserver(mutations => {
    if (mutations.some(mutation => [...mutation.addedNodes].some(node => node.nodeType === 1 && (node.matches?.('i.bi') || node.querySelector?.('i.bi'))))) queueAdminIconRender();
  }).observe(document.documentElement, { childList: true, subtree: true });
}

window.renderAdminIcons = queueAdminIconRender;
})();
