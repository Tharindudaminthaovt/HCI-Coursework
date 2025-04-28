// const Furniture = require('../models/furnitureModel');

// // Create new furniture item
// const createFurniture = async (req, res) => {
//   try {
//     const { title, description, productType, price, discount, stock, image } = req.body;
    
//     // Validate required fields
//     if (!title || !description || !productType || !price || !image) {
//       return res.status(400).json({ message: 'All required fields must be provided' });
//     }

//     // Create new furniture item
//     const furniture = new Furniture({
//       title,
//       description,
//       productType,
//       price,
//       discount: discount || 0,
//       stock: stock || 0,
//       image,
//       createdBy: req.user.userId
//     });

//     await furniture.save();
    
//     res.status(201).json({ 
//       message: 'Furniture item created successfully',
//       furniture 
//     });
//   } catch (error) {
//     console.error('Error creating furniture:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get all furniture items
// const getAllFurniture = async (req, res) => {
//   try {
//     const furniture = await Furniture.find();
//     res.status(200).json(furniture);
//   } catch (error) {
//     console.error('Error fetching furniture:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get single furniture item by ID
// const getFurnitureById = async (req, res) => {
//   try {
//     const furniture = await Furniture.findById(req.params.id);
//     if (!furniture) {
//       return res.status(404).json({ message: 'Furniture item not found' });
//     }
//     res.status(200).json(furniture);
//   } catch (error) {
//     console.error('Error fetching furniture item:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Update furniture item
// const updateFurniture = async (req, res) => {
//   try {
//     const { title, description, productType, price, discount, stock, image } = req.body;
    
//     const updatedFurniture = await Furniture.findByIdAndUpdate(
//       req.params.id,
//       {
//         title,
//         description,
//         productType,
//         price,
//         discount,
//         stock,
//         image
//       },
//       { new: true }
//     );

//     if (!updatedFurniture) {
//       return res.status(404).json({ message: 'Furniture item not found' });
//     }

//     res.status(200).json({
//       message: 'Furniture item updated successfully',
//       furniture: updatedFurniture
//     });
//   } catch (error) {
//     console.error('Error updating furniture:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Delete furniture item
// const deleteFurniture = async (req, res) => {
//   try {
//     const furniture = await Furniture.findByIdAndDelete(req.params.id);
    
//     if (!furniture) {
//       return res.status(404).json({ message: 'Furniture item not found' });
//     }

//     res.status(200).json({ message: 'Furniture item deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting furniture:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = {
//   createFurniture,
//   getAllFurniture,
//   getFurnitureById,
//   updateFurniture,
//   deleteFurniture
// };




// const Furniture = require('../models/furnitureModel');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = 'uploads/furniture';
    
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
    
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const ext = path.extname(file.originalname);
//     cb(null, 'furniture-' + uniqueSuffix + ext);
//   }
// });

// // File filter
// const fileFilter = (req, file, cb) => {
//   const allowedFileTypes = /jpeg|jpg|png|webp/;
//   const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedFileTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed!'), false);
//   }
// };

// // Create multer upload middleware
// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: fileFilter
// });

// // Get all furniture items
// const getAllFurniture = async (req, res) => {
//   try {
//     const furniture = await Furniture.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: furniture.length, data: furniture });
//   } catch (error) {
//     console.error('Error fetching furniture items:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // Get single furniture item
// const getFurnitureById = async (req, res) => {
//   try {
//     const furniture = await Furniture.findById(req.params.id);
    
//     if (!furniture) {
//       return res.status(404).json({ success: false, message: 'Furniture item not found' });
//     }
    
//     res.status(200).json({ success: true, data: furniture });
//   } catch (error) {
//     console.error('Error fetching furniture item:', error);
    
//     if (error.kind === 'ObjectId') {
//       return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
//     }
    
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // Create new furniture item
// const createFurniture = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'Image is required' });
//     }

//     const { title, description, productType, price, discount, stockCount } = req.body;
    
//     // Validation
//     if (!title || !description || !productType || !price) {
//       // Remove uploaded file if validation fails
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Please provide all required fields: title, description, productType, price' 
//       });
//     }

//     const newFurniture = new Furniture({
//       title,
//       description,
//       productType,
//       price: parseFloat(price),
//       discount: discount ? parseFloat(discount) : 0,
//       image: req.file.path.replace(/\\/g, '/'),
//       stockCount: stockCount ? parseInt(stockCount) : 0,
//       createdBy: req.user.userId
//     });

//     const savedFurniture = await newFurniture.save();
    
//     res.status(201).json({ 
//       success: true, 
//       message: 'Furniture item created successfully', 
//       data: savedFurniture 
//     });
//   } catch (error) {
//     console.error('Error creating furniture item:', error);
    
//     // Remove uploaded file if error occurs
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
    
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // Update furniture item
// const updateFurniture = async (req, res) => {
//   try {
//     const { title, description, productType, price, discount, stockCount } = req.body;
    
//     // Find the furniture item
//     const furniture = await Furniture.findById(req.params.id);
    
//     if (!furniture) {
//       // Remove uploaded file if furniture not found
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//       return res.status(404).json({ success: false, message: 'Furniture item not found' });
//     }
    
//     // Build update object
//     const updateData = {
//       title: title || furniture.title,
//       description: description || furniture.description,
//       productType: productType || furniture.productType,
//       price: price ? parseFloat(price) : furniture.price,
//       discount: discount !== undefined ? parseFloat(discount) : furniture.discount,
//       stockCount: stockCount !== undefined ? parseInt(stockCount) : furniture.stockCount
//     };
    
