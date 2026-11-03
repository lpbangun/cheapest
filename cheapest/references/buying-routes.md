# Buying routes and access fallbacks

Use only the sections relevant to the mission. Discover local alternatives;
these examples are starting points, not an exhaustive provider list. Check
current interfaces and terms rather than depending on fixed selectors or APIs.
Use built-in search and the host's browser; none of the named websites requires
installing a plugin for this skill. A local browser CLI is host tooling, not a
dependency the skill installs or a reason to require a particular agent runtime.

## Surfacing offers from apps

Start with the app's public website, exact listing/product ID or share link.
Follow official merchant/venue links into their actual ordering or booking
engine; the offer may live on a different domain. Use comparison sites to find
additional suppliers, then follow promising offers to the seller. Preserve the
mission and verify the resulting state at every handoff. A price embedded in a
URL is an expected price, not evidence returned by the seller.

For app-only or personalized offers, use supported native-app control or an
authorized user session if the host has it. A web equivalent does not prove
the app's promo or account price. Otherwise keep that route conditional and
name the missing access. Do not require another plugin to reach it.

### When a small direct script is useful

The executing agent may create a narrow helper for the current mission if its
host supports scripts and this materially improves access or repeatability.
Prefer an official documented API with legitimately available credentials, or
public data/ordinary search requests used by an accessible page when permitted.
Inspect the actual request inputs and response before implementing; observing
an endpoint name alone does not establish a working integration. A read-only
search may use POST; distinguish it from reservations, holds and purchase calls.

Pass mission inputs explicitly (IDs, variants, dates, quantity/occupancy,
destination and currency). Return offers with source, observation time, actual
search context, price unit, mandatory costs, eligibility and unresolved fields.
Verify a sample against the visible seller offer before using it to rank prices.
Return access errors distinctly from empty inventory; respect rate limits and
bound retries. Keep credentials/session tokens out of saved code and reports.

Scripts can solve rendering or repetitive navigation; they do not grant access
through login, CAPTCHA, an explicit bot denial or unavailable API credentials.
Do not replay alternate endpoints to evade a block. Continue another permitted
route or retain a conditional lead. Record whether a route worked, needs a
session/native tool, was blocked, or is only an implementation candidate.
Build only the helper justified by the current failure, not a connector registry.

## Physical products, Amazon, and photo matching

1. Identify brand/model or style code, exact variant, size/measurements, region,
   quantity and permitted condition. Use labels, official product images and
   listing details to distinguish exact matches from visually similar pieces.
   Get permission before uploading the user's image to a third-party search
   service unless already authorized; text search can proceed independently.
2. Search the brand's own shop and stockist list, regional retailers and a
   comparison search such as Google Shopping or a local equivalent. For fashion,
   ModeSens and retailers such as SSENSE, END., MR PORTER or FARFETCH are leads
   where relevant. Search `"brand model/style code" size buy region`, then
   `"brand model/style code" sale outlet`. Check less obvious stockists revealed
   by the results instead of assuming familiar sites cover the market.
