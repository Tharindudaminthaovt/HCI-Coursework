import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section site-name">
          <h4>Logo</h4>
          <p>Your Slogan Here</p>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="footer-section quick-links">
          <h4>Quick Links</h4><br />
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#services">Products</a></li>
            <li><a href="#work">Design</a></li>
            <li><a href="#aim">Favourite</a></li>
            <li><a href="#contact">My Account</a></li>
          </ul>
        </div>
        <div className="footer-section contact-us">
          <h4>Contact Us</h4><br />
          <p><i className="fas fa-envelope"></i> furniture@gmail.com</p>
          <p><i className="fas fa-phone"></i> +94 77 777 7777</p>
          <p><i className="fas fa-map-marker-alt"></i> Address</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
