import React from "react";
import monkey from "../assets/monkey.png";
import auth0 from "../assets/auth0-logo.png";

const Footer = () => (
  <footer className="bg-gradient-light p-3 text-center">
    <p>
      <img className="logo-footer" src={monkey}/>
      <img className="logo-footer2" src={auth0}/>
    </p>
  </footer>
);

export default Footer;
