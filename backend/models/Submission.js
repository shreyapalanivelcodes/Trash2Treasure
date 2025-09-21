const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    message: { type: String, default: "" }
  },
  { timestamps: true }
);

// ✅ Avoid OverwriteModelError
module.exports = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
