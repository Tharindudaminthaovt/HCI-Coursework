import "./Explore.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Explore = () => {
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3001/api/furniture",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const limitedFurniture = response.data.data.slice(0, 8);
        setFurniture(limitedFurniture);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching furniture:", err);
        setError("Failed to load furniture. Please try again later.");
        setLoading(false);
      }
    };

    fetchFurniture();
  }, []);

  const calculateFinalPrice = (price, discount) => {
    if (!discount) return price;
    return price - price * (discount / 100);
  };

  return (
    <section className="explore-section">
      <div className="explore-header">
        <div className="line4"></div>
        <p className="subtitle2">What We Do Best</p>
        <br />
        <div className="line5"></div>
        <h2 className="title2">EXPLORE MORE</h2>
        <p className="description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="products-grid">
          {furniture.map((item) => (
            <div key={item._id} className="product-card1">
              <div className="image-container">
                <img
                  src={`http://localhost:3001/${item.image}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <button className="favorite-btn">♡</button>
                <div className="product-overlay">
                  <p className="product-name1">{item.title}</p>
                  {item.discount > 0 ? (
                    <div className="price-display">
                      <p className="product-price1">
                        $
                        {calculateFinalPrice(item.price, item.discount).toFixed(
                          2
                        )}
                      </p>
                      <p className="original-price">${item.price.toFixed(2)}</p>
                    </div>
                  ) : (
                    <p className="product-price1">${item.price.toFixed(2)}</p>
                  )}
                </div>
                <Link to={`/user/product/${item._id}`} className="add-to-cart">
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div><br />
        <Link
          to="/user/products"
          className="px-6 py-3 bg-[#000000] text-white rounded-md hover:bg-[#181818] transition inline-flex items-center"
        >
          Load More
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default Explore;
