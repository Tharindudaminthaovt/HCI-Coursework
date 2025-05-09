const UserFavorite = require('../models/userFavoritesModel');
const Furniture = require('../models/furnitureModel');

const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const favorites = await UserFavorite.find({ userId })
      .populate('furnitureId')
      .sort({ createdAt: -1 });
    
    const furnitureItems = favorites.map(fav => fav.furnitureId);
    
    res.status(200).json({ 
      success: true, 
      count: furnitureItems.length, 
      data: furnitureItems
    });
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const { furnitureId } = req.body;
    const userId = req.user.userId;
    
    const furniture = await Furniture.findById(furnitureId);
    if (!furniture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Furniture item not found' 
      });
    }
    
    const existingFavorite = await UserFavorite.findOne({ userId, furnitureId });
    if (existingFavorite) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item is already in favorites' 
      });
    }
    
    const newFavorite = new UserFavorite({
      userId,
      furnitureId
    });
    
    await newFavorite.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Item added to favorites', 
      data: newFavorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const furnitureId = req.params.id;
    const userId = req.user.userId;
    
    const result = await UserFavorite.findOneAndDelete({ userId, furnitureId });
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in favorites' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Item removed from favorites' 
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const checkFavoriteStatus = async (req, res) => {
  try {
    const furnitureId = req.params.id;
    const userId = req.user.userId;
    
    const favorite = await UserFavorite.findOne({ userId, furnitureId });
    
    res.status(200).json({ 
      success: true, 
      isFavorite: favorite ? true : false 
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
};