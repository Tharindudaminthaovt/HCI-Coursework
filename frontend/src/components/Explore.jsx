import React from "react";
import "./Explore.css";
import EX1 from "../Assets/EX1.png";
import EX2 from "../Assets/EX2.png";
import EX3 from "../Assets/EX3.png";
import EX4 from "../Assets/EX4.png";
import EX5 from "../Assets/EX5.png";
import EX6 from "../Assets/EX6.png";
import EX7 from "../Assets/EX7.png";
import EX8 from "../Assets/EX8.png";

const products = [
  { id: 1, title: "Ork Stool", price: "15.18", image: EX1 },
  { id: 2, title: "Ork Stool", price: "15.18", image: EX2 },
  { id: 3, title: "Ork Stool", price: "15.18", image: EX3 },
  { id: 4, title: "Ork Stool", price: "15.18", image: EX4 },
  { id: 5, title: "Ork Stool", price: "15.18", image: EX2 },
  { id: 6, title: "Leatherette Sofa", price: "15.18", image: EX5 },
  { id: 7, title: "Leatherette Sofa", price: "15.18", image: EX6 },
  { id: 8, title: "Leatherette Sofa", price: "15.18", image: EX7 },
  { id: 9, title: "Leatherette Sofa", price: "15.18", image: EX8 },
  { id: 10, title: "Leatherette Sofa", price: "15.18", image: EX6 },
];

const Explore = () => {
  return (
    <section className="explore-section">
      <div className="explore-header">
        <div className="line4"></div>
        <p className="subtitle2">What We Do Best</p>
        <br />
        <div className="line5"></div>
        <h2 className="title2">EXPLORE MORE</h2>
        <p className="description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card1">
            <div className="image-container">
              <img src={product.image} alt={product.title} />
              <button className="favorite-btn">♡</button>
              <div className="product-overlay">
                <p className="product-name1">{product.title}</p>
                <p className="product-price1">${product.price}</p>
              </div>
              <button className="add-to-cart">Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Explore;
