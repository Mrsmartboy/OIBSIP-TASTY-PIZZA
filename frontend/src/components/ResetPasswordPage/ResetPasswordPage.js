import React, { useState,useCallback } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import HeaderSignLogin from '../HeaderSignLogin';
import './ResetPasswordPage.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ResetPasswordPage = ({dispatch}) => {
  const query = useQuery();
  const token = query.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setSuccess(false);
      return;
    }

    try {
      const response = await axios.post('https://oibsip-tasty-pizza.onrender.com/api/reset-password', { token, newPassword });
      setMessage(response.data.message);
      setSuccess(response.data.success);
      toast.success('Reset password successfully',{autoClose:2000})

      if (response.data.success) {
        navigate('/login');
      }
    } catch (error) {
      setMessage('Error resetting password.');
      setSuccess(false);
    }
  },[confirmPassword,navigate,newPassword,token]);

  return (
    <>
    <div className='header-signlogin'>
    <HeaderSignLogin dispatch={dispatch}/>
  </div>
    <div className="reset-password-container">
      <form onSubmit={handleSubmit} className="reset-password-form">
        <h2>Reset Password</h2>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="password-input"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="password-input"
          required
        />
        <button type="submit" className="submit-button-reset">Reset Password</button>
        {message && (
          <p className={classNames('message', { 'success': success, 'error': !success })}>
            {message}
          </p>
        )}
      </form>
    </div>
    </>
  );
};

export default ResetPasswordPage;
