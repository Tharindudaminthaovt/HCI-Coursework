import React from "react";
import {
  FaTachometerAlt,
  FaPlus,
  FaThList,
  FaCouch,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Style.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="logo">LOGO</div>
        <nav className="nav-links-dashboard">
          <a href="/dashboard" className="nav-link-dashboard active">
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
          <a href="/logout" className="nav-link-dashboard">
            <FaSignOutAlt className="icon" /> Log Out
          </a>
        </nav>
      </aside>

      <div className="main-content">
        <div className="logout-btn-container">
          <a href="/login"><button className="logout-btn">Log Out</button></a>
        </div>
        <div className="dashboard-content">
          <h1>DASHBOARD</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non sit commodi animi obcaecati expedita quia eum officia, quas esse omnis repellendus nisi corrupti incidunt labore amet! Perspiciatis expedita quidem voluptates.
          </p>

          <div className="card-container">
            <div className="dashboard-card">
              <h2>CREATE DESIGNS</h2>
              <p>
                Create designed rooms, and browse furniture to add to your
                inventory to enhance your selection.
              </p>
              <a href="/admin/create-room-design"><button className="view-btn">View</button></a> 
            </div>
            <div className="dashboard-card">
              <h2>MY DESIGNS</h2>
              <p>
                View, edit, and delete designed rooms, and browse furniture to
                add to your inventory to enhance your selection.
              </p>
              <a href="/admin/room-designs"><button className="view-btn">View</button></a> 
            </div>
            <div className="dashboard-card">
              <h2>ADD FURNITURE</h2>
              <p>
                Add a variety of furniture items to your inventory to enhance
                the selection available.
              </p>
              <a href="/admin/furniture/add"><button className="view-btn">View</button></a> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
