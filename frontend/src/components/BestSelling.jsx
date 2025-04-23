import React from "react";
import "./BestSelling.css";
import Bed from "../Assets/img1.png";
import table from "../Assets/img2.png";
import bed2 from "../Assets/img3.png";
import cupboard from "../Assets/img4.png";

const products = [
  {
    title: "Kids Bed",
    category: "Furniture",
    price: "$75.85",
    image: Bed,
  },
  {
    title: "Table Set",
    category: "Furniture",
    price: "$100.05",
    image: table,
  },
  {
    title: "Queen Bed",
    category: "Furniture",
    price: "$112.74",
    image: bed2,
  },
  {
    title: "Four-door Wardrobe",
    category: "Furniture",
    price: "$150.99",
    image: cupboard,
  },
];

const BestSelling = () => {
  return (
    <div className="best-selling-container">
      <div className="best-selling-header">
        <div className="heading-wrapper">
          <div className="heading-text">
            <div className="line1"></div>
            <p className="subheading">What We Do Best</p>
            <div className="line2"></div>
            <h2 className="title">BEST SELLER</h2>
          </div>
        </div>
      </div>
      <div className="product-carousel">
        <button className="arrow left">❮</button>
        <div className="product-list">
          {products.map((product, index) => (
            <div className="product-card" key={index}>
              <img src={product.image} alt={product.title} />
              <div className="product-info">
                <h4>{product.title}</h4>
                <p>{product.category}</p>
                <p className="price">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="arrow right">❯</button>
      </div>
    </div>
  );
};

export default BestSelling;
