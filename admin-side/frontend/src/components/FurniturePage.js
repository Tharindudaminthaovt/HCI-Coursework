import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';

export default function FurniturePage() {
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [productTypes, setProductTypes] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:3001';
  
  useEffect(() => {
    fetchFurniture();
  }, [navigate, API_BASE_URL]);
  
  const fetchFurniture = async () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const token = localStorage.getItem('authToken');
    if (!token || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await Axios.get(`${API_BASE_URL}/api/admin/furniture`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('API Response:', response.data);
      setFurniture(response.data.data);
      
      // Extract unique product types for filter dropdown
      const types = [...new Set(response.data.data.map(item => item.productType))];
      setProductTypes(types);
    } catch (err) {
      console.error('Error fetching furniture:', err);
      setError('Failed to load furniture items');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle navigating to add furniture page
  const handleAddFurniture = () => {
    navigate('/admin/furniture/add');
  };
  
  // Filter furniture based on search term and product type
  const filteredFurniture = furniture.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = productTypeFilter === '' || item.productType === productTypeFilter;
    return matchesSearch && matchesType;
  });
  
  // Handle image loading errors
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };
  
  // Convert relative path to absolute URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already an absolute URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Remove any leading slash to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#DEE8F1] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#014482]">All Furniture</h1>
          <div className="flex space-x-4">
            <button 
              onClick={handleAddFurniture}
              className="bg-[#014482] text-white py-2 px-4 rounded hover:bg-[#013366] transition duration-300"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Furniture
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                id="search"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">Filter by Product Type</label>
              <select
                id="productType"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {productTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Furniture Cards */}
        {filteredFurniture.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No furniture items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFurniture.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
              {/* Make the entire card clickable */}
              <div 
                className="cursor-pointer" 
                onClick={() => navigate(`/admin/furniture/${item._id}`)}
              >
                <div className="h-48 overflow-hidden bg-gray-100 flex justify-center items-center">
                  {item.image && !imageErrors[item._id] ? (
                    <img 
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(item._id)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-center text-sm">Image Not Available</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-[#014482]">{item.title}</h3>
                  <p className="text-gray-700 font-medium">${item.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}