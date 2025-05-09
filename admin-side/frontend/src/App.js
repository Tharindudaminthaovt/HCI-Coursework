import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Form from './components/LoginPage/loginform';
import FurniturePage from './components/FurniturePage';
import FurnitureDetailPage from './components/FurnitureDetailPage';
import AddFurniture from './components/AddFurniture';
import EditFurniture from './components/EditFurniture';
import RoomDesignsPage from './components/RoomDesignsPage';
import CreateRoomDesign from './components/CreateRoomDesign';
import EditRoomDesign from './components/EditRoomDesign';
import LogOut from './components/LogOut';

function App() {
  const location = useLocation();
  
  return (
    <div>
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate replace to="/login" />} />
        
        {/* Admin routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/furniture" element={<FurniturePage />} />
        <Route path="/admin/furniture/:id" element={<FurnitureDetailPage />} />
        <Route path="/admin/furniture/add" element={<AddFurniture />} />
        <Route path="/admin/furniture/edit/:id" element={<EditFurniture />} />
        <Route path="/admin/room-designs" element={<RoomDesignsPage />} />
        <Route path="/admin/create-room-design" element={<CreateRoomDesign />} />
        <Route path="/admin/edit-room-design/:id" element={<EditRoomDesign />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Form />} />
        <Route path="/logout" element={<LogOut />} />
        
        {/* Catch all undefined routes */}
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}