const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { getProductList } = require('../services/gsc.service');
const gscConfig = require('../config/gsc');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testFetchProducts() {
    try {
        console.log('--- GSC Fetch Products Test ---');
        console.log('Operator Code:', gscConfig.operatorCode);

        const result = await getProductList();

        console.log('--- Fetch Result ---');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('--- Fetch Failed ---');
        console.error(error);
    } finally {
        process.exit();
    }
}

testFetchProducts();
