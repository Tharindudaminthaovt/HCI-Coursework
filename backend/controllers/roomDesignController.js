// const RoomDesign = require('../models/roomDesignModel');

// // Create a new room design
// const createRoomDesign = async (req, res) => {
//   try {
//     const { 
//       name, 
//       dimensions, 
//       shape, 
//       colorScheme, 
//       customLayout, 
//       furniture, 
//       isPublic,
//       preview2DUrl,
//       preview3DUrl
//     } = req.body;

//     // Validate required fields
//     if (!name || !dimensions) {
//       return res.status(400).json({ message: 'Room name and dimensions are required' });
//     }

//     // Create new design with admin as creator
//     const newRoomDesign = new RoomDesign({
//       name,
//       createdBy: req.user.userId, // From auth middleware
//       dimensions,
//       shape: shape || 'rectangular',
//       colorScheme: colorScheme || undefined,
//       customLayout: customLayout || undefined,
//       furniture: furniture || [],
//       isPublic: isPublic || false,
//       preview2DUrl,
//       preview3DUrl
//     });

//     const savedDesign = await newRoomDesign.save();
    
//     res.status(201).json({
//       message: 'Room design created successfully',
//       design: savedDesign
//     });
//   } catch (error) {
//     console.error('Create room design error:', error);
//     res.status(500).json({ message: 'Server error creating room design' });
//   }
// };

// // Get all room designs (with optional filters)
// const getAllRoomDesigns = async (req, res) => {
//   try {
//     // Optional query parameters for filtering
//     const { shape, isPublic } = req.query;
    
//     const filter = { createdBy: req.user.userId };
    
//     if (shape) filter.shape = shape;
//     if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

//     const designs = await RoomDesign.find(filter)
//       .sort({ createdAt: -1 })
//       .populate('createdBy', 'email');
    
//     res.status(200).json(designs);
//   } catch (error) {
//     console.error('Get room designs error:', error);
//     res.status(500).json({ message: 'Server error fetching room designs' });
//   }
// };

// // Get a single room design by ID
// const getRoomDesignById = async (req, res) => {
//   try {
//     const design = await RoomDesign.findById(req.params.id)
//       .populate('createdBy', 'email')
//       .populate('furniture.itemId');
    
//     if (!design) {
//       return res.status(404).json({ message: 'Room design not found' });
//     }
    
//     // Check if admin has access to this design
//     if (design.createdBy._id.toString() !== req.user.userId && !design.isPublic) {
//       return res.status(403).json({ message: 'Access denied: You do not have permission to view this design' });
//     }
    
//     res.status(200).json(design);
//   } catch (error) {
//     console.error('Get room design by ID error:', error);
//     res.status(500).json({ message: 'Server error fetching room design' });
//   }
// };

// // Update a room design
// const updateRoomDesign = async (req, res) => {
//   try {
//     const { 
//       name, 
//       dimensions, 
//       shape, 
//       colorScheme, 
//       customLayout, 
//       furniture, 
//       isPublic,
//       preview2DUrl,
//       preview3DUrl
//     } = req.body;
    
//     const design = await RoomDesign.findById(req.params.id);
    
//     if (!design) {
//       return res.status(404).json({ message: 'Room design not found' });
//     }
    
//     // Check if admin has access to edit this design
//     if (design.createdBy.toString() !== req.user.userId) {
//       return res.status(403).json({ message: 'Access denied: You do not have permission to edit this design' });
//     }
    
//     // Update fields
//     if (name) design.name = name;
//     if (dimensions) design.dimensions = dimensions;
//     if (shape) design.shape = shape;
//     if (colorScheme) design.colorScheme = colorScheme;
//     if (customLayout) design.customLayout = customLayout;
//     if (furniture) design.furniture = furniture;
//     if (isPublic !== undefined) design.isPublic = isPublic;
//     if (preview2DUrl) design.preview2DUrl = preview2DUrl;
//     if (preview3DUrl) design.preview3DUrl = preview3DUrl;
    
//     const updatedDesign = await design.save();
    
//     res.status(200).json({
//       message: 'Room design updated successfully',
//       design: updatedDesign
//     });
//   } catch (error) {
//     console.error('Update room design error:', error);
//     res.status(500).json({ message: 'Server error updating room design' });
//   }
// };

// // Delete a room design
// const deleteRoomDesign = async (req, res) => {
//   try {
//     const design = await RoomDesign.findById(req.params.id);
    
//     if (!design) {
//       return res.status(404).json({ message: 'Room design not found' });
//     }
    
//     // Check if admin has access to delete this design
//     if (design.createdBy.toString() !== req.user.userId) {
//       return res.status(403).json({ message: 'Access denied: You do not have permission to delete this design' });
//     }
    
//     await design.remove();
    
//     res.status(200).json({
//       message: 'Room design deleted successfully',
//       designId: req.params.id
//     });
//   } catch (error) {
//     console.error('Delete room design error:', error);
//     res.status(500).json({ message: 'Server error deleting room design' });
//   }
// };

// // Update room color scheme
// const updateRoomColorScheme = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { colorScheme } = req.body;
    
//     if (!colorScheme) {
//       return res.status(400).json({ message: 'Color scheme is required' });
//     }
    
//     const design = await RoomDesign.findById(id);
    
//     if (!design) {
//       return res.status(404).json({ message: 'Room design not found' });
//     }
    
//     // Check if admin has access to edit this design
//     if (design.createdBy.toString() !== req.user.userId) {
//       return res.status(403).json({ message: 'Access denied: You do not have permission to edit this design' });
//     }
    
//     design.colorScheme = colorScheme;
//     const updatedDesign = await design.save();
    
