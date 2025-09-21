const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    organization: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    requestedAdmin: { type: Boolean, default: false } // For admin requests
});

module.exports = mongoose.model("User", userSchema);
