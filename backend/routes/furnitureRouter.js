// const express = require('express');
// const furnitureRouter = express.Router();
// const furnitureController = require('../controllers/furnitureController');
// const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// // Set base middleware for all routes
// furnitureRouter.use(authenticate, isAdmin);

// // Get all furniture items
// furnitureRouter.get('/', furnitureController.getAllFurniture);

// // Get single furniture item
// furnitureRouter.get('/:id', furnitureController.getFurnitureById);

// // Create new furniture item
// furnitureRouter.post(
//   '/',
//   furnitureController.upload.single('image'),
//   furnitureController.createFurniture
// );

// // Update furniture item
// furnitureRouter.put(
//   '/:id',
//   furnitureController.upload.single('image'),
//   furnitureController.updateFurniture
// );

// // Delete furniture item
// furnitureRouter.delete('/:id', furnitureController.deleteFurniture);

// module.exports = furnitureRouter;




const express = require('express');
const furnitureRouter = express.Router();
const furnitureController = require('../controllers/furnitureController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// Set base middleware for all routes
furnitureRouter.use(authenticate, isAdmin);

// Get all furniture items
furnitureRouter.get('/', furnitureController.getAllFurniture);

// Get favorite furniture items
furnitureRouter.get('/favorites', furnitureController.getFavoriteFurniture);

// Get single furniture item
furnitureRouter.get('/:id', furnitureController.getFurnitureById);

// Create new furniture item
furnitureRouter.post(
  '/',
  furnitureController.upload.single('image'),
  furnitureController.createFurniture
);

// Update furniture item
furnitureRouter.put(
  '/:id',
  furnitureController.upload.single('image'),
  furnitureController.updateFurniture
);

// Toggle favorite status
furnitureRouter.patch('/:id/favorite', furnitureController.toggleFavorite);

// Delete furniture item
furnitureRouter.delete('/:id', furnitureController.deleteFurniture);

module.exports = furnitureRouter;