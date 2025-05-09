const express = require('express');
const userRoomDesignRouter = express.Router();
const userRoomDesignController = require('../controllers/userRoomDesignController');
const { authenticate } = require('../middleware/authMiddleware');

userRoomDesignRouter.use(authenticate);

userRoomDesignRouter.get('/', userRoomDesignController.getPublicRoomDesigns);

userRoomDesignRouter.get('/popular', userRoomDesignController.getPopularRoomDesigns);

userRoomDesignRouter.get('/:id', userRoomDesignController.getPublicRoomDesignById);

userRoomDesignRouter.post('/:id/rate', userRoomDesignController.ratePublicRoomDesign);

userRoomDesignRouter.get('/:id/ratings', userRoomDesignController.getPublicRoomDesignRatings);

module.exports = userRoomDesignRouter;