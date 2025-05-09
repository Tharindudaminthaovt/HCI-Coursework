const express = require('express');
const furnitureRouter = express.Router();
const furnitureController = require('../controllers/furnitureController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

furnitureRouter.use(authenticate, isAdmin);

furnitureRouter.get('/', furnitureController.getAllFurniture);

furnitureRouter.get('/:id', furnitureController.getFurnitureById);

furnitureRouter.post(
  '/',
  furnitureController.upload.single('image'),
  furnitureController.createFurniture
);

furnitureRouter.put(
  '/:id',
  furnitureController.upload.single('image'),
  furnitureController.updateFurniture
);

furnitureRouter.delete('/:id', furnitureController.deleteFurniture);

module.exports = furnitureRouter;