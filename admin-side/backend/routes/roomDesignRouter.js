const express = require('express');
const roomDesignRouter = express.Router();
const roomDesignController = require('../controllers/roomDesignController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

roomDesignRouter.use(authenticate, isAdmin);

roomDesignRouter.post('/create', roomDesignController.createRoomDesign);
roomDesignRouter.get('/', roomDesignController.getAllRoomDesigns);
roomDesignRouter.get('/:id', roomDesignController.getRoomDesignById);
roomDesignRouter.put('/:id', roomDesignController.updateRoomDesign);
roomDesignRouter.delete('/:id', roomDesignController.deleteRoomDesign);

roomDesignRouter.patch('/:id/colorscheme', roomDesignController.updateRoomColorScheme);
roomDesignRouter.patch('/:id/furniture', roomDesignController.updateRoomFurniture);

roomDesignRouter.post('/:id/rate', roomDesignController.rateRoomDesign);
roomDesignRouter.get('/:id/ratings', roomDesignController.getRoomDesignRatings);

module.exports = roomDesignRouter;