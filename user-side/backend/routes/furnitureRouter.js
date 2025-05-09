const express = require('express');
const furnitureRouter = express.Router();
const furnitureController = require('../controllers/furnitureController');
const { authenticate } = require('../middleware/authMiddleware');

furnitureRouter.use(authenticate);

furnitureRouter.get('/', furnitureController.getAllFurniture);

furnitureRouter.get('/favorites', furnitureController.getFavoriteFurniture);

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

furnitureRouter.patch('/:id/favorite', furnitureController.toggleFavorite);

furnitureRouter.delete('/:id', furnitureController.deleteFurniture);

module.exports = furnitureRouter;