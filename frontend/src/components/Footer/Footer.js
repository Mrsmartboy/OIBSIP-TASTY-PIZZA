import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/order-details">My Orders</Link></li>
            <li><Link to="/past-orders">My Past Orders</Link></li>
          </ul>
        </div>
        <div className="footer-social">
          <h4>Follow Us</h4>
          <ul>
          <li>
            <a href="https://www.linkedin.com/in/peddanna-joseph-g-9b4a2a209/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
          </li>

            <li>
              <a href="https://wa.link/3zreeg" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i> WhatsApp
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/mr.smart_and_decent_boy?utm_source=qr&igsh=c2Rpd3R0aHFvY241" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i> Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Tasty Pizza. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
