const Cart = require('../models/cartModel');
const Furniture = require('../models/furnitureModel');

const getUserCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate({
        path: 'items.furniture',
        select: 'title image price discount stockCount'
      });
    
    if (!cart) {
      cart = new Cart({ 
        user: req.user.userId,
        items: [],
        total: 0
      });
      await cart.save();
    }
    
    res.status(200).json({ 
      success: true, 
      data: cart 
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching cart' 
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { furnitureId, quantity = 1 } = req.body;
    
    if (!furnitureId) {
      return res.status(400).json({
        success: false,
        message: 'Furniture ID is required'
      });
    }
    
    const furniture = await Furniture.findById(furnitureId);
    if (!furniture) {
      return res.status(404).json({
        success: false,
        message: 'Furniture item not found'
      });
    }
    
    if (furniture.stockCount < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }
    
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({
        user: req.user.userId,
        items: [],
        total: 0
      });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.furniture.toString() === furnitureId
    );
    
    const itemPrice = furniture.discount > 0 
      ? furniture.price - (furniture.price * (furniture.discount / 100))
      : furniture.price;
    
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({
        furniture: furnitureId,
        quantity: parseInt(quantity)
      });
    }
    
    cart.total = await calculateCartTotal(cart);
    
    await cart.save();
    
    await cart.populate({
      path: 'items.furniture',
      select: 'title image price discount stockCount'
    });
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart'
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;
    
    if (!quantity || parseInt(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => item._id.toString() === id);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    const furniture = await Furniture.findById(cart.items[itemIndex].furniture);
    if (!furniture) {
      return res.status(404).json({
        success: false,
        message: 'Furniture item not found'
      });
    }
    
    if (furniture.stockCount < parseInt(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }
    
    cart.items[itemIndex].quantity = parseInt(quantity);
    
    cart.total = await calculateCartTotal(cart);
    
    await cart.save();
    
    await cart.populate({
      path: 'items.furniture',
      select: 'title image price discount stockCount'
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: cart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart'
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== id);
    
    cart.total = await calculateCartTotal(cart);
    
    await cart.save();
    
    await cart.populate({
      path: 'items.furniture',
      select: 'title image price discount stockCount'
    });
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart'
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    cart.total = 0;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
};

const calculateCartTotal = async (cart) => {
  let total = 0;
  
  for (const item of cart.items) {
    const furniture = await Furniture.findById(item.furniture);
    if (furniture) {
      const itemPrice = furniture.discount > 0 
        ? furniture.price - (furniture.price * (furniture.discount / 100))
        : furniture.price;
      total += itemPrice * item.quantity;
    }
  }
  
  return parseFloat(total.toFixed(2));
};

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};