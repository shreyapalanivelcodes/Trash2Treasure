// backend/routes/submission.js
const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const authMiddleware = require("../middleware/auth"); // ensures JWT is valid

// ===== GET ALL SUBMISSIONS (Admin only) =====
router.get("/", authMiddleware, async (req, res) => {
    try {
        // Optional: check if req.user.isAdmin
        const submissions = await Submission.find().sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ===== UPDATE STATUS =====
router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ message: "Submission not found" });

        submission.status = status;
        await submission.save();
        res.json({ message: "Status updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
