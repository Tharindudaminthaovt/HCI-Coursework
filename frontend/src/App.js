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
import BestSelling from "./components/BestSelling";
import Services from "./components/Services";
import Explore from "./components/Explore";
import Contact from "./components/ContactUs";
import Footer from "./components/Footer";
import Furniture from "./components/FurniturePage/furniture";
import FurnitureItem from "./components/FurniturePage/FurnitureItem";

function App() {
  const location = useLocation();

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <BestSelling />
              <Services />
              <Explore />
              <Contact />
              <Footer />
            </>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Form />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/products"
          element={
            <>
              <Furniture />
              <Footer />
            </>
          }
        />
        <Route path="/furniture/:id" element={<FurnitureItem />} />

        {/* <Route path="/design" element={<Services />} />
        <Route path="/addtocart" element={<Explore />} />
        <Route path="/favourite" element={<Contact />} />
        <Route path="/account" element={<Footer />} /> */}
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
