import axios from "axios";
import Header from "../Header";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Footer from '../Footer/Footer';
import './OrderDetails.css'; // Assuming you have a CSS file for styling

const OrderDetails = ({ dispatch }) => {
  const [orderDetailsData, setOrderDetailsData] = useState([]);
  const navigate = useNavigate();

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/order-details', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { userId }
      });

      setOrderDetailsData(response.data);
      fetchOrderDetails()
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error fetching order data.', { autoClose: 2000 });
    }
  }, []);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleOrderTracking = useCallback((orderId) => {
    navigate(`/order-tracking/${orderId}`);
  },[navigate]);

  return (
    <>
      <Header dispatch={dispatch} />
      <div className="body-container">
        <h1 className="your-orders">{orderDetailsData.length !== 0 && 'My Active Orders'}</h1>
        <div className="order-details-container">
          {orderDetailsData.length === 0 ? (
            <p className="no-active">There is no active orders</p>
          ) : (
            orderDetailsData.map((order, index) => (
              <div key={index} className="order-card">
                <h2>Order #{index + 1}</h2>
                <h3>Cart Items</h3>
                <table className="cart-items-table">
                  <thead>
                    <tr>
                      <th>Pizza Name</th>
                      <th>Quantity</th>
                      <th>Base</th>
                      <th>Cheese</th>
                      <th>Sauce</th>
                      <th>Veg</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.cartItems.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td>{item.pizzaName}</td>
                        <td>{item.pizzaQuantity}</td>
                        <td>{item.pizzaDetails.pizzaBaseId.name}</td>
                        <td>{item.pizzaDetails.pizzaCheeseId.name}</td>
                        <td>{item.pizzaDetails.pizzaSauceId.name}</td>
                        <td>{item.pizzaDetails.pizzaVegId.name}</td>
                        <td>{item.pizzaPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h3>Payment Details</h3>
                <table className="payment-details-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Payment ID</th>
                      <th>Total Price</th>
                      <th>Amount</th>
                      <th>Time</th>
                      <th>Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{order.paymentDetails.razorpayOrderId}</td>
                      <td>{order.paymentDetails.razorpayPaymentId}</td>
                      <td>{order.paymentDetails.totalPrice}</td>
                      <td>{order.paymentDetails.amount}</td>
                      <td>{order.paymentDetails.ptime}</td>
                      <td>{order.paymentDetails.status}</td>
                    </tr>
                  </tbody>
                </table>
                <button className="track-order" onClick={() => handleOrderTracking(order._id)}>Track Order</button>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderDetails;
