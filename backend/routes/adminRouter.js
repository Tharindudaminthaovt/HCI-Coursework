const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

adminRouter.post('/login', adminController.loginAdmin);

adminRouter.get('/profile', authenticate, isAdmin, adminController.getAdminProfile);

adminRouter.get('/dashboard', authenticate, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin dashboard data' });
});

module.exports = adminRouter;