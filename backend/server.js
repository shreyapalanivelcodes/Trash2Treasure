const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads (images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend"))); // <-- IMPORTANT

// API routes
const adminRoutes = require("./routes/admin");
const submissionsRoutes = require("./routes/submissions");
const itemsRoutes = require("./routes/items"); // for /api/items/user

app.use("/api/admin", adminRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/items", itemsRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Fallback: serve index.html for any non-API route
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
