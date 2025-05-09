// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const Hero = () => {
//   const navigate = useNavigate();

//   const handleRegisterClick = () => {
//     navigate('/signup');
//   };

//   return (
//     <div className="text-center py-16 text-[#004581]">
//       <h1 className="text-4xl font-bold mb-6">Welcome to the home page</h1>
//       <button
//         onClick={handleRegisterClick}
//         className="bg-[#018ABD] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#004581] transition duration-300"
//       >
//         SIGN UP
//       </button>
//     </div>
//   );
// };

// export default Hero;









// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import NavBar from './NavBar';

// const Hero = () => {
//   const navigate = useNavigate();
  
//   useEffect(() => {
//     // Check if user is already logged in
//     const token = localStorage.getItem('token');
//     const userRole = localStorage.getItem('userRole');
    
//     if (token) {
//       // Redirect based on role
//       if (userRole === 'admin') {
//         navigate('/dashboard');
//       } else {
//         navigate('/user/home');
//       }
//     }
//   }, [navigate]);

//   const handleLoginClick = () => {
//     navigate('/login');
//   };
  
//   const handleRegisterClick = () => {
//     navigate('/signup');
//   };

//   return (
//     <div>
      
//       <NavBar />

//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
//       <div className="text-center mb-12">
//         <h1 className="text-5xl font-bold mb-6 text-[#004581]">Welcome to Furniture Store</h1>
//         <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
//           Discover beautiful, modern furniture for every room in your home. Quality craftsmanship, elegant designs, and comfort that lasts.
//         </p>
//       </div>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
//           <h3 className="text-xl font-bold text-[#004581] mb-2">Quality Furniture</h3>
//           <p className="text-gray-600">Our furniture is crafted with the finest materials for lasting quality.</p>
//         </div>
        
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
//           <h3 className="text-xl font-bold text-[#004581] mb-2">Modern Designs</h3>
//           <p className="text-gray-600">Explore our collection of contemporary and classic furniture styles.</p>
//         </div>
        
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
//           <h3 className="text-xl font-bold text-[#004581] mb-2">Room Planning</h3>
//           <p className="text-gray-600">Get inspiration for your home with our room design gallery.</p>
//         </div>
//       </div>
//     </div>

//     </div>
    
//   );
// };

// export default Hero;





// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import NavBar from './NavBar';
// import axios from 'axios';

// const Hero = () => {
//   const navigate = useNavigate();
//   const [topFurniture, setTopFurniture] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Check if user is already logged in
//     const token = localStorage.getItem('token');
//     const userRole = localStorage.getItem('userRole');
    
//     if (token) {
//       // Redirect based on role
//       if (userRole === 'admin') {
//         navigate('/dashboard');
//       } else {
//         navigate('/user/home');
//       }
//     }

//     // Fetch top furniture items
//     const fetchTopFurniture = async () => {
//       try {
//         const response = await axios.get('/api/furniture/top');
//         setTopFurniture(response.data.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load top furniture items');
//         setLoading(false);
//         console.error('Error fetching top furniture:', err);
//       }
//     };

//     fetchTopFurniture();
//   }, [navigate]);

//   const handleLoginClick = () => {
//     navigate('/login');
//   };
  
//   const handleRegisterClick = () => {
//     navigate('/signup');
//   };

//   // Function to format price
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(price);
//   };

//   // Function to get image URL
//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return '';
//     // For local development environment
//     if (imagePath.startsWith('uploads/')) {
//       return `/${imagePath}`;
//     }
//     return imagePath;
//   };

//   return (
//     <div>
//       <NavBar />
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold mb-6 text-[#004581]">Welcome to Furniture Store</h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
//             Discover beautiful, modern furniture for every room in your home. Quality craftsmanship, elegant designs, and comfort that lasts.
//           </p>
//         </div>
        
//         {/* Top Furniture Items Section */}
//         <div className="w-full max-w-6xl mx-auto mb-16">
//           <h2 className="text-3xl font-bold text-[#004581] mb-8 text-center">Top Furniture</h2>
          
//           {loading ? (
//             <div className="text-center py-12">
//               <p>Loading top furniture items...</p>
//             </div>
//           ) : error ? (
//             <div className="text-center py-12 text-red-600">
//               <p>{error}</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//               {topFurniture.map((item) => (
//                 <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
//                   <div className="h-48 overflow-hidden">
//                     <img 
//                       src={getImageUrl(item.image)} 
//                       alt={item.title} 
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = '/placeholder-furniture.jpg';
//                       }}
//                     />
//                   </div>
//                   <div className="p-4">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{item.title}</h3>
//                     <p className="text-sm text-gray-500 mb-2">{item.productType}</p>
//                     <p className="text-lg font-bold text-[#004581]">{formatPrice(item.price)}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Features Section */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
//             <h3 className="text-xl font-bold text-[#004581] mb-2">Quality Furniture</h3>
//             <p className="text-gray-600">Our furniture is crafted with the finest materials for lasting quality.</p>
//           </div>
          
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
//             <h3 className="text-xl font-bold text-[#004581] mb-2">Modern Designs</h3>
//             <p className="text-gray-600">Explore our collection of contemporary and classic furniture styles.</p>
//           </div>
          
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
//             <h3 className="text-xl font-bold text-[#004581] mb-2">Room Planning</h3>
//             <p className="text-gray-600">Get inspiration for your home with our room design gallery.</p>
//           </div>
//         </div>

//         {/* Buttons for Login/Register */}
//         <div className="mt-12 flex flex-col sm:flex-row gap-4">
//           <button 
//             onClick={handleLoginClick}
//             className="bg-[#004581] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#003566] transition-colors"
//           >
//             Log In
//           </button>
//           <button 
//             onClick={handleRegisterClick}
//             className="bg-white text-[#004581] border-2 border-[#004581] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
//           >
//             Sign Up
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hero;









////hero section with top funritre
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import TopFurniture from '../components/TopFurniture';

// const HomePage = () => {
//   // Check if user is logged in
//   const token = localStorage.getItem('token');
  
//   // If not logged in, redirect to login page
//   if (!token) {
//     return <Navigate to="/login" />;
//   }
  
//   return (
//     <div>
//       {/* Hero Banner */}
//       <div className="bg-indigo-700 text-white py-20">
//         <div className="container mx-auto px-4 text-center">
//           <h1 className="text-4xl md:text-5xl font-bold mb-4">Elegant Furniture For Your Home</h1>
//           <p className="text-xl md:w-2/3 mx-auto">
//             Discover our collection of premium furniture designed for comfort and style.
//           </p>
//         </div>
//       </div>
      
//       {/* Top Furniture Section */}
//       <TopFurniture />
      
//       {/* Additional homepage content goes here */}
//     </div>
//   );
// };

// export default HomePage;









import React from 'react';
import { Navigate } from 'react-router-dom';
import TopFurniture from '../components/TopFurniture';
import ExploreSection from '../components/ExploreSection';

const HomePage = () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  
  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Elegant Furniture For Your Home</h1>
          <p className="text-xl md:w-2/3 mx-auto">
            Discover our collection of premium furniture designed for comfort and style.
          </p>
        </div>
      </div>
      
      {/* Explore Section with 8 furniture items */}
      <ExploreSection />
      
      {/* Top Furniture Section */}
      <TopFurniture />
      
      {/* Additional homepage content can go here */}
    </div>
  );
};

export default HomePage;