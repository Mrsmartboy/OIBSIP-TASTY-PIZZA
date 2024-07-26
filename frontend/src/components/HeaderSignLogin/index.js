import React from 'react';
import { Link } from 'react-router-dom';
import './index.css'; // Assume you have a CSS file for styling

const HeaderSignLogin = () => (
    <header className="header fixed-header">
      <div className="header-logo">
        <h1 className="header-title">
        <img src="./tasty-pizza-logo-1.png" alt="logo" className='logo'/>
          Tasty Pizza</h1>
      </div>
      <nav className="header-nav">
        <ul>
         
                <>
            <li>
            <Link to="/signup">Signup</Link>
            </li>
            <li className='login-nav'>
            <Link to="/login">Login</Link>
            </li>
            </> 
         
        </ul>
      </nav>
    </header>
  );


export default HeaderSignLogin;











/*
 */