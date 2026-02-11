const { asyncHandler } = require('../middleware/error.middleware');
const Bet = require('../models/Bet');
const User = require('../models/User');

/**
 * Get Winner Board Data
 * Returns leader board and first to reach milestones
 */
exports.getWinnerBoard = asyncHandler(async (req, res) => {
  try {
    // Get current date range (last 7 days for example)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Leader Board - Top winners by total winnings
    const leaderBoard = await Bet.aggregate([
      {
        $match: {
          status: 'won',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalWinnings: { $sum: '$payout' },
          gamesWon: { $sum: 1 }
        }
      },
      {
        $sort: { totalWinnings: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          username: '$user.username',
          amount: '$totalWinnings',
          gamesWon: 1,
          game: 'Multiple Games', // You can customize this based on most played game
          date: new Date().toLocaleDateString()
        }
      }
    ]);

    // Add rank numbers
    const leaderBoardWithRank = leaderBoard.map((item, index) => ({
      rank: index + 1,
      username: item.username,
      amount: Math.round(item.amount),
      game: item.game,
      date: item.date
    }));

    // First To Reach - Users who reached specific milestones first
    const firstToReach = await Bet.aggregate([
      {
        $match: {
          status: 'won',
          payout: { $gte: 10000 } // Milestone: 10,000 or more
        }
      },
      {
        $sort: { createdAt: 1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          username: '$user.username',
          amount: '$payout',
          game: '$gameType',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        }
      }
    ]);

    // Add rank numbers
    const firstToReachWithRank = firstToReach.map((item, index) => ({
      rank: index + 1,
      username: item.username,
      amount: Math.round(item.amount),
      game: item.game || 'Casino Game',
      date: item.date
    }));

    res.json({
      success: true,
      data: {
        leaderBoard: leaderBoardWithRank,
        firstToReach: firstToReachWithRank
      }
    });

  } catch (error) {
    console.error('Error fetching winner board:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching winner board data',
      error: error.message
    });
  }
});
