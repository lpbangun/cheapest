#!/usr/bin/env node
// Node 22+. Read-only Camofox/CDP inspection; no dependencies, cookies or clicks.
import { pathToFileURL } from 'node:url';

export const SHOPS = ['doordash.com', 'ubereats.com', 'grubhub.com', 'wonder.com',
  'ebay.com', 'mycomicshop.com', 'comicconnect.com', 'comiclink.com', 'ha.com'];

export function merchantHost(raw) {
  const host = raw.toLowerCase();
  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host))
    throw new Error('allow-host must be an explicit merchant DNS hostname, without URL, port or wildcard.');
  return host;
}

export function shopURL(raw, allowedHosts = SHOPS) {
  try {
    const u = new URL(raw);
    return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password &&
      allowedHosts.some(h => u.hostname === h || u.hostname.endsWith('.' + h));
  } catch { return false; }
}

export function cleanURL(raw) {
  const u = new URL(raw);
  const item = (u.hostname === 'ebay.com' || u.hostname.endsWith('.ebay.com')) && u.pathname.match(/\/(?:itm|i)\/(?:[^/]+\/)?(\d{9,15})(?:\/|$)/);
  if (item) return `https://www.ebay.com/itm/${item[1]}`;
  const safe = new URLSearchParams();
  for (const k of ['q', '_nkw', '_sop', 'IID', 'ItemID'])
    if (u.searchParams.has(k)) safe.set(k, u.searchParams.get(k));
  // These public catalogue queries identify the actual fashion search performed.
  const fashionQuery = ((u.hostname === 'grailed.com' || u.hostname.endsWith('.grailed.com')) && u.pathname === '/shop') ||
    ((u.hostname === 'poshmark.com' || u.hostname.endsWith('.poshmark.com')) && u.pathname === '/search');
  if (fashionQuery && u.searchParams.has('query')) safe.set('query', u.searchParams.get('query'));
  if (/^(?:www\.)?vinted\.(?:com|de|fr|co\.uk)$/.test(u.hostname) && u.pathname === '/catalog' && u.searchParams.has('search_text'))
    safe.set('search_text', u.searchParams.get('search_text'));
  // Shopify variants identify different stock/grade offers on one product URL.
  if (/^\d{1,25}$/.test(u.searchParams.get('variant') || ''))
    safe.set('variant', u.searchParams.get('variant'));
  const comicLink = ['comiclink.com', 'clinkexchange.com'].some(h => u.hostname === h || u.hostname.endsWith('.' + h));
  if (comicLink && /^\/itemdetail\.asp$/i.test(u.pathname) && /^\d{1,25}$/.test(u.searchParams.get('id') || ''))
    safe.set('id', u.searchParams.get('id'));
  return u.origin + u.pathname + (safe.size ? '?' + safe : '');
}

export function localEndpoint(raw) {
  const u = new URL(raw);
  if (u.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(u.hostname) || u.username || u.password)
    throw new Error('Use a loopback HTTP browser endpoint. Forward a remote browser to loopback first.');
  return u.origin;
}

async function targets(endpoint, allowedHosts = SHOPS) {
  const r = await fetch(endpoint + '/json/list', { signal: AbortSignal.timeout(4000), redirect: 'error' });
  if (!r.ok) throw new Error('Browser endpoint returned HTTP ' + r.status);
  return (await r.json()).filter(t => t.type === 'page' && shopURL(t.url, allowedHosts));
}

async function camoRequest(endpoint, path, body) {
  const key = process.env.CAMOFOX_ACCESS_KEY;
  const r = await fetch(endpoint + path, {
    method: body ? 'POST' : 'GET', redirect: 'error',
    headers: {...(body ? {'Content-Type': 'application/json'} : {}),
      ...(key ? {Authorization: 'Bearer ' + key} : {})},
    ...(body ? {body: JSON.stringify(body)} : {}),
    signal: AbortSignal.timeout(25000)
  });
  if (!r.ok) throw new Error('Camofox returned HTTP ' + r.status);
  return r.json();
}

