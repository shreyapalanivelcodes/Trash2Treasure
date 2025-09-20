const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    filename: { type: String, required: true },  // ensure consistent naming
    topCategories: { type: Array, default: [] }, // store classification results
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', ItemSchema);
