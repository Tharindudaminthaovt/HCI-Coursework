const mongoose = require('mongoose');

const roomDesignSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dimensions: {
      width: { type: Number, required: true },
      length: { type: Number, required: true },
      height: { type: Number, required: true },
      secondWidth: { type: Number },
      secondLength: { type: Number },
    },
    shape: { 
      type: String, 
      enum: ['rectangular', 'L-shaped'],
      default: 'rectangular' 
    },
    colorScheme: {
      name: { type: String, default: 'Default' },
      walls: { type: String, default: '#FFFFFF' },
      floor: { type: String, default: '#8B4513' },
      ceiling: { type: String, default: '#F8F8F8' },
      trim: { type: String, default: '#FFFFFF' }
    },
    customLayout: {
      // For storing custom room shapes as polygon points or similar
      points: [{ 
        x: Number, 
        y: Number 
      }]
    },
    furniture: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Furniture'
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      position: {
        x: Number,
        y: Number,
        z: Number
      },
      rotation: Number
    }],
    isPublic: {
      type: Boolean,
      default: false
    },
    preview2DUrl: String,
    preview3DUrl: String,
    // Rating field
    ratings: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    averageRating: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

roomDesignSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.value, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  } else {
    this.averageRating = 0;
  }
  next();
});

const RoomDesign = mongoose.model('RoomDesign', roomDesignSchema);

module.exports = RoomDesign;