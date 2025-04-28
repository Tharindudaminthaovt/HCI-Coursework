import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/signup");
  };

  return (
    <div className="text-center py-16 text-[#004581]">
      <h1 className="text-4xl font-bold mb-6">Welcome to the home page</h1>
      <button
        onClick={handleRegisterClick}
        className="bg-[#018ABD] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#004581] transition duration-300"
      >
        SIGN UP
      </button>
    </div>
  );
};

export default Hero;
