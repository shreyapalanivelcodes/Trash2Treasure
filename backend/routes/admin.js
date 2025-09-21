const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Match your file name exactly
const Submission = require("../models/submission");
const authMiddleware = require("../middleware/auth"); // JWT check

// ===== ADMIN ONLY MIDDLEWARE =====
const adminOnly = (req, res, next) => {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Admins only" });
    next();
};

// ===== REQUEST ADMIN ACCESS =====
router.post("/request-admin", authMiddleware, async (req, res) => {
    try {
        const userId = req.body.userId || req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });
        if (user.isAdmin) return res.status(400).json({ msg: "Already an admin" });

        user.requestedAdmin = true; // Add this field to user schema if not exists
        await user.save();

        res.json({ msg: "Admin request sent!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// ===== GET ALL USERS (Admin Dashboard) =====
router.get("/users", authMiddleware, adminOnly, async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
});

// ===== DELETE USER =====
router.delete("/users/:id", authMiddleware, adminOnly, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
});

// ===== GET ALL SUBMISSIONS =====
router.get("/submissions", authMiddleware, adminOnly, async (req, res) => {
    const submissions = await Submission.find();
    res.json(submissions);
});

// ===== UPDATE SUBMISSION STATUS =====
router.patch("/submissions/:id", authMiddleware, adminOnly, async (req, res) => {
    const { status } = req.body;
    await Submission.findByIdAndUpdate(req.params.id, { status });
    res.json({ msg: "Status updated" });
});

// ===== APPROVE ADMIN REQUEST =====
router.post("/approve-admin/:id", authMiddleware, adminOnly, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.isAdmin = true;
    user.requestedAdmin = false;
    await user.save();
    res.json({ msg: "User promoted to admin" });
});

module.exports = router;
