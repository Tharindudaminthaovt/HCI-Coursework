// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import Axios from 'axios';

// export default function FurnitureDetailPage() {
//   const [furniture, setFurniture] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [imageError, setImageError] = useState(false);

//   const { id } = useParams();
//   const navigate = useNavigate();
//   const API_BASE_URL = 'http://localhost:3001';

//   useEffect(() => {
//     fetchFurnitureDetails();
//   }, [id]);

//   const fetchFurnitureDetails = async () => {
//     const user = JSON.parse(localStorage.getItem('user')) || {};
//     const token = localStorage.getItem('authToken');

//     if (!token || user.role !== 'admin') {
//       navigate('/login');
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await Axios.get(`${API_BASE_URL}/api/admin/furniture/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       setFurniture(response.data.data);
//     } catch (err) {
//       console.error('Error fetching furniture details:', err);
//       setError('Failed to load furniture details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Toggle favorite status
//   const toggleFavorite = async () => {
//     const token = localStorage.getItem('authToken');
//     try {
//       const response = await Axios.patch(
//         `${API_BASE_URL}/api/admin/furniture/${id}/favorite`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       // Update local state
//       setFurniture(prev => ({
//         ...prev,
//         isFavorite: !prev.isFavorite
//       }));

//       console.log('Favorite toggled:', response.data);
//     } catch (err) {
//       console.error('Error toggling favorite:', err);
//     }
//   };

//   // Convert relative path to absolute URL
//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return null;

//     // If it's already an absolute URL, return as is
//     if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//       return imagePath;
//     }

//     // Remove any leading slash to avoid double slashes
//     const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
//     return `${API_BASE_URL}/${cleanPath}`;
//   };

//   // Calculate the final price after discount
//   const calculateFinalPrice = (price, discount) => {
//     if (!discount) return price;
//     return price - (price * discount / 100);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#DEE8F1] p-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//             <p>{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!furniture) {
//     return (
//       <div className="min-h-screen bg-[#DEE8F1] p-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
//             <p>Furniture item not found.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#DEE8F1] p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-[#014482]">Furniture Details</h1>
//           <div className="flex space-x-4">
//             <button
//               onClick={() => navigate('/admin/furniture')}
//               className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
//             >
//               Back to Furniture List
//             </button>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="grid md:grid-cols-2 gap-0">
//             {/* Image Section */}
//             <div className="bg-gray-100 min-h-[350px] flex items-center justify-center relative">
//               {furniture.image && !imageError ? (
//                 <img
//                   src={getImageUrl(furniture.image)}
//                   alt={furniture.title}
//                   className="w-full h-full object-contain"
//                   onError={() => setImageError(true)}
//                 />
//               ) : (
//                 <div className="flex flex-col items-center justify-center text-gray-400 p-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                   </svg>
//                   <p className="text-center text-sm">Image Not Available</p>
//                 </div>
//               )}
//               <button
//                 onClick={toggleFavorite}
//                 className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
//               >
//                 {furniture.isFavorite ? (
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffcc00" className="w-6 h-6">
//                     <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
//                   </svg>
//                 ) : (
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
//                   </svg>
//                 )}
//               </button>
//             </div>

//             {/* Information Section */}
//             <div className="p-6">
//               <h2 className="text-2xl font-bold text-[#014482] mb-2">{furniture.title}</h2>
//               <p className="text-gray-600 mb-6">{furniture.productType}</p>

//               <div className="flex items-center mb-6">
//                 {furniture.discount > 0 ? (
//                   <>
//                     <span className="text-2xl font-bold text-[#014482]">
//                       ${calculateFinalPrice(furniture.price, furniture.discount).toFixed(2)}
//                     </span>
//                     <span className="ml-3 text-lg text-gray-500 line-through">
//                       ${furniture.price.toFixed(2)}
//                     </span>
//                     <span className="ml-3 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
//                       {furniture.discount}% OFF
//                     </span>
//                   </>
//                 ) : (
//                   <span className="text-2xl font-bold text-[#014482]">
//                     ${furniture.price.toFixed(2)}
//                   </span>
//                 )}
//               </div>

//               <div className="mb-6">
//                 <div className="flex items-center mb-2">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
//                   </svg>
//                   <span className={`font-medium ${furniture.stockCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {furniture.stockCount > 0 ? `In Stock (${furniture.stockCount})` : 'Out of Stock'}
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
//                 <p className="text-gray-700 whitespace-pre-wrap">{furniture.description}</p>
//               </div>

//               <div className="mt-6 pt-6 border-t border-gray-200">
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => navigate(`/admin/furniture/edit/${furniture._id}`)}
//                     className="bg-[#014482] text-white py-2 px-4 rounded hover:bg-[#013366] transition duration-300 flex-1"
//                   >
//                     Edit Item
//                   </button>
//                   <button
//                     onClick={() => {
//                       if (confirm('Are you sure you want to delete this item?')) {
//                         // Add delete functionality here
//                         navigate('/admin/furniture');
//                       }
//                     }}
//                     className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-300 flex-1"
//                   >
//                     Delete Item
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "axios";

export default function FurnitureDetailPage() {
  const [furniture, setFurniture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3001";

  useEffect(() => {
    fetchFurnitureDetails();
  }, [id]);

  const fetchFurnitureDetails = async () => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const token = localStorage.getItem("authToken");

    if (!token || user.role !== "admin") {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await Axios.get(
        `${API_BASE_URL}/api/admin/furniture/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFurniture(response.data.data);
    } catch (err) {
      console.error("Error fetching furniture details:", err);
      setError("Failed to load furniture details");
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await Axios.patch(
        `${API_BASE_URL}/api/admin/furniture/${id}/favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setFurniture((prev) => ({
        ...prev,
        isFavorite: !prev.isFavorite,
      }));

      console.log("Favorite toggled:", response.data);
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // Handle delete functionality
  const handleDelete = async () => {
    // Use window.confirm instead of confirm to avoid ESLint warning
    if (window.confirm("Are you sure you want to delete this item?")) {
      const token = localStorage.getItem("authToken");
      try {
        await Axios.delete(`${API_BASE_URL}/api/admin/furniture/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        navigate("/admin/furniture");
      } catch (err) {
        console.error("Error deleting furniture:", err);
        alert("Failed to delete furniture item");
      }
    }
  };

  // Convert relative path to absolute URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already an absolute URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Remove any leading slash to avoid double slashes
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // Calculate the final price after discount
  const calculateFinalPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#DEE8F1] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!furniture) {
    return (
      <div className="min-h-screen bg-[#DEE8F1] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Furniture item not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DEE8F1] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#014482]">
            Furniture Details
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/admin/furniture")}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
            >
              Back to Furniture List
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="bg-gray-100 min-h-[350px] flex items-center justify-center relative">
              {furniture.image && !imageError ? (
                <img
                  src={getImageUrl(furniture.image)}
                  alt={furniture.title}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-center text-sm">Image Not Available</p>
                </div>
              )}
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
              >
                {furniture.isFavorite ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#ffcc00"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Information Section */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#014482] mb-2">
                {furniture.title}
              </h2>
              <p className="text-gray-600 mb-6">{furniture.productType}</p>

              <div className="flex items-center mb-6">
                {furniture.discount > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-[#014482]">
                      $
                      {calculateFinalPrice(
                        furniture.price,
                        furniture.discount
                      ).toFixed(2)}
                    </span>
                    <span className="ml-3 text-lg text-gray-500 line-through">
                      ${furniture.price.toFixed(2)}
                    </span>
                    <span className="ml-3 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {furniture.discount}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-[#014482]">
                    ${furniture.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  <span
                    className={`font-medium ${
                      furniture.stockCount > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {furniture.stockCount > 0
                      ? `In Stock (${furniture.stockCount})`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {furniture.description}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/furniture/edit/${furniture._id}`)
                    }
                    className="bg-[#014482] text-white py-2 px-4 rounded hover:bg-[#013366] transition duration-300 flex-1"
                  >
                    Edit Item
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-300 flex-1"
                  >
                    Delete Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
