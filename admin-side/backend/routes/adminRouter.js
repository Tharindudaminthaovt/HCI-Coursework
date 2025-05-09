const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const furnitureRouter = require('./furnitureRouter');
const roomDesignRouter = require('./roomDesignRouter');

adminRouter.post('/login', adminController.loginAdmin);
adminRouter.get('/profile', authenticate, isAdmin, adminController.getAdminProfile);
adminRouter.get('/dashboard', authenticate, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin dashboard data' });
});

adminRouter.use('/furniture', furnitureRouter);

adminRouter.use('/room-designs', roomDesignRouter);

adminRouter.get('/createdesigns', authenticate, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin create designs page' });
});

module.exports = adminRouter;