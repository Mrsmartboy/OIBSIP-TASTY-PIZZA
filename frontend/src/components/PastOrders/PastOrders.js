import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from "../Header";
import { useNavigate } from "react-router-dom";
import { useCart } from '../CartContext';
import RatingModal from "../RatingModal";
import Footer from '../Footer/Footer';
import './PastOrders.css';

const PastOrders = ({ dispatch }) => {
  const [pastOrders, setPastOrders] = useState([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderRatings, setOrderRatings] = useState({});
  const [stars, setStars] = useState({});
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const fetchPastOrderData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {  
        console.error('No token found');
        return;
      }
      const userId = localStorage.getItem('userId');
      const response = await axios.get('http://localhost:5000/api/past-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { userId }
      });

      const orders = response.data;

      try {
        // Fetch rating status for all orders
        const ratingsResponse = await axios.get('http://localhost:5000/api/order-ratings', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { userId }
        });

        const ratingsData = ratingsResponse.data;
        const ratingsMap = {};
        const countRating = {};
        ratingsData.forEach(rating => {
          ratingsMap[rating.pizzaDetails.orderId] = rating.pizzaDetails.isRatingGiven;
        });
        ratingsData.forEach(rating => {
          countRating[rating.pizzaDetails.orderId] = rating.pizzaDetails.rating;
        });
        
        setOrderRatings(ratingsMap);
        setStars(countRating);
      } catch (error) {
        console.error('Error fetching ratings data:', error);
      }

      setPastOrders(orders);
    } catch (error) {
      console.error('Error fetching past order details:', error);
      toast.error('Error fetching past orders. Please try again later.', { autoClose: 2000 });
    }
    fetchPastOrderData()
  }, []);

  useEffect(() => {
    fetchPastOrderData();
  }, [fetchPastOrderData]);

  const fetchPizzaDetails = useCallback(async (pizzaId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return null;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/pizzaDetails/${pizzaId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pizza details:', error);
      return null;
    }
  },[]);

  const handleAddToCart = useCallback(async (order) => {
    for (const item of order.cartItems) {
      const dataDetails = {
        pizzaBase: item.pizzaDetails.pizzaBaseId,
        pizzaCheese: item.pizzaDetails.pizzaCheeseId,
        pizzaSauce: item.pizzaDetails.pizzaSauceId,
        pizzaVeg: item.pizzaDetails.pizzaVegId
      };

      const pizza = await fetchPizzaDetails(item.pizzaId);
      if (!pizza) {
        console.error(`Pizza details not found for pizzaId: ${item.pizzaId}`);
        continue;
      }

      if (dataDetails.pizzaBase && dataDetails.pizzaCheese && dataDetails.pizzaSauce && dataDetails.pizzaVeg) {
        const eachUnitPrice = item.unitPrice;
        addToCart(
          dataDetails,
          item.pizzaQuantity,
          pizza, // passing pizzaId and pizzaName as pizza
          eachUnitPrice * item.pizzaQuantity,
          eachUnitPrice
        );
      } else {
        console.error('Incomplete pizza details:', dataDetails);
      }
    }
    navigate('/cart');
  },[addToCart,fetchPizzaDetails,navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    const getOrdinalSuffix = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinalSuffix(day)} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  const openRatingModal = (order) => {
    setCurrentOrder(order);
    setIsRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setIsRatingModalOpen(false);
    setCurrentOrder(null);
  };

  const handleRatingSubmit = useCallback(async (orderId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/rateOrder/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const ratingData = response.data.pizzaDetails;

      setOrderRatings(prevRatings => ({
        ...prevRatings,
        [orderId]: ratingData.isRatingGiven
      }));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error('Rating details not found');
      } else {
        console.error('Error fetching rating details:', error);
      }
    }
  },[]);

  return (
    <>
      <div className='header-container-1'>
        <Header dispatch={dispatch} />
      </div>
      <div className='past-orders-container'>
        <h1 className="past-order-title">Past Orders</h1>
        {pastOrders.length > 0 ? (
          pastOrders.map(order => (
            <div key={order._id} className='order-card-1'>
              <div className='order-header'>
                <div>
                  <h3>Tasty Pizza</h3>
                  <p>Benz Circle, Vijayawada</p>
                  <p>₹{order.paymentDetails.totalPrice}</p>
                </div>
                <div>
                  <span className='order-status'>{order.paymentDetails.status === 'Complete' && "Delivered"}</span>
                </div>
              </div>
              <div className='order-details'>
                {order.cartItems.map((item, index) => (
                  <div key={index} className='order-item'>
                    <p>{item.pizzaName} ({item.pizzaQuantity})</p>
                  </div>
                ))}
              </div>
              <p className="past-date">{formatDate(order.orderTime)}</p>
              <div className='order-actions'>
                <button className='reorder-button' onClick={() => handleAddToCart(order)}>REORDER</button>
                <button
                  className='rate-order-button'
                  onClick={() => openRatingModal(order)}
                  disabled={orderRatings[order._id]}
                >
                  {orderRatings[order._id] ? "RATED" : "RATE ORDER"}
                </button>
              </div>
              <div className='order-footer'>
                <p>{orderRatings[order._id] ? `You have rated this food ${stars[order._id]} ${stars[order._id] < 2 ? 'star' : 'stars'}` : "You haven't rated this food yet."}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No past orders available.</p>
        )}
        {isRatingModalOpen && (
          <RatingModal
            isOpen={isRatingModalOpen}
            onRequestClose={closeRatingModal}
            order={currentOrder}
            onRatingSubmit={handleRatingSubmit}
          />
        )}
      </div>
      <Footer/>
    </>
  );
};

export default PastOrders;
