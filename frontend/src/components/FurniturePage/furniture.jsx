import React from "react";
import "./furniture.css";
import { Link } from "react-router-dom";
import EX1 from "../../Assets/EX1.png";
import EX2 from "../../Assets/EX2.png";
import EX3 from "../../Assets/EX3.png";
import EX4 from "../../Assets/EX4.png";
import EX5 from "../../Assets/EX5.png";
import EX6 from "../../Assets/EX6.png";
import EX7 from "../../Assets/EX7.png";
import EX8 from "../../Assets/EX8.png";

const products = [
  { id: 1, title: "Nix Chair | Contemporary Design for Modern Living", price: "125", image: EX1 },
  { id: 2, title: "Nix Chair | Contemporary Design for Modern Living", price: "125", image: EX2 },
  { id: 3, title: "Nix Chair | Contemporary Design for Modern Living", price: "125", image: EX3 },
  { id: 4, title: "Nix Chair | Contemporary Design for Modern Living", price: "125", image: EX4 },
  { id: 5, title: "Nix Chair | Contemporary Design for Modern Living", price: "125", image: EX5 },
  { id: 6, title: "Leatherette Sofa", price: "125", image: EX6 },
  { id: 7, title: "Leatherette Sofa", price: "125", image: EX7 },
  { id: 8, title: "Leatherette Sofa", price: "125", image: EX8 },
  { id: 9, title: "Nix Chair | Contemporary Design for Modern Living", price: "125", image: EX4 },
  { id: 10, title: "Leatherette Sofa", price: "125", image: EX6 },
];

export default function Furniture() {
  return (
    <div className="furniture-page">
      <header className="navbar2">
        <div className="navbar-content2">
          <div className="logo2">LOGO</div>
          <nav className="nav-links2">
            <a href="/">Home</a>
            <a href="/products" className="active">Products</a>
            <a href="#">Design</a>
            <span className="icons">
              <i className="fa fa-shopping-cart"></i>
              <i className="fa fa-heart"></i>
              <i className="fa fa-user-circle"></i>
            </span>
            <button className="log-out">
              <a href="#">Log Out</a>
            </button>
          </nav>
        </div>
      </header>

      <section className="hero-section2">
        <h1 className="title4">FURNITURE</h1>
        <p className="description4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque quos
          neque distinctio consectetur perspiciatis aut ipsum itaque natus.
          Assumenda, consequuntur?
        </p>
        <div className="search-filter-bar">
          <div className="search-box">
            <span className="icon">&#9776;</span>
            <input type="text" placeholder="Hinted search text" className="search-input" />
            <span className="icon">
              <i className="fas fa-search"></i>
            </span>
          </div>

          <div className="sort-box">
            <label htmlFor="sort">Sort By :</label>
            <select id="sort" className="sort-select">
              <option value="price">Price</option>
              <option value="availability">Availability</option>
            </select>
          </div>
        </div>
      </section>

      <div className="products-grid">
        {products.map((product) => (
          <Link to={`/furniture/${product.id}`} className="product-card1" key={product.id}>
            <div className="image-container">
              <img src={product.image} alt={product.title} />
              <button className="favorite-btn">♡</button>
              <div className="product-overlay">
                <p className="product-name1">{product.title}</p>
                <p className="product-price1">${product.price}</p>
              </div>
              <button className="add-to-cart">Add to cart</button>
            </div>
          </Link>
        ))}
      </div><br /><br />
    </div>
  );
}