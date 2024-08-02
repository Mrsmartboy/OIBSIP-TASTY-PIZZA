import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import HeaderSignLogin from '../HeaderSignLogin';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const PizzaSignup = ({dispatch}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpResendDisabled, setIsOtpResendDisabled] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.endsWith('.com');
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(String(password));
  };

  const onLogin = () => navigate('/login', { replace: true });

  const handleSubmit = useCallback(async(event) => {
    event.preventDefault();
    const { name, email, address, mobile, password, confirmPassword } = formData;

    if (!validateEmail(email)) {
      setMessage('Invalid email format');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setMessage('Give Strong Password');
      return;
    }

    setLoading(true); // Show loader

    try {
      const response = await axios.post('https://oibsip-tasty-pizza.onrender.com/api/signup', {
        name,
        email,
        address,
        mobile,
        password,
      });

      if (response.data.success) {
        setIsOtpSent(true);
        setOtpTimer(60); // Start timer for 60 seconds
        setIsOtpResendDisabled(true); // Disable resend OTP button initially
        toast.success('OTP sent to your email');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Error: ' + (error.response ? error.response.data.message : error.message));
    } finally {
      setLoading(false); // Hide loader
    }
  },[formData]);

  const handleOtpSubmit = useCallback(async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('https://oibsip-tasty-pizza.onrender.com/api/verify-otp', { email: formData.email, otp });
      if (response.data.success) {
        toast.success('Email verified successfully!', { autoClose: 1000 });
        navigate('/login', { replace: true });
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Error: ' + (error.response ? error.response.data.message : error.message));
    }
  },[formData.email,navigate,otp]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleResendOtp = useCallback( async () => {
    try {
      const response = await axios.post('https://oibsip-tasty-pizza.onrender.com/api/resend-otp', { email: formData.email });
      if (response.data.success) {
        toast.success('OTP resent to your email!');
        setOtpTimer(60); // Reset timer for 30 seconds
        setIsOtpResendDisabled(true); // Disable resend OTP button
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Error: ' + (error.response ? error.response.data.message : error.message));
    }
  },[formData.email]);

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsOtpResendDisabled(false); // Re-enable resend OTP button
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  },[]);

  return (
    <>
      <div className='header-signlogin'>
        <HeaderSignLogin dispatch={dispatch}/>
      </div>

      {loading ? ( // Show loader if loading state is true
        <div className='loader-container'>
          <div className='loader'></div>
          <p>Loading...</p>
        </div>
      ) : !isOtpSent ? (
        <form onSubmit={handleSubmit} className='form-container-signup'>
          <div className='signup-image-container'>
            <img src='/pizza-signup.jpg' alt='pizza' className='pizza-image' />
            <div className='signup-form-container'>
              <div>
                <h1 className='signup-head'>SignUp</h1>
              </div>
              <div className='signup-input-container'>
                <label htmlFor='name' className='signup-label'>Name:</label>
                <input
                  type='text'
                  name='name'
                  id='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className='input-signup'
                  placeholder='name'
                />
              </div>
              <div className='signup-input-container'>
                <label htmlFor='email' className='signup-label'>Email:</label>
                <input
                  className='input-signup'
                  type='email'
                  name='email'
                  id='email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder='email'
                />
              </div>
              <div className='signup-input-container'>
                <label htmlFor='address' className='signup-label'>Address:</label>
                <input
                  className='input-signup'
                  type='textarea'
                  name='address'
                  id='address'
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder='address'
                />
              </div>
              <div className='signup-input-container'>
                <label htmlFor='mobile' className='signup-label'>Mobile:</label>
                <input
                  className='input-signup'
                  type='tel'
                  name='mobile'
                  id='mobile'
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  pattern='[1-9]{1}[0-9]{9}'
                  placeholder='mobile'
                />
              </div>
              <div className='signup-input-container'>
                <label htmlFor='password' className='signup-label'>Password:</label>
                <div className='signup-visible'>
                  <input
                    className='input-signup'
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    id='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder='Password'
                  />
                  <button type='button' onClick={togglePasswordVisibility} className='password-toggle-button'>
                    <img
                      src={showPassword ? '/eye.png' : '/invisible.png'}
                      alt={showPassword ? 'Hide password' : 'Show password'}
                      className='password-toggle-icon'
                    />
                  </button>
                </div>
              </div>
              <div className='signup-input-container'>
                <label htmlFor='confirmPassword' className='signup-label'>Confirm Password:</label>
                <div className='signup-visible'>
                  <input
                    className='input-signup'
                    type={showConfirmPassword ? 'text' : 'password'}
                    id='confirmPassword'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder='Confirm Password'
                    required
                  />
                  <button type='button' onClick={toggleConfirmPasswordVisibility} className='password-toggle-button'>
                    <img
                      src={showConfirmPassword ? '/eye.png' : '/invisible.png'}
                      alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className='password-toggle-icon'
                    />
                  </button>
                </div>
              </div>

              <button type='submit' className='signup-button'>Sign Up</button>
              {message && <p className='signup-error-message'>`*{message}*`</p>}
              <p className='user-exist'>If you already registered, click on <span className='login-link' onClick={onLogin}>Login</span></p>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className='form-container-signup'>
          <div className='signup-image-container'>
            <img src='/pizza-signup.jpg' alt='pizza' className='pizza-image' />
            <div className='signup-form-container'>
              <div>
                <h1 className='signup-head'>Verify Email</h1>
              </div>
              <div className='signup-input-container'>
                <label htmlFor='otp' className='signup-label'>Enter OTP:</label>
                <input
                  type='text'
                  id='otp'
                  name='otp'
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  className='input-signup'
                  placeholder='OTP'
                />
              </div>
              <button type='submit' className='signup-button'>Verify OTP</button>
              {message && <p className='signup-error-message'>`*{message}*`</p>}
              <button 
                onClick={handleResendOtp} 
                className='resend-otp-button'
                disabled={isOtpResendDisabled} // Disable button based on state
              >
                {isOtpResendDisabled ? `Resend OTP (${formatTime(otpTimer)})` : 'Resend OTP'}
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default PizzaSignup;
