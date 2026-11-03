# Live-test summary

Manual research runs on November 2–3, 2026 used built-in web tools and an ordinary
browser, then the standalone Camofox service and project helpers. No purchases,
bids, binding offers or seller messages were submitted. An unrelated connected
fetcher was used during the earliest exploration before the no-other-plugins
constraint; its output was excluded from conclusions. Subsequent runs used no
other plugins.

This is a sanitized capability summary. Raw screenshots, uploaded photos,
authorized account sessions, delivery details and account-specific quotes stay
local. Prices were observations at the time, not ongoing offers. These runs were
conducted by the authoring agent, not independent agents or an automated market
coverage benchmark.

| Mission | Observed behavior | Remaining limit |
| --- | --- | --- |
| Amazon product | An ordinary browser exposed the selected new offer when extracted HTML lacked a price. | Shipping, tax and differing retail identifiers prevented a verified delivered winner. |
| Ticket pair | Quantity selection and an offer panel exposed an adjacent-pair candidate with stated fee inclusion. | Full checkout, exact seat numbers and some seller access remained unverified. |
| Flight and hotel fares | Inspected resulting dates, baggage, occupancy, seller handoffs and full-stay quote details. | Observed quotes do not prove universal provider coverage or continuing availability. |
| DoorDash, Uber Eats and Wonder | The user signed in, authorized a common delivery destination, and the agent compared the same branch and order at checkout, including tested promos and fees. | Account-specific result; human login/verification required. Grubhub was excluded by the user and not tested. |
| Monthly storage | Compared move-in charges, renewal terms, prepayment and minimum commitment. | Actual availability and final account checkout require a fresh mission. |
| VPS | Compared configured location, payment term, committed cost and renewal rather than advertised monthly equivalents. | Not a deployment or performance benchmark; plan availability changes. |
| Green Lantern #87, certified 7.0+ | Read actual label photos, tracked the same slab across marketplaces, checked buyer fees and coupon eligibility. | Final tax and account offers were explicitly unverified; no purchase. |
| Photo identification: look 31 | Found the exact original Our Legacy Fall 2025 collection image. Barcodes identified one retailer candidate as a different model. | Original jacket's retail model/style code remained unresolved; no exact EU 48 listing verified. |
| Natural-language shirt request | Found a live Our Legacy tagged-48 M2242BL shirt, with stockist records establishing SS24; compared the same seller's matching listing across eBay and Grailed. | Final tax and personalized shipping-promo eligibility unverified; cheaper shirts without collection-year evidence stayed conditional. Not a universal cheapest-shirt claim. |

The shirt run observed item-plus-shipping subtotals of $151.50 on eBay and
$153.99 on Grailed, with an ongoing Grailed new-buyer offer as a conditional
challenger. Both remain historical observations. The successful shirt search did
not resolve the separate jacket request.

The tests led to small workflow fixes: distinguish extraction failure from an
access block; preserve actual variant and search context; inspect garment tags;
verify collection-year provenance; check promo terms and actual application;
reuse live task-owned browser tabs when tab limits recycle new ones.

## Repeatable checks

The bundled tests cover URL/host restrictions, redaction and listing-link
extraction; the optional browser fixture checks visible read-only prices and
confirms that no purchase control was clicked. Offline eBay tests distinguish
auctions from fixed prices, missing credentials from empty inventory, and retain
pagination and destination context. They do not test current merchant inventory
or prove complete price comparison.
