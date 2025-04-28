// const express = require('express');
// const roomDesignRouter = express.Router();
// const roomDesignController = require('../controllers/roomDesignController');
// const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// // All routes require authentication and admin privileges
// roomDesignRouter.use(authenticate, isAdmin);

// // Room design CRUD operations
// roomDesignRouter.post('/create', roomDesignController.createRoomDesign);
// roomDesignRouter.get('/', roomDesignController.getAllRoomDesigns);
// roomDesignRouter.get('/:id', roomDesignController.getRoomDesignById);
// roomDesignRouter.put('/:id', roomDesignController.updateRoomDesign);
// roomDesignRouter.delete('/:id', roomDesignController.deleteRoomDesign);

// // Special operations
// roomDesignRouter.patch('/:id/colorscheme', roomDesignController.updateRoomColorScheme);

// module.exports = roomDesignRouter;



const express = require('express');
const roomDesignRouter = express.Router();
const roomDesignController = require('../controllers/roomDesignController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication and admin privileges
roomDesignRouter.use(authenticate, isAdmin);

// Room design CRUD operations
roomDesignRouter.post('/create', roomDesignController.createRoomDesign);
roomDesignRouter.get('/', roomDesignController.getAllRoomDesigns);
roomDesignRouter.get('/:id', roomDesignController.getRoomDesignById);
roomDesignRouter.put('/:id', roomDesignController.updateRoomDesign);
roomDesignRouter.delete('/:id', roomDesignController.deleteRoomDesign);

// Special operations
roomDesignRouter.patch('/:id/colorscheme', roomDesignController.updateRoomColorScheme);
roomDesignRouter.patch('/:id/furniture', roomDesignController.updateRoomFurniture);

// Rating endpoints
roomDesignRouter.post('/:id/rate', roomDesignController.rateRoomDesign);
roomDesignRouter.get('/:id/ratings', roomDesignController.getRoomDesignRatings);

module.exports = roomDesignRouter;