3. Check relevant marketplaces: [Amazon](https://www.amazon.com/),
   [eBay](https://www.ebay.com/), [Poshmark](https://poshmark.com/),
   [Vinted](https://www.vinted.com/), [Grailed](https://www.grailed.com/),
   [Depop](https://www.depop.com/) or local alternatives. Select the user's
   marketplace region; verify shipping rather than assuming cross-border access.
   Inspect seller, condition, measurements, authenticity evidence, returns and
   delivery. Parent products, starting prices and sample images are not variants.
4. Check the merchant's offers, outlet/refurbished stock if acceptable, newsletter
   or first-order promotions, then relevant coupon sources. Open-box, refurbished,
   used and final-sale options are distinct from new stock. Do not infer a
   warranty, authentic item, or trustworthy seller from a low price or badge.

For an unlabelled fashion photo, resolve the original collection/look when
possible, expand its gallery, and compare distinctive pockets, closure and hem
against seller photos. A matching lookbook image establishes the source look,
not a retail model name, production variant, available size or stock. Collection
samples can differ from retail; retain unresolved identity instead of naming a
lookalike. Public reference thumbnails can be compared locally without uploading
the user's image. An optional reverse-image search can use an already-public
source image; a challenge remains a blocked route, not a required dependency.
If Lens is unavailable, try Bing Visual Search or Yandex Images with that public
URL, optionally cropped through the source's public image controls. Follow the
actual source matches: generated image-search answers can confidently name a
different garment. Check neighbouring categories such as shirts/overshirts and
use retailer lookbooks for captions; do not infer a missing retail SKU from a
collection image or an incomplete archive.
For a generic retailer title, compare its public GTIN/EAN and size variants with
the manufacturer's product data. Shared barcodes can resolve the style code;
reseller feature descriptions can be wrong even when the product is identified.
For collection-year requests, match the garment's style code to a dated brand or
stockist record. Purchase/upload dates and seller account dates do not establish
the collection; retain unknown years as conditional leads rather than excluding
them silently or treating them as eligible.

Read the marketplace's actual search context and inspect listing images even
when titles are vague. Vinted can return other brands containing the search
words; its image-overlay links may carry the title and prices in `title` rather
than visible link text. Inspect the selected item and actual tag before ranking.
Grailed's M / EU 48–50 group does not verify a 48 tag. Use the US Vinted catalogue
for a US mission; foreign inventory needs separately verified delivery access.
Keep identity failures separate from access failures and from no suitable stock.
Compare advertised counts with unique loaded cards. Use ordinary scrolling or
Load more to expose further candidates; report the extent actually inspected,
not a first viewport as the whole search. An obscured pocket alone is not a
definitive mismatch; verify visible closure, hem, cuffs and other product angles.

### Graded collectibles and auctions

Resolve natural language to the actual issue/edition: original versus reprint or
facsimile, series/volume, cover and publication dates. Search naming variants;
Green Lantern #87's original 1971/72 dates describe the same issue, while a later
series' #87 is different. Verify grader, numerical grade, certificate/label,
restoration/qualification notes and actual item images. A seller's raw grade
estimate is not a certified grade. Keep qualified/restored copies separate from
otherwise equivalent universal grades; ask only if accepting them changes the
decision. A high qualified number can conceal a much lower universal grade.

Check eBay, specialist dealers such as MyComicShop, and relevant auction houses
such as Heritage, ComicConnect or ComicLink. Sold records and price guides are
comparables, not stock. Check active status, ending date/time, reserve, buyer's
premium, shipping and tax. Keep current bid and possible maximum bid separate
from buy-now offers. Cross-check certificate IDs for cross-listed copies.
Use the actual label photo: automatically generated image descriptions can
misidentify the grader or cover. A listing-advertised coupon is a conditional
price until its terms and actual account/basket application are checked.
Inspect variant-specific stock, not just a catalogue price; a cheaper slab can
remain in the selector after selling out. Search results can also mix original
issues, facsimiles, loose pages and later volumes. Check the actual search
query: eBay rewrote a CBCS query to CGC until its “Search instead” link was used.
Its “See more results” link also exposed inventory omitted from streamlined
results. Review promising pages without treating recommendation cards as exact
query matches.

Follow seller and certificate leads to other marketplaces. In the live test,
the same CGC certificate was pictured on eBay and a cheaper MySlabs listing.
Count the latter's mandatory buyer fee, verify domestic shipping eligibility,
and compare its return terms. Matching photos/certificates identify a
cross-listed copy; they do not independently authenticate a seller or reserve
stock. Keep “sale pending,” historical auction prices, bid prices and minimum
“Make Offer to Owner” amounts separate from live fixed asking prices. Do not
submit a seller offer merely to find out whether the price will be accepted.
For browser extraction and the optional official eBay API helper, read
[browser-access.md](browser-access.md). No developer account is needed for the
ordinary browser route.

### When Amazon or another merchant blocks the agent

Keep the merchant in the coverage record. Distinguish a broken tool or public
JS rendering problem from a login requirement, explicit bot challenge or access
denial. A normal supported browser can resolve rendering; it is not permission
to defeat a bot restriction. Respect rate limits and the tool's access limits.

Use whichever of these independent, permitted paths is available:

- A normal browser for public pages, or an authorized user-browser session if
  the host supports it and access is permitted. Missing fields in an extracted
  or cached page do not establish that the ordinary browser is blocked.
  The user handles login or CAPTCHA. Resume only when ordinary access is
  available; a session does not guarantee agent access or personalized prices.
- Search-engine discovery: `site:amazon.<market> "exact model"` or an ASIN.
  Use indexed results to locate the product; mark quoted prices as indexed
  estimates, not live availability or the user's checkout price.
- A user-provided product link, visible price/cart details, or screenshot when
  direct inspection is unavailable. Mark provenance and remaining uncertainty.
  Continue checking other sellers while awaiting this information.

Do not rotate identities/proxies, forge tokens, solve challenges through an
automated bypass service, or repeat denied calls through alternate endpoints.
Changing the evidence source is a fallback, not proof that the merchant was read.

For Amazon, capture marketplace domain, ASIN and selected variant, actual seller,
condition, quantity, delivery destination and date, shipping, taxes and any coupon
or subscription requirement. Scope reads to the selected offer panel. Keep used
offers, other sellers, multipacks, installments and credit-card signup credits
separate. A sub-threshold order does not inherit free shipping from the banner.
The same model on a different national Amazon site
can have different fulfillment, duties, specifications or warranty; compare its
delivered total only if it is eligible for the mission.

This workflow does not require an Amazon API or a third-party scraping service.
If ordinary access fails, retain the indexed lead with its date and unresolved
costs, and continue other sellers. Stop probing a host after an explicit block.

Example: Amazon appears at $79 in search, another retailer has a verified $85
delivered total, and Amazon inspection is blocked. Report the retailer as the
best verified option and Amazon as a possible cheaper lead with an indexed price.
If a user later supplies an Amazon cart totaling $91, the retailer still wins.

## Event tickets

Start with the event/venue/team's official ticket link and box office. Discover
resale through [SeatPick](https://seatpick.com/),
[TicketData](https://www.ticketdata.com/), then relevant sellers such as
[Ticketmaster](https://www.ticketmaster.com/), [SeatGeek](https://seatgeek.com/),
[StubHub](https://www.stubhub.com/), [TickPick](https://www.tickpick.com/) and
[Gametime](https://gametime.co/). Verify the actual seller options that could win.

Match opponent, event date and venue; exclude parking, hospitality or partial
access unless requested. Set quantity before reading prices. For a pair, verify
adjacency, section/row, restrictions or obstructed views, transfer timing and
combined total. A $45 starting price or price-history floor is not proof that
two adjacent tickets are purchasable for $90. Check promo eligibility and all
mandatory charges; recheck the selected listing before any authorized purchase.
Cross-listed inventory is not necessarily an independent alternative or a hold.
Wait for listing rows after changing quantity. Reopen the candidate and read its
own section, row, quantity and notes; page titles, history charts and get-in
summaries can disagree with the current rows. "Includes fees" does not by itself
establish tax inclusion. Do not turn rounded dollars per seat into an exact
order total or treat a seller's adjacency policy as a checkout confirmation.

## Food orders

Search the restaurant branch's own ordering link and services available at the
actual address, for example [DoorDash](https://www.doordash.com/),
[Uber Eats](https://www.ubereats.com/), [Grubhub](https://www.grubhub.com/) and
[Wonder](https://www.wonder.com/). Deal aggregators can expose leads but do not
establish the account's cart price. No integration with these sites is bundled.

Compare the same branch, items, quantities, sizes, modifiers and fulfillment
time. Preserve exclusions, sold-out items, BOGO quantities, discount caps and
minimums. Include per-platform menu prices, delivery/service/small-order fees,
tax, and the same user-selected tip treatment. Keep pickup separate unless
allowed. Public, new-user and member-only offers are separate scenarios until
eligibility is known. Verify membership cost if joining is part of the proposal.
Select required modifiers before trusting a “from” price; some selectors replace
the base price rather than add to it. Confirm the actual cart items and amounts.
Read its delivery/service/small-order fees separately from a spend-threshold
upsell or membership banner. A visible $0 delivery fee does not waive service
fees or tax. Record promo acceptance or the actual rejection reason; “no offers
found” in a guest account does not establish that a signed-in user has none.
An account gate leaves the cart partial; do not estimate missing fees or tax as
zero, or substitute pickup to manufacture a comparable total.

For an exploratory test, establish a common branch and basket across the chosen
channels before building carts. If the requested restaurant is missing from one
channel's actual catalogue, report that gap or test a clearly identified common
alternative; do not silently substitute a similar restaurant.

A BOGO item may default to quantity two even when one was requested. Inspect the
normal cart quantity editor for a supported quantity of one, then verify that
both quantities and fees changed. Keep the exact basket and bonus-item scenario
separate. A free item can raise service fees: in the live test, Uber's second
burger was free but increased the total by $3.94. Re-read the full quote after
each promo/quantity change rather than subtracting the advertised savings.

Use the same authorized account session for each app and capture its best
eligible promo plus the ordinary basket price. Test realistic public and visible
account offers individually; record acceptance, savings and rejection reasons.
Keep existing credits separate from a reusable deal, and do not activate a paid
membership or trial during research. Inspect an existing cart before changing
it; preserve its contents and restore research changes when feasible. Stop
before Place order, payment confirmation, subscription or other commitment.

Treat Wonder as a fourth ordering channel. Check both its own restaurant
catalogue and any partner restaurant marketplace exposed to that account.
A missing restaurant on Wonder's public location menu does not establish that
it is absent from its app. Partner and Wonder restaurant promos may have
different eligibility; verify the exact branch, basket and checkout independently
from Grubhub. If an offer is native-app-only, require supported app control or
user-provided evidence rather than claiming the website covers it.

## Local services and vouchers

Identify provider branch, exact service/duration, date/time and required
practitioner or facilities. Search the provider's own pricing/booking pages,
relevant booking marketplaces (for example [Fresha](https://www.fresha.com/),
[Booksy](https://booksy.com/) or [Treatwell](https://www.treatwell.com/)), and
discounters such as [Groupon](https://www.groupon.com/) where locally relevant.

Check first-visit and newsletter offers, off-peak slots, gift/package pricing,
and eligible app promotions. Read the particular voucher's fine print: valid
branches, new-client definition, service inclusions, booking availability,
redemption deadline, blackout dates, extra charges and cancellation/refund terms.
Distinguish first use of a platform from first visit to the provider. A voucher
that cannot be booked for the requested time does not satisfy the mission.
Separate any discretionary tip from mandatory charges using the same treatment.
Do not buy a voucher just to discover appointment availability.

[Groupon's promotion guide](https://www.groupon.com/faq/promo-codes-and-promotions/how-to-use-groupon-promo-codes)
and [buying guide](https://www.groupon.com/faq/getting-started-with-groupon/buying-groupons)
describe deal-specific eligibility and fine print; reviewed 2026-11-02.

## Other purchase categories

For flights and hotels, use [travel.md](travel.md). For rentals, subscriptions,
digital goods or unfamiliar services, apply
the shared workflow and discover category-specific routes. Establish the unit
being compared: whole stay vs nightly rate, baggage/occupancy, rental deposit vs
cost, introductory vs renewal period, license region/seat count, or compatibility.
Do not borrow a category's completeness claim for a category not yet tested.

## Negotiation

Use listed offer functionality or authorized seller messages. Inspect the
listing and current platform rules before acting. Draft an offer from comparable
available listings, condition and total budget; do not invent a competing quote.
State item offer separately from shipping, taxes and platform charges.

If sending is authorized, confirm the listing, permitted opening amount and
all-in ceiling; use the user's strategy or at most one opening message and one
counteroffer by default. Stop when terms exceed the ceiling, the seller declines,
the limit is reached, or the task expires. Ask about material unknown costs if
they could cause an authorized commitment to exceed the budget.

Check whether Send Offer, Accept or a bid creates a purchase obligation or
automatic payment. These require purchase/commitment authority, even if the user
authorized negotiation messages. eBay documents possible automatic payment in
its [payment guide](https://www.ebay.com/help/buying/paying/paying?id=4009);
Poshmark describes accepted offers as completing a purchase in its
[buying guide](https://support.poshmark.com/s/article/How-to-buy-on-Poshmark?language=en_US).
Reviewed 2026-11-02; inspect current terms for every other marketplace.

Keep asking price, proposed offer, seller-agreed price and confirmed purchase
distinct. An unanswered offer or an auction's current bid cannot win as an
available fixed price. For a single-item mission, do not leave multiple binding
offers outstanding. Keep negotiations on the marketplace when using its listings.
