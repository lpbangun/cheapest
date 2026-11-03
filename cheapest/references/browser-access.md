# Browser access without another plugin

Keep the buying instructions independent of ChatGPT, Grok or any particular
host's tool names. Use the host's browser/search or terminal capabilities.
Camofox is a standalone browser service here, not a required app connector.

## Check access before comparing prices

Check the available browser and whether the intended account session exists.
Reuse the user's authorized session when the host supports it. Otherwise use a
dedicated persistent shopping session and hand the browser to the user for login,
MFA or a challenge. Never request passwords, cookie exports or session tokens in
chat. A browser installation does not sign into the user's apps.

Login is optional for discovery and public price comparisons. Try a guest basket
where supported and include every fee the site actually reveals. Public coupons
remain conditional on eligibility; a guest result cannot establish the user's
targeted offers, membership benefits or credits. Escalate to saved account
sessions only for promising routes where personalization or hidden checkout
charges could change the winner. Use existing logins rather than asking the user
to sign in on every mission. If the user declines account access, return the
public/guest comparison and identify which personalized totals remain unknown.
An official account API also requires authorization; a custom script does not
remove that requirement. User-provided cart evidence is another explicit option.

Distinguish service connected, page rendered, user signed in, and full checkout
observed. HTTP 200 proves none of the latter three. Read the actual page; a tab
can expire between calls. Recover an expired research tab normally, without
clearing a user's authenticated session. An explicit challenge requires the
user's intervention. A browser change can help rendering but is no guarantee of
access. Do not rotate identities/proxies or automate challenge bypasses.

## Camofox route

First check a known local endpoint such as `http://127.0.0.1:9377/health`.
Do not replace an existing service or inspect other users' sessions. Use an
explicit user/session identifier supplied by the session owner or created for
this task. The bundled read-only helper uses Node 22+ and no npm dependencies:

```sh
node scripts/shop_browser.mjs doctor
node scripts/shop_browser.mjs tabs --user YOUR_SESSION_USER
node scripts/shop_browser.mjs read --user YOUR_SESSION_USER --tab TAB_ID --selector 'main'
```

Use `--endpoint http://127.0.0.1:PORT` for another local service. A local
`CAMOFOX_ACCESS_KEY` environment variable is supported; never print it. The
helper only reads authorized shopping tabs, strips private URL parameters,
redacts emails and retains visible listing-card context. Narrow `--selector` to
the relevant cart or listing before reading signed-in pages. It is evidence
extraction, not automatic price matching or proof of account eligibility.
Image-only listing links also use their public `title`/image alt text when link
text is empty, as observed on Vinted. Inspect the actual photos in the browser;
these labels do not establish a visual match. Public catalogue queries are kept
for Grailed, Poshmark and tested Vinted regions so the captured search is auditable.
Its default host list covers the four food sites, eBay and several comic
specialists. For another merchant discovered during the mission, explicitly add
its hostname with `--allow-host myslabs.com` (repeat for additional merchants).
Do not drop a cheaper seller because it is absent from the default list. The
helper checks both the selected tab and the page's resulting origin; redirects
to a new merchant host require an explicit host entry. It also captures visible
read-only monetary input fields, which some sites use instead of text prices.

Use Camofox's local REST interface for ordinary navigation and basket building:

- `POST /tabs` with `userId`, `sessionKey`, `url` creates a tab.
- `GET /tabs/TAB_ID/snapshot?userId=USER` returns the current UI and element refs.
- `POST /tabs/TAB_ID/click` with `userId`, `ref` clicks an observed control.
- `POST /tabs/TAB_ID/type` with `userId`, `ref`, `text` fills a field.
- `POST /tabs/TAB_ID/select` with `userId`, an observed `selector` or `ref`,
  and `option` selects a native dropdown in versions that support it.
- `GET /tabs/TAB_ID/screenshot?userId=USER` supplies visual evidence.

Refresh snapshots after navigation. Consult the installed version's API for
response formats and pagination; do not assume a successful click changed the
selection. Default link/snapshot limits can hide all product results behind
navigation links. Paginate or use a focused DOM read, merge duplicate image/title
links by canonical listing ID, and retain the price-bearing card. Reject dummy
advertising cards, similar items and sold comparables as exact offers.

### When the page works but browser controls fail

If an app's feed/search renders empty, discover its exact merchant share link
through ordinary search and open that link in the same shopping session. Verify
the branch and delivery context again. This worked for Uber Eats without a
separate integration. Do not infer that a catalogue is app-only from a broken
feed or an incomplete accessibility snapshot.

