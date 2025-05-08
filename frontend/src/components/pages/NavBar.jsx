import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };
  
  return (
    <nav className="bg-[#004581] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Furniture Store</div>
        
        <div className="flex space-x-6">
          <Link to="/user/home" className="hover:text-gray-300">Home</Link>
          <Link to="/user/products" className="hover:text-gray-300">Products</Link>
          <Link to="/user/design" className="hover:text-gray-300">Design</Link>
          <Link to="/user/favorites" className="hover:text-gray-300">Favorites</Link>
          <Link to="/user/cart" className="hover:text-gray-300">Cart</Link>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;