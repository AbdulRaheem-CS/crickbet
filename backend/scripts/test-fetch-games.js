const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { getGameList } = require('../services/gsc.service');
const gscConfig = require('../config/gsc');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testFetchGames() {
    try {
        console.log('--- GSC Fetch Games Test ---');
        console.log('Operator Code:', gscConfig.operatorCode);

        // Using PG Soft product code from the fetched list
        const productCode = 1007;
        console.log(`Fetching games for product code: ${productCode}`);

        const result = await getGameList({ productCode, size: 5 });

        console.log('--- Fetch Result ---');
        console.log(JSON.stringify(result, null, 2));

        if (result.provider_games && result.provider_games.length > 0) {
            console.log('--- First Game Details ---');
            console.log(result.provider_games[0]);
        } else {
            console.log('No games found or error in structure');
        }

    } catch (error) {
        console.error('--- Fetch Failed ---');
        console.error(error);
    } finally {
        process.exit();
    }
}

testFetchGames();
