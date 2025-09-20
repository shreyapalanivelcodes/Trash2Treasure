const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

// GET /api/leaderboard
// Optional query: ?org=ORG_NAME
router.get('/', async (req, res) => {
  try {
    const orgName = req.query.org || req.query.organization;
    let matchStage = {};

    if (orgName) {
      const orgUsers = await User.find({ organization: { $regex: `^${orgName}$`, $options: 'i' } }, '_id');
      const orgUserIds = orgUsers.map(u => u._id);
      matchStage = { user: { $in: orgUserIds } };
    }

    const leaderboard = await Item.aggregate([
      { $match: matchStage },
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user_info"
        }
      },
      { $unwind: "$user_info" },
      {
        $project: {
          _id: 0,
          name: "$user_info.name",
          count: 1,
          organization: "$user_info.organization" // ✅ Include org
        }
      }
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /api/leaderboard/my-org
router.get('/my-org', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const orgName = user.organization;

    if (!orgName) {
      return res.status(400).json({ message: "No organization found for user" });
    }

    const orgUsers = await User.find({ organization: { $regex: `^${orgName}$`, $options: 'i' } }, '_id');
    const orgUserIds = orgUsers.map(u => u._id);

    const leaderboard = await Item.aggregate([
      { $match: { user: { $in: orgUserIds } } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user_info"
        }
      },
      { $unwind: "$user_info" },
      {
        $project: {
          _id: 0,
          name: "$user_info.name",
          count: 1,
          organization: "$user_info.organization" // ✅ Include org
        }
      }
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
