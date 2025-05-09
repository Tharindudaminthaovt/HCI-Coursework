import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import furnitureData from "../FurnitureData";
import "./furniture.css";

const FurnitureItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const item = furnitureData.find(f => f.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);

  if (!item) return <p>Item not found</p>;

  const increase = () => setQuantity(prev => prev + 1);
  const decrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="item-page">
      <div className="top-bar">
        <span className="back-arrow "onClick={() => navigate(-1)}><i class="fa-solid fa-left-long"></i></span>
      </div>
      <div className="item-content">
        <div className="image-box">
          <img src={item.image} alt={item.name} />
        </div>
        <div className="details-box">
          <p className="category">{item.category}</p>
          <h2>{item.name}</h2>
          <div className="rating">
            {"★".repeat(item.rating)}
            {"☆".repeat(5 - item.rating)}
          </div>
          <p className="price">
            ${item.price}.00
            <span className="discount">50%</span><br />
            <span className="old-price">${item.oldPrice}.00</span>
          </p>
          <div className="quantity-selector">
            <button onClick={decrease}>−</button>
            <span>{quantity}</span>
            <button onClick={increase}>＋</button>
          </div>
          <button className="add-to-cart-btn">🛒 Add to Cart</button>
        </div>
      </div>
      <div className="description-section">
        <h3>Description</h3>
        <p>{item.description}</p>
        <a href="#">Read more</a>
      </div>
    </div>
  );
};

export default FurnitureItem;