//     res.status(200).json({
//       message: 'Room color scheme updated successfully',
//       design: updatedDesign
//     });
//   } catch (error) {
//     console.error('Update room color scheme error:', error);
//     res.status(500).json({ message: 'Server error updating room color scheme' });
//   }
// };

// module.exports = {
//   createRoomDesign,
//   getAllRoomDesigns,
//   getRoomDesignById,
//   updateRoomDesign,
//   deleteRoomDesign,
//   updateRoomColorScheme
// };






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
    
    // Validate required fields
    if (!name || !dimensions) {
      return res.status(400).json({ message: 'Room name and dimensions are required' });
    }
    
    // Add shape to dimensions for validation purposes
    if (shape) {
      dimensions.shape = shape;
    }
    
    // Validate dimensions
    const dimensionsValidation = validateRoomDimensions(dimensions);
    if (!dimensionsValidation.valid) {
      return res.status(400).json({ message: dimensionsValidation.message });
    }
    
    // Validate color scheme if provided
    if (colorScheme) {
      const colorValidation = validateColorScheme(colorScheme);
      if (!colorValidation.valid) {
        return res.status(400).json({ message: colorValidation.message });
      }
    }
    
    // Generate 2D preview
    const preview2D = generate2DPreview(dimensions, shape || 'rectangular', furniture);
    
    // Create new design
    const newRoomDesign = new RoomDesign({
      name,
      createdBy: req.user.userId, // From auth middleware
      dimensions,
      shape: shape || 'rectangular',
      colorScheme: colorScheme || undefined,
      furniture: furniture || [],
      isPublic: isPublic || false
    });
    
    // Save the design first to get an ID
    const savedDesign = await newRoomDesign.save();
    
    // Save the preview image to disk and get the URL
    const previewUrl = await savePreviewImage(preview2D, savedDesign._id);
    
    // Update the design with the preview URL
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

// Get all room designs (with optional filters)
const getAllRoomDesigns = async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { shape, isPublic, page = 1, limit = 10 } = req.query;
    
    const filter = { createdBy: req.user.userId };
    
    if (shape) filter.shape = shape;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination info
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
        select: 'title productType price image' // Select relevant fields
      });
    
    if (!design) {
      console.log('Room design not found');
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    console.log('Room design found:', design.name);
    console.log('Furniture items:', design.furniture.length);
    
    // Check if admin has access to this design
    if (design.createdBy._id.toString() !== req.user.userId && !design.isPublic) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to view this design' });
    }
    
    res.status(200).json(design);
  } catch (error) {
    console.error('Get room design by ID error:', error);
    res.status(500).json({ message: 'Server error fetching room design' });
  }
};

// Update a room design
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
    
    // Check if admin has access to edit this design
    if (design.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to edit this design' });
    }
    
    // Validate dimensions if provided
    if (dimensions) {
      const dimensionsValidation = validateRoomDimensions(dimensions);
      if (!dimensionsValidation.valid) {
        return res.status(400).json({ message: dimensionsValidation.message });
      }
    }
    
    // Validate color scheme if provided
    if (colorScheme) {
      const colorValidation = validateColorScheme(colorScheme);
      if (!colorValidation.valid) {
        return res.status(400).json({ message: colorValidation.message });
      }
    }
    
    // Update fields
    if (name) design.name = name;
    if (dimensions) design.dimensions = dimensions;
    if (shape) design.shape = shape;
    if (colorScheme) design.colorScheme = colorScheme;
    if (customLayout) design.customLayout = customLayout;
    if (isPublic !== undefined) design.isPublic = isPublic;
    
    // Specifically handle furniture update
    if (furniture) {
      // Validate furniture items existence if IDs are provided
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
      
      // Update furniture after validation passes
      design.furniture = furniture;
    }
    
    // If critical elements changed, regenerate preview
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
    
    // Check if admin has access to edit this design
    if (design.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to edit this design' });
    }
    
    // Validate furniture items existence if IDs are provided
    for (const item of furniture) {
      if (item.itemId) {
        // Handle both string IDs and object IDs
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
    
    // Ensure furniture items have the proper format
    const formattedFurniture = furniture.map(item => ({
      itemId: typeof item.itemId === 'object' ? item.itemId._id : item.itemId,
      position: {
        x: item.position?.x || 0,
        y: item.position?.y || 0,
        z: item.position?.z || 0
      },
      rotation: item.rotation || 0
    }));
    
    // Update furniture
    design.furniture = formattedFurniture;
    
    // Regenerate the preview since furniture has changed
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


// Delete a room design
const deleteRoomDesign = async (req, res) => {
  try {
    const design = await RoomDesign.findById(req.params.id);
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    // Check if admin has access to delete this design
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

// Update room color scheme
const updateRoomColorScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { colorScheme } = req.body;
    
    if (!colorScheme) {
      return res.status(400).json({ message: 'Color scheme is required' });
    }
    
    // Validate color scheme
    const colorValidation = validateColorScheme(colorScheme);
    if (!colorValidation.valid) {
      return res.status(400).json({ message: colorValidation.message });
    }
    
    const design = await RoomDesign.findById(id);
    
    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }
    
    // Check if admin has access to edit this design
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



// Add a new function to handle ratings
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
    
    // Check if user already rated this design
    const existingRatingIndex = design.ratings.findIndex(r => 
      r.userId.toString() === userId.toString()
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      design.ratings[existingRatingIndex].value = rating;
      design.ratings[existingRatingIndex].comment = comment || '';
      design.ratings[existingRatingIndex].date = Date.now();
    } else {
      // Add new rating
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

// Get ratings for a room design
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