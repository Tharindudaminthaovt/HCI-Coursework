import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopFurniture = () => {
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopFurniture = async () => {
      try {
        setLoading(true);
        // Use the correct backend URL - make sure this matches your backend server
        const response = await axios.get('http://localhost:3001/api/furniture/top', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setFurniture(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching top furniture:', err);
        setError('Failed to load furniture items');
        setLoading(false);
      }
    };

    fetchTopFurniture();
  }, []);

  if (loading) return <div className="text-center py-10">Loading top furniture...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Top In Stock Furniture</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {furniture.length > 0 ? (
            furniture.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={`http://localhost:3001/${item.image}`} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <span className="text-sm text-gray-500 uppercase tracking-wider">{item.productType}</span>
                  <h3 className="font-semibold text-lg mt-1">{item.title}</h3>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      {item.discount > 0 ? (
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-indigo-600">
                            ${((item.price * (100 - item.discount)) / 100).toFixed(2)}
                          </span>
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-indigo-600">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      In Stock: {item.stockCount}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8">No furniture items available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopFurniture;