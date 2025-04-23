import React, { useState } from 'react';
import './signupform.css';
import { Link } from 'react-router-dom';
import Axios from 'axios';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      setMessage('Password must be at least 8 characters, including a number and a symbol.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match!');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setMessage(error.response?.data?.message || 'Signup failed!');
    }
  };

  return (
    <div className="container">
      <div className="signup-left">
        <h2>Welcome Back!</h2>
        <p>To keep connected with us please<br />Login with your Personal Information</p>
        <Link to="/login">
          <button className="ghost-button">Sign in</button>
        </Link>
      </div>
      <div className="signup-right">
        <h1>Sign up</h1>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <input
            type="emails"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          <button type="submit" className="solid-button">Sign up</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
