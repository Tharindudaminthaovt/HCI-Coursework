import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './loginform.css';

export default function Form({ setIsLoggedIn, setUserRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });
      
      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', user.role);
        
        setIsLoading(false);
        
        if (setIsLoggedIn) setIsLoggedIn(true);
        if (setUserRole) setUserRole(user.role);
        
        navigate('/user/home');
      }
    } catch (error) {
      console.error("Login failed:", error);
      setMessage('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Sign in</h2>
          <br />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="divider">
            <span className="line"></span>
            <span className="or">OR</span>
            <span className="line"></span>
          </div>

          <div className="signup-prompt">
            Not registered yet? <Link to="/signup">Create an account</Link>
          </div>

          <button type="submit" className="login-btn">
            Sign in
          </button>
          {message && <p className="error-msg">{message}</p>}
        </form>
      </div>
      <div className="login-right">
        <h2>Hello, Friend!</h2>
        <p>Enter your personal details and start journey with us</p>
        <Link to="/signup">
          <button className="signup-btn">Sign up</button>
        </Link>
      </div>
    </div>
  );
}