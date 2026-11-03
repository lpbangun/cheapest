# Cheapest!

A portable agent skill for finding and comparing buying options across retailers,
resale marketplaces, ticket sellers, travel providers, food apps and local services.
It guides your agent through the search, checks that offers actually match, and
compares shipping, fees and eligible promotions. No other plugins are required.

Cheapest! is an instruction-based skill with optional small helpers. Your agent
supplies web search, a browser or terminal tools. It does not promise universal
merchant access or the lowest price everywhere. Personalized prices require an
authorized account session; unknown costs and blocked routes stay visible.

## Use it

Copy the [`cheapest/`](cheapest) folder into the skills location supported by your
agent, or have the agent read [`cheapest/SKILL.md`](cheapest/SKILL.md) directly.
The skill identifier is `cheapest`; its display name is **Cheapest!**.

Example requests:

- “Find two adjacent NBA tickets for $100 total, including fees.”
- “Find this jacket in EU 48 on eBay, Grailed, Vinted and Poshmark.”
- “Find an Our Legacy medium shirt from the 2023–2024 collections under $200.”
- “Compare this exact restaurant order on DoorDash, Uber Eats, Grubhub and Wonder,
  including the promotions available to my account. Don't place an order.”
- “Compare monthly luggage storage near me, including move-in fees and minimum terms.”
- “Find a cheap VPS and compare the committed cost, renewal rate and location.”

Research is the default. Purchases, bids, binding offers and seller messages need
appropriate user authorization. The skill does not bypass logins, CAPTCHA or
merchant access restrictions, or assume eligibility for a new-user offer.

## Optional helpers

The skill works with the host's available browser. Camofox and Chrome DevTools
Protocol are supported by the bundled read-only helper; neither is installed
automatically. See [browser setup and access](cheapest/references/browser-access.md).

With Node 22+ and a running local Camofox service:

```sh
node cheapest/scripts/shop_browser.mjs doctor
node cheapest/scripts/shop_browser.mjs tabs --user YOUR_SESSION_USER
node cheapest/scripts/shop_browser.mjs read --user YOUR_SESSION_USER --tab TAB_ID --selector 'main'
```

Use `--endpoint http://127.0.0.1:PORT` for a nondefault port and `--allow-host`
for a merchant outside the helper's default host list. Use only sessions you own
or are authorized to inspect. The helper reads evidence; it does not navigate,
click purchase controls, or provide automatic matching.

The optional `cheapest/scripts/ebay_search.py` uses eBay's official Browse API.
It requires your own production API access and credentials; ordinary browser
research does not. Keep credentials in local environment variables.

[`tools/camofox_vps.py`](tools/camofox_vps.py) is an optional launcher from the
original Linux test host. It requires a separately prepared runtime and viewer;
see [its setup assumptions](tools/README.md). It is not a portable installer.

## Validation and current limits

```sh
node cheapest/scripts/test_shop_browser.mjs
python3 -m unittest discover -s cheapest/scripts -p 'test_*.py'
```

An optional browser fixture uses only a temporary synthetic page and a separate
session: `TEST_CAMOFOX=http://127.0.0.1:PORT node cheapest/scripts/test_shop_browser.mjs`.

The [live-test summary](cheapest/evals/README.md) distinguishes working routes
from incomplete results. Tests are manual observations, not guarantees that a
merchant still works. Raw account sessions, shopping screenshots, uploaded photos
and account-specific evidence are excluded from this public repository.

The instructions avoid host-specific tool names so they can be reused with
other capable agents. End-to-end execution on Dots, Grok and other hosts has not
been validated.

## License

[MIT](LICENSE).
