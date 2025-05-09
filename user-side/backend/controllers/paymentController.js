const crypto = require('crypto');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Furniture = require('../models/furnitureModel');

const initPayment = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate({
      path: 'items.furniture',
      select: 'title price discount'
    });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const amount = cart.total.toFixed(2);
    const merchantId = "";
    const merchantSecret = "";
    const currency = "LKR";
    const hashString = merchantId + orderId + amount + currency + 
                        crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
    
    const newOrder = new Order({
        user: req.user.userId,
        orderId: orderId,
        paymentId: `TEMP-${orderId}`,
        items: cart.items,
        total: amount,
        status: 'pending',
        currency: currency
    });
    await newOrder.save();
    
    res.status(200).json({
      success: true,
      data: {
        merchantId,
        orderId,
        amount,
        currency,
        hash,
        items: cart.items.map(item => item.furniture.title).join(', ')
      }
    });
    
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing payment'
    });
  }
};

const paymentNotification = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    } = req.body;
    
    const merchantSecret = "MTAxMjM1OTczMDYzNjcwODA1NTMwNjIwOTkxMjAxMTAwNjEwOTI0";
    
    const localMd5Sig = crypto.createHash('md5')
      .update(
        merchant_id + 
        order_id + 
        payhere_amount + 
        payhere_currency + 
        status_code + 
        crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
      )
      .digest('hex')
      .toUpperCase();
      
    if (localMd5Sig !== md5sig) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
    
    let orderStatus;
    if (status_code === '2') {
      orderStatus = 'success';
    } else if (status_code === '0') {
      orderStatus = 'pending';
    } else {
      orderStatus = 'failed';
    }
    
    const order = await Order.findOne({ orderId: order_id }).populate('items.furniture');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.status = orderStatus;
    order.paymentId = req.body.payment_id || `COMPLETED-${order_id}`;
    await order.save();
    
    if (status_code === '2') {
      for (const item of order.items) {
        const furniture = await Furniture.findById(item.furniture);
        if (furniture) {
          furniture.stockCount = Math.max(0, furniture.stockCount - item.quantity);
          await furniture.save();
        }
      }
      
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], total: 0 }
      );
    }
    
    res.status(200).send('Payment notification received');
    
  } catch (error) {
    console.error('Error processing payment notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment notification'
    });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        total: order.total
      }
    });
    
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payment status'
    });
  }
};

module.exports = {
  initPayment,
  paymentNotification,
  getPaymentStatus
};