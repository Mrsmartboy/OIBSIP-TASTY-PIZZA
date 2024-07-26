import axios from 'axios';
import { toast } from 'react-toastify';

const MIN_ORDER_AMOUNT = 1; // Minimum order amount in INR

export const createOrder = async (amount) => {
  const token = localStorage.getItem('token');

  if (!token) {
    toast.error('Please log in to place an order', { autoClose: 2000 });
    return;
  }

  if (amount < MIN_ORDER_AMOUNT) {
    toast.error(`Order amount must be at least Rs.${MIN_ORDER_AMOUNT}`, { autoClose: 2000 });
    return;
  }

  try {
    const response = await axios.post(
      'https://oibsip-tasty-pizza.onrender.com/api/create-order',
      { amount: amount * 100 }, // Convert amount to paise
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.order;
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.response && error.response.data) {
      console.error('Error response data:', error.response.data);
      toast.error(`Error: ${error.response.data.error.description}`, { autoClose: 2000 });
    } else {
      toast.error('Failed to create order. Please try again later.', { autoClose: 2000 });
    }
    throw error;
  }
};



export const handlePayment = (order, onSuccess, onFailure) => {
  const options = {
    key: 'rzp_test_DSy3lCncQ7ullG',
    amount: order.amount,
    currency: order.currency,
    name: 'Tasty Pizza',
    description: 'Order Payment',
    order_id: order.id,
    method: ['upi'],
    handler: function (response) {
      onSuccess(response);
    },
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    notes: {
      address: 'Razorpay Corporate Office'
    },
    theme: {
      color: '#F37254'
    }
  };

  const rzp = new window.Razorpay(options);

  rzp.on('payment.failed', function (response) {
    onFailure(response);
  });

  rzp.open();
};
