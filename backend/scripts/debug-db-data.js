const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const GscGame = require('../models/GscGame');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function debugDbData() {
    try {
        console.log('--- Database Debug Script ---');

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        // Use MONGODB_URI consistent with .env file
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is undefined in .env');
        }
        await mongoose.connect(uri);
        console.log('Connected.');

        // 1. Find the game "Mahjong Ways" (code 65, product 1007)
        console.log('\nSearching for game "Mahjong Ways" (code 65)...');
        const game = await GscGame.findOne({ gameCode: '65', productCode: 1007 });

        if (game) {
            console.log('--- Game Found ---');
            console.log(`ID: ${game._id}`);
            console.log(`Name: ${game.gameName}`);
            console.log(`Game Code: ${game.gameCode} (Type: ${typeof game.gameCode})`);
            console.log(`Product Code: ${game.productCode} (Type: ${typeof game.productCode})`);
            console.log(`Game Type: ${game.gameType}`);
            console.log(`Status: ${game.status}`);
            console.log('Full Object:', JSON.stringify(game.toObject(), null, 2));
        } else {
            console.log('ERROR: Game not found in DB!');
            console.log('Searching for ANY game with productCode 1007...');
            const anyGame = await GscGame.findOne({ productCode: 1007 });
            if (anyGame) {
                console.log('Found a PG Soft game:', anyGame.gameName, anyGame.gameCode);
            } else {
                console.log('No PG Soft games found in DB at all.');
            }
        }

        // 2. Check for a user to test with
        console.log('\nSearching for a test user...');
        const user = await User.findOne();
        if (user) {
            console.log(`Found User: ${user.username} (ID: ${user._id})`);
            console.log(`Wallet Balance: ${user.wallet ? user.wallet.balance : 'No wallet'}`);
        } else {
            console.log('No users found in DB.');
        }

    } catch (error) {
        console.error('--- Debug Failed ---');
        console.error(error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit();
    }
}

debugDbData();
