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
    _get(key, fallback) { return collections[key] || fallback; },
    getOne(collection) { return collections[collection] || {}; },
    getAll(collection) { return collections[collection] || []; },
    saveAll(collection, rows) { collections[collection] = rows; return true; },
    setOne(collection, value) { collections[collection] = value; return true; }
  };
  const fetch = async endpoint => {
    const url = new URL(String(endpoint));
    const key = url.pathname.replace(/^\//, '') + url.search;
    requests.push(key);
    if (payloads[key] instanceof Error) throw payloads[key];
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true, data: payloads[key] })
    };
  };
  let readyCallback;
  const renderCounts = { services: 0, gallery: 0 };
  const publicDataStatus = { textContent: '', hidden: true };
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
    $: jquery,
    CONFIG: { businessNameFallback: 'AKAD Rentals' },
    document: {
      currentScript: { src: 'http://localhost/js/api.js' },
      documentElement: { style: { setProperty() {} } },
      getElementById: id => id === 'publicDataStatus' ? publicDataStatus : null
    },
    window: { location: { href: 'http://localhost/index.html' } }
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'js', 'api.js'), 'utf8') + '\nglobalThis.API = API;', context);
  vm.runInContext(fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8'), context, { filename: 'js/app.js' });
  return {
    context, requests, collections, renderCounts, payloads, publicDataStatus,
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

  await ready();

  assert.equal(renderCounts.services, 2);
  assert.equal(renderCounts.gallery, 2);
});

test('public outage retains cached data while successful endpoints still refresh', async () => {
  const { context, collections, payloads, publicDataStatus } = createHarness();
  payloads['api/services.php?do=all'] = new Error('Offline');
  const result = await context.refreshPublicSiteData();
  assert.ok(result.errors.services);
  assert.equal(publicDataStatus.hidden, false);
  assert.match(publicDataStatus.textContent, /Showing the latest saved content/);
  assert.equal(collections.services[0].name, 'Cached Karaoke');
  assert.equal(collections.gallery[0].title, 'Server Gallery');
});

test('public refresh preserves pending edits and removes accepted records deleted on the server', async () => {
  const { context, collections, payloads } = createHarness();
  collections.services[0].pending_sync = true;
  collections.services[0].name = 'Unsynced edit';
  collections.services.push({ service_id: 'SVC-099', name: 'Deleted service', status: 'Active' });
  await context.refreshPublicSiteData();
  assert.equal(collections.services.find(row => row.service_id === 'SVC-001').name, 'Unsynced edit');
  assert.ok(!collections.services.some(row => row.service_id === 'SVC-099'));
  payloads['api/services.php?do=all'] = [];
  await context.refreshPublicSiteData();
  assert.equal(collections.services.length, 2);
});
