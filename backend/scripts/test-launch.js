const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { launchGame } = require('../services/gsc.service');
const gscConfig = require('../config/gsc');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testLaunch() {
    try {
        console.log('--- GSC Launch Game Test ---');
        console.log('Operator Code:', gscConfig.operatorCode);
        console.log('Operator URL:', gscConfig.operatorUrl);

        // Using valid game details from previous fetch
        const mockLaunchData = {
            memberAccount: 'test_user_001',
            password: 'test_password_md5_hash',
            nickname: 'Test User',
            currency: 'IDR2', // Using supported currency from game details
            productCode: 1007, // PG Soft
            gameType: 'SLOT',
            gameCode: '65', // Mahjong Ways
            ip: '127.0.0.1',
            platform: 'WEB',
            lobbyUrl: 'http://localhost:3000/casino',
        };

        console.log('Attempting to launch with data:', mockLaunchData);

        const result = await launchGame(mockLaunchData);

        console.log('--- Launch Result ---');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('--- Launch Failed ---');
        console.error(error);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    } finally {
        process.exit();
    }
}

testLaunch();
