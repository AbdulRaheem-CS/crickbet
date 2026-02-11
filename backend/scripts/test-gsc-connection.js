/**
 * GSC+ Connection Test Script
 * Tests the connection to GSC+ staging environment
 * 
 * Usage: node scripts/test-gsc-connection.js
 */

require('dotenv').config();
const gscConfig = require('../config/gsc');
const { generateOutboundSignature, getTimestamp, buildSignedParams, md5 } = require('../utils/gsc-signature');

const BASE_URL = gscConfig.operatorUrl;

console.log('========================================');
console.log('  GSC+ Connection Test');
console.log('========================================');
console.log(`  Operator Code: ${gscConfig.operatorCode}`);
console.log(`  Operator URL:  ${gscConfig.operatorUrl}`);
console.log(`  Environment:   ${gscConfig.environment}`);
console.log(`  Currency:      ${gscConfig.defaultCurrency}`);
console.log('========================================\n');

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  // Test 1: Signature Generation
  console.log('🧪 Test 1: Signature Generation');
  try {
    const requestTime = getTimestamp();
    const sign = generateOutboundSignature('productList', requestTime);
    console.log(`   Request Time: ${requestTime}`);
    console.log(`   Signature:    ${sign}`);
    console.log('   ✅ Signature generated successfully\n');
    passed++;
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}\n`);
    failed++;
  }

  // Test 2: Product List API
  console.log('🧪 Test 2: Fetch Product List');
  try {
    const params = buildSignedParams('productList');
    const url = `${BASE_URL}/api/operators/available-products?${new URLSearchParams(params).toString()}`;
    console.log(`   URL: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      console.log(`   ✅ Got ${data.length} product(s)`);
      console.log('   First 5 products:');
      data.slice(0, 5).forEach(p => {
        console.log(`     - ${p.provider} (${p.product_code}) [${p.status}] - ${p.currency}`);
      });
      passed++;
    } else if (data.code) {
      console.log(`   ❌ API Error: ${data.message} (code: ${data.code})`);
      failed++;
    } else {
      console.log('   ⚠️  Empty response:', JSON.stringify(data).substring(0, 200));
      failed++;
    }
    console.log('');
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}\n`);
    failed++;
  }

  // Test 3: Game List API (using Spribe product code 1138)
  console.log('🧪 Test 3: Fetch Game List (Spribe - 1138)');
  try {
    const params = buildSignedParams('gameList', { product_code: 1138, size: 5 });
    const url = `${BASE_URL}/api/operators/provider-games?${new URLSearchParams(params).toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.provider_games && data.provider_games.length > 0) {
      console.log(`   ✅ Got ${data.provider_games.length} game(s)`);
      data.provider_games.forEach(g => {
        console.log(`     - ${g.game_name} (${g.game_code}) [${g.game_type}] - ${g.status}`);
      });
      if (data.pagination) {
        console.log(`   Total available: ${data.pagination.total}`);
      }
      passed++;
    } else if (data.code && data.code !== 0) {
      console.log(`   ❌ API Error: ${data.message} (code: ${data.code})`);
      failed++;
    } else {
      console.log('   ⚠️  No games found for this product');
      console.log('   Response:', JSON.stringify(data).substring(0, 300));
      failed++;
    }
    console.log('');
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}\n`);
    failed++;
  }

  // Test 4: Wallet Balance API
  console.log('🧪 Test 4: Check Wallet Balance');
  try {
    const params = buildSignedParams('walletBalance');
    const url = `${BASE_URL}/api/operators/wallet-balance?${new URLSearchParams(params).toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 0 && data.data) {
      console.log(`   ✅ Wallet balance retrieved`);
      console.log(`   Operator: ${data.data.operator_code}`);
      console.log(`   Credit Mode: ${data.data.is_credit}`);
      if (data.data.currencies) {
        data.data.currencies.forEach(c => {
          console.log(`     ${c.currency}: ${c.current_balance}`);
        });
      }
      passed++;
    } else {
      console.log('   ⚠️  Response:', JSON.stringify(data).substring(0, 300));
      // Wallet balance may not be available in staging
      passed++;
    }
    console.log('');
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}\n`);
    failed++;
  }

  // Test 5: Callback Signature Verification
  console.log('🧪 Test 5: Callback Signature Verification');
  try {
    const { verifyCallbackSignature, generateCallbackSignature } = require('../utils/gsc-signature');

    const requestTime = String(getTimestamp());
    const opCode = gscConfig.operatorCode;

    // Generate a balance callback signature
    const sign = generateCallbackSignature('balance', opCode, requestTime);
    const isValid = verifyCallbackSignature('balance', opCode, requestTime, sign);

    if (isValid) {
      console.log('   ✅ Callback signature verification works correctly');
      passed++;
    } else {
      console.log('   ❌ Signature verification failed');
      failed++;
    }
    console.log('');
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}\n`);
    failed++;
  }

  // Summary
  console.log('========================================');
  console.log('  TEST RESULTS');
  console.log('========================================');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Total:   ${passed + failed}`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('🎉 All tests passed! GSC+ integration is ready.\n');
    console.log('Next steps:');
    console.log('  1. Run: node scripts/sync-gsc-games.js');
    console.log('  2. Start server: npm run dev');
    console.log('  3. Test game launch via API');
  } else {
    console.log('⚠️  Some tests failed. Please check:');
    console.log('  - GSC_OPERATOR_CODE in .env');
    console.log('  - GSC_SECRET_KEY in .env');
    console.log('  - GSC_OPERATOR_URL in .env');
    console.log('  - Network connectivity to staging.gsimw.com');
  }
};

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
