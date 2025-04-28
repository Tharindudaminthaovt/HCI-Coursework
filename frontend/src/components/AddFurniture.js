import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import {
  FaTachometerAlt,
  FaPlus,
  FaThList,
  FaCouch,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Furniture.css";

export default function AddFurniture() {
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3001";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    productType: "",
    price: "",
    discount: "0",
    stockCount: "0",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.title ||
      !formData.description ||
      !formData.productType ||
      !formData.price ||
      !image
    ) {
      setError("Please fill in all required fields and select an image");
      return;
    }

    setLoading(true);
    setError(null);

    // Create form data for multipart/form-data submission
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("productType", formData.productType);
    submitData.append("price", formData.price);
    submitData.append("discount", formData.discount);
    submitData.append("stockCount", formData.stockCount);
    submitData.append("image", image);

    const token = localStorage.getItem("authToken");

    try {
      const response = await Axios.post(
        `${API_BASE_URL}/api/admin/furniture`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Furniture added:", response.data);
      setSuccess(true);

      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        productType: "",
        price: "",
        discount: "0",
        stockCount: "0",
      });
      setImage(null);
      setImagePreview(null);

      // Redirect to furniture list after a short delay
      setTimeout(() => {
        navigate("/admin/furniture");
      }, 2000);
    } catch (err) {
      console.error("Error adding furniture:", err);
      setError(err.response?.data?.message || "Failed to add furniture item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Add-furniture">
      <div className="room-navbar">
        <aside className="sidebar">
          <div className="logo">LOGO</div>
          <nav className="nav-links-dashboard">
            <a href="/dashboard" className="nav-link-dashboard">
              <FaTachometerAlt className="icon" /> Dashboard
            </a>
            <a href="/admin/create-room-design" className="nav-link-dashboard">
              <FaPlus className="icon" /> Create Designs
            </a>
            <a href="/admin/room-designs" className="nav-link-dashboard">
              <FaThList className="icon" /> My Designs
            </a>
            <a
              href="/admin/furniture/add"
              className="nav-link-dashboard active"
            >
              <FaCouch className="icon" /> Furniture
            </a>
            <a href="/logout" className="nav-link-dashboard">
              <FaSignOutAlt className="icon" /> Log Out
            </a>
          </nav>
        </aside>
      </div>
      <div className="furniture-main max-w-4xl">
        <br />
        <br />
        <div className="top-furniture flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Add New Furniture</h1>
          {/* <button
            onClick={() => navigate("/admin/furniture")}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
          >
            Back to Furniture List
          </button> */}
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>Furniture item added successfully! Redirecting...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="bottom-furniture bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter furniture title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="productType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="productType"
                    name="productType"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="E.g. Chair, Table, Sofa"
                    value={formData.productType}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="discount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    min="0"
                    max="100"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter discount"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="stockCount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stockCount"
                    name="stockCount"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter stock quantity"
                    value={formData.stockCount}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter furniture description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    onChange={handleImageChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, WEBP (Max: 5MB)
                  </p>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <p className="block text-sm font-medium text-gray-700 mb-1">
                      Image Preview
                    </p>
                    <div className="h-48 w-full border border-gray-300 rounded-md overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="furniture-btn mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="cancel-btn bg-gray-300 text-gray-700 mr-4 py-2 px-6 rounded hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="add-btn bg-[#014482] text-white py-2 px-6 rounded hover:bg-[#013366] transition duration-300 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Add Furniture"
                )}
              </button>
            </div>
          </form>
        </div>
        <br />
        <br />
        <br />
        <br />
      </div>
    </div>
  );
}
