// const express = require('express');
// const adminRouter = express.Router();
// const adminController = require('../controllers/adminController');
// const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// adminRouter.post('/login', adminController.loginAdmin);

// adminRouter.get('/profile', authenticate, isAdmin, adminController.getAdminProfile);

// adminRouter.get('/dashboard', authenticate, isAdmin, (req, res) => {
//   res.status(200).json({ message: 'Admin dashboard data' });
// });

// module.exports = adminRouter;






// const express = require('express');
// const adminRouter = express.Router();
// const adminController = require('../controllers/adminController');
// const furnitureController = require('../controllers/furnitureController');
// const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// // Admin authentication routes
// adminRouter.post('/login', adminController.loginAdmin);
// adminRouter.get('/profile', authenticate, isAdmin, adminController.getAdminProfile);
// adminRouter.get('/dashboard', authenticate, isAdmin, (req, res) => {
//   res.status(200).json({ message: 'Admin dashboard data' });
// });

// // Furniture management routes (protected by admin authentication)
// adminRouter.post('/furniture', authenticate, isAdmin, furnitureController.createFurniture);
// adminRouter.get('/furniture', authenticate, isAdmin, furnitureController.getAllFurniture);
// adminRouter.get('/furniture/:id', authenticate, isAdmin, furnitureController.getFurnitureById);
// adminRouter.put('/furniture/:id', authenticate, isAdmin, furnitureController.updateFurniture);
// adminRouter.delete('/furniture/:id', authenticate, isAdmin, furnitureController.deleteFurniture);

// module.exports = adminRouter;


const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const furnitureRouter = require('./furnitureRouter');
const roomDesignRouter = require('./roomDesignRouter');

// Admin authentication routes
adminRouter.post('/login', adminController.loginAdmin);
adminRouter.get('/profile', authenticate, isAdmin, adminController.getAdminProfile);
adminRouter.get('/dashboard', authenticate, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin dashboard data' });
});

// Mount furniture routes
adminRouter.use('/furniture', furnitureRouter);

// Mount room design routes
adminRouter.use('/room-designs', roomDesignRouter);

// Create designs route (for frontend reference)
adminRouter.get('/createdesigns', authenticate, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin create designs page' });
});

module.exports = adminRouter;