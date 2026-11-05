const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../sw.js'), 'utf8');
function worker(options = {}) {
  const listeners = {}, stored = [], deleted = [];
  const caches = {
    open:async () => ({put:async (...args) => stored.push(args),addAll:async () => {}}),
    match:options.match || (async () => undefined),
    keys:async () => ['ebl-old', 'ebl-delivery-1', 'another-app'],
    delete:async key => deleted.push(key)
  };
  const self = {location:{origin:'https://eventsbyluwa.com'},clients:{claim:async () => {}},skipWaiting:async () => {},addEventListener:(name, fn) => {listeners[name] = fn;}};
  vm.runInNewContext(source, {self,caches,URL,Response,fetch:options.fetch || (async () => new Response('OK'))});
  return {listeners,stored,deleted};
}
test('does not intercept form submissions or third-party requests', () => {
  const w = worker();
  for (const request of [{method:'POST',url:'https://eventsbyluwa.com/'},{method:'GET',url:'https://formsubmit.co/'}]) {
    w.listeners.fetch({request,respondWith:() => assert.fail('Unexpected interception')});
  }
});
test('does not cache failed HTTP responses', async () => {
  const w = worker({fetch:async () => new Response('Missing', {status:404})});
  let response;
  w.listeners.fetch({request:{method:'GET',url:'https://eventsbyluwa.com/missing.png'},respondWith:p => {response = p;},waitUntil:() => {}});
  assert.equal((await response).status, 404);
  assert.equal(w.stored.length, 0);
});
test('offline navigation uses an offline page, not an unrelated home page', async () => {
  const w = worker({fetch:async () => {throw new Error('Offline');},match:async request => request === './offline.html' ? new Response('Offline page') : undefined});
  let response;
  w.listeners.fetch({request:{method:'GET',mode:'navigate',url:'https://eventsbyluwa.com/unvisited.html'},respondWith:p => {response = p;}});
  assert.equal(await (await response).text(), 'Offline page');
});
test('an offline missing asset does not receive HTML', async () => {
  const w = worker({fetch:async () => {throw new Error('Offline');}});
  let response;
  w.listeners.fetch({request:{method:'GET',mode:'no-cors',url:'https://eventsbyluwa.com/missing.png'},respondWith:p => {response = p;}});
  assert.equal((await response).type, 'error');
});
test('cache cleanup preserves caches owned by other applications', async () => {
  const w = worker(); let task;
  w.listeners.activate({waitUntil:p => {task = p;}}); await task;
  assert.deepEqual(w.deleted, ['ebl-old']);
});
