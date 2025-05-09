const RoomDesign = require('../models/roomDesignModel');
const Furniture = require('../models/furnitureModel');
const { 
  validateRoomDimensions, 
  validateColorScheme,
  generate2DPreview,
  savePreviewImage
} = require('../utils/roomDesignUtils');

const createRoomDesign = async (req, res) => {
  try {
    const { 
      name, 
      dimensions, 
      shape, 
      colorScheme, 
      furniture, 
      isPublic
    } = req.body;
    
    if (!name || !dimensions) {
      return res.status(400).json({ message: 'Room name and dimensions are required' });
    }
    
    if (shape) {
      dimensions.shape = shape;
    }
    
    const dimensionsValidation = validateRoomDimensions(dimensions);
    if (!dimensionsValidation.valid) {
      return res.status(400).json({ message: dimensionsValidation.message });
    }
    
    if (colorScheme) {
      const colorValidation = validateColorScheme(colorScheme);
      if (!colorValidation.valid) {
        return res.status(400).json({ message: colorValidation.message });
      }
    }
    
    const preview2D = generate2DPreview(dimensions, shape || 'rectangular', furniture);
    
    const newRoomDesign = new RoomDesign({
      name,
      createdBy: req.user.userId,
      dimensions,
      shape: shape || 'rectangular',
      colorScheme: colorScheme || undefined,
      furniture: furniture || [],
      isPublic: isPublic || false
    });
    
    const savedDesign = await newRoomDesign.save();
    
    const previewUrl = await savePreviewImage(preview2D, savedDesign._id);
    
    savedDesign.preview2DUrl = previewUrl;
    await savedDesign.save();
    
    res.status(201).json({
      message: 'Room design created successfully',
      design: savedDesign
    });
  } catch (error) {
    console.error('Create room design error:', error);
    res.status(500).json({ message: 'Server error creating room design' });
  }
};

const getAllRoomDesigns = async (req, res) => {
  try {
    const { shape, isPublic, page = 1, limit = 10 } = req.query;
    
    const filter = { createdBy: req.user.userId };
    
    if (shape) filter.shape = shape;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

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
    console.error('Get room designs error:', error);
    res.status(500).json({ message: 'Server error fetching room designs' });
  }
};

const getRoomDesignById = async (req, res) => {
  try {
    console.log('Fetching room design with ID:', req.params.id);
    
    const design = await RoomDesign.findById(req.params.id)
      .populate('createdBy', 'email')
      .populate({
        path: 'furniture.itemId',
        model: 'Furniture',
        select: 'title productType price image'
      });
    
    if (!design) {
      console.log('Room design not found');
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    console.log('Room design found:', design.name);
    console.log('Furniture items:', design.furniture.length);
    
    if (design.createdBy._id.toString() !== req.user.userId && !design.isPublic) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to view this design' });
    }
    
    res.status(200).json(design);
  } catch (error) {
    console.error('Get room design by ID error:', error);
    res.status(500).json({ message: 'Server error fetching room design' });
  }
};

const updateRoomDesign = async (req, res) => {
  try {
    const { 
      name, 
      dimensions, 
      shape, 
      colorScheme, 
      customLayout, 
      furniture, 
      isPublic
    } = req.body;
    
    const design = await RoomDesign.findById(req.params.id);
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    if (design.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to edit this design' });
    }
    
    if (dimensions) {
      const dimensionsValidation = validateRoomDimensions(dimensions);
      if (!dimensionsValidation.valid) {
        return res.status(400).json({ message: dimensionsValidation.message });
      }
    }
    
    if (colorScheme) {
      const colorValidation = validateColorScheme(colorScheme);
      if (!colorValidation.valid) {
        return res.status(400).json({ message: colorValidation.message });
      }
    }
    
    if (name) design.name = name;
    if (dimensions) design.dimensions = dimensions;
    if (shape) design.shape = shape;
    if (colorScheme) design.colorScheme = colorScheme;
    if (customLayout) design.customLayout = customLayout;
    if (isPublic !== undefined) design.isPublic = isPublic;
    
    if (furniture) {
      if (furniture.length > 0) {
        for (const item of furniture) {
          if (item.itemId) {
            const furnitureExists = await Furniture.findById(item.itemId);
            if (!furnitureExists) {
              return res.status(400).json({ 
                message: `Furniture item with ID ${item.itemId} not found` 
              });
            }
          }
        }
      }
      
      design.furniture = furniture;
    }
    
    if (dimensions || shape || customLayout || furniture) {
      const updatedPreview = generate2DPreview(
        dimensions || design.dimensions,
        shape || design.shape,
        furniture || design.furniture
      );
      
      const previewUrl = await savePreviewImage(updatedPreview, design._id);
      design.preview2DUrl = previewUrl;
    }
    
    const updatedDesign = await design.save();
    
    res.status(200).json({
      message: 'Room design updated successfully',
      design: updatedDesign
    });
  } catch (error) {
    console.error('Update room design error:', error);
    res.status(500).json({ message: 'Server error updating room design' });
  }
};

