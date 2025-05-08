import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NavBar from "./NavBar";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/furniture/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setProduct(result.data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch product details");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("An error occurred while fetching product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate]);

  const calculateFinalPrice = (price, discount) => {
    if (!discount) return price;
    return price - price * (discount / 100);
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ furnitureId: id, quantity: 1 }),
      });

      if (response.ok) {
        alert("Added to cart successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("An error occurred while adding to cart");
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
          <p className="text-xl mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="container mx-auto p-4 text-center">
          <p className="text-xl text-red-500">{error}</p>
          <button
            onClick={() => navigate("/user/products")}
            className="mt-4 bg-[#004581] text-white px-4 py-2 rounded hover:bg-[#003366] transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto p-4 text-center">
          <p className="text-xl text-gray-500">Product not found</p>
          <button
            onClick={() => navigate("/user/products")}
            className="mt-4 bg-[#004581] text-white px-4 py-2 rounded hover:bg-[#003366] transition"
          >
            Back to Products
          </button>
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
      <div className="hero-section5 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="h-80 md:h-full">
                <img
                  src={`http://localhost:3001/${product.image}`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded mb-2">
                    {product.productType}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {product.title}
                  </h1>
                </div>
                <button
                  onClick={() => navigate("/user/products")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="my-4">
                {product.discount > 0 ? (
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      $
                      {calculateFinalPrice(
                        product.price,
                        product.discount
                      ).toFixed(2)}
                    </span>
                    <span className="ml-3 text-gray-400 line-through text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="ml-3 bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                      {product.discount}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-indigo-600">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mb-6">
                {product.stockCount > 0 ? (
                  <p className="text-sm text-green-600">
                    <span className="font-medium">In Stock</span> (
                    {product.stockCount} available)
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">
                    Out of Stock
                  </p>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </h2>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockCount <= 0}
                  className={`w-full py-3 px-6 rounded-md font-medium text-white ${
                    product.stockCount > 0
                      ? "bg-[#004581] hover:bg-[#003366]"
                      : "bg-gray-400 cursor-not-allowed"
                  } transition`}
                >
                  {product.stockCount > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Product Type</p>
                    <p className="font-medium text-black">{product.productType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stock Count</p>
                    <p className="font-medium text-black">{product.stockCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
