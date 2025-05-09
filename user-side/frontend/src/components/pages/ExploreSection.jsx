import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ExploreSection = () => {
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/furniture', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Get only first 8 items
        const limitedFurniture = response.data.data.slice(0, 8);
        setFurniture(limitedFurniture);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching furniture:', err);
        setError('Failed to load furniture. Please try again later.');
        setLoading(false);
      }
    };

    fetchFurniture();
  }, []);

  // Calculate discounted price
  const calculateFinalPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Explore Our Collection</h2>
          <Link 
            to="/user/products" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {furniture.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={`http://localhost:3001/${item.image}`} 
                      alt={item.title}  
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 text-gray-800">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">{item.productType}</p>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <div>
                        {item.discount > 0 ? (
                          <div className="flex items-center">
                            <span className="font-bold text-indigo-600">${calculateFinalPrice(item.price, item.discount).toFixed(2)}</span>
                            <span className="ml-2 text-gray-400 line-through text-sm">${item.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-indigo-600">${item.price.toFixed(2)}</span>
                        )}
                      </div>
                      <Link 
                        to={`/user/product/${item._id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link 
                to="/user/products" 
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition inline-flex items-center"
              >
                Load More
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ExploreSection;