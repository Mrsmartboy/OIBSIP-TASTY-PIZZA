import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './CustomerOrderDetails.css';
import AdminDashboard from '../AdminDashboard';

const CustomerOrderDetails = ({ dispatch }) => {
  const [orderDetailsData, setOrderDetailsData] = useState([]);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = Cookies.get('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://localhost:10000/api/admin/order-details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrderDetailsData(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error fetching order details. Please try again later.', { autoClose: 2000 });
    }
    fetchOrderDetails()

  }, []);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleStatusChange = useCallback(async (orderId, status) => {
    try {
      const token = Cookies.get('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.put(
        `http://localhost:10000/api/admin/order-details/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Order status updated successfully.', { autoClose: 2000 });
      // Refresh the order details after update
      fetchOrderDetails()
      if (status === 'Complete') {
        const completedOrder = orderDetailsData.find(order => order._id === orderId);
        const orderTime= new Date();
        if (completedOrder) {
          await axios.post(
            `http://localhost:10000/api/admin/order-history`,
            { completedOrder,status,orderTime},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }
     
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status. Please try again later.', { autoClose: 2000 });
    }
  },[fetchOrderDetails,orderDetailsData]);

  const deleteOrder = useCallback(async (orderId) => {
    try {
      const token = Cookies.get('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.delete(`http://localhost:10000/api/admin/order-details/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      toast.success('Order deleted successfully');
      fetchOrderDetails(); // Refresh the order details after deletion
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error deleting order. Please try again later.', { autoClose: 2000 });
    }
  },[fetchOrderDetails]);

  return (
    <div className="admin-dashboard-container">
      <AdminDashboard dispatch={dispatch} />
      <div className="content">
        <h2>Customer Order Details</h2>
        {orderDetailsData.length > 0 ? (
          <>
            <table className="order-details-table">
              <thead>
                <tr>
                  <th>Orders</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Placed at</th>
                  <th>Remove Order</th>
                </tr>
              </thead>
              <tbody>
                {orderDetailsData.map((order) => (
                  <tr key={order._id}>
                    <td>
                      {order.cartItems.map((item, index) => (
                        <div key={index}>
                          <h1 className='pizza-name'>{item.pizzaName} - {item.pizzaQuantity} pcs</h1>
                          <div><strong>Base:</strong> {item.pizzaDetails.pizzaBaseId.name}</div>
                          <div><strong>Cheese:</strong> {item.pizzaDetails.pizzaCheeseId.name}</div>
                          <div><strong>Sauce:</strong> {item.pizzaDetails.pizzaSauceId.name}</div>
                          <div><strong>Veg:</strong> {item.pizzaDetails.pizzaVegId.name}</div>
                        </div>
                      ))}
                    </td>
                    <td>{order.addressDetails.name}</td>
                    <td>
                      {order.addressDetails.floor}, {order.addressDetails.area}, {order.addressDetails.city} - {order.addressDetails.pincode}, ph:{order.addressDetails.mobile}
                    </td>
                    <td>
                      <select value={order.paymentDetails.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} className='select-option'>
                        <option value="Order Placed">Order Placed</option>
                        <option value="Order Confirmation">Order Confirmation</option>
                        <option value="Preparation">Preparation</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Complete">Complete</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{order.paymentDetails.time}</td>
                    <td>
                      <button className='delete-order' onClick={() => deleteOrder(order._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Payment Details</h2>
            <table className="payment-details-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>Total Price</th>
                  <th>Amount Status</th>
                  <th>Payment Time</th>
                </tr>
              </thead>
              <tbody>
                {orderDetailsData.map((order) => (
                  <tr key={order._id}>
                    <td>{order.cartItems[0].userId}</td>
                    <td>{order.addressDetails.name}</td>
                    <td>{order.paymentDetails.razorpayPaymentId}</td>
                    <td>{order.paymentDetails.razorpayOrderId}</td>
                    <td>{order.paymentDetails.totalPrice}</td>
                    <td>{order.paymentDetails.amount}</td>
                    <td>{order.paymentDetails.ptime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>No order details available.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerOrderDetails;
