import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import NavBar from './NavBar';
import './FurniturePage/furniture.css'

const Products = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        setLoading(true);
        
        const productsResponse = await fetch('http://localhost:3001/api/furniture', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const favoritesResponse = await fetch('http://localhost:3001/api/favorites', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (productsResponse.ok && favoritesResponse.ok) {
          const productsData = await productsResponse.json();
          const favoritesData = await favoritesResponse.json();
          
          const favoritesMap = {};
          favoritesData.data.forEach(item => {
            favoritesMap[item._id] = true;
          });
          
          setProducts(productsData.data || []);
          setFavorites(favoritesMap);
        } else {
          setError('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const calculateFinalPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  const handleToggleFavorite = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (favorites[productId]) {
        response = await fetch(`http://localhost:3001/api/favorites/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await fetch('http://localhost:3001/api/favorites/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ furnitureId: productId })
        });
      }
      
      if (response.ok) {
        setFavorites(prev => {
          const updated = {...prev};
          if (updated[productId]) {
            delete updated[productId];
          } else {
            updated[productId] = true;
          }
          return updated;
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ furnitureId: productId, quantity: 1 })
      });
      
      if (response.ok) {
        alert('Added to cart!');
      } else {
        alert('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto p-4 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
          <p className="text-xl mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto p-4 text-center">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="navbar2">
        <div className="navbar-content2">
          <div className="logo2">LOGO</div>
          <nav className="nav-links2">
            <a href="/">Home</a>
            <Link to="/user/products" className="hover:text-gray-300">
              Products
            </Link>
            <Link to="/user/design" className="hover:text-gray-300">
              Design
            </Link>
            <Link to="/user/favorites" className="hover:text-gray-300">
              Favorites
            </Link>
            <Link to="/user/cart" className="hover:text-gray-300">
              Cart
            </Link>
            <button onClick={handleLogout} className="log-out">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <div className="hero-section2">
        <h1 className="title4">Our Furniture Collection</h1><br />
        
        <div className="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                {product.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={`http://localhost:3001/${product.image}`} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg text-black font-semibold mb-1">{product.title}</h2>
                  <p className="text-sm text-gray-500 mb-2">{product.productType}</p>
                  
                  <div className="mt-2">
                    {product.discount > 0 ? (
                      <div className="flex items-center">
                        <span className="font-bold text-indigo-600">${calculateFinalPrice(product.price, product.discount).toFixed(2)}</span>
                        <span className="ml-2 text-gray-400 line-through text-sm">${product.price.toFixed(2)}</span>
                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                          {product.discount}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {product.stockCount > 0 ? (
                    <p className="text-xs text-green-600 mt-1">In Stock ({product.stockCount})</p>
                  ) : (
                    <p className="text-xs text-red-600 mt-1">Out of Stock</p>
                  )}
                  
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => navigate(`/user/product/${product._id}`)}
                      className="bg-black text-white px-3 py-1 rounded hover:bg-[#003366] transition"
                    >
                      View Details
                    </button>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleToggleFavorite(product._id)}
                        className={`${favorites[product._id] ? 'bg-pink-500' : 'bg-gray-200'} text-white p-1 rounded hover:bg-pink-600 transition`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stockCount <= 0}
                        className={`${product.stockCount > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'} text-white p-1 rounded transition`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-xl text-gray-500">No products found</p>
            </div>
          )}
        </div><br /><br />
      </div>
    </div>
  );
};

export default Products;