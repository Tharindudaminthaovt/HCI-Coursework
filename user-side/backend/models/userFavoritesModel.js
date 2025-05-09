const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    furnitureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Furniture',
      required: true
    }
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, furnitureId: 1 }, { unique: true });

const UserFavorite = mongoose.model('UserFavorite', favoriteSchema);
module.exports = UserFavorite;