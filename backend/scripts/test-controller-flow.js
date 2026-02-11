const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const casinoController = require('../controllers/casino.controller');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testControllerFlow() {
    try {
        console.log('--- Controller Flow Test ---');

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is undefined');
        await mongoose.connect(uri);
        console.log('Connected.');

        // Check connection state
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Mongoose not connected (readyState !== 1)');
        }

        // Mock Request
        // User ID: 696a089885fb45a0a0c5f775 (admin)
        // Game ID: 6989e1e9a5dc29674d32a4b7 (Mahjong Ways)
        const req = {
            user: { id: '696a089885fb45a0a0c5f775' },
            params: { id: '6989e1e9a5dc29674d32a4b7' },
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'x-forwarded-for': '127.0.0.1'
            },
            ip: '127.0.0.1',
            connection: { remoteAddress: '127.0.0.1' }
        };

        // Mock Response
        const res = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                console.log(`\nResponse Status: ${this.statusCode}`);
                console.log('Response JSON:', JSON.stringify(data, null, 2));
                return this;
            }
        };

        // Mock Next
        const next = (err) => {
            if (err) {
                console.error('Controller called next(err):', err);
            }
        };

        console.log('Calling launchGame controller...');

        // Execute and await
        await casinoController.launchGame(req, res, next);

        // Extra wait just in case
        await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
        console.error('--- Controller Test Failed ---');
        console.error(error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit();
    }
}

testControllerFlow();
