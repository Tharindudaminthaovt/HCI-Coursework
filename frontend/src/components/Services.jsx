import React from 'react';
import './Services.css';
import officeImage from '../Assets/Services.png'; 

const Services = () => {
  return (
    <div className="our-services">
      <div className="services-content">
        <div className="services-text">
          <div className="services-header">
            <p className="subheading1">What We Do Best</p>
            <div className="heading-line-wrap">
              <h2 className="title1">OUR SERVICES</h2>
              <div className="horiz-line"></div>
              <div className="ver-line"></div>
            </div>
          </div>
          <p className="description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua...
          </p>
          <p className="description">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore earum hic minus voluptas tenetur harum doloremque itaque odio eveniet, praesentium rerum perspiciatis illum debitis recusandae quidem pariatur. Cum, voluptatibus magnam aspernatur alias repudiandae unde, quidem enim repellat quibusdam sapiente dolores illum quod molestias nihil tenetur dolore reiciendis illo minus veritatis vel laboriosam ex, maxime a modi? Voluptatem voluptate assumenda molestias deleniti delectus? Provident, tempore quas! Nulla, asperiores porro. Soluta aliquid magnam ducimus quam ipsam itaque animi. Totam deserunt suscipit nihil, exercitationem assumenda praesentium? Nostrum nam sunt non eaque enim reprehenderit possimus neque, tenetur deserunt nulla aliquid aperiam est illum quaerat.
          </p><br />
          <button className="explore-btn">Explore More.</button>
        </div>
        <div className="services-image">
          <img src={officeImage} alt="Office" />
        </div>
      </div>
    </div>
  );
};

export default Services;