In Camofox 1.18.1, some native clicks stalled during accessibility-ref rebuilding
and closed the tab. Inspect the resulting state before retrying an add. Recover
a lost tab using the same authorized `userId` and `sessionKey`; check existing
carts before making any further changes. Account sessions and carts survived
these tab failures in the live test.
Also check the browser's configured idle-tab lifetime: the default standalone
service reaped idle research tabs after five minutes in the resale test. Use the
task-owned service's appropriate lifetime when available, keep a manageable set
of research tabs, and reopen expired public pages normally. Do not restart a
shared service or clear account profiles to recover a research tab.
Tab limits can also recycle the least-used tab, including a recently opened one.
List live tabs and reuse task-owned research tabs before opening more; a stale
tab ID is a browser-state failure, not evidence that the merchant is blocked.

When a visible control is missing from a snapshot, use a screenshot and a narrow
DOM read. Wonder's promo and cart controls included ordinary spans and SVGs;
CSS uppercasing also made rendered text differ from `textContent`. Scope to the
visible control, normalize case/whitespace, and exclude hidden duplicates. The
host's browser evaluation, or Camofox `POST /tabs/TAB_ID/evaluate` with `userId`
and `expression`, can dispatch one click on an already inspected control. Then
read the resulting dialog/cart/quote separately. This avoids the failing
post-click snapshot path; it does not replace postcondition verification.
Use the host's native browser interaction when the page requires trusted input.
Changing a dropdown value through evaluation can leave its results unchanged;
use native selection and verify the resulting filter and result count.
Do not install a selector registry or retry mutations automatically.

Follow the actual checkout link with its functional cart/location parameters.
Strip private URL parameters only when reporting or exporting evidence, not
before navigation: a redacted checkout URL can open a 404 or the wrong cart.
Scope checkout reads to prices and relevant controls; do not save unrelated
account, payment, order-history or contact details in portable evidence.
Keep offer-identifying parameters such as numeric Shopify `variant` or
ComicLink `id` in exported links. Different graded copies can share a product
URL; removing their variant IDs can silently point to another grade or sold-out
copy. The helper preserves these numeric selectors while removing session data.

For eBay, cart checkout can show sign-in while the item's documented **Buy It
Now → Check out as guest** flow remains available. Inspect the offered UI before
declaring login mandatory; stop before **Confirm and pay**. Recheck destination
at checkout even after the item's shipping calculator worked. In the resale
test, free shipping to the requested New York ZIP was verified but guest checkout still defaulted
to Missouri for estimated tax. That total was excluded from the New York
comparison. A guest coupon rejection also does not establish eligibility for a
different signed-in account.

### Fresh host setup

If no usable browser exists and installation is authorized, install the
[standalone Camofox package](https://github.com/jo-inc/camofox-browser) locally,
or use its documented container. Do this during setup, not on every shopping
mission. The tested package version is `@askjo/camofox-browser@1.18.1`.
For a terminal host with Node 22+, the starting point is:

```sh
npm install --prefix "$CHEAPEST_RUNTIME" --omit=dev @askjo/camofox-browser@1.18.1
```

Set `CHEAPEST_RUNTIME` to a dedicated private directory first. Do not omit
optional npm dependencies indiscriminately: a required native browser dependency
ships its platform binary that way. Reuse a compatible installed engine with
`CAMOUFOX_EXECUTABLE`; otherwise the package downloads its engine.
Start its `server.js` with `CAMOFOX_BIND_HOST=127.0.0.1`, a free port and
`CAMOFOX_CRASH_REPORT_ENABLED=false`. Set `CAMOFOX_PROFILE_DIR`,
`CAMOFOX_COOKIES_DIR`, `CAMOFOX_UPLOADS_DIR` and `CAMOFOX_TRACES_DIR` to private
runtime directories outside the skill package. Use `umask 077`. Keep unrelated
integrations disabled. Do not commit profiles, browser state or private captures.

For login, use `CAMOFOX_INTERACTIVE=desktop` with an actual display, or the
upstream documented noVNC setup on a headless server. Forward a remote viewer
over SSH and bind browser control/viewer ports to loopback. Verify both its web
page and display connection before handing it to the user. On this VPS a
separate local viewer has been prepared; its machine-specific launcher is not
part of the portable skill. Persist the same shopping user ID and profile;
normal session shutdown checkpoints state. Logins can still expire.

If Chrome is the host's available authorized browser instead, the same helper
supports `--backend cdp --endpoint http://127.0.0.1:9222`. Do not assume a
headless research profile is the user's signed-in browser.

## eBay's optional API route

Browser discovery needs no eBay developer credentials. If official production
API access is available, `python3 scripts/ebay_search.py 'green lantern 87 cgc'`
uses the Browse API directly. Add `--auction` for a separate auction search and
`--postal 10024` for a US shipping context. Supply `EBAY_APP_TOKEN` or
`EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` locally. Production access restrictions
still apply. Follow `next_offset` while promising results remain; grade labels,
edition and final shipping/tax still require verification. Current bids are
separate from fixed prices. `credentials_required` or `api_error` means no
inventory result was obtained. This API route has unit checks but has not been
live-verified with production credentials in this project.
