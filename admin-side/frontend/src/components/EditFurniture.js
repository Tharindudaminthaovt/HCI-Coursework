import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';

export default function EditFurniture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:3001';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productType: '',
    price: '',
    discount: '',
    stockCount: '',
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('authToken');
      
      if (!token || user.role !== 'admin') {
        navigate('/login');
        return false;
      }
      return true;
    };
    
    const fetchFurnitureDetails = async () => {
      if (!checkAuth()) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await Axios.get(`${API_BASE_URL}/api/admin/furniture/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const furniture = response.data.data;
        setFormData({
          title: furniture.title,
          description: furniture.description,
          productType: furniture.productType,
          price: furniture.price.toString(),
          discount: furniture.discount.toString(),
          stockCount: furniture.stockCount.toString(),
        });
        
        if (furniture.image) {
          setCurrentImage(getImageUrl(furniture.image));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching furniture details:', err);
        setError('Failed to load furniture details');
        setLoading(false);
      }
    };
    
    fetchFurnitureDetails();
  }, [id, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      const updatedFormData = new FormData();
      updatedFormData.append('title', formData.title);
      updatedFormData.append('description', formData.description);
      updatedFormData.append('productType', formData.productType);
      updatedFormData.append('price', formData.price);
      updatedFormData.append('discount', formData.discount);
      updatedFormData.append('stockCount', formData.stockCount);
      
      if (image) {
        updatedFormData.append('image', image);
      }
      
      const response = await Axios.put(
        `${API_BASE_URL}/api/admin/furniture/${id}`,
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Furniture updated:', response.data);
      navigate(`/admin/furniture/${id}`);
    } catch (err) {
      console.error('Error updating furniture:', err);
      setError('Failed to update furniture item');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#DEE8F1] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#DEE8F1] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#014482]">Edit Furniture</h1>
          <button 
            onClick={() => navigate(`/admin/furniture/${id}`)}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
          >
            Cancel
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productType">
                Product Type *
              </label>
              <input
                type="text"
                id="productType"
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Price (LKR) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stockCount">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stockCount"
                  name="stockCount"
                  value={formData.stockCount}
                  onChange={handleChange}
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Product Image {imagePreview || currentImage ? '(Current)' : ''}
              </label>
              
              {(imagePreview || currentImage) && (
                <div className="mb-4">
                  <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={imagePreview || currentImage} 
                      alt="Product Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-2">
                <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="image">
                  {currentImage ? 'Update image' : 'Upload image'}
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/jpeg, image/png, image/jpg, image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">PNG, JPG, JPEG or WebP (max 5MB)</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitLoading}
                className={`bg-[#014482] text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
                  submitLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#013366]'
                }`}
              >
                {submitLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Furniture'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}