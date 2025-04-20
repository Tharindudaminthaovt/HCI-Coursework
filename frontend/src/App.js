import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Form from './components/LoginPage/loginform';
import Signup from './components/SignupPage/signupform';
import Hero from './components/Hero';

function App() {
  const location = useLocation();

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
              <Hero />
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/login"
          element={<Form />}
        />
        <Route
          path="/signup"
          element={<Signup />}
        />
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
