import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {shopURL, cleanURL, localEndpoint, pageExpression, sanitizeResult, merchantHost} from './shop_browser.mjs';

assert.equal(shopURL('https://www.ebay.com/itm/123456789012'), true);
assert.equal(shopURL('https://ebay.com.evil.invalid/itm/123456789012'), false);
assert.equal(shopURL('https://mail.google.com/'), false);
assert.equal(cleanURL('https://www.ebay.com/itm/name/123456789012?tracking=private'), 'https://www.ebay.com/itm/123456789012');
assert.equal(cleanURL('https://www.grubhub.com/checkout?token=private'), 'https://www.grubhub.com/checkout');
assert.throws(() => localEndpoint('https://remote.invalid:9222'));
assert.throws(() => localEndpoint('http://user:secret@localhost:9222'));
const merged = sanitizeResult({url: 'https://www.ebay.com/sch/i.html?token=private', links: [
  {url:'https://www.ebay.com/itm/123456789012?track=image', text:'', context:''},
  {url:'https://www.ebay.com/itm/123456789012?track=title', text:'Comic', context:'CGC 7.0 $599'},
  {url:'https://ebay.com/itm/123456', text:'Shop on eBay', context:'$20 dummy card'},
  {url:'https://mail.google.com/', text:'Private', context:'Not shopping'}]});
assert.equal(merged.links.length, 1);
assert.equal(merged.links[0].context, 'CGC 7.0 $599');
assert.equal(merged.url.includes('private'), false);
assert.throws(() => sanitizeResult({url:'https://mail.google.com/', links:[]}));
assert.equal(shopURL('https://myslabs.com/slab/view/1862609/'), false);
assert.equal(shopURL('https://myslabs.com/slab/view/1862609/', ['myslabs.com']), true);
assert.equal(shopURL('https://myslabs.com.evil.invalid/', ['myslabs.com']), false);
assert.equal(merchantHost('MySlabs.com'), 'myslabs.com');
for (const invalid of ['https://myslabs.com', '*.com', 'myslabs.com:443', '127.0.0.1', 'user@myslabs.com', 'myslabs.com/'])
  assert.throws(() => merchantHost(invalid));
assert.equal(cleanURL('https://comicbookaddiction.com/products/book?variant=41053750296631&token=secret'),
  'https://comicbookaddiction.com/products/book?variant=41053750296631');
assert.equal(cleanURL('https://shop.invalid/p?variant=private-token'), 'https://shop.invalid/p');
assert.equal(cleanURL('https://clinkexchange.com/itemdetail.asp?id=1667421&back=private'),
  'https://clinkexchange.com/itemdetail.asp?id=1667421');
assert.equal(cleanURL('https://myslabs.com/account/?id=123456789'), 'https://myslabs.com/account/');
assert.equal(cleanURL('https://notebay.com/itm/123456789012'), 'https://notebay.com/itm/123456789012');
assert.equal(cleanURL('https://www.grailed.com/shop?query=our+legacy+jacket&token=private'),
  'https://www.grailed.com/shop?query=our+legacy+jacket');
assert.equal(cleanURL('https://poshmark.com/search?query=our+legacy+jacket&session=private'),
  'https://poshmark.com/search?query=our+legacy+jacket');
assert.equal(cleanURL('https://www.vinted.com/catalog?search_text=our+legacy+jacket&referrer=private'),
  'https://www.vinted.com/catalog?search_text=our+legacy+jacket');
assert.equal(cleanURL('https://www.vinted.com/account?search_text=private'), 'https://www.vinted.com/account');
const extra = sanitizeResult({url:'https://myslabs.com/slab/view/1862609/', links:[
  {url:'https://myslabs.com/account/login/?token=secret',text:'Login',context:'Account gate'},
  {url:'https://myslabs.com.evil.invalid/',text:'Wrong host',context:'Excluded'}]}, ['myslabs.com']);
assert.equal(extra.links.length, 1);
assert.equal(extra.links[0].url, 'https://myslabs.com/account/login/');

