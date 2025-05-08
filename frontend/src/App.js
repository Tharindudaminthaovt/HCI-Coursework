import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Form from './components/LoginPage/loginform';
import Signup from './components/SignupPage/signupform';
import Hero from './components/Hero';
import UserHero from './components/Hero';
import Products from './components/Products';
import UserRoomDesignsPage from './components/UserRoomDesignsPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import FavoritePage from './components/FavoritePage';
import ShoppingCart from './components/ShoppingCart';

const ProtectedRoute = ({ children }) => {
  const auth = localStorage.getItem('token');
  
  if (!auth) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Form setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/landing" element={<Hero />} />
        
        <Route path="/" element={
          isLoggedIn ? <Navigate to="/user/home" /> : <Navigate to="/login" />
        } />
        
        <Route path="/user/home" element={
          <ProtectedRoute>
            <UserHero />
          </ProtectedRoute>
        } />
        <Route path="/user/products" element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } />
        <Route path="/user/design" element={
          <ProtectedRoute>
            <UserRoomDesignsPage />
          </ProtectedRoute>
        } />
        <Route path="/user/product/:id" element={
          <ProtectedRoute>
            <ProductDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="/user/favorites" element={
          <ProtectedRoute>
            <FavoritePage />
          </ProtectedRoute>
        } />
        <Route path="/user/cart" element={
          <ProtectedRoute>
            <ShoppingCart />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}