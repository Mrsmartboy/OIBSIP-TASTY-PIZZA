import React, { useState,useCallback } from 'react';
import axios from 'axios';
import HeaderSignLogin from '../HeaderSignLogin';
import { toast } from 'react-toastify';
import './ForgotPasswordForm.css'

const ForgotPasswordForm = ({dispatch}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:10000/forgot-password', { email });
      setMessage(response.data.message);
      toast.success("Check your email",{autoClose:2000})
      toast.success("Reset the password",{autoClose:2000})
    } catch (error) {
      setError('Something went wrong. Please try again later.');

    }
  },[email]);

  return (
    <>
  <div className='header-signlogin'>
        <HeaderSignLogin dispatch={dispatch}/>
      </div>

  
    <div className='forgot-password-main-container'>
    <div className="forgot-password-form-container">
      <h2 className='title'>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='email-forgot-1'
          />
        </div>
        <button type="submit" className='reset-button-1'>Reset Password</button>
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
    </div>
    </>
  );
};

export default ForgotPasswordForm;