// Optional real Camofox fixture. Serves only synthetic content over loopback;
// never modifies existing shopping pages or account sessions.
if (process.env.TEST_CAMOFOX) {
  const endpoint = localEndpoint(process.env.TEST_CAMOFOX);
  const userId = 'cheapest-fixture-' + Date.now();
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<main><h1>Fixture offer</h1><input readonly value="$575">' +
      '<input readonly value="$999" style="display:none"><input readonly value="$888" style="opacity:0">' +
      '<input value="$777"><input type="password" readonly value="$666">' +
      '<input readonly value="private@example.invalid"><a href="https://myslabs.com/slab/view/1862609/">Comic CGC 7.0</a>' +
      '<a href="https://www.vinted.com/items/123456789-jacket" title="Our Legacy, Size M, $90, $95.20"><div></div></a>' +
      '<a href="https://poshmark.com/listing/jacket-123"><img alt="Our Legacy cropped jacket"></a>' +
      '<button onclick="window.purchased=true">Confirm and pay</button></main>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let tab;
  async function call(path, body) {
    const r = await fetch(endpoint + path, {method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body), signal:AbortSignal.timeout(25000)});
    const d = await r.json();
    if (!r.ok || d.error) throw new Error('Camofox fixture request failed: ' + r.status);
    return d;
  }
  try {
    tab = await call('/tabs', {userId, sessionKey:'fixture', url:'http://127.0.0.1:' + server.address().port});
    const {result} = await call(`/tabs/${tab.tabId}/evaluate`, {userId, expression:pageExpression('main', ['127.0.0.1'])});
    assert.deepEqual(result.price_fields, [{value:'$575',label:''}]);
    assert.ok(!JSON.stringify(result).includes('private@example.invalid'));
    assert.ok(result.links.some(l => l.text === 'Our Legacy, Size M, $90, $95.20'));
    assert.ok(result.links.some(l => l.text === 'Our Legacy cropped jacket'));
    const {result:purchased} = await call(`/tabs/${tab.tabId}/evaluate`, {userId, expression:'Boolean(window.purchased)'});
    assert.equal(purchased, false);
    const {result:blocked} = await call(`/tabs/${tab.tabId}/evaluate`, {userId, expression:pageExpression('main')});
    assert.ok(blocked.error);
    console.log('Camofox fixture passed: displayed readonly price, hidden/editable exclusions, no purchase action, origin restriction.');
  } finally {
    if (tab?.tabId) await fetch(endpoint + `/tabs/${tab.tabId}?userId=${userId}`, {method:'DELETE'});
    await new Promise(resolve => server.close(resolve));
  }
}

// Run against a disposable blank tab only. No real shopping/account pages changed.
if (process.env.TEST_CDP) {
  const endpoint = localEndpoint(process.env.TEST_CDP);
  const response = await fetch(endpoint + '/json/new?about:blank', {method: 'PUT'});
  const tab = await response.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject); });
  async function evaluate(expression) {
    const key = ++id;
    const result = new Promise(resolve => pending.set(key, resolve));
    ws.send(JSON.stringify({id:key, method:'Runtime.evaluate', params:{expression, returnByValue:true}}));
    const m = await Promise.race([result, new Promise((_, reject) => setTimeout(() => reject(new Error('fixture timeout')), 6000))]);
    if (m.error || m.result.exceptionDetails) throw new Error('fixture failed');
    return m.result.result.value;
  }
  try {
    await evaluate(`document.body.innerHTML = '<main><h1>Fixture cart</h1><p>Items subtotal</p><p>$16.68</p><p>Service fee $4.67</p><p>This promo code has expired.</p><p style="display:none">Secret hidden price $0</p><p>test@example.invalid</p><a href="https://www.ebay.com/itm/123456789012?tracking=x">Green Lantern 87 CGC 7.0 $599</a><button onclick="window.purchased=true">Place order</button></main>'; true`);
    const captured = await evaluate(pageExpression('main', [''])); // about:blank has empty hostname
    assert.ok(captured.evidence.includes('$16.68'));
    assert.ok(captured.evidence.some(s => s.includes('expired')));
    assert.ok(!captured.evidence.join(' ').includes('Secret hidden price'));
    assert.ok(!JSON.stringify(captured).includes('test@example.invalid'));
    assert.ok(captured.links.some(l => l.url.includes('/itm/123456789012')));
    assert.equal(await evaluate('Boolean(window.purchased)'), false);
    assert.ok((await evaluate(pageExpression(null))).error); // production origins reject fixture
  } finally {
    ws.close();
    await fetch(endpoint + '/json/close/' + tab.id);
  }
  console.log('Browser fixture passed: visible prices, promo rejection, links, no purchase action, origin restriction.');
}
console.log('URL/privacy checks passed.');
