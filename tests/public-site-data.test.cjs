const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

function createHarness() {
  const requests = [];
  const collections = {
    settings: {},
    websiteContent: {},
    services: [{
      service_id: 'SVC-001', name: 'Cached Karaoke', status: 'Active',
      image: 'cached-service.jpg'
    }, {
      service_id: 'LOCAL-services-1', name: 'Offline Service', status: 'Active',
      image: 'offline-service.jpg', pending_sync: true
    }],
    gallery: [{
      image_id: 'LOCAL-gallery-1', title: 'Offline Gallery',
      image: 'offline-gallery.jpg', pending_sync: true
    }]
  };
  const payloads = {
    'api/settings.php?do=get': { primary_color: '#123456' },
    'api/websiteContent.php?do=get': { business_name: 'AKAD Rentals' },
    'api/services.php?do=all': [{
      service_id: 1, service_name: 'Server Karaoke',
      description: 'Server description', status: 'Active'
    }],
    'api/gallery.php?do=all': [{
      image_id: 2, title: 'Server Gallery', image: 'server-gallery.jpg', featured: 1
    }]
  };

  const STORAGE = {
    getAll(collection) { return collections[collection] || []; },
    saveAll(collection, rows) { collections[collection] = rows; return true; },
    setOne(collection, value) { collections[collection] = value; return true; }
  };
  const API = {
    getSettings: () => collections.settings,
    getWebsiteContent: () => collections.websiteContent,
    getActiveServices: () => collections.services.filter(row => row.status === 'Active'),
    getService: id => collections.services.find(row => row.service_id === id) || null,
    getGallery: () => collections.gallery
  };
  const fetch = async endpoint => {
    requests.push(String(endpoint));
    return {
      ok: true,
      json: async () => ({ ok: true, data: payloads[String(endpoint)] })
    };
  };
  let readyCallback;
  const renderCounts = { services: 0, gallery: 0 };
  const jquery = argument => {
    if (typeof argument === 'function') {
      readyCallback = argument;
      return undefined;
    }
    return {
      on() { return this; }, text() { return this; }, attr() { return this; },
      empty() {
        if (argument === '#servicesGrid') renderCounts.services++;
        if (argument === '#galleryGrid') renderCounts.gallery++;
        return this;
      },
      append() { return this; }, toggle() { return this; }, parent() { return this; },
      closest() { return this; }, prop() { return this; }
    };
  };
  const context = {
    console,
    URL,
    AbortSignal: { timeout() { return undefined; } },
    fetch,
    STORAGE,
    API,
    $: jquery,
    CONFIG: { businessNameFallback: 'AKAD Rentals' },
    document: { documentElement: { style: { setProperty() {} } } },
    window: { location: { href: 'http://localhost/index.html' } }
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8'), context, { filename: 'js/app.js' });
  return {
    context, requests, collections, renderCounts,
    ready: () => readyCallback()
  };
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
}

test('public refresh loads settings, content, services, and gallery from PHP', async () => {
  const { context, requests, collections } = createHarness();

  await context.refreshPublicSiteData();

  assert.deepEqual(requests.sort(), [
    'api/gallery.php?do=all',
    'api/services.php?do=all',
    'api/settings.php?do=get',
    'api/websiteContent.php?do=get'
  ]);
  assert.equal(collections.settings.primary_color, '#123456');
  assert.equal(collections.websiteContent.business_name, 'AKAD Rentals');
  assert.ok(collections.services.some(row => row.service_id === 'SVC-001' && row.name === 'Server Karaoke'));
  assert.ok(collections.gallery.some(row => row.image_id === 'IMG-002' && row.title === 'Server Gallery'));
});

test('public refresh retains cached presentation fields and pending local records', async () => {
  const { context, collections } = createHarness();

  await context.refreshPublicSiteData();

  const service = collections.services.find(row => row.service_id === 'SVC-001');
  assert.equal(service.image, 'cached-service.jpg');
  assert.ok(collections.services.some(row => row.service_id === 'LOCAL-services-1' && row.pending_sync));
  assert.ok(collections.gallery.some(row => row.image_id === 'LOCAL-gallery-1' && row.pending_sync));
});

test('public page rerenders services and gallery after server refresh', async () => {
  const { ready, renderCounts } = createHarness();

  ready();
  await settle();

  assert.equal(renderCounts.services, 2);
  assert.equal(renderCounts.gallery, 2);
});
