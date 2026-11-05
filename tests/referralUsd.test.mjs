import { test } from 'node:test';
import assert from 'node:assert/strict';
import { referralUsdTotal, formatReferralUsd } from '../src/pages/client/referral/referralUsd.js';

const coins = [
  { id: 'bitcoin', symbol: 'btc', current_price: 60000 },
  { id: 'ethereum', symbol: 'eth', current_price: 3000 },
];
test('sums crypto USD equivalents and stablecoins', () => {
  assert.equal(referralUsdTotal({ BTC: 0.1, ethereum: 2, USD: 20, USDT: 30, USDC: 10 }, coins), 12060);
  assert.equal(formatReferralUsd(referralUsdTotal({ bitcoin: 0.1 }, coins)), '$6,000.00');
});
test('zero and admin-set USD availability do not need market prices', () => {
  assert.equal(formatReferralUsd(referralUsdTotal({ USD: 0 })), '$0.00');
  assert.equal(formatReferralUsd(referralUsdTotal({ USD: 125.5 })), '$125.50');
  assert.equal(referralUsdTotal({ BTC: 0 }), 0);
});
test('missing crypto prices cannot silently display crypto amounts as dollars', () => {
  assert.equal(referralUsdTotal({ BTC: 0.1 }), null);
  assert.equal(referralUsdTotal({ UNKNOWN: 1 }, coins), null);
});
test('reversals reduce the converted total', () => {
  assert.equal(referralUsdTotal({ BTC: -0.01, USD: 1000 }, coins), 400);
});
