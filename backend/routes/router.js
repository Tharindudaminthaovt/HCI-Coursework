const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const userFavoritesController = require('../controllers/userFavoritesController');
const userRoomDesignRouter = require('./userRoomDesignRouter');
const { authenticate } = require('../middleware/authMiddleware');
const Furniture = require('../models/furnitureModel');
const cartController = require('../controllers/cartController');
const paymentRoutes = require('./paymentRoutes');

router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.get('/profile', authenticate, controller.getUserProfile);

router.use('/room-designs', userRoomDesignRouter);
router.use('/payment', paymentRoutes);

router.get('/furniture/top', authenticate, async (req, res) => {
  try {
    const allFurniture = await Furniture.find();
    
    const topFurniture = allFurniture
      .sort((a, b) => b.stockCount - a.stockCount)
      .slice(0, 4);
    
    res.status(200).json({ 
      success: true, 
      count: topFurniture.length, 
      data: topFurniture 
    });
  } catch (error) {
    console.error('Error fetching top furniture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.get('/furniture', authenticate, async (req, res) => {
  try {
    const furniture = await Furniture.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: furniture.length, data: furniture });
  } catch (error) {
    console.error('Error fetching furniture items:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/furniture/:id', authenticate, async (req, res) => {
  try {
    const furniture = await Furniture.findById(req.params.id);
    
    if (!furniture) {
      return res.status(404).json({ success: false, message: 'Furniture item not found' });
    }
    
    res.status(200).json({ success: true, data: furniture });
  } catch (error) {
    console.error('Error fetching furniture item:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/favorites', authenticate, userFavoritesController.getUserFavorites);
router.post('/favorites/add', authenticate, userFavoritesController.addToFavorites);
router.delete('/favorites/remove/:id', authenticate, userFavoritesController.removeFromFavorites);
router.get('/favorites/check/:id', authenticate, userFavoritesController.checkFavoriteStatus);

router.get('/cart', authenticate, cartController.getUserCart);
router.post('/cart/add', authenticate, cartController.addToCart);
router.put('/cart/update/:id', authenticate, cartController.updateCartItem);
router.delete('/cart/remove/:id', authenticate, cartController.removeFromCart);
router.delete('/cart/clear', authenticate, cartController.clearCart);

module.exports = router;