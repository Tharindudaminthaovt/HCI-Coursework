//signupform.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  // Regex for password validation
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setMessage('First Name is required.');
      return false;
    }
    if (!formData.lastName.trim()) {
      setMessage('Last Name is required.');
      return false;
    }
    if (!formData.email.trim()) {
      setMessage('Email is required.');
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      setMessage('Password must be at least 8 characters long, with at least one number and one symbol.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match!');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validate the form
    if (!validateForm()) return;

    try {
      const response = await Axios.post('http://localhost:3001/api/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        setMessage('Account created successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'Signup failed!');
      } else {
        setMessage('Network error. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white px-6 py-10 border-2 border-gray-200 w-full">
      <h1 className="text-4xl font-sans font-bold text-[#004581]">Create Account</h1>
      <p className="font-sans font-medium text-medium text-gray-500 mt-1">
        Already have an account?{' '}
        <Link to="/login" className="text-[#018ABD] hover:underline">
          Login
        </Link>
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mt-8">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-lg font-medium text-[#004581]">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                placeholder="First name"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-lg font-medium text-[#004581]">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-lg font-medium text-[#004581]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
              placeholder="Email"
              required
            />
          </div>
          <div className="mt-3">
            <label className="text-lg font-medium text-[#004581]">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
              placeholder="Password"
              required
            />
          </div>
          <div className="mt-3">
            <label className="text-lg font-medium text-[#004581]">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
              placeholder="Confirm password"
              required
            />
          </div>
          <div className="mt-6 flex flex-col gap-y-2">
            <button
              type="submit"
              className="group active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl text-white text-lg font-bold"
              style={{ backgroundColor: '#018ABD' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#004581')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#018ABD')}
            >
              Create Account
            </button>
          </div>
        </div>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}

