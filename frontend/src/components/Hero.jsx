import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/Hero.css";

const Hero = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/login");
  };

  return (
    <div className="homepage">
      <div className="hero-background"></div>

      <header className="navbar">
        <div className="navbar-content">
          <div className="logo">LOGO</div>
          <nav className="nav-links">
            <a href="/" className="active">
              Home
            </a>
            <a href="/products">Products</a>
            <a href="#">Design</a>
            <span className="icons">
              <i className="fa fa-shopping-cart"></i>
              <i className="fa fa-heart"></i>
              <i className="fa fa-user-circle"></i>
            </span>
            <button onClick={handleRegisterClick} className="log-out">
              <a href="#">Log Out</a>
            </button>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-text">
          <h1>
            <span className="heading-line">Timeless</span>
            <br />
            Furniture, Made To Last.
          </h1>
          <p className="tagline">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et co laboris nisi ut aliquip ex
            ea commodo consequat
          </p>
        </div>
      </section>
    </div>
  );
};

export default Hero;