export function sanitizeResult(result, allowedHosts = SHOPS) {
  if (result.error) throw new Error(result.error);
  if (!shopURL(result.url, allowedHosts)) throw new Error('Page left the allowed shopping sites; capture discarded.');
  result.url = cleanURL(result.url);
  const unique = new Map();
  for (const link of result.links) {
    if (!shopURL(link.url, allowedHosts)) continue;
    const url = cleanURL(link.url);
    // Ignore eBay's dummy advertising card, which is not an actual item ID.
    const hostname = new URL(url).hostname;
    if ((hostname === 'ebay.com' || hostname.endsWith('.ebay.com')) && /\/itm\//.test(url) &&
        !/\/itm\/\d{9,15}$/.test(url)) continue;
    const old = unique.get(url);
    // Image links often precede the same card's title and price-bearing link.
    if (!old || link.context.length + link.text.length > old.context.length + old.text.length)
      unique.set(url, {...link, url});
  }
  result.links = [...unique.values()];
  result.logged_in = 'Not inferred; agent must inspect the account UI.';
  return result;
}

// This expression only reads rendered content and public links in the chosen tab.
export function pageExpression(selector, allowedHosts = SHOPS) {
  return `(() => {
    if (!${JSON.stringify(allowedHosts)}.some(h => location.hostname === h || location.hostname.endsWith('.' + h)))
      return {error: 'Page left allowed shopping origins; nothing read'};
    const root = ${selector ? `document.querySelector(${JSON.stringify(selector)})` : 'document.body'};
    if (!root) return {error: 'Selector did not match; nothing captured'};
    const redact = s => s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi, '[email redacted]');
    const lines = (root.innerText || '').split(/\\n/).map(s => s.trim()).filter(Boolean);
    const selected = new Set();
    lines.forEach((s, i) => {
      if (/(?:[$€£]\\s*\\d|\\b(?:subtotal|total|delivery fee|service fee|tax|tip|promo|discount|expired|not eligible|sign in|log in|captcha|verification|blocked|sold|ended|auction|current bid|CGC|CBCS|qualified|restored)\\b)/i.test(s)) {
        for (let j = Math.max(0, i - 1); j < Math.min(lines.length, i + 3); j++) selected.add(j);
      }
    });
    const evidence = [...selected].sort((a,b) => a-b).map(i => redact(lines[i]));
    const visible = a => a.getClientRects().length && getComputedStyle(a).visibility !== 'hidden' && getComputedStyle(a).opacity !== '0';
    // Some merchants render the offer price as a readonly field, absent from innerText.
    // Read only displayed monetary fields, never editable identity/payment inputs.
    const price_fields = [...root.querySelectorAll('input[readonly]')]
      .filter(e => ['text', 'number'].includes(e.type) && visible(e) && /^[$€£]\\s*\\d[\\d,.]*(?:\\s*(?:USD|CAD|EUR|GBP))?$/.test(e.value.trim()))
      .map(e => ({value: e.value.trim(), label: redact(e.getAttribute('aria-label') || '')}));
    const links = [...root.querySelectorAll('a[href]')].filter(visible)
      .map(a => ({url: a.href, text: redact(((a.innerText || '').trim() || a.getAttribute('aria-label') || a.title || a.querySelector('img')?.alt || '').trim()),
        context: redact((a.closest('li, article, td, tr') || a.parentElement).innerText.slice(0, 1600))}));
    const challenge = /performing security verification|verify you are human|sorry, you have been blocked|hcaptcha security challenge/i.test(lines.join(' '));
    return {url: location.href, observed_at: new Date().toISOString(),
      access: challenge ? 'challenge_or_block' : 'rendered_page_not_yet_verified',
      headings: [...root.querySelectorAll('h1,h2')].slice(0, 12).map(e => redact(e.innerText)),
      evidence: evidence.slice(0, 180), evidence_truncated: evidence.length > 180, price_fields,
      links, assurance: 'Rendered evidence only; prices, selected basket, account eligibility and availability require agent verification.'};
  })()`;
}

