const RoomDesign = require('../models/roomDesignModel');
const Furniture = require('../models/furnitureModel');

const getPublicRoomDesigns = async (req, res) => {
  try {
    const { shape, page = 1, limit = 10 } = req.query;
    
    const filter = { isPublic: true };
    
    if (shape) filter.shape = shape;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const total = await RoomDesign.countDocuments(filter);
    
    const designs = await RoomDesign.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'email');
    
    res.status(200).json({
      designs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get public room designs error:', error);
    res.status(500).json({ message: 'Server error fetching room designs' });
  }
};

const getPopularRoomDesigns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    const popularDesigns = await RoomDesign.find({ isPublic: true })
      .sort({ averageRating: -1, 'ratings.length': -1 })
      .limit(limit)
      .populate('createdBy', 'email');
    
    res.status(200).json({
      count: popularDesigns.length,
      designs: popularDesigns
    });
  } catch (error) {
    console.error('Get popular room designs error:', error);
    res.status(500).json({ message: 'Server error fetching popular designs' });
  }
};

const getPublicRoomDesignById = async (req, res) => {
  try {
    const design = await RoomDesign.findById(req.params.id)
      .populate('createdBy', 'email')
      .populate({
        path: 'furniture.itemId',
        model: 'Furniture',
        select: 'title productType price image dimensions'
      });
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    if (!design.isPublic) {
      return res.status(403).json({ message: 'This design is not available for public viewing' });
    }
    
    res.status(200).json(design);
  } catch (error) {
    console.error('Get public room design by ID error:', error);
    res.status(500).json({ message: 'Server error fetching room design' });
  }
};

const ratePublicRoomDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1-5 is required' });
    }
    
    const design = await RoomDesign.findById(id);
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    if (!design.isPublic) {
      return res.status(403).json({ message: 'This design is not available for public rating' });
    }
    
    const existingRatingIndex = design.ratings.findIndex(r => 
      r.userId.toString() === userId.toString()
    );
    
    if (existingRatingIndex !== -1) {
      design.ratings[existingRatingIndex].value = rating;
      design.ratings[existingRatingIndex].comment = comment || '';
      design.ratings[existingRatingIndex].date = Date.now();
    } else {
      design.ratings.push({
        userId,
        value: rating,
        comment: comment || '',
        date: Date.now()
      });
    }
    
    await design.save();
    
    res.status(200).json({
      message: 'Room design rated successfully',
      averageRating: design.averageRating,
      totalRatings: design.ratings.length
    });
  } catch (error) {
    console.error('Rate room design error:', error);
    res.status(500).json({ message: 'Server error rating room design' });
  }
};

const getPublicRoomDesignRatings = async (req, res) => {
  try {
    const { id } = req.params;
    
    const design = await RoomDesign.findById(id)
      .populate('ratings.userId', 'firstName lastName email');
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    if (!design.isPublic) {
      return res.status(403).json({ message: 'This design is not available for public viewing' });
    }
    
    res.status(200).json({
      averageRating: design.averageRating,
      totalRatings: design.ratings.length,
      ratings: design.ratings
    });
  } catch (error) {
    console.error('Get room design ratings error:', error);
    res.status(500).json({ message: 'Server error fetching room design ratings' });
  }
};

module.exports = {
  getPublicRoomDesigns,
  getPopularRoomDesigns,
  getPublicRoomDesignById,
  ratePublicRoomDesign,
  getPublicRoomDesignRatings
};