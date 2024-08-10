const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number},
    image: { type: String, required: true },
    items: { type: Array, default: [] }
});

module.exports = mongoose.model('CartItem', cartItemSchema);