const updateRoomFurniture = async (req, res) => {
  try {
    const { id } = req.params;
    const { furniture } = req.body;
    
    console.log('Updating room furniture for design ID:', id);
    console.log('Received furniture data:', furniture);
    
    if (!furniture || !Array.isArray(furniture)) {
      return res.status(400).json({ message: 'Valid furniture array is required' });
    }
    
    const design = await RoomDesign.findById(id);
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    if (design.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to edit this design' });
    }
    
    for (const item of furniture) {
      if (item.itemId) {
        const furnitureId = typeof item.itemId === 'object' ? item.itemId._id : item.itemId;
        console.log('Checking furniture item:', furnitureId);
        
        const furnitureExists = await Furniture.findById(furnitureId);
        if (!furnitureExists) {
          return res.status(400).json({ 
            message: `Furniture item with ID ${furnitureId} not found` 
          });
        }
      }
    }
    
    const formattedFurniture = furniture.map(item => ({
      itemId: typeof item.itemId === 'object' ? item.itemId._id : item.itemId,
      position: {
        x: item.position?.x || 0,
        y: item.position?.y || 0,
        z: item.position?.z || 0
      },
      rotation: item.rotation || 0
    }));
    
    design.furniture = formattedFurniture;
    
    const updatedPreview = generate2DPreview(
      design.dimensions,
      design.shape,
      design.furniture
    );
    
    const previewUrl = await savePreviewImage(updatedPreview, design._id);
    design.preview2DUrl = previewUrl;
    
    const updatedDesign = await design.save();
    console.log('Room furniture updated successfully');
    
    res.status(200).json({
      message: 'Room furniture updated successfully',
      design: updatedDesign
    });
  } catch (error) {
    console.error('Update room furniture error:', error);
    res.status(500).json({ message: 'Server error updating room furniture' });
  }
};

const deleteRoomDesign = async (req, res) => {
  try {
    const design = await RoomDesign.findById(req.params.id);
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    if (design.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to delete this design' });
    }
    
    await RoomDesign.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      message: 'Room design deleted successfully',
      designId: req.params.id
    });
  } catch (error) {
    console.error('Delete room design error:', error);
    res.status(500).json({ message: 'Server error deleting room design' });
  }
};

const updateRoomColorScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { colorScheme } = req.body;
    
    if (!colorScheme) {
      return res.status(400).json({ message: 'Color scheme is required' });
    }
    
    const colorValidation = validateColorScheme(colorScheme);
    if (!colorValidation.valid) {
      return res.status(400).json({ message: colorValidation.message });
    }
    
    const design = await RoomDesign.findById(id);
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    if (design.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to edit this design' });
    }
    
    design.colorScheme = colorScheme;
    const updatedDesign = await design.save();
    
    res.status(200).json({
      message: 'Room color scheme updated successfully',
      design: updatedDesign
    });
  } catch (error) {
    console.error('Update room color scheme error:', error);
    res.status(500).json({ message: 'Server error updating room color scheme' });
  }
};

const rateRoomDesign = async (req, res) => {
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

const getRoomDesignRatings = async (req, res) => {
  try {
    const { id } = req.params;
    
    const design = await RoomDesign.findById(id)
      .populate('ratings.userId', 'firstName lastName email');
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
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
  createRoomDesign,
  getAllRoomDesigns,
  getRoomDesignById,
  updateRoomDesign,
  updateRoomFurniture,
  deleteRoomDesign,
  updateRoomColorScheme,
  rateRoomDesign,
  getRoomDesignRatings
};