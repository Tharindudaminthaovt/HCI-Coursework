const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const generate2DPreview = (dimensions, shape, furniture = []) => {
  const scale = 20;
  
  let canvasWidth, canvasLength;
  
  if (shape === 'L-shaped') {
    canvasWidth = Math.max(dimensions.width, dimensions.secondWidth) * scale + 20;
    canvasLength = Math.max(dimensions.length, dimensions.secondLength) * scale + 20;
  } else {
    canvasWidth = dimensions.width * scale + 20;
    canvasLength = dimensions.length * scale + 20;
  }
  
  canvasWidth = Math.max(canvasWidth, 400);
  canvasLength = Math.max(canvasLength, 400);
  
  const canvas = createCanvas(canvasWidth, canvasLength);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvasWidth, canvasLength);
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  
  if (shape === 'rectangular') {
    ctx.strokeRect(10, 10, dimensions.width * scale, dimensions.length * scale);
  } else if (shape === 'L-shaped') {
    const mainWidth = dimensions.width * scale;
    const mainLength = dimensions.length * scale;
    const secWidth = dimensions.secondWidth * scale;
    const secLength = dimensions.secondLength * scale;
    
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(10 + mainWidth, 10);
    ctx.lineTo(10 + mainWidth, 10 + secLength);
    ctx.lineTo(10 + secWidth, 10 + secLength);
    ctx.lineTo(10 + secWidth, 10 + mainLength);
    ctx.lineTo(10, 10 + mainLength);
    ctx.closePath();
    ctx.stroke();
  }
  
  if (furniture && furniture.length > 0) {
    furniture.forEach(item => {
      ctx.fillStyle = '#8B4513';
      
      const x = 10 + (item.position.x * scale);
      const y = 10 + (item.position.y * scale);
      const itemWidth = 20;
      const itemLength = 20;
      
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
  
  return canvas.toDataURL('image/png');
};

const savePreviewImage = async (dataUrl, designId) => {
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  
  const uploadDir = path.join(__dirname, '../uploads/previews');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filePath = path.join(uploadDir, `${designId}_2d.png`);
  
  await fs.promises.writeFile(filePath, base64Data, 'base64');
  
  return `/uploads/previews/${designId}_2d.png`;
};


const validateRoomDimensions = (dimensions) => {
  const { width, length, height, secondWidth, secondLength } = dimensions;
  
  if (!width || !length || !height) {
    return { valid: false, message: 'Width, length, and height are required' };
  }
  
  if (width <= 0 || length <= 0 || height <= 0) {
    return { valid: false, message: 'Dimensions must be positive numbers' };
  }
  
  if (width > 100 || length > 100 || height > 30) {
    return { valid: false, message: 'Dimensions exceed maximum allowed values' };
  }
  
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

const validateColorScheme = (colorScheme) => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
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