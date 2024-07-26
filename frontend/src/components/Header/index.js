import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

import './Header.css'; // Assume you have a CSS file for styling

const Header = ({ dispatch }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logout Successful', { autoClose: 2000 });
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <header className="header-fixed">
      <div className="logo-container">
        <h1 className="site-titles">
        <img src="./tasty-pizza-logo-1.png" alt="logo" className='logo'/>
        
        Tasty Pizza</h1>
      </div>
      <nav className="navigation">
        <ul>
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/menu/category/all">Menu</Link>
            </li>
           
            <li className="user-menu" onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
              <FaUserCircle className='user-icon'/>
              {dropdownVisible && (
                <ul className="dropdown-menu">
                  <li>
              <Link to="/cart">My Cart</Link>
            </li>
                  <li>
                    <Link to="/order-details">My Orders</Link>
                  </li>
                  <li>
                    <Link to="/past-orders">My Past Orders</Link>
                  </li>
                  <li onClick={handleLogout}>
                    <FaSignOutAlt className='logout-icon'/>
                  </li>
                </ul>
              )}
            </li>
          </>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
