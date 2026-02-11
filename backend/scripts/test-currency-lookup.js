const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { getProductCurrency } = require('../services/gsc.service');
const gscConfig = require('../config/gsc');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testCurrencyLookup() {
    try {
        console.log('--- GSC Currency Lookup Test ---');
        console.log('Operator Code:', gscConfig.operatorCode);

        // Test PG Soft (Product Code: 1007, Game Type: SLOT)
        // We expect IDR2 based on previous findings
        const productCode = 1007;
        const gameType = 'SLOT';

        console.log(`Looking up currency for Product: ${productCode}, Type: ${gameType}`);

        const currency = await getProductCurrency(productCode, gameType);

        console.log('--- Lookup Result ---');
        console.log(`Currency: ${currency}`);

        // Check if it matches expectation
        if (currency === 'IDR2') {
            console.log('SUCCESS: Currency matches expected IDR2');
        } else {
            console.log('FAILURE: Currency does not match expected IDR2');
        }

    } catch (error) {
        console.error('--- Lookup Failed ---');
        console.error(error);
    } finally {
        process.exit();
    }
}

testCurrencyLookup();
