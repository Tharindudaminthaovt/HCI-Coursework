import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "./NavBar";

const FavoritePage = () => {
  const [favorites, setFavorites] = useState([]);
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
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const productsResponse = await fetch(
          "http://localhost:3001/api/favorites",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (productsResponse.ok) {
          const result = await productsResponse.json();
          setFavorites(result.data || []);
        } else {
          console.error("Failed to fetch favorite products");
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError("An error occurred while fetching favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const calculateFinalPrice = (price, discount) => {
    if (!discount) return price;
    return price - price * (discount / 100);
  };

  const handleRemoveFromFavorites = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/favorites/remove/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFavorites(favorites.filter((item) => item._id !== productId));
      } else {
        alert("Failed to remove from favorites");
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ furnitureId: productId, quantity: 1 }),
      });

      if (response.ok) {
        alert("Added to cart!");
      } else {
        alert("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
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
          <p className="text-xl mt-4">Loading favorites...</p>
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
        <h1 className="title4 text-3xl font-bold text-center mb-8 text-[#004581]">
          My Favorites
        </h1><br />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-7xl mb-4">💔</div>
            <h2 className="text-2xl text-black font-semibold mb-2">
              Your favorites list is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding products to your favorites to see them here!
            </p>
            <button
              onClick={() => navigate("/user/products")}
              className="bg-[#004581] text-white px-6 py-2 rounded-md hover:bg-[#003366] transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
              >
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
                  <h2 className="text-lg text-black font-semibold mb-1">
                    {product.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.productType}
                  </p>

                  <div className="mt-2">
                    {product.discount > 0 ? (
                      <div className="flex items-center">
                        <span className="font-bold text-indigo-600">
                          $
                          {calculateFinalPrice(
                            product.price,
                            product.discount
                          ).toFixed(2)}
                        </span>
                        <span className="ml-2 text-gray-400 line-through text-sm">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                          {product.discount}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-indigo-600">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {product.stockCount > 0 ? (
                    <p className="text-xs text-green-600 mt-1">
                      In Stock ({product.stockCount})
                    </p>
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
                        onClick={() => handleRemoveFromFavorites(product._id)}
                        className="bg-gray-200 text-gray-800 p-1 rounded hover:bg-gray-300 transition"
                        title="Remove from Favorites"
                      >
                        ✖
                      </button>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition"
                        title="Add to Cart"
                        disabled={product.stockCount === 0}
                        style={{ opacity: product.stockCount === 0 ? 0.5 : 1 }}
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritePage;
