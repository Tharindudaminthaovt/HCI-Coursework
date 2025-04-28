const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Utility for generating a simple 2D preview of the room
const generate2DPreview = (dimensions, shape, furniture = []) => {
  // Scale factor for the canvas (pixels per meter/foot)
  const scale = 20;
  
  // Calculate canvas dimensions
  let canvasWidth, canvasLength;
  
  if (shape === 'L-shaped') {
    // For L-shaped rooms, make the canvas large enough to fit both sections
    canvasWidth = Math.max(dimensions.width, dimensions.secondWidth) * scale + 20;
    canvasLength = Math.max(dimensions.length, dimensions.secondLength) * scale + 20;
  } else {
    // Rectangular rooms
    canvasWidth = dimensions.width * scale + 20;
    canvasLength = dimensions.length * scale + 20;
  }
  
  // Ensure minimum size
  canvasWidth = Math.max(canvasWidth, 400);
  canvasLength = Math.max(canvasLength, 400);
  
  // Create canvas
  const canvas = createCanvas(canvasWidth, canvasLength);
  const ctx = canvas.getContext('2d');
  
  // Draw room background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvasWidth, canvasLength);
  
  // Draw room outline
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  
  if (shape === 'rectangular') {
    // Simple rectangular room
    ctx.strokeRect(10, 10, dimensions.width * scale, dimensions.length * scale);
  } else if (shape === 'L-shaped') {
    // L-shaped room based on the dimensions provided
    const mainWidth = dimensions.width * scale;
    const mainLength = dimensions.length * scale;
    const secWidth = dimensions.secondWidth * scale;
    const secLength = dimensions.secondLength * scale;
    
    // Draw L shape
    ctx.beginPath();
    ctx.moveTo(10, 10);  // Start at top-left
    ctx.lineTo(10 + mainWidth, 10);  // Top edge
    ctx.lineTo(10 + mainWidth, 10 + secLength);  // Right edge of main section
    ctx.lineTo(10 + secWidth, 10 + secLength);  // Bottom edge connecting to extension
    ctx.lineTo(10 + secWidth, 10 + mainLength);  // Right edge of extension
    ctx.lineTo(10, 10 + mainLength);  // Bottom edge
    ctx.closePath();
    ctx.stroke();
  }
  
  // Draw furniture if available
  if (furniture && furniture.length > 0) {
    furniture.forEach(item => {
      ctx.fillStyle = '#8B4513'; // Brown color for furniture
      
      // Simple rectangle for each furniture item
      const x = 10 + (item.position.x * scale);
      const y = 10 + (item.position.y * scale);
      const itemWidth = 20; // Standard width for preview
      const itemLength = 20; // Standard length for preview
      
      // Draw a rotated rectangle if rotation is specified
      if (item.rotation) {
        ctx.save();
        ctx.translate(x + itemWidth/2, y + itemLength/2);
        ctx.rotate(item.rotation * Math.PI / 180);
        ctx.fillRect(-itemWidth/2, -itemLength/2, itemWidth, itemLength);
        ctx.restore();
      } else {
        ctx.fillRect(x, y, itemWidth, itemLength);
      }
    });
  }
  
  // Return as data URL
  return canvas.toDataURL('image/png');
};

// Function to save 2D preview image
const savePreviewImage = async (dataUrl, designId) => {
  // Remove header from data URL to get just the base64 data
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  
  // Ensure upload directory exists
  const uploadDir = path.join(__dirname, '../uploads/previews');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Create file path
  const filePath = path.join(uploadDir, `${designId}_2d.png`);
  
  // Write file
  await fs.promises.writeFile(filePath, base64Data, 'base64');
  
  // Return the URL path
  return `/uploads/previews/${designId}_2d.png`;
};

// Function to validate room dimensions
// Function to validate room dimensions
const validateRoomDimensions = (dimensions) => {
  const { width, length, height, secondWidth, secondLength } = dimensions;
  
  // Basic validation for all room types
  if (!width || !length || !height) {
    return { valid: false, message: 'Width, length, and height are required' };
  }
  
  if (width <= 0 || length <= 0 || height <= 0) {
    return { valid: false, message: 'Dimensions must be positive numbers' };
  }
  
  // Add maximum size validation
  if (width > 100 || length > 100 || height > 30) {
    return { valid: false, message: 'Dimensions exceed maximum allowed values' };
  }
  
  // L-shaped room validation
  if (dimensions.shape === 'L-shaped') {
    if (!secondWidth || !secondLength) {
      return { valid: false, message: 'L-shaped rooms require secondWidth and secondLength values' };
    }
    
    if (secondWidth <= 0 || secondLength <= 0) {
      return { valid: false, message: 'Secondary dimensions must be positive numbers' };
    }
    
    if (secondWidth > 100 || secondLength > 100) {
      return { valid: false, message: 'Secondary dimensions exceed maximum allowed values' };
    }
  }
  
  return { valid: true };
};

// Function to validate color values
const validateColorScheme = (colorScheme) => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  // Check each color value for valid hex format
  for (const key in colorScheme) {
    if (key !== 'name' && !colorRegex.test(colorScheme[key])) {
      return { 
        valid: false, 
        message: `Invalid color format for ${key}: ${colorScheme[key]}. Use hex format (#RRGGBB)` 
      };
    }
  }
  
  return { valid: true };
};

module.exports = {
  generate2DPreview,
  savePreviewImage,
  validateRoomDimensions,
  validateColorScheme
};