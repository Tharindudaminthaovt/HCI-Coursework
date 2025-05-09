import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Axios from 'axios';

export default function EditRoomDesign() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [furniture, setFurniture] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [furnitureFilter, setFurnitureFilter] = useState('all');
  const [showFurnitureGallery, setShowFurnitureGallery] = useState(false);
  const [savedDesign, setSavedDesign] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    shape: 'rectangular',
    width: '',
    length: '',
    height: '',
    secondWidth: '',
    secondLength: '',
    isPublic: false,
    colorScheme: {
      name: 'Default',
      walls: '#FFFFFF',
      floor: '#8B4513',
      ceiling: '#F8F8F8',
      trim: '#FFFFFF'
    }
  });



      const generatePreview = useCallback(() => {
        if (formData.width && formData.length && formData.height) {
          if (formData.shape === 'L-shaped' && (!formData.secondWidth || !formData.secondLength)) {
            return;
          }
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const scale = 20;
          
          let canvasWidth, canvasLength;
          if (formData.shape === 'L-shaped') {
            canvasWidth = Math.max(parseFloat(formData.width), parseFloat(formData.secondWidth)) * scale + 20;
            canvasLength = Math.max(parseFloat(formData.length), parseFloat(formData.secondLength)) * scale + 20;
          } else {
            canvasWidth = parseFloat(formData.width) * scale + 20;
            canvasLength = parseFloat(formData.length) * scale + 20;
          }
          
          canvasWidth = Math.max(canvasWidth, 400);
          canvasLength = Math.max(canvasLength, 400);
          
          canvas.width = canvasWidth;
          canvas.height = canvasLength;
          
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(0, 0, canvasWidth, canvasLength);
          
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 2;
          
          if (formData.shape === 'rectangular') {
            ctx.strokeRect(10, 10, parseFloat(formData.width) * scale, parseFloat(formData.length) * scale);
            
            ctx.fillStyle = formData.colorScheme.walls;
            ctx.fillRect(10, 10, parseFloat(formData.width) * scale, parseFloat(formData.length) * scale);
            
            ctx.fillStyle = formData.colorScheme.floor;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(10, 10, parseFloat(formData.width) * scale, parseFloat(formData.length) * scale);
            ctx.globalAlpha = 1.0;
          } else if (formData.shape === 'L-shaped') {
            const mainWidth = parseFloat(formData.width) * scale;
            const mainLength = parseFloat(formData.length) * scale;
            const secWidth = parseFloat(formData.secondWidth) * scale;
            const secLength = parseFloat(formData.secondLength) * scale;
            
            ctx.beginPath();
            ctx.moveTo(10, 10);
            ctx.lineTo(10 + mainWidth, 10);
            ctx.lineTo(10 + mainWidth, 10 + secLength);
            ctx.lineTo(10 + secWidth, 10 + secLength);
            ctx.lineTo(10 + secWidth, 10 + mainLength);
            ctx.lineTo(10, 10 + mainLength);
            ctx.closePath();
            
            ctx.fillStyle = formData.colorScheme.walls;
            ctx.fill();
            
            ctx.fillStyle = formData.colorScheme.floor;
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            
            ctx.stroke();
          }
          
          if (selectedFurniture && selectedFurniture.length > 0) {
            selectedFurniture.forEach(item => {
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
          
          setPreviewUrl(canvas.toDataURL('image/png'));
        }
      }, [formData, selectedFurniture]);



  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
  const fetchRoomDesign = async () => {
    try {
      const response = await Axios.get(
        `http://localhost:3001/api/admin/room-designs/${id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const design = response.data;
      console.log('Fetched room design:', design);
      
      setFormData({
        name: design.name,
        shape: design.shape,
        width: design.dimensions.width,
        length: design.dimensions.length,
        height: design.dimensions.height,
        secondWidth: design.dimensions.secondWidth || '',
        secondLength: design.dimensions.secondLength || '',
        isPublic: design.isPublic,
        colorScheme: design.colorScheme
      });
      
      const formattedFurniture = design.furniture.map(item => ({
        itemId: item.itemId?._id || item.itemId,
        position: {
          x: item.position?.x || 0,
          y: item.position?.y || 0,
          z: item.position?.z || 0
        },
        rotation: item.rotation || 0
      }));
      
      console.log('Formatted furniture:', formattedFurniture);
      
      setSelectedFurniture(formattedFurniture);
      
    } catch (err) {
      console.error('Error fetching room design:', err);
      setError('Failed to load room design. Please try again later.');
    }
  };
    
    const fetchFurniture = async () => {
      try {
        const response = await Axios.get('http://localhost:3001/api/admin/furniture', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFurniture(response.data.data || []);
      } catch (err) {
        console.error('Error fetching furniture:', err);
        setError('Failed to load furniture items.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDesign();
    fetchFurniture();
  }, [id, navigate]);


    useEffect(() => {
      generatePreview();
    }, [formData, selectedFurniture, generatePreview]);  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('colorScheme.')) {
      const colorKey = name.split('.')[1];
      setFormData({
        ...formData,
        colorScheme: {
          ...formData.colorScheme,
          [colorKey]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleFurnitureFilterChange = (e) => {
    setFurnitureFilter(e.target.value);
  };

  const getFilteredFurniture = () => {
    if (furnitureFilter === 'all') {
      return furniture;
    }
    return furniture.filter(item => item.productType === furnitureFilter);
  };

  const getProductTypes = () => {
    const types = new Set(furniture.map(item => item.productType));
    return ['all', ...Array.from(types)];
  };

  const handleFurnitureSelect = (item) => {
    const newFurnitureItem = {
      itemId: item._id,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0
    };
    setSelectedFurniture([...selectedFurniture, newFurnitureItem]);
  };

  const handleFurniturePositionChange = (index, axis, value) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture[index].position[axis] = Number(value);
    setSelectedFurniture(updatedFurniture);
  };

  const handleFurnitureRotationChange = (index, value) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture[index].rotation = Number(value);
    setSelectedFurniture(updatedFurniture);
  };

  const removeFurniture = (index) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture.splice(index, 1);
    setSelectedFurniture(updatedFurniture);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const dimensions = {
      width: parseFloat(formData.width),
      length: parseFloat(formData.length),
      height: parseFloat(formData.height)
    };
    
    if (formData.shape === 'L-shaped') {
      dimensions.secondWidth = parseFloat(formData.secondWidth);
      dimensions.secondLength = parseFloat(formData.secondLength);
    }
    
    const roomDesignData = {
      name: formData.name,
      dimensions,
      shape: formData.shape,
      colorScheme: formData.colorScheme,
      furniture: selectedFurniture,
      isPublic: formData.isPublic
    };
    
    try {
      const response = await Axios.put(
        `http://localhost:3001/api/admin/room-designs/${id}`,
        roomDesignData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/room-designs');
      }, 2000);
    } catch (err) {
      console.error('Error updating room design:', err);
      setError(err.response?.data?.message || 'Failed to update room design');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) return imagePath;
    
    if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads')) {
      return `http://localhost:3001${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    }
    
    if (imagePath.includes('\\furniture\\') || imagePath.includes('/furniture/')) {
      const filename = imagePath.split(/[/\\]/).pop();
      return `http://localhost:3001/uploads/furniture/${filename}`;
    }
    
    return `http://localhost:3001${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Room Design</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Room design updated successfully! Redirecting...
          </div>
        )}

        <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-[#014482] mb-4">Room Design Preview</h2>
          <div className="flex justify-center">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Room Design Preview" 
                className="max-w-full h-auto border rounded-md shadow-sm"
                style={{ maxHeight: '300px' }}
              />
            ) : (
              <div className="flex items-center justify-center bg-gray-100 w-full h-64 rounded-md text-gray-500">
                Preview will appear here once you enter room dimensions
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Room Shape *
                </label>
                <select
                  name="shape"
                  value={formData.shape}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                >
                  <option value="rectangular">Rectangular</option>
                  <option value="L-shaped">L-shaped</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Room Dimensions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Width (meters) *
                </label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Length (meters) *
                </label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Height (meters) *
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                  step="0.01"
                />
              </div>
            </div>
            
            {formData.shape === 'L-shaped' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Second Width (meters) *
                  </label>
                  <input
                    type="number"
                    name="secondWidth"
                    value={formData.secondWidth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Second Length (meters) *
                  </label>
                  <input
                    type="number"
                    name="secondLength"
                    value={formData.secondLength}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    required
                    step="0.01"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Color Scheme
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Color Scheme Name
                </label>
                <input
                  type="text"
                  name="colorScheme.name"
                  value={formData.colorScheme.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Wall Color
                </label>
                <input
                  type="color"
                  name="colorScheme.walls"
                  value={formData.colorScheme.walls}
                  onChange={handleChange}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Floor Color
                </label>
                <input
                  type="color"
                  name="colorScheme.floor"
                  value={formData.colorScheme.floor}
                  onChange={handleChange}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Ceiling Color
                </label>
                <input
                  type="color"
                  name="colorScheme.ceiling"
                  value={formData.colorScheme.ceiling}
                  onChange={handleChange}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Trim Color
                </label>
                <input
                  type="color"
                  name="colorScheme.trim"
                  value={formData.colorScheme.trim}
                  onChange={handleChange}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                />
              </div>
            </div>
          </div>
          
          {furniture && furniture.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                Furniture Selection
              </h2>
              <button
                type="button"
                onClick={() => setShowFurnitureGallery(!showFurnitureGallery)}
                className="mb-4 px-4 py-2 bg-[#014482] text-white rounded-md hover:bg-[#01325e] transition duration-300"
              >
                {showFurnitureGallery ? 'Hide Furniture Gallery' : 'Show Furniture Gallery'}
              </button>
              
              {showFurnitureGallery && (
                <div className="mb-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Filter by Type
                    </label>
                    <select
                      value={furnitureFilter}
                      onChange={handleFurnitureFilterChange}
                      className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    >
                      {getProductTypes().map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Items' : type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getFilteredFurniture().map(item => (
                      <div 
                        key={item._id} 
                        className="border rounded-md overflow-hidden shadow-sm hover:shadow transition"
                      >
                        <div className="h-40 bg-gray-100 flex items-center justify-center">

                          {item.image ? (
                            <img 
                              src={getImageUrl(item.image)}
                              alt={item.title}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                console.error('Image failed to load:', item.image);
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect fill="%23f0f0f0" width="150" height="150"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-sm">
                              No image
                            </div>
                          )}

                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-semibold text-sm mb-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1">
                            {item.productType}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              ${item.price.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFurnitureSelect(item)}
                              className="text-xs px-2 py-1 bg-[#014482] text-white rounded hover:bg-[#01325e]"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              

              {selectedFurniture.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    Selected Furniture ({selectedFurniture.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedFurniture.map((item, index) => {
                      const itemId = typeof item.itemId === 'object' ? item.itemId._id : item.itemId;
                      const furnitureDetails = furniture.find(f => f._id === itemId);
                      
                      console.log(`Furniture item ${index}:`, {
                        itemId,
                        furnitureDetails: furnitureDetails ? `Found: ${furnitureDetails.title}` : 'Not found',
                        position: item.position,
                        rotation: item.rotation
                      });
                      
                      return (
                        <div 
                          key={index}
                          className="border rounded-md p-4 flex flex-col md:flex-row gap-4"
                        >
                          <div className="w-full md:w-1/5 h-40 md:h-32 bg-gray-100 flex items-center justify-center rounded">

                          
                          {furnitureDetails?.image ? (
                            <img 
                              src={getImageUrl(furnitureDetails.image)}
                              alt={furnitureDetails?.title || "Furniture item"}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                console.error('Image failed to load:', furnitureDetails.image);
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect fill="%23f0f0f0" width="150" height="150"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-sm">
                              No image available
                            </div>
                          )}

                          </div>
                          
                          <div className="w-full md:w-4/5">
                            <div className="flex justify-between mb-3">
                              <h4 className="font-semibold">
                                {furnitureDetails?.title || 'Furniture Item'}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeFurniture(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  X Position
                                </label>
                                <input
                                  type="number"
                                  value={item.position?.x || 0}
                                  onChange={(e) => handleFurniturePositionChange(index, 'x', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Y Position
                                </label>
                                <input
                                  type="number"
                                  value={item.position?.y || 0}
                                  onChange={(e) => handleFurniturePositionChange(index, 'y', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Z Position
                                </label>
                                <input
                                  type="number"
                                  value={item.position?.z || 0}
                                  onChange={(e) => handleFurniturePositionChange(index, 'z', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Rotation (degrees)
                                </label>
                                <input
                                  type="number"
                                  value={item.rotation || 0}
                                  onChange={(e) => handleFurnitureRotationChange(index, e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-[#014482] border-gray-300 rounded focus:ring-[#014482]"
              />
              <label htmlFor="isPublic" className="ml-2 text-gray-700">
                Make this room design public
              </label>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/admin/room-designs')}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#014482] text-white rounded-md hover:bg-[#01325e] transition duration-300"
            >
              {loading ? 'Updating...' : 'Update Room Design'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}