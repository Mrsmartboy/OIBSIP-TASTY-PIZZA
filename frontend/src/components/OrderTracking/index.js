import React, { useEffect, useState, useCallback } from 'react';
import { useParams ,useNavigate} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../Header';
import Footer from '../Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faCheckDouble, faPizzaSlice, faTruck, faSmile } from '@fortawesome/free-solid-svg-icons';
import './OrderTracking.css';

const steps = [
  { icon: faSquareCheck, label: 'Order Placed' },
  { icon: faCheckDouble, label: 'Order Confirmation' },
  { icon: faPizzaSlice, label: 'Preparation' },
  { icon: faTruck, label: 'Out for Delivery' },
  { icon: faSmile, label: 'Complete' },
];



const OrderTracking = ({dispatch}) => {
  const { orderId } = useParams();
  const [orderDetailsData, setOrderDetailsData] = useState(null);
  const navigate= useNavigate()

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(`https://oibsip-tasty-pizza.onrender.com/api/track-details`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { orderId }
      });
  
      // Log the full response
     
  
      if (response.data.success === false) {
        navigate('/order-details'); // Navigate to order-details if success is false
        return;
      }
  
      // Set order details data
      setOrderDetailsData(response.data);
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error fetching order details. Please try again later.', { autoClose: 2000 });
    }
    fetchOrderDetails()
  }, [orderId, navigate]);
  
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const currentStepIndex = steps.findIndex(
    step => orderDetailsData && orderDetailsData.paymentDetails && step.label === orderDetailsData.paymentDetails.status
  );

  return (
    <>
     <Header dispatch={dispatch}/>
    <div className="order-tracking-container bodi">
      <h2>Track Delivery Status</h2>
      <div className="order-tracking-steps">
        {steps.map((step, index) => {
          const isCancelled = orderDetailsData && orderDetailsData.paymentDetails.status === 'Cancelled';
          const isActive = index <= currentStepIndex;
          const isCurrentStep = index === currentStepIndex;

          return (
            <div
              key={index}
              className={`step ${isActive ? 'active' : ''} ${isCancelled && step.label === 'Complete' ? 'cancelled' : ''}`}
            >
              <div className="step-container">
                <div className="icon-container">
                  <div className="icon">
                    <FontAwesomeIcon icon={step.icon} />
                  </div>
                  <div className="dot"></div>
                  <p className={`label ${isCancelled && step.label === 'Complete' ? 'cancelled' : ''}`}>
                    {isCancelled && step.label === 'Complete' ? 'Cancelled' : step.label}
                    <br />
                    {isCurrentStep && orderDetailsData && (
                      <span className="time">{orderDetailsData.paymentDetails.time}</span>
                    )}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && <div className="line" />}
            </div>
          );
        })}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default OrderTracking;
