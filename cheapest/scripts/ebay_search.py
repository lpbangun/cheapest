#!/usr/bin/env python3
"""Direct official eBay Browse API discovery. Python stdlib; never bids/buys."""
import argparse
import base64
import datetime
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API = 'https://api.ebay.com'


class CredentialsRequired(Exception):
    pass


def request_json(url, *, headers, data=None):
    req = urllib.request.Request(url, headers=headers, data=data)
    with urllib.request.urlopen(req, timeout=25) as response:
        return json.load(response)


def token():
    if os.environ.get('EBAY_APP_TOKEN'):
        return os.environ['EBAY_APP_TOKEN']
    client, secret = os.environ.get('EBAY_CLIENT_ID'), os.environ.get('EBAY_CLIENT_SECRET')
    if not client or not secret:
        raise CredentialsRequired('missing_credentials')
    encoded = base64.b64encode((client + ':' + secret).encode()).decode()
    result = request_json(API + '/identity/v1/oauth2/token', headers={
        'Authorization': 'Basic ' + encoded,
        'Content-Type': 'application/x-www-form-urlencoded'}, data=urllib.parse.urlencode({
            'grant_type': 'client_credentials', 'scope': 'https://api.ebay.com/oauth/api_scope'}).encode())
    return result['access_token']


def normalize(item):
    options = item.get('buyingOptions', [])
    auction = 'AUCTION' in options
    # A bid is never converted to a purchasable fixed price, including dual-format listings.
    fixed = item.get('price') if 'FIXED_PRICE' in options else None
    bid = item.get('currentBidPrice') if auction else None
    return {
        'item_id': item.get('itemId'), 'legacy_item_id': item.get('legacyItemId'),
        'title': item.get('title'),
        'url': item.get('itemWebUrl', '').split('?')[0],
        'buying_options': options, 'fixed_price': fixed, 'current_bid': bid,
        'bid_count': item.get('bidCount'), 'ends_at': item.get('itemEndDate'),
        'shipping_options': item.get('shippingOptions'), 'item_location': item.get('itemLocation'),
        'condition': item.get('condition'), 'seller': item.get('seller', {}).get('username'),
        'tax': None, 'delivered_total': None,
        'verification': 'API search lead; verify exact edition, grading label, stock and destination costs.'}


def search(query, bearer, *, auction=False, limit=50, offset=0, postal=None):
    params = {'q': query, 'limit': limit, 'offset': offset, 'sort': 'price',
              'filter': 'buyingOptions:{' + ('AUCTION' if auction else 'FIXED_PRICE') + '}'}
    headers = {'Authorization': 'Bearer ' + bearer, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'}
    if postal:
        headers['X-EBAY-C-ENDUSERCTX'] = 'contextualLocation=' + urllib.parse.quote(
            'country=US,zip=' + postal, safe='')
    data = request_json(API + '/buy/browse/v1/item_summary/search?' + urllib.parse.urlencode(params),
                        headers=headers)
    return {'source': 'eBay Browse API production', 'query': query,
            'observed_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'marketplace': 'EBAY_US', 'postal_context': postal,
            'format': 'auction' if auction else 'fixed_price',
            'total_matches': data.get('total'), 'offset': offset,
            'next_page': bool(data.get('next')), 'next_offset': offset + limit if data.get('next') else None,
            'warnings': data.get('warnings', []),
            'offers': [normalize(i) for i in data.get('itemSummaries', [])]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query')
    parser.add_argument('--auction', action='store_true')
    parser.add_argument('--limit', type=int, default=50)
    parser.add_argument('--offset', type=int, default=0)
    parser.add_argument('--postal')
    args = parser.parse_args()
    if not 1 <= args.limit <= 200 or args.offset < 0:
        parser.error('limit must be 1..200 and offset nonnegative')
    if args.postal and (len(args.postal) != 5 or not args.postal.isdigit()):
        parser.error('postal must be a five-digit US ZIP')
    try:
        result = search(args.query, token(), auction=args.auction, limit=args.limit,
                        offset=args.offset, postal=args.postal)
    except CredentialsRequired:
        result = {'status': 'credentials_required', 'offers': None,
                  'message': 'Set EBAY_APP_TOKEN or EBAY_CLIENT_ID/EBAY_CLIENT_SECRET locally. No request made; no inventory result.'}
    except urllib.error.HTTPError as exc:
        result = {'status': 'api_error', 'http_status': exc.code, 'offers': None,
                  'message': 'API access failed. Check production approval, credential scope or rate limit. No inventory conclusion.'}
    except (OSError, KeyError, json.JSONDecodeError):
        result = {'status': 'request_failed', 'offers': None, 'message': 'No usable API result. No inventory conclusion.'}
    print(json.dumps(result, indent=2))
    return 2 if 'status' in result else 0


if __name__ == '__main__':
    sys.exit(main())
