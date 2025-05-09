const mongoose = require('mongoose');
const furnitureSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    productType: { 
      type: String, 
      required: true,
      trim: true 
    },
    price: { 
      type: Number, 
      required: true,
      min: 0 
    },
    discount: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100 
    },
    image: { 
      type: String, 
      required: true 
    },
    stockCount: { 
      type: Number, 
      required: true,
      min: 0,
      default: 0
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  },
  { timestamps: true }
);

const Furniture = mongoose.model('Furniture', furnitureSchema);
module.exports = Furniture;