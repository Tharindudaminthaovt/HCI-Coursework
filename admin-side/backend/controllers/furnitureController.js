const Furniture = require('../models/furnitureModel');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/furniture';
    
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
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});
const getAllFurniture = async (req, res) => {
  try {
    const furniture = await Furniture.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: furniture.length, data: furniture });
  } catch (error) {
    console.error('Error fetching furniture items:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
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
const createFurniture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }
    const { title, description, productType, price, discount, stockCount } = req.body;
    
    if (!title || !description || !productType || !price) {
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
    
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const updateFurniture = async (req, res) => {
  try {
    const { title, description, productType, price, discount, stockCount } = req.body;
    
    const furniture = await Furniture.findById(req.params.id);
    
    if (!furniture) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Furniture item not found' });
    }
    
    const updateData = {
      title: title || furniture.title,
      description: description || furniture.description,
      productType: productType || furniture.productType,
      price: price ? parseFloat(price) : furniture.price,
      discount: discount !== undefined ? parseFloat(discount) : furniture.discount,
      stockCount: stockCount !== undefined ? parseInt(stockCount) : furniture.stockCount
    };
    
    if (req.file) {
      if (furniture.image && fs.existsSync(furniture.image)) {
        fs.unlinkSync(furniture.image);
      }
      updateData.image = req.file.path.replace(/\\/g, '/');
    }
    
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
    
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid furniture ID' });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const deleteFurniture = async (req, res) => {
  try {
    const furniture = await Furniture.findById(req.params.id);
    
    if (!furniture) {
      return res.status(404).json({ success: false, message: 'Furniture item not found' });
    }
    
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
  getFurnitureById,
  createFurniture,
  updateFurniture,
  deleteFurniture
};