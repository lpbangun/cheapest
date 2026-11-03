"""Offline contract tests; no eBay credentials or network requests."""
import os
import unittest
from unittest.mock import patch
import ebay_search as ebay


class SearchTests(unittest.TestCase):
    def test_auction_never_becomes_buy_now(self):
        item = ebay.normalize({'buyingOptions': ['AUCTION'], 'price': {'value': '1000', 'currency': 'USD'},
                               'currentBidPrice': {'value': '162.50', 'currency': 'USD'}})
        self.assertIsNone(item['fixed_price'])
        self.assertEqual(item['current_bid']['value'], '162.50')
        self.assertIsNone(item['delivered_total'])
        self.assertIsNone(item['shipping_options'])

    def test_dual_format_prices_stay_separate(self):
        item = ebay.normalize({'buyingOptions': ['AUCTION', 'FIXED_PRICE'],
                               'price': {'value': '600', 'currency': 'USD'},
                               'currentBidPrice': {'value': '300', 'currency': 'USD'}})
        self.assertEqual(item['fixed_price']['value'], '600')
        self.assertEqual(item['current_bid']['value'], '300')

    def test_credentials_missing_is_not_empty_stock(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(ebay, 'request_json') as call:
            with self.assertRaisesRegex(ebay.CredentialsRequired, 'missing_credentials'):
                ebay.token()
            call.assert_not_called()

    def test_pagination_and_destination_are_not_lost(self):
        with patch.object(ebay, 'request_json', return_value={'total': 80, 'next': 'url', 'itemSummaries': []}) as call:
            result = ebay.search('green lantern 87 cgc', 'NOT_A_REAL_TOKEN', auction=True, postal='10024')
        self.assertTrue(result['next_page'])
        self.assertEqual(result['next_offset'], 50)
        self.assertEqual(result['postal_context'], '10024')
        self.assertIn('AUCTION', call.call_args.args[0])
        self.assertIn('zip%3D10024', call.call_args.kwargs['headers']['X-EBAY-C-ENDUSERCTX'])


if __name__ == '__main__':
    unittest.main()
