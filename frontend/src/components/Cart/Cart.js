import React, { useEffect, useState, useCallback } from 'react';
import { useCart } from '../CartContext';
import { toast } from 'react-toastify';
import { createOrder, handlePayment } from '../Razorpay/index.js';
import Header from '../Header';
import axios from 'axios';
import Footer from '../Footer/Footer.js';
import { useNavigate } from 'react-router-dom';

import './Cart.css';

const Cart = ({ dispatch }) => {
  const { state, removeFromCart, updateCartItem, fetchCart } = useCart();
  const { items: cartItems } = state;
  const [formData, setFormData] = useState({
    name: '',
    floor: '',
    area: '',
    city: '',
    pincode: '',
    mobile: ''
  });

  const date = new Date();
  const hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const strTime = hours % 12 + ':' + minutes + ' ' + ampm;
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Error fetching cart items. Please try again.', { autoClose: 2000 });
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amount = cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

  const handleRemoveFromCart = useCallback(async (cartId) => {
    try {
      await removeFromCart(cartId);
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Error removing item from cart. Please try again.', { autoClose: 2000 });
    }
  }, [removeFromCart]);

  const handleQuantityChange = useCallback(async (cartId, newQuantity, totalPrice) => {
    try {
      await updateCartItem(cartId, newQuantity, totalPrice);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error updating item quantity. Please try again.', { autoClose: 2000 });
    }
  }, [updateCartItem]);

  const isFormDataValid = useCallback((data) => {
    return Object.values(data).every((field) => field.trim() !== '');
  }, []);

  const handlePaymentSuccess = useCallback(async (response) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const verifyResponse = await axios.post('http://localhost:10000/api/verify-payment', response, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (verifyResponse.data.success) {
        toast.success('Payment successful!', { autoClose: 2000 });

        const orderDetailsData = {
          cartItems: cartItems.map(item => ({
            userId: item.userId,
            cartId: item._id,
            pizzaId: item.pizzaId,
            pizzaName: item.name,
            pizzaQuantity: item.quantity,
            price: item.unitPrice * item.quantity,
            unitPrice: item.unitPrice,
            toppings: item.toppings,
            category: item.category,

            pizzaDetails: {
              pizzaBaseId: item.dataDetails.pizzaBase,
              pizzaCheeseId: item.dataDetails.pizzaCheese,
              pizzaSauceId: item.dataDetails.pizzaSauce,
              pizzaVegId: item.dataDetails.pizzaVeg
            }
          })),
          addressDetails: formData,
          paymentDetails: {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            totalPrice: amount,
            amount: 'paid',
            time: strTime,
            status: 'Order Placed',
            ptime: strTime,
            Date:new Date()
          }
        };

        const data = await axios.post('http://localhost:10000/api/order-details', orderDetailsData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (data.status === 201) {
          for (const item of cartItems) {
            try {
              await handleRemoveFromCart(item._id);
            } catch (error) {
              console.error('Error removing item from cart:', error);
              toast.error('Error removing item from cart. Please try again.', { autoClose: 2000 });
            }
          }

          navigate('/order-details');

          try {
            await axios.put(
              'http://localhost:10000/api/pizza-update',
              {
                cartItems: cartItems.map(item => ({
                  pizzaId: item.pizzaId,
                  quantity: item.quantity
                }))
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

          } catch (error) {
            console.error('Error updating pizza and quantity sold:', error);
            toast.error('Error updating pizza and quantity sold. Please try again.', { autoClose: 2000 });
          }

        } else {
          toast.error('Payment verification failed. Please contact support.', { autoClose: 2000 });
        }
      } else {
        toast.error('Payment verification failed. Please contact support.', { autoClose: 2000 });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Error verifying payment. Please try again later.', { autoClose: 2000 });
    }
  }, [amount, cartItems, formData, handleRemoveFromCart, navigate, strTime]);

  const handlePaymentFailure = useCallback((response) => {
    console.error('Payment Failure:', response);
    toast.error('Payment Failed. Please try again.', { autoClose: 3000 });
  }, []);

  const placeOrder = useCallback(async (e) => {
    e.preventDefault();

    if (!isFormDataValid(formData)) {
      toast.error('Please fill in all address fields.', { autoClose: 2000 });
      return;
    }

    try {
      const order = await createOrder(amount);
      handlePayment(order, handlePaymentSuccess, handlePaymentFailure);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Error placing order. Please try again.', { autoClose: 2000 });
    }
  }, [amount, formData, handlePaymentSuccess, handlePaymentFailure, isFormDataValid]);

  return (
    <>
      <div className='header-container-1'>
        <Header dispatch={dispatch} />
      </div>
      <div className="cart-container">
        <h1 className='your-cart'>MY Cart</h1>
        {cartItems.length === 0 ? (
          <p className='empty'>Your cart is empty</p>
        ) : (
          <div className='list-centre'>
            <ul className="cart-items-list">
              {cartItems.map((item, index) => {
                const handleQuantitySelect = (e) => {
                  const newQuantity = parseInt(e.target.value);
                  const totalPrice = item.unitPrice * newQuantity;
                  handleQuantityChange(item._id, newQuantity, totalPrice);
                };

                return (
                  <li key={`${item.pizzaId}-${index}`} className="cart-item">
                    <img
                      src={item.imageUrl || '/Caprese id33.jpeg'}
                      alt={item.name || 'Pizza'}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h2 className="cart-item-name">{item.name || 'Pizza'}</h2>
                      <div className="cart-item-order-details">
                        <p>Pizza Base: {item.dataDetails.pizzaBase.name}</p>
                        <p>Pizza Cheese: {item.dataDetails.pizzaCheese.name}</p>
                        <p>Pizza Sauce: {item.dataDetails.pizzaSauce.name}</p>
                        <p>Pizza Veg: {item.dataDetails.pizzaVeg.name}</p>
                      </div>
                      <div className="cart-item-quantity-container">
                        <label htmlFor={`quantity-${item.pizzaId}`} className="cart-item-quantity-label">
                          Quantity:
                        </label>
                        <select
                          id={`quantity-${item.pizzaId}`}
                          className="cart-item-quantity-select"
                          value={item.quantity}
                          onChange={handleQuantitySelect}
                        >
                          {[1, 2, 3, 4].map((qty) => (
                            <option key={qty} value={qty} className='option'>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="cart-item-price">Unit Price: ₹{item.unitPrice}</p>
                      <p className="cart-item-total-price">Total Price: ₹{item.unitPrice * item.quantity}</p>
                    </div>
                    <button onClick={() => handleRemoveFromCart(item._id)} className="cart-item-remove">
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className='address-container'>
              <h1 className='total-items'>Total Items: <span>{cartItems.length}</span></h1>
              <h1 className='total-price-amount'>Total Item Price: <span>₹{amount}</span></h1>
              <form className="address-form" onSubmit={placeOrder}>
                <h1 className='address-head'>Address</h1>
                <>
                  <label htmlFor="name" className='cart-label'>Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder='Name'
                    className='cart-input'
                  />
                </>
                <>
                  <label  className='cart-label'  htmlFor="floor">Floor</label>
                  <input
                    type="text"
                    id="floor"
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    required
                    placeholder='Door No'
                    className='cart-input'

                  />
                </>

                <>
                  <label  className='cart-label' htmlFor="area">Area</label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    placeholder='Area'
                    className='cart-input'

                  />
                </>

                <>
                  <label  className='cart-label' htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder='City'
                    className='cart-input'

                  />
                </>

                <>
                  <label  className='cart-label' htmlFor="pincode">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    placeholder='Pincode'
                    className='cart-input'

                  />
                </>
                <>
                  <label  className='cart-label' htmlFor='mobile'>Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    id='mobile'
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    pattern="[1-9]{1}[0-9]{9}"
                    placeholder='Mobile'
                    className='cart-input'

                  />
                </>

                <button type="submit" className='place-order'>Order Now</button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default Cart;
