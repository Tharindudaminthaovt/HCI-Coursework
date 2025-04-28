import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import {
  FaTachometerAlt,
  FaPlus,
  FaThList,
  FaCouch,
  FaSignOutAlt,
} from "react-icons/fa";
import "../components/RoomDesign.css";

export default function CreateRoomDesign() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [furniture, setFurniture] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);

  const [savedDesign, setSavedDesign] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [furnitureFilter, setFurnitureFilter] = useState("all");
  const [showFurnitureGallery, setShowFurnitureGallery] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    shape: "rectangular",
    width: "",
    length: "",
    height: "",
    secondWidth: "",
    secondLength: "",
    isPublic: false,
    colorScheme: {
      name: "Default",
      walls: "#FFFFFF",
      floor: "#8B4513",
      ceiling: "#F8F8F8",
      trim: "#FFFFFF",
    },
  });

  // Generate preview based on current form data
  const generatePreview = useCallback(() => {
    // Only generate preview if we have the required dimensions
    if (formData.width && formData.length && formData.height) {
      // For L-shaped rooms, require additional dimensions
      if (
        formData.shape === "L-shaped" &&
        (!formData.secondWidth || !formData.secondLength)
      ) {
        return;
      }

      // Create a simple preview canvas representation
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scale = 20;

      // Calculate canvas size
      let canvasWidth, canvasLength;
      if (formData.shape === "L-shaped") {
        canvasWidth =
          Math.max(
            parseFloat(formData.width),
            parseFloat(formData.secondWidth)
          ) *
            scale +
          20;
        canvasLength =
          Math.max(
            parseFloat(formData.length),
            parseFloat(formData.secondLength)
          ) *
            scale +
          20;
      } else {
        canvasWidth = parseFloat(formData.width) * scale + 20;
        canvasLength = parseFloat(formData.length) * scale + 20;
      }

      // Ensure minimum size
      canvasWidth = Math.max(canvasWidth, 400);
      canvasLength = Math.max(canvasLength, 400);

      canvas.width = canvasWidth;
      canvas.height = canvasLength;

      // Draw room background
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, canvasWidth, canvasLength);

      // Draw room outline
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 2;

      if (formData.shape === "rectangular") {
        // Simple rectangular room
        ctx.strokeRect(
          10,
          10,
          parseFloat(formData.width) * scale,
          parseFloat(formData.length) * scale
        );

        // Add walls fill color
        ctx.fillStyle = formData.colorScheme.walls;
        ctx.fillRect(
          10,
          10,
          parseFloat(formData.width) * scale,
          parseFloat(formData.length) * scale
        );

        // Add floor fill
        ctx.fillStyle = formData.colorScheme.floor;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(
          10,
          10,
          parseFloat(formData.width) * scale,
          parseFloat(formData.length) * scale
        );
        ctx.globalAlpha = 1.0;
      } else if (formData.shape === "L-shaped") {
        // L-shaped room
        const mainWidth = parseFloat(formData.width) * scale;
        const mainLength = parseFloat(formData.length) * scale;
        const secWidth = parseFloat(formData.secondWidth) * scale;
        const secLength = parseFloat(formData.secondLength) * scale;

        // Draw L shape
        ctx.beginPath();
        ctx.moveTo(10, 10); // Start at top-left
        ctx.lineTo(10 + mainWidth, 10); // Top edge
        ctx.lineTo(10 + mainWidth, 10 + secLength); // Right edge of main section
        ctx.lineTo(10 + secWidth, 10 + secLength); // Bottom edge connecting to extension
        ctx.lineTo(10 + secWidth, 10 + mainLength); // Right edge of extension
        ctx.lineTo(10, 10 + mainLength); // Bottom edge
        ctx.closePath();

        // Fill with wall color
        ctx.fillStyle = formData.colorScheme.walls;
        ctx.fill();

        // Add floor color
        ctx.fillStyle = formData.colorScheme.floor;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Draw outline again
        ctx.stroke();
      }

      // Draw furniture if present
      if (selectedFurniture && selectedFurniture.length > 0) {
        selectedFurniture.forEach((item) => {
          ctx.fillStyle = "#8B4513"; // Brown color for furniture
          // Simple rectangle for each furniture item
          const x = 10 + item.position.x * scale;
          const y = 10 + item.position.y * scale;
          const itemWidth = 20; // Standard width for preview
          const itemLength = 20; // Standard length for preview

          // Draw a rotated rectangle if rotation is specified
          if (item.rotation) {
            ctx.save();
            ctx.translate(x + itemWidth / 2, y + itemLength / 2);
            ctx.rotate((item.rotation * Math.PI) / 180);
            ctx.fillRect(
              -itemWidth / 2,
              -itemLength / 2,
              itemWidth,
              itemLength
            );
            ctx.restore();
          } else {
            ctx.fillRect(x, y, itemWidth, itemLength);
          }
        });
      }

      // Return as data URL
      setPreviewUrl(canvas.toDataURL("image/png"));
    }
  }, [formData, selectedFurniture]);

  // Fetch furniture items on page load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFurniture = async () => {
      try {
        const response = await Axios.get(
          "http://localhost:3001/api/admin/furniture",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFurniture(response.data.data || []);
      } catch (err) {
        console.error("Error fetching furniture:", err);
        setError("Failed to load furniture items.");
      }
    };

    fetchFurniture();
  }, [navigate]);

  // Generate preview when form data changes
  useEffect(() => {
    generatePreview();
  }, [formData, selectedFurniture, generatePreview]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("colorScheme.")) {
      const colorKey = name.split(".")[1];
      setFormData({
        ...formData,
        colorScheme: {
          ...formData.colorScheme,
          [colorKey]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle furniture filter change
  const handleFurnitureFilterChange = (e) => {
    setFurnitureFilter(e.target.value);
  };

  // Filter furniture items based on type
  const getFilteredFurniture = () => {
    if (furnitureFilter === "all") {
      return furniture;
    }
    return furniture.filter((item) => item.productType === furnitureFilter);
  };

  // Get unique product types
  const getProductTypes = () => {
    const types = new Set(furniture.map((item) => item.productType));
    return ["all", ...Array.from(types)];
  };

  // Handle furniture selection
  const handleFurnitureSelect = (item) => {
    const newFurnitureItem = {
      itemId: item._id,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
    };
    setSelectedFurniture([...selectedFurniture, newFurnitureItem]);
  };

  // Update furniture position
  const handleFurniturePositionChange = (index, axis, value) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture[index].position[axis] = Number(value);
    setSelectedFurniture(updatedFurniture);
  };

  // Update furniture rotation
  const handleFurnitureRotationChange = (index, value) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture[index].rotation = Number(value);
    setSelectedFurniture(updatedFurniture);
  };

  // Remove furniture from selection
  const removeFurniture = (index) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture.splice(index, 1);
    setSelectedFurniture(updatedFurniture);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Prepare data for API
    const dimensions = {
      width: parseFloat(formData.width),
      length: parseFloat(formData.length),
      height: parseFloat(formData.height),
    };

    // Add secondary dimensions for L-shaped rooms
    if (formData.shape === "L-shaped") {
      dimensions.secondWidth = parseFloat(formData.secondWidth);
      dimensions.secondLength = parseFloat(formData.secondLength);
    }

    const roomDesignData = {
      name: formData.name,
      dimensions,
      shape: formData.shape,
      colorScheme: formData.colorScheme,
      furniture: selectedFurniture,
      isPublic: formData.isPublic,
    };

    try {
      const response = await Axios.post(
        "http://localhost:3001/api/admin/room-designs/create",
        roomDesignData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      // Redirect to room designs page after successful creation
      setSavedDesign(response.data.design);

      setTimeout(() => {
        navigate("/admin/room-designs");
      }, 2000);

      // // Show success message but don't redirect
      // setTimeout(() => {
      //   setSuccess(false);
      // }, 3000);
    } catch (err) {
      console.error("Error creating room design:", err);
      setError(err.response?.data?.message || "Failed to create room design");
    } finally {
      setLoading(false);
    }
  };

  // Publish the saved design
  const handlePublish = async () => {
    if (!savedDesign) {
      setError("Please save your design before publishing");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      // Update the design to mark it as public
      await Axios.put(
        `http://localhost:3001/api/admin/room-designs/${savedDesign._id}`,
        { isPublic: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      // Now redirect after successful publish
      setTimeout(() => {
        navigate("/admin/room-designs");
      }, 2000);
    } catch (err) {
      console.error("Error publishing room design:", err);
      setError(err.response?.data?.message || "Failed to publish room design");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-design-main">
      <div className="room-navbar">
        <aside className="sidebar">
          <div className="logo">LOGO</div>
          <nav className="nav-links-dashboard">
            <a href="/dashboard" className="nav-link-dashboard">
              <FaTachometerAlt className="icon" /> Dashboard
            </a>
            <a
              href="/admin/create-room-design"
              className="nav-link-dashboard  active"
            >
              <FaPlus className="icon" /> Create Designs
            </a>
            <a href="/admin/room-designs" className="nav-link-dashboard">
              <FaThList className="icon" /> My Designs
            </a>
            <a href="/admin/furniture/add" className="nav-link-dashboard">
              <FaCouch className="icon" /> Furniture
            </a>
            <a href="/logout" className="nav-link-dashboard">
              <FaSignOutAlt className="icon" /> Log Out
            </a>
          </nav>
        </aside>
      </div>

      <div className="room-create">
        <h1 className="room-title text-4xl font-bold mb-6">
          CREATE ROOM DESIGNS
        </h1>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
            role="alert"
          >
            <p>Room design created successfully! Redirecting...</p>
          </div>
        )}

        <div className="preview-area">
          <h2 className="text-xl font-semibold mb-4">Room Design Preview</h2>
          <div className="flex justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Room Design Preview"
                className="max-w-full h-auto border rounded-md shadow-sm"
                style={{ maxHeight: "300px" }}
              />
            ) : (
              <div className="flex items-center justify-center bg-gray-100 w-full h-64 rounded-md text-gray-500">
                Preview will appear here once you enter room dimensions
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Room Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="name"
                >
                  Room Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="shape"
                >
                  Room Shape *
                </label>
                <select
                  id="shape"
                  name="shape"
                  value={formData.shape}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                >
                  <option value="rectangular">Rectangular</option>
                  <option value="L-shaped">L-shaped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Room Dimensions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Room Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="width"
                >
                  Width (meters) *
                </label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  min="1"
                  max="100"
                  step="0.1"
                  value={formData.width}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="length"
                >
                  Length (meters) *
                </label>
                <input
                  type="number"
                  id="length"
                  name="length"
                  min="1"
                  max="100"
                  step="0.1"
                  value={formData.length}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="height"
                >
                  Height (meters) *
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  min="1"
                  max="30"
                  step="0.1"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
            </div>

            {/* L-shaped room additional dimensions */}
            {formData.shape === "L-shaped" && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="secondWidth"
                  >
                    Second Width (meters) *
                  </label>
                  <input
                    type="number"
                    id="secondWidth"
                    name="secondWidth"
                    min="1"
                    max="100"
                    step="0.1"
                    value={formData.secondWidth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    required={formData.shape === "L-shaped"}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="secondLength"
                  >
                    Second Length (meters) *
                  </label>
                  <input
                    type="number"
                    id="secondLength"
                    name="secondLength"
                    min="1"
                    max="100"
                    step="0.1"
                    value={formData.secondLength}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    required={formData.shape === "L-shaped"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color Scheme */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Color Scheme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.name"
                >
                  Color Scheme Name
                </label>
                <input
                  type="text"
                  id="colorScheme.name"
                  name="colorScheme.name"
                  value={formData.colorScheme.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.walls"
                >
                  Wall Color
                </label>
                <input
                  type="color"
                  id="colorScheme.walls"
                  name="colorScheme.walls"
                  value={formData.colorScheme.walls}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.floor"
                >
                  Floor Color
                </label>
                <input
                  type="color"
                  id="colorScheme.floor"
                  name="colorScheme.floor"
                  value={formData.colorScheme.floor}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.ceiling"
                >
                  Ceiling Color
                </label>
                <input
                  type="color"
                  id="colorScheme.ceiling"
                  name="colorScheme.ceiling"
                  value={formData.colorScheme.ceiling}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.trim"
                >
                  Trim Color
                </label>
                <input
                  type="color"
                  id="colorScheme.trim"
                  name="colorScheme.trim"
                  value={formData.colorScheme.trim}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Furniture Selection */}
          {furniture && furniture.length > 0 && (
            <div className="mb-8">
              <h2 className="furniture-select text-xl font-semibold mb-4">
                Furniture Selection
              </h2>

              <button
                type="button"
                onClick={() => setShowFurnitureGallery(!showFurnitureGallery)}
                className="select-btn mb-4 px-4 py-2 text-white rounded-md transition duration-300"
              >
                {showFurnitureGallery
                  ? "Hide Furniture Gallery"
                  : "Show Furniture Gallery"}
              </button>

              {showFurnitureGallery && (
                <div className="mt-4">
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 font-medium mb-2"
                      htmlFor="furnitureFilter"
                    >
                      Filter by Type
                    </label>
                    <select
                      id="furnitureFilter"
                      value={furnitureFilter}
                      onChange={handleFurnitureFilterChange}
                      className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    >
                      {getProductTypes().map((type) => (
                        <option key={type} value={type}>
                          {type === "all" ? "All Items" : type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {getFilteredFurniture().map((item) => (
                      <div
                        key={item._id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="h-48 bg-gray-200 relative">
                          {item.image ? (
                            <img
                              src={`http://localhost:3001/${item.image}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-800 mb-1 truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.productType}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              ${item.price.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFurnitureSelect(item)}
                              className="add-btn text-xs px-2 py-1 text-white rounded"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Furniture List */}
              {selectedFurniture.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Selected Furniture ({selectedFurniture.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedFurniture.map((item, index) => {
                      const furnitureDetails = furniture.find(
                        (f) => f._id === item.itemId
                      );
                      return (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-md border border-gray-200"
                        >
                          <div className="md:flex items-start">
                            {/* Furniture image thumbnail */}
                            <div className="md:w-1/6 mb-3 md:mb-0 md:mr-4">
                              {furnitureDetails?.image ? (
                                <img
                                  src={`http://localhost:3001/${furnitureDetails.image}`}
                                  alt={furnitureDetails.title}
                                  className="w-full h-20 object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">
                                    No image
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Furniture details and controls */}
                            <div className="md:w-5/6">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium">
                                  {furnitureDetails?.title || "Furniture Item"}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => removeFurniture(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    X Position
                                  </label>
                                  <input
                                    type="number"
                                    value={item.position.x}
                                    onChange={(e) =>
                                      handleFurniturePositionChange(
                                        index,
                                        "x",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Y Position
                                  </label>
                                  <input
                                    type="number"
                                    value={item.position.y}
                                    onChange={(e) =>
                                      handleFurniturePositionChange(
                                        index,
                                        "y",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Z Position
                                  </label>
                                  <input
                                    type="number"
                                    value={item.position.z}
                                    onChange={(e) =>
                                      handleFurniturePositionChange(
                                        index,
                                        "z",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Rotation (degrees)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="359"
                                    value={item.rotation}
                                    onChange={(e) =>
                                      handleFurnitureRotationChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visibility Setting */}
          <div className="mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-5 h-5 border rounded"
              />
              <label className="ml-2 block text-gray-700" htmlFor="isPublic">
                Make this room design public
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="cancel-btn px-6 py-2 text-white rounded-md transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`create-room-btn px-6 py-2 text-white rounded-md transition duration-300 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating..." : "Create Room Design"}
            </button>
          </div>
          <br />
          <br />
        </form>
      </div>
    </div>
  );
}
