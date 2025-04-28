import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Form from "./components/LoginPage/loginform";
import Signup from "./components/SignupPage/signupform";
import Hero from "./components/Hero";
import FurniturePage from "./components/FurniturePage";
import AdminFavoritesPage from "./components/AdminFavoritesPage";
import FurnitureDetailPage from "./components/FurnitureDetailPage";
import AddFurniture from "./components/AddFurniture";
import EditFurniture from "./components/EditFurniture";
import RoomDesignsPage from "./components/RoomDesignsPage";
import CreateRoomDesign from "./components/CreateRoomDesign";
import EditRoomDesign from "./components/EditRoomDesign";
import LogOut from "./components/LogOut";

function App() {
  const location = useLocation();
  return (
    <div>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/favorites" element={<AdminFavoritesPage />} />
        <Route path="/admin/furniture" element={<FurniturePage />} />
        <Route path="/admin/furniture/:id" element={<FurnitureDetailPage />} />
        <Route path="/admin/furniture/add" element={<AddFurniture />} />
        <Route path="/admin/furniture/edit/:id" element={<EditFurniture />} />
        <Route path="/admin/room-designs" element={<RoomDesignsPage />} />
        <Route
          path="/admin/create-room-design"
          element={<CreateRoomDesign />}
        />
        <Route
          path="/admin/edit-room-design/:id"
          element={<EditRoomDesign />}
        />

        <Route path="/login" element={<Form />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<LogOut />} />
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
