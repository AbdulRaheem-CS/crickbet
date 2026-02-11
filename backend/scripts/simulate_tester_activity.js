require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Bet = require('../models/Bet');

async function run() {
  try {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/crickbet';
  console.log('Using MongoDB URI:', uri);
  await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Find tester user
    const tester = await User.findOne({ $or: [ { email: 'tester123@gmail.com' }, { username: 'tester' } ] });
    if (!tester) {
      console.error('Tester user not found. Make sure tester exists.');
      process.exit(1);
    }

    console.log('Found tester:', tester.username, tester._id.toString());

    // 1) Create a completed deposit transaction of 1000
    const depositAmount = 1000;
    const userBeforeBalance = tester.wallet?.balance || 0;
    const depositTxn = new Transaction({
      user: tester._id,
      type: 'deposit',
      amount: depositAmount,
      balanceBefore: userBeforeBalance,
      balanceAfter: userBeforeBalance + depositAmount,
      status: 'completed',
      currency: tester.wallet?.currency || 'INR',
      description: 'Test deposit for affiliate commission verification',
      txnRef: Transaction.generateTxnRef(),
      processedBy: null,
    });

    await depositTxn.save();

    // update user wallet
    tester.wallet = tester.wallet || {};
    tester.wallet.balance = (tester.wallet.balance || 0) + depositAmount;
    tester.wallet.lastTransactionAt = new Date();
    await tester.save();

    console.log(`Created deposit txn ${depositTxn.txnRef}, new balance: ${tester.wallet.balance}`);

    // 2) Create a matched bet and settle it as a win to produce profit
    const stake = 200;
    const odds = 3.0; // profit = stake * (odds - 1) = 400

    const bet = new Bet({
      user: tester._id,
      market: new mongoose.Types.ObjectId(),
      event: { id: 'EVT-TEST-1', name: 'Test Match', sportId: '1', sportName: 'Cricket' },
      selection: { id: 'SEL-1', name: 'Team A' },
      betType: 'back',
      odds,
      stake,
  matchedAmount: stake,
  unmatchedAmount: 0,
  potentialProfit: stake * (odds - 1),
  liability: stake,
      status: 'matched',
      commission: { rate: 2, amount: 0 },
      betRef: Bet.generateBetRef(),
      placedFrom: { ip: '127.0.0.1', userAgent: 'script' },
    });

    // save bet
    await bet.save();
    console.log('Created bet', bet.betRef);

    // Settle bet as won
    const settlement = await bet.settle('won', null);
    await bet.save();

    console.log('Bet settled:', settlement);

    // 3) Create a bet_won transaction for tester (credit profit)
    const profit = settlement.profitLoss; // already reduced by commission in settle
    const beforeBal = tester.wallet.balance;
    const afterBal = beforeBal + profit;

    const betTxn = new Transaction({
      user: tester._id,
      type: 'bet_won',
      amount: profit,
      balanceBefore: beforeBal,
      balanceAfter: afterBal,
      status: 'completed',
      currency: tester.wallet?.currency || 'INR',
      description: `Bet settled ${bet.betRef} - profit credited`,
      betDetails: {
        betId: bet._id,
        betRef: bet.betRef,
        stake: bet.stake,
        odds: bet.odds,
      },
      txnRef: Transaction.generateTxnRef(),
    });

    await betTxn.save();

    // update tester wallet
    tester.wallet.balance = afterBal;
    tester.wallet.lastTransactionAt = new Date();
    await tester.save();

    console.log(`Credited profit ${profit} to tester, new balance: ${tester.wallet.balance}`);

    // 4) Credit affiliate commission if referredBy exists
    const affiliateId = tester.referredBy;
    if (affiliateId) {
      const affiliate = await User.findById(affiliateId);
      if (!affiliate) {
        console.warn('Affiliated user id present on tester but affiliate user not found.');
      } else {
        // Commission amount recorded earlier in bet.commission.amount
        const commissionAmount = settlement.commission || bet.commission.amount || 0;

        if (commissionAmount > 0) {
          const affBefore = affiliate.wallet?.balance || 0;
          const affTxn = new Transaction({
            user: affiliate._id,
            type: 'commission',
            amount: commissionAmount,
            balanceBefore: affBefore,
            balanceAfter: affBefore + commissionAmount,
            status: 'completed',
            currency: affiliate.wallet?.currency || 'INR',
            description: `Affiliate commission from ${tester.username} (${bet.betRef})`,
            txnRef: Transaction.generateTxnRef(),
          });

          await affTxn.save();

          // update affiliate wallet
          affiliate.wallet = affiliate.wallet || {};
          affiliate.wallet.balance = (affiliate.wallet.balance || 0) + commissionAmount;
          affiliate.wallet.lastTransactionAt = new Date();
          await affiliate.save();

          console.log(`Credited commission ${commissionAmount} to affiliate ${affiliate.username}, new balance: ${affiliate.wallet.balance}`);
        } else {
          console.log('No commission amount computed for this settled bet (commission=0).');
        }
      }
    } else {
      console.log('Tester has no referredBy set; no affiliate credited.');
    }

    console.log('Simulation complete');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
