import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav>
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo">LOGO</div>
          <nav className="nav-links">
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
    </nav>
  );
};

export default NavBar;
