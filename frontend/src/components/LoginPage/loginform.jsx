import React, { useState } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import "./loginform.css";
import Google from "../../Assets/Google.png";

export default function Form() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      try {
        const adminResponse = await Axios.post(
          "http://localhost:3001/api/admin/login",
          {
            email,
            password,
          }
        );

        if (adminResponse.status === 200) {
          const { token, admin } = adminResponse.data;
          localStorage.setItem("authToken", token);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...admin, role: "admin" })
          );
          setMessage("Admin login successful!");
          navigate("/dashboard");
          return;
        }
      } catch (adminError) {
        console.log("Not an admin, trying user login");
      }

      const userResponse = await Axios.post("http://localhost:3001/api/login", {
        email,
        password,
      });

      if (userResponse.status === 200) {
        const { token, user } = userResponse.data;
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        setMessage("Login successful!");
        navigate("/");
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || "Login failed!");
      } else {
        setMessage("Network error. Please try again.");
      }
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:3001/auth/google";
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

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignIn}
          >
            <img src={Google} className="google-icon" />
            Continue with Google
          </button>

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