async function cdpRead(endpoint, tab, selector, allowedHosts = SHOPS) {
  const pages = await targets(endpoint, allowedHosts);
  const page = pages.find(p => p.id === tab);
  if (!page) throw new Error('Tab not found among allowed shopping pages. Run tabs first.');
  const wsURL = new URL(page.webSocketDebuggerUrl);
  // Use only the local forwarded address; never follow a remote WS host.
  const base = new URL(endpoint);
  wsURL.host = base.host;
  const ws = new WebSocket(wsURL);
  try {
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Browser read timed out')), 12000);
      const done = (fn, value) => { clearTimeout(timer); fn(value); };
      ws.addEventListener('error', () => done(reject, new Error('Browser connection failed')));
      ws.addEventListener('open', () => ws.send(JSON.stringify({id: 1, method: 'Runtime.evaluate', params: {
        expression: pageExpression(selector, allowedHosts), returnByValue: true, awaitPromise: true
      }})));
      ws.addEventListener('message', e => {
        const m = JSON.parse(e.data);
        if (m.id !== 1) return;
        if (m.error || m.result?.exceptionDetails) return done(reject, new Error('Browser evaluation failed'));
        done(resolve, m.result.result.value);
      });
    });
    return sanitizeResult(result, allowedHosts);
  } finally { ws.close(); }
}

export async function main(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!['--endpoint', '--tab', '--selector', '--backend', '--user', '--allow-host'].includes(rest[i]) || rest[i+1] === undefined)
      throw new Error('Unknown or incomplete option');
    if (rest[i] === '--allow-host') (options['--allow-host'] ||= []).push(merchantHost(rest[i+1]));
    else options[rest[i]] = rest[i+1];
  }
  const allowedHosts = [...SHOPS, ...(options['--allow-host'] || [])];
  if (!['doctor', 'tabs', 'read'].includes(command))
    throw new Error('Use doctor|tabs|read. Run with --help for backend and session options.');
  const backend = options['--backend'] || 'camofox';
  if (!['camofox', 'cdp'].includes(backend)) throw new Error('backend must be camofox or cdp');
  const endpoint = localEndpoint(options['--endpoint'] ||
    (backend === 'camofox' ? 'http://127.0.0.1:9377' : 'http://127.0.0.1:9222'));
  if (backend === 'camofox') {
    if (command === 'doctor') {
      const h = await camoRequest(endpoint, '/health');
      return {status: h.ok ? 'connected' : 'unavailable', engine: h.engine,
        browser_running: h.browserRunning, logged_in: 'Not checked'};
    }
    const userId = options['--user'];
    if (!userId) throw new Error('Camofox tabs/read requires --user SESSION_USER_ID');
    const q = '?userId=' + encodeURIComponent(userId);
    const listing = await camoRequest(endpoint, '/tabs' + q);
    const pages = (listing.tabs || []).filter(p => shopURL(p.url, allowedHosts));
    if (command === 'tabs') return {tabs: pages.map(p => ({id: p.tabId || p.id, url: cleanURL(p.url)}))};
    const tab = options['--tab'];
    if (!tab || !pages.some(p => (p.tabId || p.id) === tab))
      throw new Error('Select an allowed shopping tab from this user session. Run tabs first.');
    const data = await camoRequest(endpoint, '/tabs/' + encodeURIComponent(tab) + '/evaluate',
      {userId, expression: pageExpression(options['--selector'], allowedHosts)});
    if (!data.ok || !data.result) throw new Error('Browser evaluation failed');
    return sanitizeResult(data.result, allowedHosts);
  }
  if (command === 'read') {
    if (!options['--tab']) throw new Error('read requires an explicit shopping tab ID');
    return cdpRead(endpoint, options['--tab'], options['--selector'], allowedHosts);
  }
  const pages = await targets(endpoint, allowedHosts);
  if (command === 'doctor') return {status: 'connected', shopping_tabs: pages.length,
    logged_in: 'Not checked', capability: 'Read-only browser access; no cookies exported or orders possible through this helper.'};
  return {tabs: pages.map(p => ({id: p.id, url: cleanURL(p.url)}))};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) {
    console.log('node shop_browser.mjs doctor|tabs|read [--backend camofox|cdp] [--endpoint LOOPBACK_HTTP_URL] [--user SESSION_USER_ID] [--tab ID] [--selector CSS] [--allow-host MERCHANT_HOST]\nRepeat --allow-host for explicitly selected additional merchants. Default: Camofox on port 9377. Read-only inspection; no clicks, cookies, bids or orders.');
  } else main(process.argv.slice(2)).then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(e => { console.error(JSON.stringify({status: 'unavailable', reason: e.message,
      message: 'No price or login state established.'})); process.exitCode = 2; });
}
