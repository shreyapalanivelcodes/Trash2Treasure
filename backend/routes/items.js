const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const Item = require("../models/item");

const UPLOAD_DIR = "./uploads";

// ===== Multer Storage Configuration =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ===== POST /api/items/upload =====
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const filename = req.file.filename;

    const topCategories = req.body.topCategories
      ? JSON.parse(req.body.topCategories)
      : [];

    const type = topCategories[0]?.className || "Unknown";

    const newItem = new Item({
      user: req.user.id,
      filename,      // store uploaded filename
      type,
      topCategories,
    });

    await newItem.save();
    res.json(newItem);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ===== GET /api/items/user =====
router.get("/user", auth, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Fetch user items error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
