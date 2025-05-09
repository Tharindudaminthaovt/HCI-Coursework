import React from "react";
import { useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaPlus,
  FaThList,
  FaCouch,
  FaSignOutAlt,
} from "react-icons/fa";
import "../components/LogOut.css";

const LogOut = () => {
  return (
    <div className="logout-page">
      <div className="room-navbar">
        <aside className="sidebar">
          <div className="logo">LOGO</div>
          <nav className="nav-links-dashboard">
            <a href="/dashboard" className="nav-link-dashboard">
              <FaTachometerAlt className="icon" /> Dashboard
            </a>
            <a href="/admin/create-room-design" className="nav-link-dashboard">
              <FaPlus className="icon" /> Create Designs
            </a>
            <a href="/admin/room-designs" className="nav-link-dashboard">
              <FaThList className="icon" /> My Designs
            </a>
            <a href="/admin/furniture/add" className="nav-link-dashboard">
              <FaCouch className="icon" /> Furniture
            </a>
            <a href="/logout" className="nav-link-dashboard active">
              <FaSignOutAlt className="icon" /> Log Out
            </a>
          </nav>
        </aside>
      </div>
      <main className="logout-main">
        <div className="logout-box">
          <h2>LOG OUT</h2>
          <p>Are you sure you want to log out</p>
          <div className="logout-buttons">
            <a href="/dashboard"><button className="cancel-btn" >
              Cancel
            </button></a><br />
            <a href="/login"><button className="logout-btn" >
              Log out
            </button></a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LogOut;
