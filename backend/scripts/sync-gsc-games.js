/**
 * GSC+ Game Sync Script
 * Fetches all available games from GSC+ and saves to local database
 * 
 * Usage: node scripts/sync-gsc-games.js
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Fetches all available products from GSC+
 * 3. For each product, fetches all games
 * 4. Upserts games into the GscGame collection
 * 5. Reports sync statistics
 */

require('dotenv').config();
const mongoose = require('mongoose');
const gscService = require('../services/gsc.service');
const GscGame = require('../models/GscGame');
const gscConfig = require('../config/gsc');

const syncGames = async () => {
  console.log('========================================');
  console.log('  GSC+ Game Sync Script');
  console.log('  Environment:', gscConfig.environment);
  console.log('  Operator:', gscConfig.operatorCode);
  console.log('========================================\n');

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }

  try {
    // Step 1: Get all available products
    console.log('📋 Fetching available products...');
    const productList = await gscService.getProductList();
    const products = Array.isArray(productList) ? productList : [];
    console.log(`   Found ${products.length} product(s)\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Check your operator_code and secret_key.');
      process.exit(0);
    }

    // Print product summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Product Code | Provider       | Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const p of products) {
      const code = String(p.product_code).padEnd(12);
      const name = (p.provider || p.product_name || 'Unknown').padEnd(14);
      console.log(`  ${code} | ${name} | ${p.status}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 2: Sync games for each product
    let totalNew = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const product of products) {
      const productCode = product.product_code;
      const providerName = product.provider || product.product_name || `Product ${productCode}`;

      console.log(`🎮 Syncing: ${providerName} (${productCode})...`);

      try {
        let offset = 0;
        let hasMore = true;
        let productGameCount = 0;

        while (hasMore) {
          const result = await gscService.getGameList({
            productCode,
            offset,
            size: 100,
          });

          const games = result.provider_games || [];

          for (const game of games) {
            try {
              const category = gscConfig.gameTypeToCategory[game.game_type] || 'other';

              const existingGame = await GscGame.findOne({
                gameCode: game.game_code,
                productCode: game.product_code,
                supportCurrency: game.support_currency,
              });

              await GscGame.findOneAndUpdate(
                {
                  gameCode: game.game_code,
                  productCode: game.product_code,
                  supportCurrency: game.support_currency,
                },
                {
                  gameName: game.game_name,
                  productId: game.product_id,
                  productCode: game.product_code,
                  productName: providerName,
                  gameType: game.game_type,
                  category,
                  imageUrl: game.image_url,
                  langName: game.lang_name || {},
                  langIcon: game.lang_icon || {},
                  supportCurrency: game.support_currency,
                  gscStatus: game.status,
                  allowFreeRound: game.allow_free_round || false,
                  gscCreatedAt: game.created_at,
                },
                { upsert: true, new: true }
              );

              if (!existingGame) {
                totalNew++;
              } else {
                totalUpdated++;
              }
              productGameCount++;
            } catch (gameErr) {
              totalErrors++;
              console.error(`   ⚠️  Error syncing game ${game.game_code}:`, gameErr.message);
            }
          }

          // Check pagination
          const pagination = result.pagination;
          if (pagination && (offset + games.length) < parseInt(pagination.total, 10)) {
            offset += games.length;
          } else {
            hasMore = false;
          }
        }

        console.log(`   ✅ ${productGameCount} game(s) synced`);
      } catch (err) {
        console.error(`   ❌ Failed: ${err.message}`);
        totalErrors++;
      }
    }

    // Print summary
    console.log('\n========================================');
    console.log('  SYNC COMPLETE');
    console.log('========================================');
    console.log(`  🆕 New games:     ${totalNew}`);
    console.log(`  🔄 Updated games: ${totalUpdated}`);
    console.log(`  ❌ Errors:        ${totalErrors}`);
    console.log(`  📊 Total in DB:   ${await GscGame.countDocuments()}`);
    console.log('========================================\n');

    // Category breakdown
    const categories = await GscGame.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log('📁 Games by Category:');
    for (const cat of categories) {
      console.log(`   ${cat._id}: ${cat.count}`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit(0);
  }
};

syncGames();
