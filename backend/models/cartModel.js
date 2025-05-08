const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  furniture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Furniture',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [cartItemSchema],
    total: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;