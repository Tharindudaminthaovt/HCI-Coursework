const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  furniture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Furniture',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      orderId: {
        type: String,
        required: true,
        unique: true
      },
      paymentId: {
        type: String,
        unique: true,
        sparse: true  // This allows multiple null values
      },
      items: [orderItemSchema],
      total: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
      },
      currency: {
        type: String,
        default: 'LKR'
      }
    },
    { timestamps: true }
  );
  

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;