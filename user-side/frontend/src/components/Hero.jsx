import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/Hero.css";
import BestSelling from '../components/BestSelling';
import Explore from '../components/Explore';
import Services from '../components/Services';
import ContactUs from '../components/ContactUs';
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <div className="hero-background"></div>
      <NavBar />


      <section className="hero-section">
        <div className="hero-text">
          <h1>
            <span className="heading-line">Timeless</span>
            <br />
            Furniture, Made To Last.
          </h1>
          <p className="tagline">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et co laboris nisi ut aliquip ex
            ea commodo consequat
          </p>
        </div>
      </section>
      <BestSelling />
      <Services />
      <Explore/>
      <ContactUs />
      <Footer />
    </div>
  );
};

export default Hero;
