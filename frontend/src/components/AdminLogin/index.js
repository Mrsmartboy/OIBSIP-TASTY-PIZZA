import React, { useState,useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // Make sure this path is correct

const AdminLogin = ({ dispatch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()

  const handleLogin =useCallback ( async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:10000/api/admin/login', {
        email,
        password,
      });

      // Assuming the response contains a token
      const { token } = response.data;
      Cookies.set('adminToken', token);
      toast.success('Login successful!', { autoClose: 2000 });
      dispatch({ type: 'ADMIN_LOGIN' });
      navigate('/admin/customer-order-details')

    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials and try again.', { autoClose: 2000 });
    }
  },[dispatch,email,navigate,password]);

  return (
    <div className='body-container-5'>
    <div className="admin-login-container">
      <h2 className="admin-login-title">Admin Login</h2>
      <form onSubmit={handleLogin} className="admin-login-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
    </div>
  );
};

export default AdminLogin;