//     // Update image if provided
//     if (req.file) {
//       // Delete old image
//       if (furniture.image && fs.existsSync(furniture.image)) {
//         fs.unlinkSync(furniture.image);
//       }
//       updateData.image = req.file.path.replace(/\\/g, '/');
//     }
    
//     // Update the furniture item
//     const updatedFurniture = await Furniture.findByIdAndUpdate(
//       req.params.id, 
//       updateData, 
//       { new: true, runValidators: true }
//     );
    
//     res.status(200).json({ 
//       success: true, 
//       message: 'Furniture item updated successfully', 
//       data: updatedFurniture 
//     });
//   } catch (error) {
//     console.error('Error updating furniture item:', error);
    
//     // Remove uploaded file if error occurs
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
    
//     if (error.kind === 'ObjectId') {
//       return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
//     }
    
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // Delete furniture item
// const deleteFurniture = async (req, res) => {
//   try {
//     const furniture = await Furniture.findById(req.params.id);
    
//     if (!furniture) {
//       return res.status(404).json({ success: false, message: 'Furniture item not found' });
//     }
    
//     // Delete image file
//     if (furniture.image && fs.existsSync(furniture.image)) {
//       fs.unlinkSync(furniture.image);
//     }
    
//     await Furniture.findByIdAndDelete(req.params.id);
    
//     res.status(200).json({ 
//       success: true, 
//       message: 'Furniture item deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting furniture item:', error);
    
//     if (error.kind === 'ObjectId') {
//       return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
//     }
    
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// module.exports = {
//   upload,
//   getAllFurniture,
//   getFurnitureById,
//   createFurniture,
//   updateFurniture,
//   deleteFurniture
// };



const Furniture = require('../models/furnitureModel');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/furniture';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'furniture-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Get all furniture items
const getAllFurniture = async (req, res) => {
  try {
    const furniture = await Furniture.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: furniture.length, data: furniture });
  } catch (error) {
    console.error('Error fetching furniture items:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all favorite furniture items
const getFavoriteFurniture = async (req, res) => {
  try {
    const favoriteFurniture = await Furniture.find({ isFavorite: true }).sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: favoriteFurniture.length, 
      data: favoriteFurniture 
    });
  } catch (error) {
    console.error('Error fetching favorite furniture items:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single furniture item
const getFurnitureById = async (req, res) => {
  try {
    const furniture = await Furniture.findById(req.params.id);
    
    if (!furniture) {
      return res.status(404).json({ success: false, message: 'Furniture item not found' });
    }
    
    res.status(200).json({ success: true, data: furniture });
  } catch (error) {
    console.error('Error fetching furniture item:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new furniture item
const createFurniture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }
    const { title, description, productType, price, discount, stockCount } = req.body;
    
    // Validation
    if (!title || !description || !productType || !price) {
      // Remove uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: title, description, productType, price' 
      });
    }
    const newFurniture = new Furniture({
      title,
      description,
      productType,
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : 0,
      image: req.file.path.replace(/\\/g, '/'),
      stockCount: stockCount ? parseInt(stockCount) : 0,
      isFavorite: false,
      createdBy: req.user.userId
    });
    const savedFurniture = await newFurniture.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Furniture item created successfully', 
      data: savedFurniture 
    });
  } catch (error) {
    console.error('Error creating furniture item:', error);
    
    // Remove uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update furniture item
const updateFurniture = async (req, res) => {
  try {
    const { title, description, productType, price, discount, stockCount } = req.body;
    
    // Find the furniture item
    const furniture = await Furniture.findById(req.params.id);
    
    if (!furniture) {
      // Remove uploaded file if furniture not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Furniture item not found' });
    }
    
    // Build update object
    const updateData = {
      title: title || furniture.title,
      description: description || furniture.description,
      productType: productType || furniture.productType,
      price: price ? parseFloat(price) : furniture.price,
      discount: discount !== undefined ? parseFloat(discount) : furniture.discount,
      stockCount: stockCount !== undefined ? parseInt(stockCount) : furniture.stockCount
    };
    
    // Update image if provided
    if (req.file) {
      // Delete old image
      if (furniture.image && fs.existsSync(furniture.image)) {
        fs.unlinkSync(furniture.image);
      }
      updateData.image = req.file.path.replace(/\\/g, '/');
    }
    
    // Update the furniture item
    const updatedFurniture = await Furniture.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Furniture item updated successfully', 
      data: updatedFurniture 
    });
  } catch (error) {
    console.error('Error updating furniture item:', error);
    
    // Remove uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle favorite status
const toggleFavorite = async (req, res) => {
  try {
    const furniture = await Furniture.findById(req.params.id);
    
    if (!furniture) {
      return res.status(404).json({ success: false, message: 'Furniture item not found' });
    }
    
    // Toggle the favorite status
    furniture.isFavorite = !furniture.isFavorite;
    await furniture.save();
    
    res.status(200).json({
      success: true,
      message: `Furniture ${furniture.isFavorite ? 'added to' : 'removed from'} favorites`,
      data: furniture
    });
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete furniture item
const deleteFurniture = async (req, res) => {
  try {
    const furniture = await Furniture.findById(req.params.id);
    
    if (!furniture) {
      return res.status(404).json({ success: false, message: 'Furniture item not found' });
    }
    
    // Delete image file
    if (furniture.image && fs.existsSync(furniture.image)) {
      fs.unlinkSync(furniture.image);
    }
    
    await Furniture.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      success: true, 
      message: 'Furniture item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting furniture item:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  upload,
  getAllFurniture,
  getFavoriteFurniture,
  getFurnitureById,
  createFurniture,
  updateFurniture,
  toggleFavorite,
  deleteFurniture
};